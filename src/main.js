import * as THREE from 'three';
import { World } from './World.js';
import { UIManager } from './UIManager.js';

// Init Logic
const init = () => {
    const container = document.getElementById('canvas-container');
    
    // Create the 3D World
    const world = new World(container);
    
    // Create UI Manager
    const ui = new UIManager(world);

    // Render Loop
    const animate = () => {
        requestAnimationFrame(animate);
        world.update();
        world.render();
    };
    
    animate();

    // Handle Resize
    window.addEventListener('resize', () => {
        world.onResize();
    });
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}