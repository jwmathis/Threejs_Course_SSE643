<a name="top-of-page"></a>
# Quick Start

### Prerequisites
* A modern web browser (Chrome, Firefox, or Edge recommended).
* A local development server (this project uses ES modules and loads external .gltf models).

### Installation & Running
This project is part of a monorepo. To run it locally:
  1. Clone or Download this repository to your local machine.
  2. Open a terminal in the project folder.
  3. **Install Dependencies** (from the root folder):
   ```bash
   npm install
  ```
  4. **Start a development server**: from the root folder, run:

    npm run dev -w [folder-name]

# Modules
[Module 1: Basic Geometry Scenes](#module1)

[Module 2: Lighting and Walking Controls](#module2)

[Module 3: Material and Texture Manipulation](#module3)

[Module 4: A Torus Geometry Stress Test and Exploring Mesh Geometries](#module4)
 
[Module 5: Advanced Sprite System Development with Three.js](#module5sprite)

[Module 5: Three.js Artistic Showcase](#module5scene)

# Module 1 <a name="module1"></a>
Folder: ./Module1 Basic intorduction to Three.js scenes, cameras, renders.

# Module 2 <a name="module2"></a>
Folder: ./Module2

Subfolders:
1) ./Module2/Lighting_Scene
2) ./Module2/Walking_Controls

The following information will provide instructions on how to run .Module2/Walking_Controls
## How to Run:
1. Ensure you have `npm install` in the root.
2. Execute the command
```
  npm run dev -w module2-walking-controls
```
3. Open the local server in your browser.

## Description
A high-fidelity, first person 3D gallery experience built with Three.js. This project features a multi-room layout, dynamic lighting, custom physics-based movement, and real-time telemetry.

### Controls
  The movement system is designed to mimic a standard First-Person Shooter (FPS) "Walkthrough" mode.
  
  **Movement**
  | Key | Action |
  | :--- | :--- |
  | W | Walk Forward |
  | S | Walk Backward |
  | A | Strafe Left |
  | D | Strafe Right |
  | Left Shift | Sprint (Increases movement and bobbing speed) |

  **Camera Rotation (Looking Around)**
  | Key | Action |
  | :--- | :--- |
  | Arrow up | Look Up |
  | Arrow Down | Look Down |
  | Arrow Left | Turn Left |
  | Arrow Right | Turn Right |


### Technical Implementation
 *   Raycast Collision Detection: Uses THREE.Raycaster to prevent the camera from clipping through walls. The system calculates a movement vector and checks for intersections before allowing the position to update.

 *   Procedural View Bobbing: A sine-wave animation is applied to the camera's Y-position during movement to simulate a natural human gait.

 *   Dynamic Lighting: Includes a mix of AmbientLight, DirectionalLight (simulating sun), and high-intensity SpotLights for hero exhibits.

 *   Telemetry HUD: A real-time overlay built with HTML/CSS that tracks the camera’s global XYZ coordinates and Euler rotation angles.

### The Gallery
  * The Main Hall: Houses the "Statue of a Hunter" and classic paintings.

  * The Japanese Wing: An outdoor-style exhibit featuring a stylized Japanese town street.

  * Architectural Flow: Modular walls with doorway openings allow the user to transition between different exhibit environments seamlessly.

### Project Structure

   * index.html - The entry point and UI overlay.

   * main.js - The core Three.js logic (Scene, Camera, Renderer, and Animation).

   * /assets/ - Contains GLTF models and textures for the exhibits.
    
### Troubleshooting

  *  Camera "Stuck": If the camera cannot move, check the Telemetry HUD. You may be colliding with a wall's collision boundary. Simply turn and walk in the opposite direction.


# Module 3 <a name="module3"></a>
Folder: ./Module3
The following information will provide instructions on how to run ./Module3

## How to Run:
1. Ensure you have `npm install` in the root.
2. Execute the command
```
  npm run dev -w module3
```
3. Open the local server in your browser.

## Description
This project features shapes with various materials/textures to explore how lighting materials and lighting affect appearance.

### Controls
  | Key | Action |
  | :--- | :--- |
  | 'Space' | Turn on Axes and Grid helpers and the floor |
  | 'o' | Activate sphere orbiting |
  | 'm' | Alternate between the materials on the hero shape |


# Module 4 <a name="module4"></a>
Folder: ./Module4
The following information will provide instructions on how to run ./Module4/m4torus

## How to Run:
1. Ensure you have `npm install` in the root.
2. Execute the command
```
  npm run dev -w m4torus
```
3. Open the local server in your browser.

## Description
This project stress tests the GPU by exploring how multiple objects affect the GPU along with lighting and materials.

### Controls
  | Key | Action |
  | :--- | :--- |
  | 'T' | Add Torus objects (100 at a time) |
  | 'E' | Erase Torus objects (10 at a time) |
  | 'R' | Remove all torus objects |
  | 'M' | Alternate between the materials |
  | 'C' | Alternate between the cameras (Perspective vs Orthographic) |
  | 'L' | Alternate between the lighting |


Folder: ./Module4
The following information will provide instructions on how to run ./Module4/m4mesh

## How to Run:
1. Ensure you have `npm install` in the root.
2. Execute the command
```
  npm run dev -w m4mesh
```
3. Open the local server in your browser.

## Description
This project explores user interaction, displaying information, manipulating meshes.

### Controls
  | Key | Action |
  | :--- | :--- |
  | 'Space' | Turn on/off grid and axes helpers |
  | 'K' | Increase cylinder height |
  | 'J' | Decrease cylinder height |
  | 'Click on a shape' | Alternate between the materials on each shape |

# Module 5: Advanced Sprite System Development with Three.js <a name="module5sprite"></a>

## Project Overview
This project demonstrates a high-performance 3D environment built with Three.js, focusing on the efficient management of a large number of interactive objects. Instead of traditional `THREE.Sprite` objects, this implementation uses `InstancedMesh` with a custom billboarding logic. This approach significantly reduces draw calls, allowing the GPU to render hundreds of independent entities in a single pass while maintinaing individual interactivity, movement, and color states. 

## How to Run the Project
Becasue this project is housed within a monorepository, you must target the specific workspace using npm.
1. Navigate to the root of the monorepo.
2. Install dependencies (if not already done):
```
npm install
```
3. Run the m5sprite workspace:
```
npm run dev -w "m5sprite"
```
4. Open your broswer to the local address provided (typically http://localhost:5173).

## Implemented Features
* High-Performance Instancing: Renders 100+ entities using a single `THREE.InstancedMesh` to optimize GPU overhead.
* Custom Billboarding Logic: Manually syncs instance quaternions to the `camera.quaternion` to mimic sprite behavior using `PlaneGeometry`.
* Raycasting & Selection: Custom logic to identify specific `instanceId` values from a single mesh, allowing users to "select" individual instances with a mouse click.
* Interactive Controls: 
  * Selection: Click an object to highlight it in white.
  * WASD Movement: Once slected, use the W, A, S, and D keys to move the specific instance through 3D space.
  * Depth Toggle: A UI button to toggle depthTest, demonstrating how transparency and sorting affect the visual overlap of objects.
* Dynamic Animation: Non-selected objects follow a procedural sine/cosine orbital path.
* Performance Monitoring: Integrated `Stats.js` to track frame rates and MS latency in real-time.

## Challenges and Solutions
1. Identifying Single Instances
**Challenge**: Typically, a Raycaster returns the entire Mesh object. Since 1000 objects are part of one `InstancedMesh`, clicking one would usually select all of them.
**Solution**: Using the `instanceId` property returned by the Raycaster. This allowed for a lookup in a local `spriteData` array to modify only the specific matrix and color for that unique ID.

2. Manual Billboarding vs, Sprite Class
**Challenge**: THREE.Sprite objects are easy to use but do not support `InstancedMesh` easily. Using `PlaneGeometry` meant the objects would look flat when viewed from the side.
**Solution**: In the animation loop, I force each instance's quaternion to copy the camera's quaternion:
`dummy.quaternion,cop(Camera.quaternion);`
This ensures the sprites always face the user, regardless of camera movement.

3. State Management in Instancing
**Challenge**: `InstancedMesh` does not store positionsl it only stores a large Matrix4 array.
**Solution**: Created a `spriteData` array to act as a dictionary for positions, scales, and colors. Te animation loop reads from this array, updates a `dummy` object, and then pushes those changes back to the `instanceMatrix`.


# Module 5: Three.js Artistic Showcase <a name="module5scene"></a>

## Project Overview
The concept for this was to create an atmospheric, living world inspired by the environmental storytelling of games like The Legend of Zelda: Breath of the Wild. My goal was to move beyond static 3D models and instead focus on dynamic systems, like implementing wind, rain, and movement, to evoke a specific emotional response. My goals were:

* Using low-poly stylized aesthetics combined with high-end post-processing to create a “painterly” look.
* Contrast the tiny, organic movement of the grass with the rigid, towering presence of the central monolith.
* Moving from a viewer to a participant by implementing first-person controls, allowing the user to navigate the stormy field at their own pace.


## How to Run the Project
Becasue this project is housed within a monorepository, you must target the specific workspace using npm.
1. Navigate to the root of the monorepo.
2. Install dependencies (if not already done):
```
npm install
```
3. Run the m5scene workspace:
```
npm run dev -w "m5scene"
```
4. Open your broswer to the local address provided (typically http://localhost:5173).

[Back to Top](#top-of-page)