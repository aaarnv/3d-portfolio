import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { initSkillsPhysics } from './skillsPhysics.js';
import { initProjectsGallery } from './projectsGallery.js';

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
let isFollowing = true;
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

// Initialize projects gallery
const projectsGallery = initProjectsGallery(scene, camera);

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

let currentSection = 0;
let previousSection = 0;
let isInProjectsSection = false;
let lastScrollTop = 0; // Track last scroll position to determine direction

function handleSectionChange(newSection) {
  console.log(`Changing to section ${newSection}`);

  const skillsCanvas = document.getElementById('skillsCanvas');
  const aboutMeBg = document.querySelector('.about-me-bg');
  const bgCanvas = document.querySelector('#bg');

  // Reset lights to default state
  pointLight.visible = true;
  ambientLight.visible = true;
  bgCanvas.style.display = 'block'; // Ensure Three.js canvas is visible by default
  if (aboutMeBg) aboutMeBg.style.display = 'none'; // Hide GIF by default

  // Handle section-specific logic
  if (newSection === 2) {
    // Projects section
    camera.position.copy(initialCameraPos);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    if (skillsCanvas) {
      skillsCanvas.classList.add('hidden');
      skillsCanvas.style.display = 'none';
    }
    projectsGallery.showGallery();
    blackPlane.visible = false;
    isInProjectsSection = true;
  } else if (newSection === 3) {
    // About Me section - Set up camera once when entering section
    projectsGallery.hideGallery();
    blackPlane.visible = false;
    isInProjectsSection = false;
    camera.position = new THREE.Vector3(0, 0, 50);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    headModel.visible = true;

    // Disable lights to make head appear black
    pointLight.visible = false;
    ambientLight.visible = false;
    // Hide Three.js canvas to show GIF
    bgCanvas.style.display = 'none';
    if (aboutMeBg) aboutMeBg.style.display = 'block';
    // Hide skills and projects
    if (skillsCanvas) {
      skillsCanvas.classList.add('hidden');
      skillsCanvas.style.display = 'none';
    }
  } else {
    // Sections 0 and 1
    isInProjectsSection = false;
    if (newSection === 1) {
      if (skillsCanvas) {
        skillsCanvas.classList.remove('hidden');
        skillsCanvas.style.display = 'block';
      }
      blackPlane.visible = true;
      projectsGallery.hideGallery();
    } else {
      // Section 0
      if (skillsCanvas) {
        skillsCanvas.classList.add('hidden');
        skillsCanvas.style.display = 'none';
      }
      blackPlane.visible = false;
      projectsGallery.hideGallery();
    }
  }
}

function moveCamera() {
  const snapContainer = document.querySelector('.snap-container');
  const scrollTop = snapContainer.scrollTop;
  const maxScrollEffect = 200;
  const sectionHeight = window.innerHeight;
  
  // Determine scroll direction
  const isScrollingDown = scrollTop > lastScrollTop;
  lastScrollTop = scrollTop;
  
  // Calculate current section
  previousSection = currentSection;
  currentSection = Math.round(scrollTop / sectionHeight);
  
  // Handle section changes
  if (previousSection !== currentSection) {
    handleSectionChange(currentSection);
    // If we've just entered section 3 (About Me), we skip further camera manipulation
    if (currentSection === 3) {
      return; // Exit the function to prevent camera overrides
    }
  }
  
  // Skip camera manipulation if we're in About Me section
  if (currentSection === 3) {
    console.log('In About Me section, skipping camera manipulation');
    return;
  }
  
  // Normal camera behavior for other sections
  if (!isInProjectsSection) {
    if (scrollTop <= 0) {
      // Home section - reset everything
      camera.position.copy(initialCameraPos);
      const lookAtPoint = new THREE.Vector3(0, 0, 0);
      camera.lookAt(lookAtPoint);
      
      if (headModel) {
        headModel.position.copy(initialHeadPos);
        if (!isFollowing) {
          headModel.quaternion.copy(initialHeadQuaternion);
        }
        headModel.visible = true;
      }
      blackPlane.visible = false;
    } else {
      // Calculate zoom factor based on scroll position
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
        
        // Handle head visibility based on zoom factor
        if (zoomFactor >= 0.92) {
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
  const snapContainer = document.querySelector('.snap-container');
  const scrollTop = snapContainer.scrollTop;
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

// Set up event listeners
document.querySelector('.snap-container').onscroll = moveCamera;
document.addEventListener('mousemove', orientHeadToCursor);
document.addEventListener('click', onClick);

function animate() {
  requestAnimationFrame(animate);
  projectsGallery.animateGallery();
  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize components when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initSkillsPhysics();
});