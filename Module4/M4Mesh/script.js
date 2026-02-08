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


/**
 * --- 6. GEOMETRY AND MATERIALS ---
 */

const floorGeom = new THREE.PlaneGeometry(100, 100);
const floorMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.8 });
const floor = new THREE.Mesh(floorGeom, floorMat);
floor.userData = {
    name: "Floor",
    description: "A flat surface",
    color: 0xeeeeee
}
floor.rotation.x = -Math.PI / 2; // Lay it flat
floor.position.y = -1;
scene.add(floor);

const sphere_geometry = new THREE.SphereGeometry(1, 32, 32);
const cube_geometry = new THREE.BoxGeometry(3, 3, 3);
const torus_geometry = new THREE.TorusGeometry(1, 0.5, 16, 100);
const cylinder_geometry = new THREE.CylinderGeometry(1, 1, 2, 32);

const sphere_material = new THREE.MeshPhongMaterial({ color: 0x3357ff, // Vivid Blue
    shininess: 100,
    specular: 0xaaaaaa,
    transparent: true,
    opacity: 0.8 });
const cube_material = new THREE.MeshStandardMaterial({ color: 0xff33a8, // Hot Pink
    roughness: 0.5,
    metalness: 0.5 });
const torus_material = new THREE.MeshStandardMaterial({ color: 0xff5733 });
const cylinder_material = new THREE.MeshStandardMaterial({ color: 0x00FF00 });

const bufferGeom = new THREE.BufferGeometry();
const vertices = new Float32Array([
    -2, 0, 0,
    0, 3, 0,
    2, 0, 0,
    0, -1, 2
]);

const indices = [
    0, 1, 2,
    0, 2, 3,
    1, 0, 3
];
bufferGeom.setIndex(indices);
bufferGeom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
bufferGeom.computeVertexNormals();

const customMesh = new THREE.Mesh(bufferGeom, new THREE.MeshNormalMaterial({
    color: 0xffff00,
    wireframe: true,
    side: THREE.DoubleSide
}));

customMesh.position.set(0, 5, -5);
customMesh.userData = {
    name: "Custom Mesh",
    description: "A custom 3D object",
    color: 0xffff00
}
scene.add(customMesh);

const shapeInfo = [
    { name: "Blue Sphere", description: "Smooth and shiny" },
    { name: "Pink Cube", description: "A solid box" },
    { name: "Orange Torus", description: "Looks like a donut" },
    { name: "Green Cylinder", description: "A tall pillar" }
];

const geometries = [sphere_geometry, cube_geometry, torus_geometry, cylinder_geometry];
const materials = [sphere_material, cube_material, torus_material, cylinder_material];
const shapes = geometries.map((g, index) => {
    const mesh = new THREE.Mesh(g, materials[index]);

    mesh.userData = {
        name: shapeInfo[index].name,
        description: shapeInfo[index].description,
        id: index
    };

    return mesh;
});

shapes.forEach((s, index) => {
    s.position.set(-6 + (index * 3), 1.0, 0); // Evenly spaced in a line
    scene.add(s);
});


const matNormal = new THREE.MeshNormalMaterial();
const matDepth = new THREE.MeshDepthMaterial();

const material_list = [cube_material, matNormal, matDepth, sphere_material, torus_material, cylinder_material];
/**
 * ---- 7. Information Display Logic ----
 *  
 * ***/

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const infoPanel = document.createElement('div');
infoPanel.style.position = 'absolute';
infoPanel.style.top = '10px';
infoPanel.style.right = '10px';
infoPanel.style.color = 'white';
infoPanel.style.background = 'rgba(0, 0, 0, 0.7)';
infoPanel.style.fontFamily = 'monospace';
document.body.appendChild(infoPanel);

window.addEventListener('keydown', (event) => {
     if (event.code === 'Space') {
        grid.visible = !grid.visible;
        axesHelper.visible = !axesHelper.visible;
    }

    const cylinder = shapes[3];
    if (event.key.toLowerCase() === 'k') {
        cylinder.scale.y += 0.2;
    }
    if (event.key.toLowerCase() === 'j') {
        cylinder.scale.y -= 0.2;
    }
});
window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});
window.addEventListener('click', () => {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(shapes);
    if (intersects.length > 0) {
        const obj = intersects[0].object;
        console.log(obj);
        if (obj.material === cube_material) {
            obj.material = matNormal;
        } else if (obj.material === matNormal) {
            obj.material = matDepth;
        } else {
            obj.material = material_list[Math.floor(Math.random() * material_list.length) ];
        }
    }
});

function updateTooltip() {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);

  const tooltip = document.getElementById('tooltip');

  if (intersects.length > 0) {
    const hoveredObject = intersects[0].object;
    
    // 1. Get the 3D position of the object
    const vector = new THREE.Vector3();
    hoveredObject.getWorldPosition(vector);

    // 2. Project 3D point to 2D screen space
    vector.project(camera);

    // 3. Map projected coordinates to CSS pixels
    const x = (vector.x * .5 + .5) * window.innerWidth;
    const y = (vector.y * -.5 + .5) * window.innerHeight;

    
    // 4. Update the DOM element
    const name = hoveredObject.userData.name;
    const description = hoveredObject.userData.description;
    tooltip.style.display = 'block';
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
    tooltip.innerHTML = `<strong>${name}</strong><br>${description}`;
  } else {
    tooltip.style.display = 'none';
  }
}

function animate () {
    requestAnimationFrame(animate);

    shapes[2].rotation.y += 0.01;
    shapes[2].rotation.x += 0.01;
    updateTooltip();

    infoPanel.innerHTML = `
            Press 'Space' to toggle grid and axes<br>
            Press 'K' to increase cylinder height<br>
            Press 'J' to decrease cylinder height<br>
            Click on a shape to change its material
        `;

    controls.update();
    renderer.render(scene, camera);
}

animate();