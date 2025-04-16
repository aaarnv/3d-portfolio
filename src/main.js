import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { initSkillsPhysics } from './skillsPhysics.js';
import { initProjectsGallery } from './projectsGallery.js';
import { initCameraController } from './cameraController.js';
import { initLaptop } from './laptopController.js';
import { initHeadModelViewer, initLaptopModelViewer } from './InteractiveModelViewers.js';
import { initContactForm } from './contactForm.js'; // Import the contact form module

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg')
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xf7f6f9);

const cameraController = initCameraController(scene, camera);

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

let headModel;
let isFollowing = true;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const initialHeadPos = new THREE.Vector3(50, 0, -45);
let initialHeadQuaternion;

// Initialize laptop and add to scene
const laptopController = initLaptop(scene);
const laptop = laptopController.getLaptop();
laptop.position.set(160, -20, -30); 
laptop.rotation.set(0, -0.2, 0);
laptop.scale.set(2, 2, 2); 
laptop.visible = false; 
scene.add(laptop);

const projectsGallery = initProjectsGallery(scene, camera, cameraController);

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

const codingVideo = document.createElement('video');
codingVideo.src = '/coding.mp4';
codingVideo.loop = true;
codingVideo.muted = true;
codingVideo.playsInline = true;
codingVideo.crossOrigin = 'anonymous';

const codingVideoTexture = new THREE.VideoTexture(codingVideo);
codingVideoTexture.minFilter = THREE.LinearFilter;
codingVideoTexture.magFilter = THREE.LinearFilter;

const codingVideoMaterial = new THREE.MeshStandardMaterial({
  map: codingVideoTexture,
  roughness: 0.5,
  metalness: 0.5
});

let originalHeadMaterials = new Map();

let isEducationActive = true;

function setupToggle() {
  const themeCheckbox = document.getElementById('themeToggle');
  const educationContent = document.getElementById('educationContent');
  const experienceContent = document.getElementById('experienceContent');

  themeCheckbox.addEventListener('change', () => {
    if (themeCheckbox.checked) {
      // Checkbox is checked - show Experience content with white background
      educationContent.classList.remove('active');
      experienceContent.classList.add('active');
      laptopController.closeLaptop();
      isEducationActive = false;
      scene.background = new THREE.Color(0xFFFFFF);
      
      // Restore original head materials when in white mode
      if (headModel && originalHeadMaterials.size > 0) {
        headModel.traverse(child => {
          if (child.isMesh && originalHeadMaterials.has(child.uuid)) {
            child.material = originalHeadMaterials.get(child.uuid);
          }
        });
      }
    } else {
      // Checkbox is unchecked - show Education content with black background
      educationContent.classList.add('active');
      experienceContent.classList.remove('active');
      laptopController.openLaptop();
      isEducationActive = true;
      scene.background = new THREE.Color(0x000000);
      
      // Apply video texture to head when in black mode
      if (headModel) {
        // Store original materials if not already stored
        if (originalHeadMaterials.size === 0) {
          headModel.traverse(child => {
            if (child.isMesh && child.material) {
              originalHeadMaterials.set(child.uuid, child.material.clone());
            }
          });
        }
        
        // Ensure video is playing
        codingVideo.load();
        codingVideo.play().catch(e => console.error("Video play failed:", e));
        codingVideoTexture.needsUpdate = true;
        
        // Apply video texture to head
        headModel.traverse(child => {
          if (child.isMesh) {
            child.material = new THREE.MeshBasicMaterial({
              map: codingVideoTexture,
              toneMapped: false
            });
          }
        });
      }
    }
  });
}

function handleSectionChange(newSection, scrollTop) {
  console.log(`Changing to section ${newSection}`);

  const skillsCanvas = document.getElementById('skillsCanvas');
  const bgCanvas = document.querySelector('#bg');

  pointLight.visible = true;
  ambientLight.visible = true;
  bgCanvas.style.display = 'block';

  cameraController.handleSectionChange(newSection, headModel, scrollTop);

  if (newSection === 2) {
    if (skillsCanvas) {
      skillsCanvas.classList.add('hidden');
      skillsCanvas.style.display = 'none';
    }
    projectsGallery.showGallery();
    if (headModel && originalHeadMaterials.size > 0) {
      headModel.traverse(child => {
        if (child.isMesh && originalHeadMaterials.has(child.uuid)) {
          child.material = originalHeadMaterials.get(child.uuid);
        }
      });
    }
    laptop.visible = false; // Hide laptop in Projects section
  } else if (newSection === 3) { // About Me section
    if (headModel && originalHeadMaterials.size === 0) {
      headModel.traverse(child => {
        if (child.isMesh && child.material) {
          originalHeadMaterials.set(child.uuid, child.material.clone());
        }
      });
    }
    codingVideo.load();
    codingVideo.play().catch(e => console.error("Video play failed:", e));
    codingVideoTexture.needsUpdate = true;
    if (headModel) {
      headModel.traverse(child => {
        if (child.isMesh) {
          child.material = new THREE.MeshBasicMaterial({
            map: codingVideoTexture,
            toneMapped: false
          });
        }
      });
    }
    projectsGallery.hideGallery();
    pointLight.visible = true;
    ambientLight.visible = true;
    if (skillsCanvas) {
      skillsCanvas.classList.add('hidden');
      skillsCanvas.style.display = 'none';
    }
    laptop.visible = true; // Show laptop in About Me section
  } else {
    if (headModel && originalHeadMaterials.size > 0) {
      headModel.traverse(child => {
        if (child.isMesh && originalHeadMaterials.has(child.uuid)) {
          child.material = originalHeadMaterials.get(child.uuid);
        }
      });
    }
    if (newSection === 1) {
      if (skillsCanvas) {
        skillsCanvas.classList.remove('hidden');
        skillsCanvas.style.display = 'block';
      }
      projectsGallery.hideGallery();
    } else {
      if (skillsCanvas) {
        skillsCanvas.classList.add('hidden');
        skillsCanvas.style.display = 'none';
      }
      projectsGallery.hideGallery();
    }
    laptop.visible = false; // Hide laptop in other sections
  }
}

function moveCamera() {
  const snapContainer = document.querySelector('.snap-container');
  const scrollTop = snapContainer.scrollTop;
  const sectionHeight = window.innerHeight;
  if (scrollTop >= 0 && scrollTop <= sectionHeight) {
    const skillsCanvas = document.getElementById('skillsCanvas');
    if (cameraController.handleScrollTransition(scrollTop, headModel)) {
      if (skillsCanvas) {
        const zoomFactor = Math.min(scrollTop / (sectionHeight * 0.8), 1);
        if (zoomFactor > 0.8) {
          skillsCanvas.classList.remove('hidden');
          skillsCanvas.style.display = 'block';
          skillsCanvas.style.opacity = (zoomFactor - 0.8) * 5;
        } else {
          skillsCanvas.classList.add('hidden');
          skillsCanvas.style.display = 'none';
        }
      }
      return;
    }
  }
  const currentSection = Math.round(scrollTop / sectionHeight);
  if (cameraController.getCurrentSection() !== currentSection) {
    handleSectionChange(currentSection, scrollTop);
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
  const sectionHeight = window.innerHeight;
  const currentSection = Math.round(scrollTop / sectionHeight);
  if ((currentSection === 0 || currentSection === 3) && headModel && isFollowing) {
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

document.querySelector('.snap-container').addEventListener('scroll', moveCamera);
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

document.addEventListener('keydown', (event) => {
  const snapContainer = document.querySelector('.snap-container');
  const sectionHeight = window.innerHeight;
  const totalSections = 5;
  const currentScrollPosition = snapContainer.scrollTop;
  const currentSection = Math.round(currentScrollPosition / sectionHeight);
  switch (event.key) {
    case 'ArrowUp':
      event.preventDefault();
      if (currentSection > 0) {
        const targetScrollPosition = (currentSection - 1) * sectionHeight;
        snapContainer.scrollTo({
          top: targetScrollPosition,
          behavior: 'smooth'
        });
      }
      break;
    case 'ArrowDown':
      event.preventDefault();
      if (currentSection < totalSections - 1) {
        const targetScrollPosition = (currentSection + 1) * sectionHeight;
        snapContainer.scrollTo({
          top: targetScrollPosition,
          behavior: 'smooth'
        });
      }
      break;
  }
});

// Create intro overlay
function createIntroOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'intro-overlay';
  
  // Create text container
  const textContainer = document.createElement('div');
  textContainer.id = 'typing-text';
  textContainer.className = 'tinos-regular-italic';
  
  overlay.appendChild(textContainer);
  document.body.appendChild(overlay);
  
  // The text to type
  const text = "the mind of a backend dev and the heart of a frontend dev makes one hell of a full-stack engineer";
  
  // Start typing animation
  let charIndex = 0;
  const typingSpeed = 60; // milliseconds per character
  
  const typingInterval = setInterval(() => {
    if (charIndex < text.length) {
      textContainer.textContent += text.charAt(charIndex);
      charIndex++;
    } else {
      clearInterval(typingInterval);
      // Wait a bit after typing finishes
      setTimeout(() => {
        // Fade out the overlay
        overlay.style.opacity = '0';
        // Remove overlay after fade completes
        setTimeout(() => {
          document.body.removeChild(overlay);
        }, 1000);
      }, 1500);
    }
  }, typingSpeed);
}

// Screen width warning functionality
document.addEventListener('DOMContentLoaded', function() {
  const screenSizeWarning = document.getElementById('screen-size-warning');
  
  // Function to check screen size and show/hide warning
  function checkScreenWidth() {
    if (window.innerWidth < 1200) {
      screenSizeWarning.classList.remove('hidden');
      screenSizeWarning.classList.add('flex');
      document.body.style.overflow = 'hidden'; // Prevent scrolling when warning is shown
    } else {
      screenSizeWarning.classList.add('hidden');
      screenSizeWarning.classList.remove('flex');
      document.body.style.overflow = ''; // Restore scrolling
    }
  }
  
  // Check screen size on page load
  checkScreenWidth();
  
  // Check screen size when window is resized
  window.addEventListener('resize', checkScreenWidth);
});

// Execute intro before anything else
document.addEventListener('DOMContentLoaded', () => {
  createIntroOverlay();
  
  setTimeout(() => {
    // The existing initialization code can go here
    initSkillsPhysics();
    setupToggle();

    initContactForm();
    initHeadModelViewer();
    initLaptopModelViewer();
  }, 2000); // Adjust timing based on text length and typing speed
});
