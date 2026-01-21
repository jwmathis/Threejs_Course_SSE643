import * as THREE from 'three';

// 1. Create the Scene
const scene = new THREE.Scene();

// 2. Create the Camera
const fov = 40;
const aspectRatio = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(fov, aspectRatio, 0.1, 1000);
camera.position.z = 5;

// 3. Create the Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 4. Create the Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
})

// 5. Create the cubes
const geometry = new THREE.BoxGeometry(1, 1, 1);

// Default cube
const defaultMat = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
const cube1 = new THREE.Mesh(geometry, defaultMat);
cube1.position.set(0, 0, -5);
scene.add(cube1);

// Scaled cube
const scaledMat = new THREE.MeshLambertMaterial({ color: 0xADD8E6 });
const cube2 = new THREE.Mesh(geometry, scaledMat);
cube2.position.set(-3, 0, -5);
cube2.scale.set(1.5, 2, 1);
scene.add(cube2);

// Rotated cube
const rotatedMat = new THREE.MeshPhongMaterial({
    color: 0xFF0000,
    specular: 0xFFFFFF,
    shininess: 30
});
const cube3 = new THREE.Mesh(geometry, rotatedMat);
cube3.position.set(3, 0, -5);
cube3.rotation.x = 45 * (Math.PI / 180);
cube3.rotation.y = 30 * (Math.PI / 180);
scene.add(cube3);

// Transparent cube
const transparentMat = new THREE.MeshBasicMaterial({
    color: 0x0000ff,
    transparent: true,
    opacity: 0.5
});
const cube4 = new THREE.Mesh(geometry, transparentMat);
cube4.position.set(0, -2, -5);
scene.add(cube4);

// 5th cube
const fifthMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
const cube5 = new THREE.Mesh(geometry, fifthMaterial);
cube5.position.set(0, 2, -5);
scene.add(cube5);

// 6. Create the animation loop
function animate() {
    requestAnimationFrame(animate);

    // Vary Hue of cube 4
    const time = Date.now() * 0.001;
    cube4.material.color.setHSL(Math.sin(time) * 0.5 + 0.5, 0.7, 0.5)

    // Added rotation to show 3Dness
    cube1.rotation.y += 0.01;
    cube2.rotation.x += 0.01;
    cube4.rotation.y += 0.06;
    cube5.rotation.y += 0.01;
    renderer.render(scene, camera);
}

animate();