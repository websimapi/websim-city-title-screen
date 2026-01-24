export class AudioController {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.masterGain.gain.value = 0.5;
        
        this.ambienceBuffer = null;
        this.clickBuffer = null;
        this.ambienceSource = null;
        
        this.loadAssets();
    }
    
    async loadAssets() {
        try {
            // Load Ambience
            const respAmb = await fetch('city_ambience.mp3');
            const arrAmb = await respAmb.arrayBuffer();
            this.ambienceBuffer = await this.ctx.decodeAudioData(arrAmb);
            
            // Load Click
            const respClick = await fetch('ui_click.mp3');
            const arrClick = await respClick.arrayBuffer();
            this.clickBuffer = await this.ctx.decodeAudioData(arrClick);
        } catch (e) {
            console.warn("Audio load failed", e);
        }
    }
    
    playClick() {
        if (!this.clickBuffer) return;
        this.resume();
        
        const src = this.ctx.createBufferSource();
        src.buffer = this.clickBuffer;
        src.connect(this.masterGain);
        src.start(0);
    }
    
    startAmbience() {
        if (!this.ambienceBuffer || this.ambienceSource) return;
        this.resume();
        
        this.ambienceSource = this.ctx.createBufferSource();
        this.ambienceSource.buffer = this.ambienceBuffer;
        this.ambienceSource.loop = true;
        
        // Separate gain for ambience to be lower
        const ambGain = this.ctx.createGain();
        ambGain.gain.value = 0.4;
        this.ambienceSource.connect(ambGain);
        ambGain.connect(this.masterGain);
        
        this.ambienceSource.start(0);
    }
    
    setVolume(val) {
        this.masterGain.gain.setTargetAtTime(val, this.ctx.currentTime, 0.1);
    }
    
    resume() {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }
}