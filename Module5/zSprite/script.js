import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';

/**
 * MODULE: SpriteEngine
 * This class encapsulates the creation, management, and animation of sprites.
 * It uses InstancedMesh for high-performance rendering of many identical geometries.
 */
class SpriteEngine {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.count = 100; // Total number of sprites to render
        
        // The 'dummy' is a temporary Object3D used to calculate the transformation matrix
        // for each instance before applying it to the InstancedMesh.
        this.dummy = new THREE.Object3D();
        
        // Aesthetic color palette for random assignment
        this.palette = [0xff595e, 0xffca3a, 0x8ac926, 0x1982c4, 0x6a4c93];
        
        // Array to store the 'state' of each sprite (position, phase, original color, etc.)
        this.spriteData = [];
        this.mesh = null;
        this.selectedIndex = null;

        this._init();
    }

    /**
     * Internal initialization method to set up geometry, materials, and the instance mesh.
     */
    _init() {
        // Use a simple 1x1 plane for each sprite
        const geometry = new THREE.PlaneGeometry(1, 1);
        
        // MeshPhongMaterial allows the sprites to respond to scene lighting
        const material = new THREE.MeshPhongMaterial({ 
            transparent: true, 
            opacity: 0.9, 
            side: THREE.DoubleSide, 
            alphaTest: 0.1 // Prevents depth-sorting issues with transparent fragments
        });

        // InstancedMesh creates 'count' copies of geometry/material in one draw call
        this.mesh = new THREE.InstancedMesh(geometry, material, this.count);
        
        // Hint to Three.js that the matrices will be updated every frame (dynamic)
        this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        
        // CRITICAL: We must manually initialize the color buffer attribute (RGB = 3 floats per instance)
        // to allow setColorAt() to work dynamically after the initial render.
        const colorArray = new Float32Array(this.count * 3);
        this.mesh.instanceColor = new THREE.InstancedBufferAttribute(colorArray, 3);

        // Populate initial data and transform instances
        for (let i = 0; i < this.count; i++) {
            const color = new THREE.Color(this.palette[Math.floor(Math.random() * this.palette.length)]);
            
            // Random position within a 40x20x40 volume
            const pos = new THREE.Vector3(
                (Math.random() - 0.5) * 40, 
                (Math.random() - 0.5) * 20, 
                (Math.random() - 0.5) * 40
            );
            
            const scale = Math.random() * 1.9 + 0.1;

            // Store metadata for the animation loop
            this.spriteData.push({ 
                pos, 
                phase: Math.random() * Math.PI * 2, // Random starting point in sine wave
                originalColor: color.clone(), 
                scale, 
                rotationY: 0 
            });
            
            // Update the dummy object to generate a matrix for this specific instance
            this.dummy.position.copy(pos);
            this.dummy.scale.setScalar(scale);
            this.dummy.updateMatrix();
            
            // Commit the matrix and color to the InstancedMesh buffers
            this.mesh.setMatrixAt(i, this.dummy.matrix);
            this.mesh.setColorAt(i, color);
        }
        
        this.scene.add(this.mesh);

        // Add lighting so the MeshPhongMaterial is visible
        const sun = new THREE.DirectionalLight(0xffffff, 1);
        sun.position.set(5, 10, 7.5);
        this.scene.add(sun, new THREE.AmbientLight(0x404040));
    }

    /**
     * The update loop handles sinusoidal movement, billboarding, and rotation.
     * @param {number} time - Current elapsed time in seconds.
     */
    update(time) {
        for (let i = 0; i < this.count; i++) {
            const data = this.spriteData[i];
            let { x, y, z } = data.pos;

            // Sinusoidal movement: applied only if the sprite is NOT currently selected
            if (i !== this.selectedIndex) {
                x += Math.sin(time + data.phase) * 2.0;
                z += Math.cos(time + data.phase) * 2.0;
            }

            this.dummy.position.set(x, y, z);
            
            // 1. Billboarding: Force the plane to face the camera by copying camera rotation
            this.dummy.quaternion.copy(this.camera.quaternion);
            
            // 2. Local Rotation: Increment rotation and apply it relative to the billboard plane
            data.rotationY += 0.02;
            this.dummy.rotateZ(data.rotationY); 

            this.dummy.scale.setScalar(data.scale);
            
            // Recompute the matrix for this instance
            this.dummy.updateMatrix();
            this.mesh.setMatrixAt(i, this.dummy.matrix);
        }
        
        // Notify the GPU that the matrix buffer has changed this frame
        this.mesh.instanceMatrix.needsUpdate = true;
    }

    /**
     * Handles visual feedback for selection.
     * @param {number|null} index - The instance ID to highlight, or null to clear.
     */
    highlight(index) {
        // Reset previous selection to its original color
        if (this.selectedIndex !== null) {
            this.mesh.setColorAt(this.selectedIndex, this.spriteData[this.selectedIndex].originalColor);
        }
        
        this.selectedIndex = index;
        
        // Highlight new selection in pure white
        if (index !== null) {
            this.mesh.setColorAt(index, new THREE.Color(0xffffff));
        }
        
        // Notify the GPU that the color buffer has changed
        this.mesh.instanceColor.needsUpdate = true;
    }
}

/**
 * MODULE: InteractionHandler
 * This class handles mouse raycasting for selection and keyboard input for movement.
 */
class InteractionHandler {
    constructor(engine, renderer, camera) {
        this.engine = engine;
        this.renderer = renderer;
        this.camera = camera;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // Standard event listeners for desktop interaction
        window.addEventListener('mousedown', (e) => this.onMouseDown(e));
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
    }

    /**
     * Uses Raycasting to determine if a sprite instance was clicked.
     */
    onMouseDown(event) {
        // Normalize mouse coordinates to [-1, 1] range relative to the canvas
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Cast a ray from the camera through the mouse position
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // intersectObject handles InstancedMesh automatically, providing 'instanceId'
        const intersects = this.raycaster.intersectObject(this.engine.mesh);

        if (intersects.length > 0) {
            // Sort by distance (closest first) and highlight the top result
            intersects.sort((a, b) => a.distance - b.distance);
            this.engine.highlight(intersects[0].instanceId);
        } else {
            // Clear selection if clicking on empty space
            this.engine.highlight(null);
        }
    }

    /**
     * Handles WASD movement for the currently selected sprite.
     */
    onKeyDown(event) {
        if (this.engine.selectedIndex === null) return;
        
        const speed = 0.5;
        const pos = this.engine.spriteData[this.engine.selectedIndex].pos;
        
        switch(event.key.toLowerCase()) {
            case 'w': pos.z -= speed; break; // Forward
            case 's': pos.z += speed; break; // Backward
            case 'a': pos.x -= speed; break; // Left
            case 'd': pos.x += speed; break; // Right
        }
    }
}

// --- APP CORE INITIALIZATION ---

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 40);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Stats monitor (FPS counter)
const stats = new Stats();
document.body.appendChild(stats.dom);

// Instantiate our custom modules
const engine = new SpriteEngine(scene, camera);
const interaction = new InteractionHandler(engine, renderer, camera);

/**
 * Main Render Loop
 */
function animate() {
    requestAnimationFrame(animate);
    
    stats.begin();
    
    // Pass current time to the engine for math calculations
    const time = performance.now() * 0.001;
    engine.update(time);
    
    renderer.render(scene, camera);
    
    stats.end();
}

// Responsive window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start the engine
animate();