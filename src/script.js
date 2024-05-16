import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js';
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';
import ExtendBox from './utils.js'
import Building from './buildings.js';
import Sound from './sound.js';
import Skybox from './skybox.js';

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
    });
};

await(modelCall()); 

// Menu sound
const sound = new Sound();
sound.source = './src/theme/Temple Run OZ OST- Menu theme.mp3';
sound.menu_load();

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
    let spawnRate = 200;
    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.id='Canvas'
    document.getElementById('body').appendChild(renderer.domElement);


    let boxes;
    //Infinite background
    const geometry = new THREE.PlaneGeometry(50, 55, 50);
    const material = new THREE.MeshBasicMaterial({color: '#808080', side: THREE.DoubleSide});
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = Math.PI/2;
    plane.position.y = -2;
    plane.receiveShadow = true;
    scene.add(plane);

    
    

    function init(){
        const orbitControls = new OrbitControls(camera, renderer.domElement);
        orbitControls.update();

        //Add skybox
        Skybox(scene);
  
        // Create Box Object
        boxes = new ExtendBox({
            width: 11,
            heigth: 0.5,
            depth: 50,
            color: "#5b5b5b",
            position: {x: 0, y: -2, z: 0}
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
    
    const boundingBox = new THREE.Box3().setFromObject(model);
    boundingBox.getSize(new THREE.Vector3());
    const size = boundingBox.getSize(new THREE.Vector3());

    function animate() {
        const animationId = requestAnimationFrame(animate);
        renderer.render(scene, camera);
        if (keys.a.pressed) {
            model.position.x -= 0.05
          }
          else if (keys.d.pressed) {
            model.position.x += 0.05
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
              // cancelAnimationFrame(animationId);
              //sound.gameaudio.muted = true;
            }
          })
          // Update buildings
          buildings.forEach(building => {
            building.update();
          })
          let spawnDirection = Math.random() > 0.5 ? 1 : -1;
          let spawnX = 10
          if(frames % 40 === 0){
            const newBuildingX = spawnX * spawnDirection;
            const rotationY = spawnDirection > 0 ? -Math.PI/2 : Math.PI/2;
            const building = new Building(
              {
                  scene: scene,
                  loader: new FBXLoader(),
                  scale: 0.03,
                  position: {x: newBuildingX, y: -3, z: -25},
                  rotation: {x: 0, y: rotationY, z: 0},
                  velocity: {x: 0, y: 0, z: 0.2},
                  isZaccelerated: true
              }); 
            buildings.push(building);
            spawnDirection *= -1
            spawnX += 10
          } 

        console.log('count')
          if (frames % spawnRate === 0) {
            if (spawnRate > 20) spawnRate -= 20 
        
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
    animate();
});





