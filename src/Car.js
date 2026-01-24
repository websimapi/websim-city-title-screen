import * as THREE from 'three';

export class Car {
    constructor(city, scene) {
        this.city = city;
        this.scene = scene;
        this.mesh = this.createMesh();
        
        // State
        this.state = 'PARKED'; // PARKED, DRIVING, WAITING
        this.position = new THREE.Vector3();
        this.target = new THREE.Vector3();
        this.speed = 0;
        this.maxSpeed = 0.3 + Math.random() * 0.2;
        this.driver = null; // Reference to pedestrian

        // Initialize position
        this.respawn();
        this.scene.add(this.mesh);
    }

    createMesh() {
        const group = new THREE.Group();
        
        // Body
        const bodyGeo = new THREE.BoxGeometry(4, 2, 8);
        const color = new THREE.Color().setHSL(Math.random(), 0.8, 0.5);
        const bodyMat = new THREE.MeshLambertMaterial({ color: color });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 1.5;
        body.castShadow = true;
        group.add(body);

        // Cabin
        const cabGeo = new THREE.BoxGeometry(3.5, 1.5, 4);
        const cabMat = new THREE.MeshLambertMaterial({ color: 0x333333 }); // Windows
        const cab = new THREE.Mesh(cabGeo, cabMat);
        cab.position.y = 3.25;
        cab.position.z = -0.5;
        group.add(cab);

        // Wheels
        const wheelGeo = new THREE.CylinderGeometry(1, 1, 0.5, 12);
        const wheelMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
        const wheels = [
            { x: 2, z: 2.5 }, { x: -2, z: 2.5 },
            { x: 2, z: -2.5 }, { x: -2, z: -2.5 }
        ];
        
        wheels.forEach(pos => {
            const w = new THREE.Mesh(wheelGeo, wheelMat);
            w.rotation.z = Math.PI / 2;
            w.position.set(pos.x, 1, pos.z);
            group.add(w);
        });

        return group;
    }

    respawn() {
        // Find a random road spot to park
        const roadPos = this.city.getRandomRoadPoint();
        // Offset to side of road for parking
        this.position.copy(roadPos).add(new THREE.Vector3(6, 0, 6)); 
        this.mesh.position.copy(this.position);
        
        // Randomly decide if it starts driving or parked
        if (Math.random() > 0.5) {
            this.state = 'DRIVING';
            this.position.copy(roadPos);
            this.pickNewTarget();
        } else {
            this.state = 'PARKED';
        }
        this.updateTransform();
    }

    pickNewTarget() {
        // In a grid, we just move along X or Z axes
        // Current position is likely on a node. Pick a neighbor.
        const current = this.city.getNearestRoad(this.position);
        
        // Simple random walk on the grid
        const dirs = [
            new THREE.Vector3(this.city.cellSize, 0, 0),
            new THREE.Vector3(-this.city.cellSize, 0, 0),
            new THREE.Vector3(0, 0, this.city.cellSize),
            new THREE.Vector3(0, 0, -this.city.cellSize)
        ];
        
        // Try to keep moving forward (dot product) if possible to avoid U-turns
        // But for simplicity, let's just pick a valid neighbor that is a road
        
        let bestDir = dirs[Math.floor(Math.random() * dirs.length)];
        
        // Check if target is a road
        // This is a simplified check. In a real pathfinder we'd check connectivity.
        // We will just move towards a random intersection for visual flair
        
        this.target.copy(this.position).add(bestDir);
        
        // Clamp to map bounds
        const halfSize = (this.city.size * this.city.cellSize) / 2;
        // ... (bounds check logic omitted for brevity, reliance on clamping visual)
    }

    update() {
        if (this.state === 'DRIVING') {
            const dist = this.position.distanceTo(this.target);
            
            if (dist < 1) {
                // Reached target node
                this.pickNewTarget();
                
                // Chance to park if near a building and no one is waiting
                if (Math.random() < 0.05) {
                   // Try to park
                   this.state = 'PARKING';
                }
            } else {
                // Move towards target
                const dir = new THREE.Vector3().subVectors(this.target, this.position).normalize();
                this.position.add(dir.multiplyScalar(this.speed));
                
                // Accelerate
                if (this.speed < this.maxSpeed) this.speed += 0.01;
                
                // Rotate to face
                const targetRot = Math.atan2(dir.x, dir.z);
                // Smooth rotation
                let rotDiff = targetRot - this.mesh.rotation.y;
                // Normalize angle
                while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
                while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
                
                this.mesh.rotation.y += rotDiff * 0.1;
            }
        } else if (this.state === 'PARKING') {
            // Lerp to a parking offset
            // Simplified: just stop and change state
            this.speed *= 0.9;
            if (this.speed < 0.01) {
                this.speed = 0;
                this.state = 'PARKED';
                // Eject driver
                if (this.driver) {
                    this.driver.exitCar(this.position.clone().add(new THREE.Vector3(3,0,0)));
                    this.driver = null;
                } else {
                    // Spawn a fake driver exiting
                     const evt = new CustomEvent('spawnPedestrian', { 
                        detail: { pos: this.position.clone().add(new THREE.Vector3(3,0,0)) } 
                     });
                     document.dispatchEvent(evt);
                }
            }
        }

        this.updateTransform();
    }

    updateTransform() {
        this.mesh.position.copy(this.position);
    }
}