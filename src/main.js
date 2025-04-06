import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg')
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xf7f6f9);

// Initial camera position
const initialCameraPos = new THREE.Vector3(0, 0, 50);
camera.position.copy(initialCameraPos);

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

let headModel;
let isFollowing = false;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Store initial head position and rotation
const initialHeadPos = new THREE.Vector3(50, 0, -60);
let initialHeadQuaternion;

// Black plane for "black screen" effect
let blackPlane;
const blackPlaneGeometry = new THREE.PlaneGeometry(100, 100);
const blackPlaneMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
blackPlane = new THREE.Mesh(blackPlaneGeometry, blackPlaneMaterial);
blackPlane.position.set(0, 0, -1);
blackPlane.visible = false;
scene.add(blackPlane);

const loader = new GLTFLoader();
loader.load(
  '/aarnavhead.glb',
  (gltf) => {
    headModel = gltf.scene;
    headModel.position.copy(initialHeadPos);
    headModel.scale.set(25, 25, 25);
    initialHeadQuaternion = headModel.quaternion.clone();
    scene.add(headModel);
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  (error) => {
    console.error('An error occurred while loading the model:', error);
  }
);

function moveCamera() {
  const scrollTop = document.querySelector('.snap-container').scrollTop;
  const maxScrollEffect = 200;

  if (scrollTop <= 0) {
    // Fully back to landing page
    camera.position.copy(initialCameraPos);
    // Instead of looking directly at the head, look at a point to the left of it
    // This will make the head appear on the right side of the screen
    const lookAtPoint = new THREE.Vector3(0, 0, 0); // Look at a point centered on x, but at the head's z-depth
    camera.lookAt(lookAtPoint);
    
    if (headModel) {
      headModel.position.copy(initialHeadPos); // Ensure position is reset
      if (!isFollowing) {
        headModel.quaternion.copy(initialHeadQuaternion); // Reset rotation
      }
      headModel.visible = true;
    }
    blackPlane.visible = false;
  } else {
    // Scrolling effect
    const zoomFactor = Math.min(scrollTop / maxScrollEffect, 1);
    
    // Interpolate camera position
    camera.position.x = THREE.MathUtils.lerp(initialCameraPos.x, initialHeadPos.x, zoomFactor);
    camera.position.y = THREE.MathUtils.lerp(initialCameraPos.y, initialHeadPos.y + 8, zoomFactor);
    camera.position.z = THREE.MathUtils.lerp(initialCameraPos.z, initialHeadPos.z, zoomFactor);
    camera.position.z += THREE.MathUtils.lerp(0, 20, zoomFactor);
    
    if (headModel) {
      if (!isFollowing) {
        headModel.quaternion.slerp(initialHeadQuaternion, 0.1);
      }
      
      // Hide head and show black plane when fully zoomed in
      if (zoomFactor >= 0.95) {
        headModel.visible = false;
        blackPlane.visible = true;
        blackPlane.position.copy(camera.position);
        blackPlane.position.z -= 1;
        blackPlane.lookAt(camera.position);
      } else {
        headModel.visible = true;
        blackPlane.visible = false;
      }
    }
  }
}

function onClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  
  if (headModel) {
    const intersects = raycaster.intersectObject(headModel, true);
    if (intersects.length > 0) {
      isFollowing = !isFollowing;
    }
  }
}

function orientHeadToCursor(event) {
  const scrollTop = document.querySelector('.snap-container').scrollTop;
  if (scrollTop === 0 && headModel && isFollowing) {
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    
    const vector = new THREE.Vector3(mouseX, mouseY, 0.5);
    vector.unproject(camera);
    
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const targetPos = camera.position.clone().add(dir.multiplyScalar(distance));
    
    headModel.lookAt(targetPos);
    const targetQuaternion = new THREE.Quaternion();
    targetQuaternion.setFromRotationMatrix(headModel.matrix);
    headModel.quaternion.slerp(targetQuaternion, 0.1);
  }
}

document.querySelector('.snap-container').onscroll = moveCamera;
document.addEventListener('mousemove', orientHeadToCursor);
document.addEventListener('click', onClick);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});