import * as THREE from 'three';
import { City } from './City.js';
import { Car } from './Car.js';
import { Pedestrian } from './Pedestrian.js';

export class World {
    constructor(container) {
        this.container = container;
        
        // Setup ThreeJS
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 20, 100);

        const aspect = container.offsetWidth / container.offsetHeight;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 500);
        this.camera.position.set(50, 60, 50);
        this.camera.lookAt(50, 0, 50);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(container.offsetWidth, container.offsetHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(this.renderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(100, 150, 50);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 500;
        dirLight.shadow.camera.left = -100;
        dirLight.shadow.camera.right = 100;
        dirLight.shadow.camera.top = 100;
        dirLight.shadow.camera.bottom = -100;
        this.scene.add(dirLight);

        // City
        this.city = new City(8); // 8x8 blocks
        this.scene.add(this.city.group);

        // Entities
        this.cars = [];
        this.pedestrians = [];

        // Spawn Cars
        for(let i=0; i<15; i++) {
            this.cars.push(new Car(this.city, this.scene));
        }

        // Spawn Pedestrians
        for(let i=0; i<30; i++) {
            this.pedestrians.push(new Pedestrian(this.city, this.scene));
        }

        // Event listener for spawned pedestrians from cars
        document.addEventListener('spawnPedestrian', (e) => {
            const p = new Pedestrian(this.city, this.scene, e.detail.pos);
            // Give them a cooldown before finding a car again so they don't loop instantly
            this.pedestrians.push(p);
        });

        // Camera Orbit logic
        this.orbitAngle = 0;
        this.center = new THREE.Vector3(80, 0, 80); // Center of an 8x20 map approx
    }

    update() {
        // Rotate camera slowly around the city
        this.orbitAngle += 0.001;
        const radius = 120;
        this.camera.position.x = this.center.x + Math.sin(this.orbitAngle) * radius;
        this.camera.position.z = this.center.z + Math.cos(this.orbitAngle) * radius;
        this.camera.lookAt(this.center);

        // Update entities
        this.cars.forEach(car => car.update());
        this.pedestrians.forEach(ped => ped.update(this.cars));
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    onResize() {
        const w = this.container.offsetWidth;
        const h = this.container.offsetHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }
}