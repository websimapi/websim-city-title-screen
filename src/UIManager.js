import { AudioController } from './AudioController.js';

export class UIManager {
    constructor(world) {
        this.world = world;
        this.audio = new AudioController();
        
        this.screens = {
            main: document.getElementById('main-menu'),
            settings: document.getElementById('settings-menu')
        };
        
        this.buttons = {
            start: document.getElementById('btn-start'),
            continue: document.getElementById('btn-continue'),
            settings: document.getElementById('btn-settings'),
            back: document.getElementById('btn-back')
        };
        
        this.checkSaveState();
        this.bindEvents();
    }
    
    checkSaveState() {
        // Simple logic: if 'hasPlayed' is true, show Continue
        const hasPlayed = localStorage.getItem('city_sim_has_played');
        if (hasPlayed) {
            this.buttons.continue.classList.remove('hidden');
            this.buttons.start.innerText = "New Game"; // Explicitly state new game
        }
    }
    
    bindEvents() {
        // Click sound for all buttons
        document.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => this.audio.playClick());
        });

        this.buttons.start.addEventListener('click', () => {
            this.startGame();
        });
        
        this.buttons.continue.addEventListener('click', () => {
            // In a real game, we'd load state. Here we just resume/start.
            this.startGame();
        });
        
        this.buttons.settings.addEventListener('click', () => {
            this.toggleScreen('settings');
        });
        
        this.buttons.back.addEventListener('click', () => {
            this.toggleScreen('main');
        });
        
        // Settings Inputs
        const volSlider = document.getElementById('slider-volume');
        volSlider.addEventListener('input', (e) => {
            this.audio.setVolume(e.target.value / 100);
        });
    }
    
    toggleScreen(screenName) {
        Object.values(this.screens).forEach(el => el.classList.add('hidden'));
        this.screens[screenName].classList.remove('hidden');
    }
    
    startGame() {
        // Mark as played
        localStorage.setItem('city_sim_has_played', 'true');
        
        // Hide UI
        document.getElementById('ui-layer').style.pointerEvents = 'none';
        document.getElementById('title-card').style.opacity = '0';
        Object.values(this.screens).forEach(el => el.classList.add('hidden'));
        
        // Start Ambient Audio
        this.audio.startAmbience();
        
        // In a full game, we'd switch camera modes here or transition to gameplay controls.
        // For this "Title Screen" demo, we'll just zoom the camera in a bit to simulate starting.
        this.zoomInEffect();
    }
    
    zoomInEffect() {
        // Simple tween-like effect
        const startPos = this.world.camera.position.clone();
        const targetPos = new THREE.Vector3(80, 20, 80); // Closer to ground
        let t = 0;
        
        const zoom = () => {
            t += 0.01;
            if (t > 1) return;
            this.world.camera.position.lerpVectors(startPos, targetPos, t * 0.1); // Ease out
            requestAnimationFrame(zoom);
        };
        // Disable orbit in world temporarily? 
        // For now, let's just let the loop continue but maybe we should disable the orbit in World.js
        // A clean way is to set a flag in world.
    }
}