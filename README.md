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

  [Back to Top](#top-of-page)