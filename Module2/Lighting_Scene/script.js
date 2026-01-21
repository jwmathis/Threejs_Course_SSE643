import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js' // For importing GLFT models
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js' // For camera movement

/**
 * ---- 1. SCENE SETUP ----
 * Utilizing a warm Ivory background and Fog to simulate
 * atmospheric depth and seamless background blending
 ***/
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xF0EAD6);
scene.fog = new THREE.Fog(0xF0EAD6, 10, 50);

/**
 * ---- 2. CAMERA & RENDERER ----
 * PerspectiveCamera setup with ACES Filmic Tone Mapping for
 * photographic-quality highlights and contrast
 */
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(8.15, 3.45, 6.57); // Position camera angle to see front and side of the statue

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // High-quality soft edges
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
document.body.appendChild(renderer.domElement);

// OrbitControls for interactive navigation
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Makes moving smooth
controls.target.set(14, 1.2, 2); // Centered on main exhibit



/**
 * ---- 3. LIGHTING SYSTEM ----
 */

// A. Ambient Light: Provides base-level visibility and fills deep shadows
const ambient = new THREE.AmbientLight(0xffffff, 0.2); // Soft white light
scene.add(ambient);

// B. Directional Light: Simulates primary sun/window light
const directionalLight = new THREE.DirectionalLight(0xfff5e6, 4.0);
directionalLight.position.set(5, 10, 20);
directionalLight.castShadow = true;
directionalLight.target.position.set(14, 1, 2);
scene.add(directionalLight.target);

// Tighten the shadow frustum around the Model location
directionalLight.shadow.camera.left = -8;
directionalLight.shadow.camera.right = 8;
directionalLight.shadow.camera.top = 8;
directionalLight.shadow.camera.bottom = -8;

// Increase far so light can reach the floor from its position
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 50;

// Increase map size for crispness
directionalLight.shadow.mapSize.set(2048,2048)
directionalLight.shadow.bias = -0.0005; // Prevents "Shadow Acne" artifacts
directionalLight.shadow.radius = 3; // Softens shadow edges

scene.add(directionalLight);

const dirLightHelper = new THREE.DirectionalLightHelper(directionalLight);
//scene.add(dirLightHelper);

// C. Point Light: Localized accent lighting
const pointLight = new THREE.PointLight(0xffaa00, 50, 15);
pointLight.position.set(12, 3, 2);
//scene.add(pointLight);

// DEBUG: A helper to see where the light is
 const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2);
 //scene.add(pointLightHelper);

// D. Spotlight: "Hero" lighting
const spotLight = new THREE.SpotLight(0xffffff, 280);
spotLight.position.set(14, 8, 8);
spotLight.angle = Math.PI / 12;
spotLight.penumbra = 0.3
spotLight.castShadow = true;
spotLight.decay = 2;
spotLight.distance = 25;

// Target
const spotTarget = new THREE.Object3D();
spotTarget.position.set(14, 1.5, 2); // Pointing at the Hunter's chest
spotLight.target = spotTarget;
scene.add(spotTarget);

// Shadow settings to increase detail
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.bias = -0.0001;

//scene.add(spotLight);

// E. Hemisphere Light: Bicolor environmental lighting
const hemisphereLight = new THREE.HemisphereLight(0x4433ff, 0xff5500, 1.0);
//scene.add(hemisphereLight);

/**
 * ---- 4. GEOMETRY & ARCHITECTURE
 */

// Create a polished marble floor with clear coat reflections
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshPhysicalMaterial({
        color: 0xE5E0D0,
        roughness: 0.1,
        metalness: 0.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        reflectivity: 1.0,
        ior: 1.5
    }),
)
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Add grid on top of floor for appearances
const grid = new THREE.GridHelper(40, 40, 0x444444, 0x888888);
grid.position.y = 0.01;
scene.add(grid);

// A helper function to make walls quickly
function createWall(width, height, color) {
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 1.0, // Matte so it doesn't reflect like a mirror
        metalness: 0.0
    });
    const wall = new THREE.Mesh(geometry, material);
    wall.receiveShadow = true; // Essential for your Directional and Spotlights!
    return wall;
}

// Back Wall
const backWall = createWall(20, 10, 0xF0EAD6);
backWall.position.x = 10;
scene.add(backWall);

// Left Wall
const leftWall = createWall(10, 10, 0xF0EAD6);
leftWall.position.x = 0;
leftWall.rotation.y = Math.PI / 2; // Turn it 90 degrees
leftWall.position.z = 5
scene.add(leftWall);

// Right Wall
const rightWall = createWall(10, 10, 0xF0EAD6);
rightWall.position.x = 20;
rightWall.rotation.y = -Math.PI / 2;
rightWall.position.z = 5;
scene.add(rightWall);

/**
 * ---- 5. MODEL LOADING ----
 */
const loader = new GLTFLoader();

// Load Statue of a Hunter
loader.load('/assets/statue_of_a_hunter/scene.gltf', (loadedObject) => {
    const model = loadedObject.scene;

    // Calculate the bounding box
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());

    // 1. Reset position so the bottom of the model's feet are at Y = 0
    model.position.y = (model.position.y - box.min.y);
    model.position.x -= center.x - 14;
    model.position.z -= center.z - 2;

    model.traverse((node) => {
        if(node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;

            if (node.material) {
                node.material.roughness = 0.7;
                node.material.metalness = 0.2;
            }
        }
    })
    scene.add(model);
});

// Load velvet rope
loader.load('/assets/velvet_rope_and_metal_poles/scene.gltf', (loadedObject) => {
    const model = loadedObject.scene;

    // Calculate the bounding box
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // 1. Reset position so the bottom of the model's feet are at Y = 0
    model.position.y = (model.position.y - box.min.y);
    model.position.x -= center.x - 13.8;
    model.position.z -= center.z - 3.8;

    model.scale.set(1.4, 1.4, 1.4);
    model.traverse((node) => {
        if(node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
        }
    })
    scene.add(model);
});

// Load tree Painting
loader.load('/assets/painting_lowpoly/scene.gltf', (loadedObject) => {
    const model = loadedObject.scene;
    model.position.set(10, 3, 0);

    model.traverse((node) => {
        if(node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
        }
    })
    scene.add(model);
});


// Load Starry Night painting
loader.load('/assets/psx_painting/scene.gltf', (loadedObject) => {
    const model = loadedObject.scene;
    model.position.set(19.99, 2, 3);
    model.rotation.y = -Math.PI / 2;
    model.scale.set(1.6, 1.6, 1.6);

    model.traverse((node) => {
        if(node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
        }
    })
    scene.add(model);
});


/**
 * ---- 6. ANIMATION LOOP ----
 */
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// DEBUG: Add axes helper
const axesHelper = new THREE.AxesHelper(5);
//scene.add(axesHelper);

// DEBUG: Used to determine camera position
controls.addEventListener('change', () => {
    console.log(`Camera Position: x: ${camera.position.x.toFixed(2)}, y: ${camera.position.y.toFixed(2)}, z: ${camera.position.z.toFixed(2)}`);
    console.log(`Camera Rotation: x: ${camera.rotation.x.toFixed(2)}, y: ${camera.rotation.y.toFixed(2)}, z: ${camera.rotation.z.toFixed(2)}`);
});

animate();