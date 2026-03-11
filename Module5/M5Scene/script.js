import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// Post-Processing Imports
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

// --- 1. SETUP ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2a3d45); 
scene.fog = new THREE.Fog(0x2a3d45, 20, 80); 

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// --- POST PROCESSING SETUP (Must be after renderer) ---
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight), 
    1.5,  // Strength: How much glow
    0.4,  // Radius: How far the glow spreads
    0.25  // Threshold: Anything brighter than this glows (lowered to catch fairies)
);
composer.addPass(bloomPass);

const timer = new THREE.Clock(); // Use Clock for simpler time tracking

// --- LIGHTING ---
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);

const moonLight = new THREE.DirectionalLight(0xafc9ff, 0.5);
moonLight.position.set(5, 10, 5);
scene.add(moonLight);

// --- MOVEMENT SETUP ---
const fpControls = new PointerLockControls(camera, renderer.domElement);

window.addEventListener('click', () => {
    fpControls.lock();
});

scene.add(fpControls); 

const keys = { w: false, a: false, s: false, d: false };
window.addEventListener('keydown', (e) => { if(keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { if(keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = false; });

let velocity = new THREE.Vector3(); // Add this at the top of your movement script

function updateMovement() {
    if (!fpControls.isLocked) return; 

    // Calculate acceleration based on keys
    const acceleration = 0.05;
    const friction = 0.9; // Lower = more slippery

    if (keys.w) velocity.z += acceleration;
    if (keys.s) velocity.z -= acceleration;
    if (keys.a) velocity.x -= acceleration;
    if (keys.d) velocity.x += acceleration;

    // Apply movement
    fpControls.moveForward(velocity.z);
    fpControls.moveRight(velocity.x);

    // Apply friction to slow down
    velocity.multiplyScalar(friction);

    // Keep at eye level with Bobbing
    camera.position.y = 2;
    if (velocity.length() > 0.01) {
        camera.position.y += Math.sin(performance.now() * 0.02) * 0.08;
    }
}


// --- 2. GRASS SHADER ---
const grassMaterial = new THREE.MeshStandardMaterial({
    color: 0x4E9A06,
    side: THREE.DoubleSide,
});

grassMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 };
    shader.vertexShader = `
        uniform float uTime;
        varying float vAmount;
        ${shader.vertexShader}
    `.replace(
        `#include <begin_vertex>`,
        `
        #include <begin_vertex>
        vAmount = position.y; 
        float sway = sin(uTime * 2.0 + position.x * 0.5 + position.z * 0.5) * 0.4;
        transformed.x += sway * position.y; 
        `
    );
    shader.fragmentShader = `
        varying float vAmount;
        ${shader.fragmentShader}
    `.replace(
        `#include <dithering_fragment>`,
        `
        gl_FragColor.rgb = mix(vec3(0.01, 0.04, 0.01), gl_FragColor.rgb, clamp(vAmount * 1.5, 0.0, 1.0));
        #include <dithering_fragment>
        `
    );
    grassMaterial.userData.shader = shader;
};

// Grass Geometry (X-Shape)
const blade1 = new THREE.PlaneGeometry(0.1, 0.6);
const blade2 = blade1.clone().rotateY(Math.PI / 2);
const grassGeo = BufferGeometryUtils.mergeGeometries([blade1, blade2]);
grassGeo.translate(0, 0.3, 0); 

const count = 100000; // Adjusted for performance with bloom
const iMesh = new THREE.InstancedMesh(grassGeo, grassMaterial, count);
scene.add(iMesh);

const dummy = new THREE.Object3D();
for (let i = 0; i < count; i++) {
    dummy.position.set((Math.random() - 0.5) * 100, 0, (Math.random() - 0.5) * 100);
    dummy.rotation.y = Math.random() * Math.PI;
    const s = 0.5 + Math.random() * 0.5;
    dummy.scale.set(s, s, s);
    dummy.updateMatrix();
    iMesh.setMatrixAt(i, dummy.matrix);
}

// Ground
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshStandardMaterial({ color: 0x1a2e12 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.02;
scene.add(ground);

// --- 3. FAIRY SYSTEM ---
const fairies = [];
const fairyColors = [0x00ffff, 0xff00ff, 0xffff00, 0x00ff00, 0xffffff];
fairyColors.forEach(color => {
    const group = new THREE.Group();
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ 
        color: color, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending 
    }));
    sprite.scale.set(0.6, 0.6, 1);
    group.add(sprite);
    const pLight = new THREE.PointLight(color, 10, 6); // Boosted for bloom
    group.add(pLight);
    group.userData = { angle: Math.random()*Math.PI*2, speed: 0.01+Math.random()*0.02, radius: 5+Math.random()*10, yOff: Math.random()*100 };
    scene.add(group);
    fairies.push(group);
});

// --- 4. RAIN ---
 const rainCount = 2000;
const rainPositions = new Float32Array(rainCount * 3);
const rainVelocities = new Float32Array(rainCount);

for (let i = 0; i < rainCount; i++) {
    // Spread rain across the 100x100 field
    rainPositions[i * 3] = (Math.random() - 0.5) * 100;
    rainPositions[i * 3 + 1] = Math.random() * 20; // Start at different heights
    rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    rainVelocities[i] = 0.1 + Math.random() * 0.2; // Falling speed
}
const rainGeo = new THREE.BufferGeometry();
rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
// Rain looks like thin white/blue needles
const rainMat = new THREE.PointsMaterial({
    color: 0xaaaaaa,
    size: 0.1,
    transparent: true,
    opacity: 0.5
});

const rain = new THREE.Points(rainGeo, rainMat);
scene.add(rain); 

// --- 5. MONOLITH ---
const tower = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 1.2, 10, 6),
    new THREE.MeshStandardMaterial({ color: 0x050505, metalness: 0.9, roughness: 0.1 })
);
tower.position.y = 5;
scene.add(tower);

const rune = new THREE.Mesh(
    new THREE.CylinderGeometry(1.25, 1.25, 0.2, 6),
    new THREE.MeshBasicMaterial({ color: 0x00ffff }) // Bright cyan will GLOW
);
rune.position.y = 2;
tower.add(rune);

const instructions = document.getElementById('instructions');

fpControls.addEventListener('lock', () => {
    instructions.style.display = 'none';
    console.log('Controls Locked');
});

fpControls.addEventListener('unlock', () => {
    instructions.style.display = 'block';
    console.log('Controls Unlocked');
});

// --- ANIMATION ---
let lightningTimer = 0;

function animate() {

    requestAnimationFrame(animate);
    const t = timer.getElapsedTime();

    if (grassMaterial.userData.shader) grassMaterial.userData.shader.uniforms.uTime.value = t;

    fairies.forEach(f => {
        f.userData.angle += f.userData.speed;
        f.position.x = Math.cos(f.userData.angle) * f.userData.radius;
        f.position.z = Math.sin(f.userData.angle) * f.userData.radius;
        f.position.y = 1.5 + Math.sin(t + f.userData.yOff);
    });

    const rainAr = rain.geometry.attributes.position.array;
    for(let i=1; i<rainAr.length; i+=3) {
        rainAr[i] -= 0.2;
        if(rainAr[i] < 0) rainAr[i] = 20;
    }
    rain.geometry.attributes.position.needsUpdate = true;

    if (Math.random() > 0.997 && lightningTimer <= 0) {
        lightningTimer = 10;
        scene.background.set(0x667788);
        moonLight.intensity = 10;
    }
    if (lightningTimer > 0) {
        lightningTimer--;
        if (lightningTimer <= 0) {
            scene.background.set(0x2a3d45);
            moonLight.intensity = 0.5;
        }
    }

    updateMovement();
    composer.render(); // Use composer instead of renderer
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

animate();