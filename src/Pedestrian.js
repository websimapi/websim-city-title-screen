import * as THREE from 'three';

export class Pedestrian {
    constructor(city, scene, startPos) {
        this.city = city;
        this.scene = scene;
        this.mesh = this.createMesh();
        
        this.state = 'WALKING'; // WALKING, FINDING_CAR, IN_CAR
        this.position = startPos ? startPos.clone() : this.city.getRandomSidewalkPoint();
        this.target = this.city.getRandomSidewalkPoint();
        
        this.speed = 0.1 + Math.random() * 0.05;
        this.targetCar = null;

        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);
    }

    createMesh() {
        const group = new THREE.Group();
        const color = new THREE.Color().setHSL(Math.random(), 0.7, 0.5);
        
        // Body
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(1, 2, 1),
            new THREE.MeshLambertMaterial({ color: color })
        );
        body.position.y = 1;
        body.castShadow = true;
        group.add(body);
        
        // Head
        const head = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.8, 0.8),
            new THREE.MeshLambertMaterial({ color: 0xffccaa })
        );
        head.position.y = 2.4;
        group.add(head);

        return group;
    }

    update(cars) {
        if (this.state === 'IN_CAR') {
            this.mesh.visible = false;
            return;
        }

        this.mesh.visible = true;

        if (this.state === 'WALKING') {
            this.walkLogic();
            
            // Randomly decide to find a car
            if (Math.random() < 0.002) {
                this.findCar(cars);
            }
        } else if (this.state === 'FINDING_CAR') {
            if (this.targetCar && this.targetCar.state === 'PARKED') {
                this.target = this.targetCar.position.clone();
                const dist = this.position.distanceTo(this.target);
                
                if (dist < 3) {
                    this.enterCar();
                } else {
                    this.moveTowards(this.target);
                }
            } else {
                // Car moved or invalid
                this.state = 'WALKING';
                this.targetCar = null;
                this.target = this.city.getRandomSidewalkPoint();
            }
        }
    }

    walkLogic() {
        const dist = this.position.distanceTo(this.target);
        if (dist < 1) {
            this.target = this.city.getRandomSidewalkPoint();
        }
        this.moveTowards(this.target);
    }

    moveTowards(targetVec) {
        const dir = new THREE.Vector3().subVectors(targetVec, this.position).normalize();
        this.position.add(dir.multiplyScalar(this.speed));
        
        if (dir.lengthSq() > 0) {
            this.mesh.lookAt(targetVec);
            this.mesh.position.copy(this.position);
        }
        
        // Simple "hop" animation
        this.mesh.position.y = Math.abs(Math.sin(Date.now() * 0.01)) * 0.5;
    }

    findCar(cars) {
        // Find nearest parked car
        let nearest = null;
        let minDist = 50; // max radius
        
        for (let car of cars) {
            if (car.state === 'PARKED' && !car.driver) {
                const d = this.position.distanceTo(car.position);
                if (d < minDist) {
                    minDist = d;
                    nearest = car;
                }
            }
        }

        if (nearest) {
            this.targetCar = nearest;
            this.state = 'FINDING_CAR';
        }
    }

    enterCar() {
        this.state = 'IN_CAR';
        this.targetCar.driver = this;
        this.targetCar.state = 'DRIVING';
        this.targetCar.pickNewTarget();
    }

    exitCar(pos) {
        this.state = 'WALKING';
        this.position.copy(pos);
        this.target = this.city.getRandomSidewalkPoint();
        this.mesh.visible = true;
        this.mesh.position.copy(this.position);
    }
}