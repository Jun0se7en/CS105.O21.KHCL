import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js';
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';
import ExtendBox from './utils.js'

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
    fbx.position.set(0, -1.75, 0);
    model = fbx;
    loader.load('run.fbx', (animObject) => {
            runAnimation = new THREE.AnimationMixer(model);
            const action = runAnimation.clipAction(animObject.animations[0]);
            action.play();
        });
    });
};

await(modelCall());

// Control Volume of the Game
var volumeUp = true;

var volumeBtn = document.getElementById("volumeBtn");
volumeBtn.addEventListener('click', function() {
    volumeUp = !volumeUp;
    let child = volumeBtn.lastElementChild;  
        while (child) { 
            volumeBtn.removeChild(child); 
            child = volumeBtn.lastElementChild; 
        } 
    if (volumeUp == true){
        var button = document.createElement('i');
        button.className = "fa fa-volume-up";
        volumeBtn.appendChild(button);
    }
    else{
        var button = document.createElement('i');
        button.className = "fa fa-volume-off";
        volumeBtn.appendChild(button);
    }
});

// Button to Start a New Game   
var NewGameBtn = document.getElementById("New Game");
NewGameBtn.addEventListener('click', function(){
    var body = document.getElementById('body');
    let child = body.lastElementChild;  
        while (child) { 
            body.removeChild(child); 
            child = body.lastElementChild; 
        }
    // Initialize Variables
    let camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth/window.innerHeight,
        1,
        1000
    );

    let renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
    });

    const controls = new OrbitControls(camera, renderer.domElement);
    let scene = new THREE.Scene();

    let zombieVel = 0;
    const keys = {a: {pressed: false}, 
              d: {pressed: false},
              space: {pressed: false}};
    const enemies = []
    let frames = 0;
    let spawnRate = 200;
    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.id='Canvas'
    document.getElementById('body').appendChild(renderer.domElement);
    let boxes;

    function init(){
        // Create Box Object
        boxes = new ExtendBox({
            width: 10,
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
    
        camera.position.x = 1;
        camera.position.y = 2;
        camera.position.z = 5;
    
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
        
          enemies.forEach(enemy => {
            enemy.update(boxes);
            if (zombieCollision({zombie: model, box: enemy, bboxsize: size, zombieVel: zombieVel})) {
              cancelAnimationFrame(animationId);
            }
          })
          
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


