========================================================================
PROJECT: ADVANCED SPRITE SYSTEM (THREE.JS)
COURSE: SSE643 - MODULE 5 ASSIGNMENT
DEVELOPER: 
DATE: March 2026
========================================================================

--- PROJECT OVERVIEW ---
This project demonstrates an optimized, interactive 3D sprite system 
built using the Three.js library. The application features 100 
dynamically generated sprites that animate along sinusoidal paths, 
respond to user selection, and allow for manual keyboard-based 
repositioning.

--- KEY FUNCTIONALITIES ---

1. Sprite Generation & Animation:
   - 100 sprites spawned at random positions within a 40x20x40 3D box.
   - Randomized uniform scaling (0.1 to 2.0).
   - Randomized colors selected from a 5-color aesthetic palette.
   - Looping animation: Each sprite rotates on its local axis while 
     following a smooth sinusoidal (sine/cosine) path on the X-Z plane.

2. Performance Optimization (Batching):
   - Utilizes THREE.InstancedMesh to consolidate 100 individual sprites 
     into a single GPU draw call.
   - Uses InstancedBufferAttributes for per-instance color updates, 
     significantly reducing CPU-to-GPU overhead.

3. User Interaction:
   - Selection: Clicking a sprite via Raycasting highlights it (White).
   - Movement: Once selected, users can move the sprite using the 
     WASD keys.
   - Billboarding: All sprites are programmed to always face the 
     camera, maintaining the "sprite" illusion in a 3D environment.

4. Performance Monitoring:
   - Integrated Stats.js counter to monitor real-time FPS and 
     rendering latency.

--- PROJECT STRUCTURE ---

The code is organized into modular classes to ensure high code quality 
and maintainability:

- SpriteEngine Class: Handles the initialization of the InstancedMesh, 
  color buffers, and the per-frame animation math.
- InteractionHandler Class: Encapsulates the Raycasting logic for 
  mouse selection and the event listeners for keyboard movement.
- App Core: Orchestrates the Three.js scene, camera, and the 
  requestAnimationFrame render loop.

--- CHALLENGES OVERCOME ---

- InstancedMesh Interaction: Implementing Raycasting on an 
  InstancedMesh was challenging because it returns a single object. 
  I resolved this by utilizing the 'instanceId' property from the 
  intersection array to map clicks back to the specific data index.
- Color Buffering: Solved an issue where colors would not update 
  post-initialization by manually defining the InstancedBufferAttribute 
  before the first render call.
- Billboarding Math: Integrating local rotation (requirement) with 
  camera-facing billboarding required careful manipulation of the 
  dummy object's quaternion and local rotation matrix.

--- HOW TO RUN ---

1. Ensure Node.js is installed.
2. Install dependencies: npm install three stats.js
3. Start the development server: npx vite
4. Open the Local URL (usually http://localhost:5173) in a browser.

========================================================================