import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
export default function Skybox(scene){
    let materialArray = [];
    let texture_ft = new THREE.TextureLoader().load( '/src/model/skybox/Daylight Box_Front.bmp');
    let texture_bk = new THREE.TextureLoader().load( '/src/model/skybox/Daylight Box_Back.bmp');
    let texture_up = new THREE.TextureLoader().load( '/src/model/skybox/Daylight Box_Top.bmp');
    let texture_dn = new THREE.TextureLoader().load( '/src/model/skybox/Daylight Box_Bottom.bmp');
    let texture_rt = new THREE.TextureLoader().load( '/src/model/skybox/Daylight Box_Left.bmp');
    let texture_lf = new THREE.TextureLoader().load( '/src/model/skybox/Daylight Box_Right.bmp');

    materialArray.push(new THREE.MeshBasicMaterial( { map: texture_ft }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: texture_bk }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: texture_up }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: texture_dn }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: texture_rt }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: texture_lf }));

    for (let i = 0; i < 6; i++)
        materialArray[i].side = THREE.BackSide;

    let skyboxGeo = new THREE.BoxGeometry( 600, 1000, 800);
    let skybox = new THREE.Mesh( skyboxGeo, materialArray );
    skybox.position.y = -50

    scene.add(skybox)

}
