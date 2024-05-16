const building_sources = [
    '1Story_Mat.fbx',
    '2Story_2_Mat.fbx',
    '4Story_Center_Mat.fbx',
    '4Story_Mat.fbx',
    '6Story_Stack_Mat.fbx',
  ]
export default class Building {
    constructor({ scene, loader, scale,
        position = { x: 0, y: 0, z: 0 }, velocity = { x: 0, y: 0, z: 0 },
        rotation = { x: 0, y: 0, z: 0 }, isZaccelerated = false }) {
        this.scene = scene;
        this.loader = loader;
        this.src ='./src/model/buildings/';
        this.scale = scale;
        this.rotation = rotation;
        this.position = position;
        this.velocity = velocity;
        this.isZaccelerated = isZaccelerated;
        this.building = null; // Initialize the building property
        this.file = building_sources[Math.floor(Math.random() * building_sources.length)];
        this.lifetime = 5000
        this.spawnTime = Date.now()
        // Load the model when the Building instance is created
        this.load();
    }

    load(){
        this.loader.setPath(this.src);
        this.loader.load(this.file, (fbx) => {
            fbx.scale.setScalar(this.scale);
            fbx.traverse(c => {
                c.castShadow = true;
            });
            fbx.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
            fbx.position.set(this.position.x, this.position.y, this.position.z);
            this.building = fbx;
            this.scene.add(this.building);
        });
    }

    update() {
        // Update the position of the building based on its velocity
        if (this.isZaccelerated) this.position.z += this.velocity.z;
        // Apply the updated position to the building's object
        this.building.position.set(this.position.x, this.position.y, this.position.z);
        // Check if the building has been visible longer than its lifetime
        if (Date.now() - this.spawnTime > this.lifetime) {
            // Remove the building from the scene
            this.scene.remove(this.building);
            // Optional: Dispose of resources to free up memory
            this.building.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(material => material.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        }
    }
}
