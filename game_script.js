import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.set(4.61, 2.74, 8)


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
        // console.log(this.front)
        // console.log(ground.back)
        // console.log("Collision detected")
      }
      else this.position.y += this.velocity.y
    }

}

function boxCollision({box1, box2}){
      const xCollision = box1.left <= box2.right && box1.right >= box2.left
      const yCollision = box1.bottom + box1.velocity.y <= box2.top && box1.top >= box2.bottom
      const zCollision = box1.front >= box2.back && box1.back <= box2.front
      // console.log(box1.right)
      // console.log(box2.left)
      return xCollision && yCollision && zCollision
}
  
const cube = new Box ({
  width: 1,
  heigth: 1,
  depth: 1,
  velocity: {
    x: 0,
    y: -0.01,
    z: 0
  }
})
cube.castShadow = true
scene.add(cube)


const ground = new Box({
  width: 10,
  heigth: 0.5,
  depth: 50,
  color: "#0369a1",
  position: {x: 0, y: -2, z: 0}
})

ground.receiveShadow = true
scene.add(ground)

const light= new THREE.DirectionalLight(0xffffff, 1)
light.position.y = 3
light.position.z = 1
light.castShadow = true
scene.add(light)  

scene.add(new THREE.AmbientLight(0xffffff, 0.5))

camera.position.z = 5

// console.log(ground.top)
// console.log(cube.bottom)

const keys = {a: {pressed: false}, 
              d: {pressed: false},
              w: {pressed: false},
              s: {pressed: false}}

window.addEventListener('keydown', (event) => {
  switch (event.code) {
  case 'KeyA':
    keys.a.pressed = true
    break
  case 'KeyD':
    keys.d.pressed = true
    break
  case 'KeyW':
    keys.w.pressed = true
    break
  case 'KeyS':
    keys.s.pressed = true
    break
  case 'Space':
    console.log(cube.bottom)
    console.log(ground.top)
    if (Math.round(cube.bottom * 100) / 100 === Math.round(ground.top * 100) / 100) {
      cube.velocity.y = 0.13
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
  case 'KeyW':
    keys.w.pressed = false
    break
  case 'KeyS':
    keys.s.pressed = false
    break
  }
})

const enemies = []
let frames = 0
let spawnRate = 200

function animate() {
  const animationId = requestAnimationFrame(animate)
  renderer.render(scene, camera)
  cube.velocity.x = 0
  cube.velocity.z = 0
  if (keys.a.pressed) cube.velocity.x = -0.05
  else if (keys.d.pressed) cube.velocity.x = 0.05
  else if (keys.w.pressed) cube.velocity.z = -0.05
  else if (keys.s.pressed) cube.velocity.z = 0.05

  cube.update(ground)
  enemies.forEach(enemy => {
    enemy.update(ground)
    if (boxCollision({box1: cube, box2: enemy})) {
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
        z: 0.005
      },
      color: "#800020",
      isZaccelerated: true
    })
    enemy.castShadow = true
    scene.add(enemy)
    enemies.push(enemy)
  }
  frames++

}
animate()