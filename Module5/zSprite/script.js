import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';

/**
 * MODULE: SpriteEngine
 * Handles creation, batching, and animation logic.
 */
class SpriteEngine {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.count = 100;
        this.dummy = new THREE.Object3D();
        this.palette = [0xff595e, 0xffca3a, 0x8ac926, 0x1982c4, 0x6a4c93];
        this.spriteData = [];
        this.mesh = null;
        this.selectedIndex = null;

        this._init();
    }

    _init() {
        const geometry = new THREE.PlaneGeometry(1, 1);
        const material = new THREE.MeshPhongMaterial({ 
            transparent: true, opacity: 0.9, side: THREE.DoubleSide, alphaTest: 0.1
        });

        this.mesh = new THREE.InstancedMesh(geometry, material, this.count);
        this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        
        // Initialize Color Buffer
        const colorArray = new Float32Array(this.count * 3);
        this.mesh.instanceColor = new THREE.InstancedBufferAttribute(colorArray, 3);

        for (let i = 0; i < this.count; i++) {
            const color = new THREE.Color(this.palette[Math.floor(Math.random() * this.palette.length)]);
            const pos = new THREE.Vector3((Math.random()-0.5)*40, (Math.random()-0.5)*20, (Math.random()-0.5)*40);
            const scale = Math.random() * 1.9 + 0.1;

            this.spriteData.push({ pos, phase: Math.random()*Math.PI*2, originalColor: color.clone(), scale, rotationY: 0 });
            
            this.dummy.position.copy(pos);
            this.dummy.scale.setScalar(scale);
            this.dummy.updateMatrix();
            this.mesh.setMatrixAt(i, this.dummy.matrix);
            this.mesh.setColorAt(i, color);
        }
        this.scene.add(this.mesh);

        const sun = new THREE.DirectionalLight(0xffffff, 1);
        sun.position.set(5, 10, 7.5);
        this.scene.add(sun, new THREE.AmbientLight(0x404040));
    }

    update(time) {
        for (let i = 0; i < this.count; i++) {
            const data = this.spriteData[i];
            let { x, y, z } = data.pos;

            if (i !== this.selectedIndex) {
                x += Math.sin(time + data.phase) * 2.0;
                z += Math.cos(time + data.phase) * 2.0;
            }

            this.dummy.position.set(x, y, z);
            data.rotationY += 0.02;
            this.dummy.quaternion.copy(this.camera.quaternion);
            this.dummy.rotateZ(data.rotationY); 
            this.dummy.scale.setScalar(data.scale);
            this.dummy.updateMatrix();
            this.mesh.setMatrixAt(i, this.dummy.matrix);
        }
        this.mesh.instanceMatrix.needsUpdate = true;
    }

    highlight(index) {
        if (this.selectedIndex !== null) {
            this.mesh.setColorAt(this.selectedIndex, this.spriteData[this.selectedIndex].originalColor);
        }
        this.selectedIndex = index;
        if (index !== null) {
            this.mesh.setColorAt(index, new THREE.Color(0xffffff));
        }
        this.mesh.instanceColor.needsUpdate = true;
    }
}

/**
 * MODULE: InteractionHandler
 * Handles Raycasting and Keyboard events.
 */
class InteractionHandler {
    constructor(engine, renderer, camera) {
        this.engine = engine;
        this.renderer = renderer;
        this.camera = camera;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        window.addEventListener('mousedown', (e) => this.onMouseDown(e));
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
    }

    onMouseDown(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObject(this.engine.mesh);

        if (intersects.length > 0) {
            intersects.sort((a, b) => a.distance - b.distance);
            this.engine.highlight(intersects[0].instanceId);
        } else {
            this.engine.highlight(null);
        }
    }

    onKeyDown(event) {
        if (this.engine.selectedIndex === null) return;
        const speed = 0.5;
        const pos = this.engine.spriteData[this.engine.selectedIndex].pos;
        switch(event.key.toLowerCase()) {
            case 'w': pos.z -= speed; break;
            case 's': pos.z += speed; break;
            case 'a': pos.x -= speed; break;
            case 'd': pos.x += speed; break;
        }
    }
}

// --- APP CORE ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 40);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const stats = new Stats();
document.body.appendChild(stats.dom);

const engine = new SpriteEngine(scene, camera);
new InteractionHandler(engine, renderer, camera);

function animate() {
    requestAnimationFrame(animate);
    stats.begin();
    engine.update(performance.now() * 0.001);
    renderer.render(scene, camera);
    stats.end();
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();