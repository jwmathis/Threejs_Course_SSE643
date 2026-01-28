import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js' // For importing GLFT models
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js' // For camera movement

/**
 * ---- 1. SCENE SETUP ----
 * Utilizing a warm Ivory background and Fog to simulate
 * atmospheric depth and seamless background blending
 ***/

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xfff8e1); // Warm Ivory
//scene.fog = new THREE.Fog(0xfff8e1, 10, 50); // Fog for depth

/**
 * ---- 2. CAMERA SETUP ----
 * PerspectiveCamera to mimic human eye perspective
 ***/

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 12); 

/**
 * ---- 3. RENDERER SETUP ----
 * WebGLRenderer with anti-aliasing for smoother edges
 ***/

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/**
 * ---- 4. ORBIT CONTROLS & Window Resizing & Helpers ----
 * Allowing user interaction with the scene
 ***/

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Smooth camera movement
controls.target.set(0, 1, 0);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const grid = new THREE.GridHelper(40, 40, 0x444444, 0x888888);;
scene.add(grid);
grid.visible = false;

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
axesHelper.visible = false;
/**
 * ---- 5. LIGHTING SETUP ----
 * Ambient and Directional lights to illuminate the scene
 ***/

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Soft white light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xfff5e6, 2.0);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

/**
 * --- 6. GEOMETRY AND MATERIALS ---
 */

const floorGeom = new THREE.PlaneGeometry(100, 100);
const floorMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.8 });
const floor = new THREE.Mesh(floorGeom, floorMat);
floor.rotation.x = -Math.PI / 2; // Lay it flat
floor.position.y = 0;
scene.add(floor);

const sphere_geometry = new THREE.SphereGeometry(1, 32, 32);
const cube_geometry = new THREE.BoxGeometry(1, 1, 1);

// ---TASK 1: Use Various Built-In Materials ---
// 1. MeshBasicMaterial (unlit)
const mat_basic = new THREE.MeshBasicMaterial({ color: 0xff5733 }); // Vibrant Orange

// 2. MeshNormalMaterial
const mat_normal = new THREE.MeshNormalMaterial();

// 3. MeshLambertMaterial
const mat_lambert = new THREE.MeshLambertMaterial({ color: 0x33ff57 }); // Bright Green

// 4. MeshPhongMaterial
const mat_phong = new THREE.MeshPhongMaterial({ 
    color: 0x3357ff, // Vivid Blue
    shininess: 100,
    specular: 0xaaaaaa,
    transparent: true,
    opacity: 0.8
});

// 5. MeshStandardMaterial
const mat_standard = new THREE.MeshStandardMaterial({ 
    color: 0xff33a8, // Hot Pink
    roughness: 0.5,
    metalness: 0.5
});

const mat_shader = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
    fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        void main() {
            float pulse = abs(sin(time * 2.0));
            gl_FragColor = vec4(0.0, pulse, pulse, 1.0); // Pulsing Cyan/Green
        }`
});

const textureLoader = new THREE.TextureLoader();
const brickColor = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/brick_diffuse.jpg');
const brickNormal = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/brick_bump.jpg');

// EXPERIMENT: Texture Repetition and Offset (Task 2 requirements)
brickColor.wrapS = THREE.RepeatWrapping; // Allows horizontal tiling
brickColor.wrapT = THREE.RepeatWrapping; // Allows vertical tiling
brickColor.repeat.set(2, 2);             // Tiles the image 2x2 across the surface

const mat_advanced = new THREE.MeshPhongMaterial({
    map: brickColor,
    normalMap: brickNormal,
    shininess: 150,
    specular: 0x888888
});

const sphere1 = new THREE.Mesh(sphere_geometry, mat_basic);

const sphere2 = new THREE.Mesh(sphere_geometry, mat_normal);

const sphere3 = new THREE.Mesh(sphere_geometry, mat_lambert);

const sphere4 = new THREE.Mesh(sphere_geometry, mat_phong);

const sphere5 = new THREE.Mesh(sphere_geometry, mat_standard);

const shapes = [sphere1, sphere2, sphere3, sphere4, sphere5];
shapes.forEach((s, index) => {
    s.position.set(-6 + (index * 3), 1.0, 0); // Evenly spaced in a line
    scene.add(s);
});

const cube = new THREE.Mesh(cube_geometry, mat_advanced);
cube.position.set(0, 2.5, 4);
cube.scale.set(5, 5, 5);
//scene.add(cube);

/**
 * --- TASK 3: Interactive Material Switching ---
 * Press 'M' to cycle through different materials on the hero object
 ***/
const pedestalGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.5, 32);
const pedestalMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.7 });
const pedestalMesh = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
pedestalMesh.position.set(0, 0.25, -5);
scene.add(pedestalMesh);

const heroGeometry = new THREE.IcosahedronGeometry(2, 0);
const heroMesh =  new THREE.Mesh(heroGeometry, mat_standard);
heroMesh.position.set(0, 5, -5);
scene.add(heroMesh);

const materialPalette = [mat_basic, mat_normal, mat_lambert, mat_phong, mat_standard, mat_advanced, mat_shader];
let paletteIndex = 0;

window.addEventListener('keydown', (event) => {
    if (event.key === 'm' || event.key === 'M') {
        paletteIndex = (paletteIndex + 1) % materialPalette.length;
        heroMesh.material = materialPalette[paletteIndex];
        console.log(`Hero material changed to: ${heroMesh.material.type}`);
    }

    if (event.code === 'Space') {
        grid.visible = !grid.visible;
        axesHelper.visible = !axesHelper.visible;
        floor.visible = !floor.visible;
    }
});
/**
 * ---- 7. ANIMATION LOOP ----
 * Continuously rendering the scene and updating controls
 ***/
let isOrbiting = false;
window.addEventListener('keydown', (e) => {
    if (e.key === 'o' || e.key === 'O') {
        isOrbiting = !isOrbiting;
        console.log("Orbiting Mode:", isOrbiting ? "Enabled" : "Disabled");
    }
});

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();
    mat_shader.uniforms.time.value = elapsed;

    shapes.forEach((shape, index) => {
        shape.rotation.y += 0.01 + index * 0.002; // Varying rotation speeds

        if (isOrbiting) {
            const radius = 6;
            const speed = elapsed * 0.5 *  (1 + index * 0.1); // Vary speed based on index
            const angle = speed + (index * (Math.PI / 2) / shapes.length); // Calculate angle based on index
            shape.position.x = heroMesh.position.x + Math.cos(angle) * radius;
            shape.position.z = heroMesh.position.z + Math.sin(angle) * radius;
            shape.position.y = 2 + Math.sin(elapsed + index) * 0.5; // Vertical oscillation 
        } else {
            const targetX = -6 + (index * 3);
            shape.position.x += (targetX - shape.position.x) * 0.05; // Smooth return to original x
            shape.position.z += (0 - shape.position.z) * 0.05; // Smooth return to original z
            shape.position.y = 2 + Math.sin(elapsed + index) * 0.5; // Vertical oscillation
        }
    });
    
    heroMesh.rotation.y += 0.02;
    heroMesh.rotation.x += 0.01;

    controls.update(); // Update controls for damping
    renderer.render(scene, camera);
}

animate();

/**
 * ---- END OF SCRIPT ----
 ***/