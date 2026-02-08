import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js' // For camera movement


/**
 * ---- 1. SCENE SETUP ----
 * Utilizing a warm Ivory background and Fog to simulate
 * atmospheric depth and seamless background blending
 ***/
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xfff8e1); // Warm Ivory

/**
 * ---- 2. CAMERA SETUP ----
 * PerspectiveCamera
 ***/

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 12);
const aspect = window.innerWidth / window.innerHeight;
const d = 20; // This defines the "view size"
const orthoCamera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 0.1, 1000);
orthoCamera.position.set(0, 20, 20); // Pointing down at the scene
orthoCamera.lookAt(0, 0, 0);

let activeCamera = camera;
/**
 * ---- 3. RENDERER SETUP ----
 * WebGLRenderer with anti-aliasing for smoother edges
 ***/

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/**
 * ---- 4. CONTROLS ----
 * OrbitControls for camera movement
 ***/

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
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
 **/

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Soft white light
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xfff5e6, 2.0);
mainLight.position.set(5, 5, 5);
scene.add(mainLight);

// Create an array for "Extra" lights to test GPU load
const extraLights = [];
for (let i = 0; i < 4; i++) {
    const pLight = new THREE.PointLight(0xffffff, 10);
    // Position them around the scene
    pLight.position.set(Math.random() * 20 - 10, 10, Math.random() * 20 - 10);
    pLight.visible = false; // Start with them off
    scene.add(pLight);
    extraLights.push(pLight);
}

let lightMode = 1; // 0: None, 1: Standard, 2: Overload


/**
 * --- 6. GEOMETRY AND MATERIALS ---
 */

const floorGeom = new THREE.PlaneGeometry(100, 100);
const floorMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.8 });
const floor = new THREE.Mesh(floorGeom, floorMat);
floor.rotation.x = -Math.PI / 2; // Lay it flat
floor.position.y = 0;
scene.add(floor);

//const torus_geometry = new THREE.TorusGeometry(1, 0.3, 10, 20); // Low Poly
const torus_geometry = new THREE.TorusGeometry(1, 0.3, 100, 200); // High Poly
const torus_material = new THREE.MeshStandardMaterial({ color: 0x00FF00 });
const basic_red_torus_material = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
const torus = new THREE.Mesh(torus_geometry, torus_material);
torus.position.set(0, 3, 0);
torus.rotation.x = Math.PI / 2;
scene.add(torus);

/**
 * ---- 7. FPS Counter Logic ----
 *  
 * ***/
let fps = 0;
let lastTime = performance.now();
let frames = 0;

const infoPanel = document.createElement('div');
infoPanel.style.position = 'absolute';
infoPanel.style.top = '10px';
infoPanel.style.right = '10px';
infoPanel.style.color = 'white';
infoPanel.style.background = 'rgba(0, 0, 0, 0.7)';
infoPanel.style.fontFamily = 'monospace';
document.body.appendChild(infoPanel);

let torusCount = 1;
let torusArray = [];

window.addEventListener('keydown', (event) => {
    // ADD TORI
    if (event.key.toLowerCase() === 't') {
        addTorus(100);// Add 100 tori
        torusCount += 100;
        console.log(`Added ${torusCount} tori`);
    }

    // REMOVE ALL TORI
    if (event.key.toLowerCase() === 'r') {
        torusArray.forEach(t => {
            scene.remove(t); // Remove from 3D view
            t.geometry.dispose(); // Clean up GPU memory
            t.material.dispose(); // Clean up GPU memory
        });
        torusArray = []; // Empty the array
        torusCount = 1;
        console.log("All tori removed");
    }

    // ERASE TORI (10)
    if (event.key.toLowerCase() === 'e') { // 'E' for Erase chunk
        for(let i = 0; i < 10; i++) {
            const lastTorus = torusArray.pop();
            if(lastTorus) scene.remove(lastTorus);
        }
        torusCount = torusArray.length + 1;
    }

    // SWITCH MATERIAL
    if (event.key.toLowerCase() === 'm') {
        scene.traverse((obj) => {
            if (obj.isMesh && obj !== floor) {
                obj.material = (obj.material.type === 'MeshStandardMaterial') ? basic_red_torus_material : torus_material;
            }
        });
        console.log(`Material Switched: ${torus.material.type}`);
    }

    // SWITCH CAMERA
    if (event.key.toLowerCase() === 'c') {
        // Toggle the active camera
        activeCamera = (activeCamera === camera) ? orthoCamera : camera;
        
        // Update controls to the new camera
        controls.object = activeCamera;
        controls.update();
        
        console.log(`Camera Switched to: ${activeCamera.type}`);
    }

    // SWITCH LIGHTING
    if (event.key.toLowerCase() === 'l') {
        lightMode = (lightMode + 1) % 3;

        if (lightMode === 0) {
            // Mode 0: Pitch Black (Only Basic materials will show)
            ambientLight.intensity = 0;
            mainLight.visible = false;
            extraLights.forEach(l => l.visible = false);
            console.log("Lighting: Off");
        } else if (lightMode === 1) {
            // Mode 1: Standard Lighting
            ambientLight.intensity = 0.4;
            mainLight.visible = true;
            extraLights.forEach(l => l.visible = false);
            console.log("Lighting: Standard");
        } else {
            // Mode 2: GPU Stress (Multiple Point Lights)
            ambientLight.intensity = 0.6;
            mainLight.visible = true;
            extraLights.forEach(l => l.visible = true);
            console.log("Lighting: Overload (Multiple Lights)");
        }
    }

});


function addTorus (count) {
    for (let i = 0; i < count; i++) {
        const newTorus = torus.clone();
        newTorus.position.set(
            (Math.random() * 0.5) * 40, 
            Math.random() * 20, 
            (Math.random() * 0.5) * 40
        );
        newTorus.rotation.set(Math.random()  * Math.PI, Math.random() * Math.PI, 0);
        scene.add(newTorus);
        torusArray.push(newTorus);
    }
}

function animate () {
    requestAnimationFrame(animate);
    frames++;
    const currentTime = performance.now();
    if(currentTime >= lastTime + 1000) {
        fps = frames;
        frames = 0;
        lastTime = currentTime;
    }

    infoPanel.innerHTML = `
            Torus Count: ${torusCount}<br>
            FPS: ${fps}<br>
            Press 'T' to add 100 tori<br>
            Press 'E' to erase 10 tori<br>
            Press 'M' to switch materials<br>
            Press 'R' to remove all tori<br>
            Press 'C' to switch camera<br>
            Press 'L' to switch lighting
        `;
    controls.update();
    renderer.render(scene, activeCamera);
}

animate();