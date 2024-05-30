import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

function boxCollision({box1, box2}){
    const xCollision = box1.left <= box2.right && box1.right >= box2.left;
    const yCollision = box1.bottom + box1.velocity.y <= box2.top && box1.top >= box2.bottom;
    const zCollision = box1.front >= box2.back && box1.back <= box2.front;
    return xCollision && yCollision && zCollision;
}

export default class ExtendBox extends THREE.Mesh {

    constructor({width, heigth, depth, color="#00ff00", 
                velocity={x: 0, y: 0, z: 0}, position={x: 0, y: 0, z: 0}, isZaccelerated=false, texture
              }) {
      super(
        new THREE.BoxGeometry(width, heigth, depth), 
        new THREE.MeshStandardMaterial({ color: color, map: texture}))
      this.width = width,
      this.heigth = heigth,
      this.depth = depth,
      this.position.set(position.x, position.y, position.z),
      this.bottom = this.position.y - this.heigth/2,
      this.top = this.position.y + this.heigth/2,
      this.right = this.position.x + this.width/2,
      this.left = this.position.x - this.width/2,
      this.front = this.position.z + this.depth/2,
      this.back = this.position.z - this.depth/2,
      this.velocity = velocity,
      this.isZaccelerated = isZaccelerated
    }
  
  
      update(ground){
        this.bottom = this.position.y - this.heigth/2
        this.top = this.position.y + this.heigth/2
        this.right = this.position.x + this.width/2
        this.left = this.position.x - this.width/2
        this.front = this.position.z + this.depth/2
        this.back = this.position.z - this.depth/2
  
        if (this.isZaccelerated) this.velocity.z += 0.01
  
        this.position.x += this.velocity.x
        this.position.z += this.velocity.z
        this.velocity.y -= 0.005
  
        if (boxCollision({box1: this, box2: ground})) {
          this.velocity.y = -this.velocity.y
          this.velocity.y /= 2
        }
        else this.position.y += this.velocity.y
      }
  
  }