import * as THREE from 'three';

export class City {
    constructor(size = 10) {
        this.size = size;
        this.cellSize = 20;
        this.grid = []; // 2D array of types: 0=grass, 1=road, 2=building
        this.roads = []; // List of road coordinates
        this.buildings = []; 
        this.sidewalks = [];
        this.intersections = [];
        this.group = new THREE.Group();
        
        this.generateGrid();
        this.buildMesh();
    }

    generateGrid() {
        // Initialize with grass
        for(let x=0; x<this.size; x++) {
            this.grid[x] = [];
            for(let z=0; z<this.size; z++) {
                this.grid[x][z] = { type: 'building', height: Math.floor(Math.random() * 4) + 1 };
            }
        }

        // Carve Roads (Grid pattern)
        const roadSpacing = 3;
        for(let x=0; x<this.size; x++) {
            for(let z=0; z<this.size; z++) {
                if (x % roadSpacing === 0 || z % roadSpacing === 0) {
                    this.grid[x][z] = { type: 'road' };
                    
                    if (x % roadSpacing === 0 && z % roadSpacing === 0) {
                        this.intersections.push(new THREE.Vector3(x * this.cellSize, 0, z * this.cellSize));
                    } else {
                        // It's a straight road segment
                    }
                    this.roads.push({ x, z, pos: new THREE.Vector3(x * this.cellSize, 0, z * this.cellSize) });
                }
            }
        }
    }

    buildMesh() {
        const geometries = [];
        const buildingMat = new THREE.MeshLambertMaterial({ color: 0xf5f5f5 });
        const roadMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const grassMat = new THREE.MeshLambertMaterial({ color: 0x4caf50 });
        const sidewalkMat = new THREE.MeshLambertMaterial({ color: 0x999999 });

        // Helper to add mesh to group
        const addBox = (x, y, z, w, h, d, color) => {
            const geo = new THREE.BoxGeometry(w, h, d);
            const mat = new THREE.MeshLambertMaterial({ color });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(x, y, z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.group.add(mesh);
            return mesh;
        };

        for(let x=0; x<this.size; x++) {
            for(let z=0; z<this.size; z++) {
                const cell = this.grid[x][z];
                const px = x * this.cellSize;
                const pz = z * this.cellSize;

                if (cell.type === 'road') {
                    // Road
                    const road = addBox(px, 0.1, pz, this.cellSize, 0.2, this.cellSize, 0x333333);
                    road.receiveShadow = true;
                    // Markings
                    addBox(px, 0.2, pz, 2, 0.1, 8, 0xffffff); // simplistic marking
                } else if (cell.type === 'building') {
                    // Building
                    // Sidewalk base
                    const sw = addBox(px, 0.5, pz, this.cellSize - 2, 1, this.cellSize - 2, 0xaaaaaa);
                    this.sidewalks.push(new THREE.Vector3(px, 1, pz));

                    // Building tower
                    const h = cell.height * 10;
                    // Random building colors
                    const hue = Math.random() * 0.1 + 0.05; // warm colors
                    const color = new THREE.Color().setHSL(hue, 0.6, 0.6);
                    
                    const b = addBox(px, 1 + h/2, pz, this.cellSize - 6, h, this.cellSize - 6, color);
                    
                    // Windows
                    // Simple texture or additional geometry could go here
                }
            }
        }
        
        // Ground plane
        const groundGeo = new THREE.PlaneGeometry(this.size * this.cellSize * 2, this.size * this.cellSize * 2);
        const groundMesh = new THREE.Mesh(groundGeo, new THREE.MeshLambertMaterial({ color: 0x222222 })); // Dark surroundings
        groundMesh.rotation.x = -Math.PI / 2;
        groundMesh.position.y = -0.1;
        this.group.add(groundMesh);
    }

    getRandomRoadPoint() {
        const r = this.roads[Math.floor(Math.random() * this.roads.length)];
        return r.pos.clone();
    }

    getRandomSidewalkPoint() {
        if (this.sidewalks.length === 0) return new THREE.Vector3();
        const s = this.sidewalks[Math.floor(Math.random() * this.sidewalks.length)];
        // Add random offset within the tile
        return s.clone().add(new THREE.Vector3((Math.random()-0.5)*10, 0, (Math.random()-0.5)*10));
    }
    
    // Find nearest road point to a position
    getNearestRoad(position) {
        let nearest = null;
        let minDist = Infinity;
        for(let r of this.roads) {
            const d = position.distanceTo(r.pos);
            if(d < minDist) {
                minDist = d;
                nearest = r.pos;
            }
        }
        return nearest;
    }
}