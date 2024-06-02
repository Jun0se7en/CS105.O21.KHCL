import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js';
// import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';
import ExtendBox from './utils.js'
import Building from './buildings.js';
import Sound from './sound.js';
import Skybox from './skybox.js';

function createTextTexture(text, width = 256, height = 128) {
  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  var context = canvas.getContext('2d');
  context.clearRect(0, 0, width, height); // Xóa nội dung cũ
  context.font = '48px LCD Solid';
  context.fillStyle = 'darkblue';
  context.fillText(text, 10, 50); // Vẽ text lên canvas

  var texture = new THREE.CanvasTexture(canvas);
  return texture;
};

let model;
let runAnimation;
// Import model 
function modelCall(){
    const loader = new FBXLoader();
    loader.setPath('./src/model/');
    loader.load('mremireh_o_desbiens.fbx', (fbx) => {
    fbx.scale.setScalar(0.01);
    fbx.traverse(c => {
        c.castShadow = true;
    });
    fbx.rotation.y += Math.PI;
    fbx.position.set(0, -1.75, 6);
    model = fbx;
    loader.load('run.fbx', (animObject) => {
            runAnimation = new THREE.AnimationMixer(model);
            const action = runAnimation.clipAction(animObject.animations[0]);
            action.play();
        });
    loader.load('fall.fbx', (anumObject) => {
            runAnimation_2 = new THREE.AnimationMixer(model);
            const action_2 = runAnimation_2.clipAction(animObject.animations[0]);
           // action.play();
    }) 
    });
};

await(modelCall()); 

// Menu sound
const sound = new Sound();
sound.source = './src/theme/Temple Run OZ OST- Menu theme.mp3';
sound.menu_load();

// Init Clock
let clock = new THREE.Clock();
let delta = 0;
// 30 fps
let interval = 1 / 60;

// Button to Start a New Game   
var NewGameBtn = document.getElementById("New Game");
NewGameBtn.addEventListener('click', function(){
    sound.menuaudio.muted = true;
    var body = document.getElementById('body');
    let child = body.lastElementChild;  
        while (child) { 
            body.removeChild(child); 
            child = body.lastElementChild; 
        }
    //In-game sound
    sound.source = './src/theme/Temple Run OZ OST- Whimsy Woods.mp3';
    sound.game_load();
    // Initialize Variables
    let camera = new THREE.PerspectiveCamera(
        65,
        window.innerWidth/window.innerHeight,
        1,
        1000
    );

    let renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
    });

    let scene = new THREE.Scene();

    let zombieVel = 0;
    const keys = {a: {pressed: false}, 
              d: {pressed: false},
              space: {pressed: false}};

    const enemies = []
    const buildings = []
    let frames = 0;
    let spawnRate = 20;
    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.id='Canvas'
    document.getElementById('body').appendChild(renderer.domElement);


    let boxes;
    //Infinite background
    const textureLoader = new THREE.TextureLoader();
    const geometry = new THREE.PlaneGeometry(50, 55, 50);
    var texture = textureLoader.load( './grass.jpg' );
    const material = new THREE.MeshBasicMaterial({side: THREE.DoubleSide, map: texture});
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = Math.PI/2;
    plane.position.y = -2;
    plane.receiveShadow = true;
    scene.add(plane);

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    // Lắng nghe sự kiện thay đổi kích thước cửa sổ
    window.addEventListener('resize', onWindowResize, false);
    

    function init(){
        // const orbitControls = new OrbitControls(camera, renderer.domElement);
        // orbitControls.update();

        //Add skybox
        Skybox(scene);
  
        // Create Box Object
        var texture1 = textureLoader.load( './NkL8C.jpg' );
        boxes = new ExtendBox({
            width: 11,
            heigth: 0.5,
            depth: 50,
            color: "#5b5b5b",
            position: {x: 0, y: -2, z: 0},
            texture: texture1,
          });
        boxes.receiveShadow = true;
        // Create light Object
        const light= new THREE.DirectionalLight(0xffffff, 2);
        light.position.y = 3;
        light.position.z = 1;
        light.castShadow = true;

        // Add Object to Scene
        scene.add(boxes);
        scene.add(light);
        scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        scene.add(model);
    
        camera.position.x = 0;
        camera.position.y = 2.5;
        camera.position.z = 10;
        
        camera.lookAt(new THREE.Vector3(0, 0, 0));
    }

    function zombieCollision({zombie, box, bboxsize, zombieVel}){
            if (zombie.position.x <= -4.5 || zombie.position.x >= 4.5){
              return true;
            }
            const xCollision = zombie.position.x-bboxsize.x/9 <= box.right && zombie.position.x+bboxsize.x/9 >= box.left;
            const yCollision = zombie.position.y+zombieVel <= box.top && zombie.position.y+bboxsize.y >= box.bottom;
            const zCollision = zombie.position.z+bboxsize.z/2 >= box.back && zombie.position.z-bboxsize.z/2 <= box.front;
            return xCollision && yCollision && zCollision;
    }

    window.addEventListener('keydown', (event) => {
        switch (event.code) {
        case 'KeyA':
          keys.a.pressed = true
          break
        case 'KeyD':
          keys.d.pressed = true
          break
        case 'Space':
          if (Math.round(model.position.y * 100) / 100 === Math.round(boxes.top * 100) / 100) {
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

    init();
    
    let spawnDirection = Math.random() > 0.5 ? 1 : -1;
    let spawnZ = 20;
    let scores = 0;
    let text_mesh = null;
    const boundingBox = new THREE.Box3().setFromObject(model);
    boundingBox.getSize(new THREE.Vector3());
    const size = boundingBox.getSize(new THREE.Vector3());

    const enemy_texture = new THREE.TextureLoader().load("./src/model/enemy/marbel-008.jpg");
    //const enemy_material = new THREE.MeshBasicMaterial({map: box_texture});

    function animate() {
        const animationId = requestAnimationFrame(animate);
        delta += clock.getDelta();
        if (delta  > interval) {
            // The draw or time dependent code are here
            renderer.render(scene, camera);

            delta = delta % interval;
        }
        if (keys.a.pressed) {
            model.position.x -= 0.1;
          }
          else if (keys.d.pressed) {
            model.position.x += 0.1;
          }
        
          zombieVel -= 0.005;
        
          if (zombieCollision({zombie: model, box: boxes, bboxsize: size, zombieVel: zombieVel})) {
                zombieVel = 0;
              }
          else model.position.y += zombieVel
        
          // Update enemies
          enemies.forEach(enemy => {
            enemy.update(boxes);
            if (zombieCollision({zombie: model, box: enemy, bboxsize: size, zombieVel: zombieVel})) {
              cancelAnimationFrame(animationId);
              sound.gameaudio.muted = true;
            }
          })
          // Update buildings
          if (buildings.length >= 4) {
            buildings.forEach(building => {
              building.update();
            })
          }
          
          if(frames % 10 === 0){
            const newBuildingZ = -(Math.floor(Math.random() * spawnZ))
            const rotationY = spawnDirection > 0 ? -Math.PI/2 : Math.PI/2;
            const building = new Building(
              {
                  scene: scene,
                  loader: new FBXLoader(),
                  scale: 0.03,
                  position: {x: 10, y: -3, z: newBuildingZ},
                  rotation: {x: 0, y: rotationY, z: 0},
                  velocity: {x: 0, y: 0, z: 0.2},
                  isZaccelerated: true
              }); 
            building.castShadow = true
            buildings.push(building);
            const building1 = new Building(
              {
                  scene: scene,
                  loader: new FBXLoader(),
                  scale: 0.03,
                  position: {x: -10, y: -3, z: newBuildingZ},
                  rotation: {x: 0, y: rotationY, z: 0},
                  velocity: {x: 0, y: 0, z: 0.2},
                  isZaccelerated: true
              }); 
            building1.castShadow = true
            buildings.push(building1);
            spawnDirection *= -1
          } 

        // console.log('count')
          if (frames % spawnRate === 0) {
            // if (spawnRate > 20) spawnRate -= 30; else spawnRate += 20;
        
            const enemy = new ExtendBox ({
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
              color: "#bcbcbc",
              isZaccelerated: true,
              texture: enemy_texture,
            })
            enemy.castShadow = true
            scene.add(enemy)
            enemies.push(enemy)
          }
          if (runAnimation) {
                runAnimation.update(0.01); 
          }
          frames++;
          scores += 10;
          if (text_mesh) {
              scene.remove(text_mesh);
              text_mesh.geometry.dispose();
              text_mesh.material.map.dispose();
              text_mesh.material.dispose();
          }
          var texture = createTextTexture(scores);
          var text_geometry = new THREE.PlaneGeometry(10, 2.5);
          var text_material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
          text_mesh = new THREE.Mesh(text_geometry, text_material);
           // Convert screen coordinates to normalized device coordinates (NDC)
          const x = window.innerWidth / 2 - 128;
          const y = window.innerHeight / 2 - 64;
          const ndcX = -((x / window.innerWidth) * 2 - 1);
          const ndcY = -(y / window.innerHeight) * 2 + 1;

          // Convert NDC to world coordinates
          const vector = new THREE.Vector3(ndcX, ndcY + 0.5, 0.5);
          vector.unproject(camera);
          const dir = vector.sub(camera.position).normalize();
          const distance = -camera.position.z / dir.z;
          const pos = camera.position.clone().add(dir.multiplyScalar(distance));

          text_mesh.position.copy(pos);
          text_mesh.position.z = 0; // Ensure the textMesh is in front of other objects
          console.log(text_mesh.position)
          scene.add(text_mesh);
    }
    animate();
});





