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
//scene.fog = new THREE.Fog(0xF0EAD6, 10, 50);

/**
 * ---- 2. CAMERA & RENDERER ----
 * PerspectiveCamera setup with ACES Filmic Tone Mapping for
 * photographic-quality highlights and contrast
 */
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(8.15, 3.45, 6.57); // Position camera angle to see front and side of the statue

camera.rotation.order = 'YXZ'; // Handles Gimbal Lock. Yaw first, then pitch, then roll

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // High-quality soft edges
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
document.body.appendChild(renderer.domElement);

// DISABLED: OrbitControls for interactive navigation
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true; // Makes moving smooth
// controls.target.set(14, 1.2, 2); // Centered on main exhibit




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
        metalness: 0.0,
        side: THREE.DoubleSide,
    });
    const wall = new THREE.Mesh(geometry, material);
    wall.receiveShadow = true; // Essential for your Directional and Spotlights!
    return wall;
}

function createWallWithDoor(totalWidth, totalHeight, doorWidth, doorHeight, doorX, color) {
    const wallGroup = new THREE.Group();

    // Left piece
    const leftWidth = doorX - (doorWidth / 2);
    const leftPiece = createWall(leftWidth, totalHeight, color);
    leftPiece.position.x = leftWidth / 2;
    wallGroup.add(leftPiece);

    // Right piece
    const rightWidth = totalWidth - (doorX + (doorWidth / 2));
    const rightPiece = createWall(rightWidth, totalHeight, color);
    rightPiece.position.x = totalWidth - (rightWidth / 2);
    wallGroup.add(rightPiece);

    // Top Piece
    const topHeight = totalHeight - doorHeight;
    const topPiece = createWall(doorWidth, topHeight, color);
    topPiece.position.x = doorX;
    topPiece.position.y = doorHeight-1;
    wallGroup.add(topPiece);

    return wallGroup;
}
// Back Wall
const backWall = createWall(20, 10, 0xF0EAD6);
backWall.position.x = 10;
scene.add(backWall);

// Left Wall
const leftWallWithDoor = createWallWithDoor(20, 10, 3, 7, 10,0xF0EAD6 );
leftWallWithDoor.position.x = 0;
leftWallWithDoor.rotation.y = -Math.PI / 2;
leftWallWithDoor.position.z = 0;
scene.add(leftWallWithDoor);

// Right Wall
const rightWall = createWall(40, 10, 0xF0EAD6);
rightWall.position.x = 20;
rightWall.rotation.y = -Math.PI / 2;
scene.add(rightWall);

// Wall
const WallWithDoor = createWallWithDoor(20, 10, 3, 7, 3,0xF0EAD6 );
WallWithDoor.position.x = -20;
WallWithDoor.position.z = 0;
scene.add(WallWithDoor);

const leftWall = createWall(40, 10, 0xF0EAD6);
leftWall.position.x = -20;
leftWall.rotation.y = -Math.PI / 2;
leftWall.position.z = 0;
scene.add(leftWall);

// Wall
const WallWithDoor2 = createWallWithDoor(20, 10, 3, 7, 8,0xF0EAD6 );
WallWithDoor2.position.x = -9.5;
WallWithDoor2.rotation.y = Math.PI / 2;
WallWithDoor2.position.z = 0;
scene.add(WallWithDoor2);

const backWall2 = createWall(40, 10, 0xF0EAD6);
backWall2.position.x = 0;
backWall2.position.z = -20;
scene.add(backWall2);


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

// Load stylized_little_japanese_town_street
loader.load('/assets/stylized_little_japanese_town_street/scene.gltf', (loadedObject) => {
    const model = loadedObject.scene;
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.y = 0.5;
    model.position.x += 6;
    model.position.z -= 11;
    model.rotation.y = Math.PI / 2;
    model.scale.set(0.02, 0.02, 0.02);
    scene.add(model);
});

// ---- Keyboard State ----
const keys = {
    w: false, s:false, a:false, d:false,
    ArrowUp:false, ArrowDown:false, ArrowLeft:false, ArrowRight:false,
    shift: false
};

// Event listeners for smooth tracking
window.addEventListener('keydown', (e) => {
    if (e.key === 'Shift') keys.shift = true;
    if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'Shift') keys.shift = false;
    if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
});

/**
 * ---- 6. ANIMATION LOOP ----
 */
const moveSpeed = 0.1;
const rotateSpeed = 0.02;
const eyeLevel = 2.45;
const minPitch = -Math.PI/2.1;
const maxPitch = Math.PI/2.1;
let bobTimer = 0;
const bobSpeed = 2.2;
const bobAmount = 0.05;
const posDisplay = document.getElementById('pos-display');
const rotDisplay = document.getElementById('rot-display');

function updateUI() {
    const x = camera.position.x.toFixed(2);
    const y = camera.position.y.toFixed(2);
    const z = camera.position.z.toFixed(2);

    const rx = THREE.MathUtils.radToDeg(camera.rotation.x).toFixed(0);
    const ry = THREE.MathUtils.radToDeg(camera.rotation.y).toFixed(0);
    const rz = THREE.MathUtils.radToDeg(camera.rotation.z).toFixed(0);

    posDisplay.innerText = `Pos: X: ${x}, Y: ${y}, Z: ${z}`;
    rotDisplay.innerText = `Rot: ${rx}°, ${ry}°, ${rz}°`;
}

// Locate this in your code and make sure all walls are added:
const collisionObjects = [];
collisionObjects.push(
    backWall,
    rightWall,
    leftWallWithDoor,
    WallWithDoor,
    leftWall,
    WallWithDoor2,
    backWall2
);
const raycaster = new THREE.Raycaster();
const collisionDistance = 1.2; // Distance from wall to stop at

function updateCamera() {
    const isMoving = keys.w || keys.s || keys.a || keys.d;

    const currentSpeed = keys.shift ? moveSpeed * 2.5 : moveSpeed;
    const currentBobSpeed = keys.shift ? bobSpeed * 1.5 : bobSpeed;

    // 1. Determine Movement Vector
    let moveVector = new THREE.Vector3(0, 0, 0);

    // We calculate the direction relative to where the camera is looking
    let forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0; // Keep movement on the ground plane
    forward.normalize();

    let right = new THREE.Vector3().crossVectors(camera.up, forward).normalize();

    // Add up the intended direction based on keys
    if (keys.w) moveVector.add(forward);
    if (keys.s) moveVector.sub(forward);
    if (keys.a) moveVector.add(right);
    if (keys.d) moveVector.sub(right);

    if (moveVector.length() > 0) {
        moveVector.normalize().multiplyScalar(currentSpeed);

        // 2. RAYCAST CHECK
        // Point the raycaster in the direction we want to move
        raycaster.set(camera.position, moveVector.clone().normalize());

        // Check intersections with our walls (true = check children inside Groups)
        const intersections = raycaster.intersectObjects(collisionObjects, true);

        // 3. APPLY MOVEMENT IF CLEAR
        if (intersections.length > 0 && intersections[0].distance < collisionDistance) {
            // Do nothing - a wall is in the way!
        } else {
            camera.position.add(moveVector);
        }
    }

    // --- Head Bobbing ---
    if (isMoving) {
        bobTimer += 0.1;
        camera.position.y = eyeLevel + Math.sin(bobTimer * currentBobSpeed) * bobAmount;
    } else {
        camera.position.y += (eyeLevel - camera.position.y) * 0.1;
        bobTimer = 0;
    }

    // --- Rotation ---
    if (keys.ArrowLeft) camera.rotateOnWorldAxis(new THREE.Vector3(0,1,0), rotateSpeed);
    if (keys.ArrowRight) camera.rotateOnWorldAxis(new THREE.Vector3(0,1,0), -rotateSpeed);
    if (keys.ArrowUp) camera.rotateX(rotateSpeed);
    if (keys.ArrowDown) camera.rotateX(-rotateSpeed);

    // Limit looking up/down
    camera.rotation.x = Math.max(minPitch, Math.min(maxPitch, camera.rotation.x));
    camera.rotation.z = 0; // Force horizon to stay level
}
function animate() {
    requestAnimationFrame(animate);
    //controls.update();
    updateCamera();
    updateUI();
    renderer.render(scene, camera);
}

// DEBUG: Add axes helper
const axesHelper = new THREE.AxesHelper(5);
//scene.add(axesHelper);

// DISABLED DEBUG: Used to determine camera position
// controls.addEventListener('change', () => {
//     console.log(`Camera Position: x: ${camera.position.x.toFixed(2)}, y: ${camera.position.y.toFixed(2)}, z: ${camera.position.z.toFixed(2)}`);
//     console.log(`Camera Rotation: x: ${camera.rotation.x.toFixed(2)}, y: ${camera.rotation.y.toFixed(2)}, z: ${camera.rotation.z.toFixed(2)}`);
// });

animate();