import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

// --- 1. SETUP ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2a3d45); // darker, stormy blue
//scene.background = new THREE.Color(0x87CEEB); // Sky blue
scene.fog = new THREE.Fog(0x87CEEB, 20, 100); // Fog for depth and atmosphere
scene.fog.color.set(0x2a3d45); // darker, stormy blue

const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

const moonLight = new THREE.DirectionalLight(0xafc9ff, 0.5);
moonLight.position.set(5, 10, 5);
scene.add(moonLight);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

const timer = new THREE.Timer(); //"Heartbeat" for the wind effect

// --- 2. WAVING GRASS ---
const grassMaterial = new THREE.MeshStandardMaterial({
    color: 0x4E9A06,
    side: THREE.DoubleSide,
})
grassMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 };
    shader.vertexShader = `
        uniform float uTime;
        ${shader.vertexShader}
    `.replace(
        `#include <begin_vertex>`,
        `
        vec3 transformed = vec3(position);
        float sway = sin(uTime * 2.0 + position.x * 0.5 + position.z * 0.5) * 0.4;
        transformed.x += sway * (position.y + 1.0); // Only sway top vertices
        `
    );
    grassMaterial.userData.shader = shader;
};

const grassGeometry = new THREE.PlaneGeometry(0.1, 0.5);
const grass = new THREE.Mesh(grassGeometry, grassMaterial);
grass.position.y = 1.0;
scene.add(grass);

const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x2D4C1E });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2; // Lay it flat
ground.position.y = -0.01;
scene.add(ground);

const count = 100000; // Total blades of grass
const grassGeo = new THREE.PlaneGeometry(0.1, 0.6);
grassGeo.translate(0, 0.3, 0);

const iMesh = new THREE.InstancedMesh(grassGeo, grassMaterial, count);
scene.add(iMesh);

const dummy = new THREE.Object3D();

for (let i = 0; i < count; i++) {
    // Random posiiton within a 100x100 area
    const x = (Math.random() - 0.5) * 100;
    const z = (Math.random() - 0.5) * 100;

    dummy.position.set(x, 0, z);
    dummy.rotation.y = Math.random() * Math.PI;
    
    const s = 0.5 + Math.random() * 0.5; // Random scale between 0.5 and 1.0
    dummy.scale.set(s, s, s);

    dummy.updateMatrix();
    iMesh.setMatrixAt(i, dummy.matrix);
}

iMesh.instanceMatrix.needsUpdate = true;

// --- 3. FAIRY SYSTEM ---
const fairies = [];

function createFairy(color) {
    const group = new THREE.Group();
    
    // 1. The Visual Sprite (The glow)
    const spriteMat = new THREE.SpriteMaterial({ 
        color: color, 
        transparent: true, 
        opacity: 0.8,
        blending: THREE.AdditiveBlending // Makes it look like it's glowing
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(0.5, 0.5, 1);
    group.add(sprite);

    // 2. The Actual Light (Cast light on grass)
    const light = new THREE.PointLight(color, 2, 5); 
    group.add(light);

    // Initial random position
    group.position.set((Math.random()-0.5)*20, 2, (Math.random()-0.5)*20);
    
    // Movement data
    group.userData = {
        angle: Math.random() * Math.PI * 2,
        speed: 0.01 + Math.random() * 0.02,
        radius: 5 + Math.random() * 5,
        yOffset: Math.random() * 100
    };

    scene.add(group);
    fairies.push(group);
}

// Create 5 fairies
const fairyColors = [0x00ffff, 0xff00ff, 0xffff00, 0x00ff00, 0xffffff];
fairyColors.forEach(color => createFairy(color));

// --- 4. STYLIZED RAIN ---
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

// --- Animation Loop ---
function animate() {
    stats.begin();
    requestAnimationFrame(animate);
    timer.update();
    const t = timer.getElapsed();
    
    // 1. Update wind
    if (grassMaterial.userData.shader) {
        grassMaterial.userData.shader.uniforms.uTime.value = t;
    }

    // 2. Update Fairies (Circular drifting motion)
    fairies.forEach(fairy => {
        const data = fairy.userData;
        data.angle += data.speed;
        
        fairy.position.x = Math.cos(data.angle) * data.radius;
        fairy.position.z = Math.sin(data.angle) * data.radius;
        // Bobbing up and down
        fairy.position.y = 1.5 + Math.sin(t + data.yOffset) * 0.5;
    });

    // 3. Update Rain
    const positions = rain.geometry.attributes.position.array;
    for (let i = 0; i < rainCount; i++) {
        // Move Y down by velocity
        positions[i * 3 + 1] -= rainVelocities[i];

        // If it hits the ground, reset to top
        if (positions[i * 3 + 1] < 0) {
            positions[i * 3 + 1] = 20;
        }
    }
    rain.geometry.attributes.position.needsUpdate = true;

    controls.update();
    renderer.render(scene, camera);
    stats.end();
}
animate();