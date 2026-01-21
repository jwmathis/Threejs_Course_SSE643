# Interactive 3D Museum Walkthrough
A high-fidelity, first person 3D gallery experience built with Three.js. This project features a multi-room layout, dynamic lighting, custom physics-based movement, and real-time telemetry.

## Quick Start

### Prerequisites
* A modern web browser (Chrome, Firefox, or Edge recommended).
* A local development server (this project uses ES modules and loads external .gltf models).

### Installation & Running
  1. CLone or Download this repository to your local machine.
  2. Open a terminal in the project folder.
  3. Start a local server:
    * If you have Node.js installed, run npx serve .
    * If you use VS Code, right-click index.html and select "Open with Live Server"
    * If you have Python installed, run: python -m http.server
  4. Navigate to http://localhost:5000 (or the port provided by your server).

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

    
