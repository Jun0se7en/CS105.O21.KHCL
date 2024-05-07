import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js';
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.set(0.80, 2.74, 8);


const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true
})
renderer.shadowMap.enabled = true
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)


const controls = new OrbitControls(camera, renderer.domElement)


class Box extends THREE.Mesh {

  constructor({width, heigth, depth, color="#00ff00", 
              velocity={x: 0, y: 0, z: 0}, position={x: 0, y: 0, z: 0}, isZaccelerated=false
            }) {
    super(
      new THREE.BoxGeometry(width, heigth, depth), 
      new THREE.MeshStandardMaterial({ color: color }))
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
    this.velocity = velocity
    this.isZaccelerated = isZaccelerated
  }


    update(ground){
      this.bottom = this.position.y - this.heigth/2
      this.top = this.position.y + this.heigth/2
      this.right = this.position.x + this.width/2
      this.left = this.position.x - this.width/2
      this.front = this.position.z + this.depth/2
      this.back = this.position.z - this.depth/2

      if (this.isZaccelerated) this.velocity.z += 0.001

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


function boxCollision({box1, box2}){
      const xCollision = box1.left <= box2.right && box1.right >= box2.left;
      const yCollision = box1.bottom + box1.velocity.y <= box2.top && box1.top >= box2.bottom;
      const zCollision = box1.front >= box2.back && box1.back <= box2.front;
      return xCollision && yCollision && zCollision;
}


function zombieCollision({zombie, box, bboxsize, zombieVel}){
      const xCollision = zombie.position.x-bboxsize.x/9 <= box.right && zombie.position.x+bboxsize.x/9 >= box.left;
      const yCollision = zombie.position.y+zombieVel <= box.top && zombie.position.y+bboxsize.y >= box.bottom;
      const zCollision = zombie.position.z+bboxsize.z/2 >= box.back && zombie.position.z-bboxsize.z/2 <= box.front;
      return xCollision && yCollision && zCollision;
}



const ground = new Box({
  width: 10,
  heigth: 0.5,
  depth: 50,
  color: "#5b5b5b",
  position: {x: 0, y: -2, z: 0}
})

ground.receiveShadow = true
scene.add(ground)

const light= new THREE.DirectionalLight(0xffffff, 2)
light.position.y = 3
light.position.z = 1
light.castShadow = true
scene.add(light)  

scene.add(new THREE.AmbientLight(0xffffff, 0.5))

camera.position.z = 5

const keys = {a: {pressed: false}, 
              d: {pressed: false},
              space: {pressed: false}};

let zombieVel = 0;
let model;
let runAnimation;
const loader = new FBXLoader();
loader.setPath('./model/');
loader.load('mremireh_o_desbiens.fbx', (fbx) => {
  fbx.scale.setScalar(0.01);
  fbx.traverse(c => {
    c.castShadow = true;
  });
  fbx.rotation.y += Math.PI;
  fbx.position.set(0, -1.75, 0);
  model = fbx;
  scene.add(model);
  loader.load('run.fbx', (animObject) => {
        runAnimation = new THREE.AnimationMixer(model);
        const action = runAnimation.clipAction(animObject.animations[0]);
        action.play();
    });
});
await new Promise(r => setTimeout(r, 20000));

const boundingBox = new THREE.Box3().setFromObject(model);
const size = boundingBox.getSize(new THREE.Vector3());
console.log(size);


window.addEventListener('keydown', (event) => {
  switch (event.code) {
  case 'KeyA':
    keys.a.pressed = true
    break
  case 'KeyD':
    keys.d.pressed = true
    break
  case 'Space':
    console.log(model.position.y);
    console.log(ground.top);
    if (Math.round(model.position.y * 100) / 100 === Math.round(ground.top * 100) / 100) {
      zombieVel = 0.13;
    }
    break
  }
})

window.addEventListener('keyup', (event) => {
  switch (event.code) {
  case 'KeyA':
    keys.a.pressed = false
    break
  case 'KeyD':
    keys.d.pressed = false
    break
  }
})


const enemies = []
let frames = 0
let spawnRate = 200

function animate() {
  const animationId = requestAnimationFrame(animate)
  renderer.render(scene, camera)
  if (keys.a.pressed) {
    model.position.x -= 0.05
  }
  else if (keys.d.pressed) {
    model.position.x += 0.05
  }

  zombieVel -= 0.005;

  if (zombieCollision({zombie: model, box: ground, bboxsize: size, zombieVel: zombieVel})) {
        zombieVel = 0;
      }
  else model.position.y += zombieVel

  enemies.forEach(enemy => {
    enemy.update(ground)
    if (zombieCollision({zombie: model, box: enemy, bboxsize: size, zombieVel: zombieVel})) {
      cancelAnimationFrame(animationId)
    }
  })
  
  if (frames % spawnRate === 0) {
    if (spawnRate > 20) spawnRate -= 20 

    const enemy = new Box ({
      width: 1,
      heigth: 1,
      depth: 1,
      position: {
        x: (Math.random() - 0.5) * 10,
        y: 0,
        z: -20,
      },
      velocity: {
        x: 0,
        y: 0,
        z: 0.005,
      },
      color: "#800020",
      isZaccelerated: true
    })
    enemy.castShadow = true
    scene.add(enemy)
    enemies.push(enemy)
  }
  if (runAnimation) {
        runAnimation.update(0.01); 
  }
  frames++;
}
animate()