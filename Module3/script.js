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

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
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

const textureLoader = new THREE.TextureLoader();
const brickColor = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/brick_diffuse.jpg');
const brickNormal = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/brick_bump.jpg');
const mat_advanced = new THREE.MeshPhongMaterial({
    map: brickColor,
    normalMap: brickNormal,
    shininess: 150,
    specular: 0x888888
});

const sphere1 = new THREE.Mesh(sphere_geometry, mat_basic);
sphere1.position.set(-6, 1, 0);

const sphere2 = new THREE.Mesh(sphere_geometry, mat_normal);
sphere2.position.set(-3, 1, 0);

const sphere3 = new THREE.Mesh(sphere_geometry, mat_lambert);
sphere3.position.set(0, 1, 0);

const sphere4 = new THREE.Mesh(sphere_geometry, mat_phong);
sphere4.position.set(3, 1, 0);

const sphere5 = new THREE.Mesh(sphere_geometry, mat_standard);
sphere5.position.set(6, 1, 0);

const cube = new THREE.Mesh(cube_geometry, mat_advanced);
cube.position.set(0, 2.5, 4);
cube.scale.set(5, 5, 5);

scene.add(sphere1, sphere2, sphere3, sphere4, sphere5, cube);

/**
 * ---- 7. ANIMATION LOOP ----
 * Continuously rendering the scene and updating controls
 ***/

function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Update controls for damping
    renderer.render(scene, camera);
}

animate();

/**
 * ---- END OF SCRIPT ----
 ***/