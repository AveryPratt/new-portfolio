'use strict';

var loc = 0;
var time = Date.now();
var delta = 0;
var deltaTime = 0;

const deg = 180 / Math.PI;
var canvas = document.getElementById('background-canvas');
window.addEventListener('keydown', slide);

function slide(e){
    switch(e.keyCode){
        case 70: // f
            loc += 100;
            break;
        case 68: // d
            loc = camera.position.x;
            break;
        case 83: // s
            loc -= 100;
            break;
        default:
            break;
    }
}
var textureLoader = new THREE.TextureLoader();

var renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// Camera
var camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, .1, 3000);
// camera.position.y = 8;
// camera.position.z = 60;
// camera.rotateX(-5 / deg);
camera.position.y = 300;
camera.position.z = 600;
camera.rotateX(-12 / deg);

// Lights
var directionalLight = new THREE.DirectionalLight(0xffffff, .15);
directionalLight.translateY(100);
directionalLight.translateX(-100);
directionalLight.translateZ(-100);
var ambientLight = new THREE.AmbientLight(0xffffff, .5);
var hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x0080ff, .35);

// Geometries
var skyPlane = new THREE.PlaneGeometry(600, 1000, 10, 10);
var waterPlane = new THREE.PlaneGeometry(500, 250, 250, 125);
for (var i = 0; i <= 125; i++){
    for (var j = 0; j <= 250; j++){
        var idx = i * 251 + j;
        waterPlane.vertices[idx].y += 75;
    }
}
var basePlane = new THREE.PlaneGeometry(600, 500, 1, 1);
basePlane.rotateX(86.5);

// Materials
var sunPos = new THREE.Vector3(-100, 50, -250);
var skyPlaneMaterial = new THREE.ShaderMaterial({
    uniforms: {
        sunPos: { type: "v3", value: sunPos }
    },
    vertexShader: document.getElementById('skyVertex').textContent,
    fragmentShader: document.getElementById('skyFragment').textContent
});
var waterPlaneMaterial = new THREE.ShaderMaterial({
    uniforms: {
        sunPos: { type: "v3", value: sunPos }
    },
    vertexShader: document.getElementById('waterVertex').textContent,
    fragmentShader: document.getElementById('waterFragment').textContent,
    transparent: true
});
var basePlaneMaterial = new THREE.ShaderMaterial({
    uniforms: {
        sunPos: { type: "v3", value: sunPos }
    },
    vertexShader: document.getElementById('baseVertex').textContent,
    fragmentShader: document.getElementById('baseFragment').textContent,
});
// var basePlaneMaterial = new THREE.MeshLambertMaterial({
//     color: 0x004080
// });

// Meshes
var skyPlaneMesh = new THREE.Mesh(skyPlane, skyPlaneMaterial);
skyPlaneMesh.translateZ(-250);

var waterPlaneMesh = new THREE.Mesh(waterPlane, waterPlaneMaterial);
waterPlaneMesh.rotateX(-90 / deg);
var basePlaneMesh = new THREE.Mesh(basePlane, basePlaneMaterial);
basePlaneMesh.translateY(-31);

// Scene
var scene = new THREE.Scene();
scene.add(directionalLight);
scene.add(ambientLight);
scene.add(hemisphereLight);
scene.add(skyPlaneMesh);
scene.add(waterPlaneMesh);
scene.add(basePlaneMesh);

// Loop
window.onload = function(){
    var direction = true;
    var loop = function(){
        requestAnimationFrame(loop);

        var newTime = Date.now();
        deltaTime = newTime - time;
        delta += deltaTime / 1500;

        sunPos.y = camera.position.x;
        
        moveCamera();
        updateWater();
        
        renderIsland();
        renderIceberg();
        
        renderer.render(scene, camera);

        time = newTime;
    }
    loop();
};

function moveCamera(){
    var dist = 0;
    if (camera.position.x < loc - .001){
        var dist = .001 + (loc - camera.position.x) * deltaTime / 1000;
    }
    else if (camera.position.x > loc + .001){
        var dist = .001 + (loc - camera.position.x) * deltaTime / 1000;
    }
    
    sunPos.x += dist;
    camera.translateX(dist);
    skyPlane.translate(dist, 0, 0);
    waterPlane.translate(dist, 0, 0);
    basePlane.translate(dist, 0, 0);
}
function updateWater(){
    for (var i = 0; i <= 125; i++){
        for (var j = 0; j <= 250; j++){
            var idx = i * 251 + j;
            waterPlane.vertices[idx].z = Math.sin(delta * .75 + i / 2 - (j + camera.position.x) / 10) * .25;
            waterPlane.vertices[idx].z += Math.sin(delta - i / 5 + (j + camera.position.x) / 5) * .35 - 2;
        }
    }
    waterPlane.verticesNeedUpdate = true;
}