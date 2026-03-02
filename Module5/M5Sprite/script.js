import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 30);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

// --- Instanced Mesh Setup ---
let instancedSprites;
const dummy = new THREE.Object3D(); 
const spriteCount = 100;
const palette = [0xff5733, 0x33ff57, 0x3357ff, 0xff33a8, 0xffff00];
const spriteData = []; // Store the individual logic for each instance here

function createSprite() {
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({ 
        transparent: true, 
        opacity: 0.8,
        side: THREE.DoubleSide 
    });

    instancedSprites = new THREE.InstancedMesh(geometry, material, spriteCount);
    
    // Enable color support per instance
    instancedSprites.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(spriteCount * 3), 3);

    for (let i = 0; i < spriteCount; i++) {
        const color = new THREE.Color(palette[i % palette.length]);
        const pos = new THREE.Vector3(
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 30
        );
        const scale = Math.random() * 1.9 + 0.1;

        spriteData.push({
            baseX: pos.x,
            baseY: pos.y,
            baseZ: pos.z,
            phase: Math.random() * Math.PI * 2,
            originalColor: color,
            scale: scale,
            rotationZ: 0 
        });

        dummy.position.copy(pos);
        dummy.scale.set(scale, scale, 1);
        dummy.updateMatrix();
        instancedSprites.setMatrixAt(i, dummy.matrix);
        instancedSprites.setColorAt(i, color);
    }
    
    scene.add(instancedSprites);
}
createSprite();

// --- Selection Logic ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedIndex = null; // Track the index (ID) of the instance, not an object

window.addEventListener('click', (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    
    // Check intersection against the one instanced mesh
    const intersects = raycaster.intersectObject(instancedSprites);

    // 1. Reset old selection color
    if (selectedIndex !== null) {
        console.log("Resetting Instance:", selectedIndex);
        console.log("Resetting:", spriteData[selectedIndex]);
        console.log("Resetting Color:", spriteData[selectedIndex].originalColor);
        instancedSprites.setColorAt(selectedIndex, spriteData[selectedIndex].originalColor);
    }

    if (intersects.length > 0) {
        // 2. Get the instanceId of the one clicked
        selectedIndex = intersects[0].instanceId; 
        instancedSprites.setColorAt(selectedIndex, new THREE.Color(0xffffff));
        console.log("Matched Instance:", selectedIndex);
    } else {
        selectedIndex = null;
        console.log("No Sprite Match");
    }
    
    // Tell Three.js the colors changed
    instancedSprites.instanceColor.needsUpdate = true;
});

// --- WASD Logic ---
window.addEventListener('keydown', (event) => {
    if (selectedIndex === null) return;
    
    const speed = 0.5;
    const key = event.key.toLowerCase();
    const data = spriteData[selectedIndex];

    if (key === 'w') data.baseZ += speed;
    if (key === 's') data.baseZ -= speed;
    if (key === 'a') data.baseX -= speed;
    if (key === 'd') data.baseX += speed;
});

// --- Toggle Depth Logic ---
let useDepthBuffer = true;
document.getElementById('toggleSort').addEventListener('click', () => {
    useDepthBuffer = !useDepthBuffer;
    document.getElementById('status').innerText = `Depth Test: ${useDepthBuffer ? 'ON' : 'OFF'}`;
    instancedSprites.material.depthTest = useDepthBuffer;
    instancedSprites.material.needsUpdate = true;
});

// --- Animation Loop ---
function animate() {
    stats.begin();
    requestAnimationFrame(animate);
    const time = performance.now() * 0.001;

    for (let i = 0; i < spriteCount; i++) {
        const data = spriteData[i];
        
        // Use the dummy to calculate the new position for this specific instance
        if (i === selectedIndex) {
            dummy.position.set(data.baseX, data.baseY, data.baseZ);
        } else {
            // Movement on X-Z plane
            dummy.position.x = data.baseX + Math.sin(data.phase + time) * 2;
            dummy.position.z = data.baseZ + Math.cos(data.phase + time) * 2;
            dummy.position.y = data.baseY;
        }

        // Billboarding: Make the plane face the camera (mimics a Sprite)
        dummy.quaternion.copy(camera.quaternion);
        
        // Requirement: Rotation around Y-axis (or Z for billboarding effect)
        data.rotationZ += 0.02;
        dummy.rotation.z = data.rotationZ;

        dummy.scale.set(data.scale, data.scale, 1);
        dummy.updateMatrix();
        
        // Push the dummy's transformation into the instanced array
        instancedSprites.setMatrixAt(i, dummy.matrix);
    }

    instancedSprites.instanceMatrix.needsUpdate = true;
    controls.update();
    renderer.render(scene, camera);
    stats.end();
}
animate();