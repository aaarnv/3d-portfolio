import * as THREE from 'three';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';

export function initProjectsGallery(scene, camera) {
  // Project data - with actual projects and GitHub links
  const projects = [
    {
      image: '/projects/project1.png',
      title: 'AI Data Analyst Chatbot',
      description: 'Python Flask OpenAI API Square API SQLite',
      github: 'https://github.com/aaarnv/rnm-ai'
    },
    {
      image: '/projects/projectshift.png',
      title: 'Shift Management App',
      description: 'TypeScript Next Prisma NextAuth PostgreSQL',
      github: 'https://github.com/aaarnv/fullofshift'
    },
    {
        image: '/projects/project4.jpg',
        title: 'Tributary',
        description: 'Java JUnit',
        github: 'https://github.com/username/fitness-app'
    },
    {
      image: '/projects/project4.jpg',
      title: 'Vibecheck: Social Media App',
      description: 'ThreeJS MatterJS Tailwind CSS',
      github: 'https://github.com/aaarnv/3d-portfolio'
    },
    {
        image: '/projects/project2.png',
        title: 'Portfolio Website',
        description: 'ThreeJS MatterJS Tailwind CSS',
        github: 'https://github.com/aaarnv/3d-portfolio'
    },
    {
      image: '/projects/project6.jpg',
      title: 'Coming Soon: Stock App',
      description: 'Swift Firebase',
      github: 'https://github.com/username/collab-tool'
    }
  ];

  // Extract titles, descriptions, and GitHub links from projects
  const titles = projects.map(project => project.title);
  const descriptions = projects.map(project => project.description);
  const images = projects.map(project => project.image);
  const githubLinks = projects.map(project => project.github);

  const textureLoader = new THREE.TextureLoader();
  
  // Create a root object to hold all gallery elements
  const galleryRoot = new THREE.Object3D();
  galleryRoot.visible = false; // Start hidden
  scene.add(galleryRoot);
  
  // Set up gallery elements in circle formation
  const count = images.length;
  const radius = 4; // Distance from center
  
  // Create an array to hold all project nodes
  const projectNodes = [];
  
  for (let i = 0; i < count; i++) {
    const image = textureLoader.load(images[i]);
  
    const baseNode = new THREE.Object3D();
    baseNode.rotation.y = 2 * Math.PI * (i / count);
    baseNode.name = `project-${i}`;
  
    const border = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 2.2, 0.005),
      new THREE.MeshStandardMaterial({ 
        color: 0x303030,
        emissive: 0x101010
      })
    );
    border.position.z = -radius;
    baseNode.add(border);
  
    const artwork = new THREE.Mesh(
      new THREE.BoxGeometry(3, 2, 0.01),
      new THREE.MeshStandardMaterial({ 
        map: image,
        emissive: 0x222222,
        emissiveIntensity: 0.2
      })
    );
    artwork.position.z = -radius + 1;
    baseNode.add(artwork);
    
    projectNodes.push(baseNode);
    galleryRoot.add(baseNode);
  }
  
  // Add spotlight for gallery illumination - will be targeted at current project
  const spotlight = new THREE.SpotLight(0xffffff, 50.0, 10, 0.65, 1);
  spotlight.position.set(0, 3, 0);
  spotlight.target.position.set(0, 0, -3);
  galleryRoot.add(spotlight);
  galleryRoot.add(spotlight.target);
  
  // Store original scene background and lighting
  let originalLights = [];
  
  // Add reflective floor
  const mirror = new Reflector(
    new THREE.CircleGeometry(5, 64),
    {
      color: 0x505050,
      textureWidth: window.innerWidth * window.devicePixelRatio,
      textureHeight: window.innerHeight * window.devicePixelRatio,
    }
  );
  
  mirror.position.set(0, -1.1, 0);
  mirror.rotateX(-Math.PI / 2);
  galleryRoot.add(mirror);
  
  // Store original camera position and look target
  let originalCameraPosition = null;
  let originalCameraRotation = null;
  let currentProjectIndex = 0;
  
  // Animation state variables
  let isRotating = false;
  let rotationStartValue = 0;
  let rotationTargetValue = 0;
  let rotationStartTime = 0;
  let rotationDuration = 1500; // ms
  
  // Update project info display
  function updateProjectInfo(index) {
    const projectTitle = document.getElementById('projectTitle');
    const projectDescription = document.getElementById('projectDescription');
    const projectLink = document.getElementById('projectLink');
    const projectInfo = document.getElementById('projectInfo');
    
    if (projectTitle && projectDescription && projectLink) {
      projectTitle.innerText = titles[index];
      projectDescription.innerText = descriptions[index];
      projectLink.href = githubLinks[index];
      
      projectInfo.style.opacity = '1';
    }
    
    // Update spotlight target to point at current project
    const currentProjectNode = projectNodes[index];
    const targetPosition = new THREE.Vector3();
    
    // Get world position of the artwork inside the project node
    currentProjectNode.children[1].getWorldPosition(targetPosition);
    
    // Point spotlight at the current project
    spotlight.target.position.copy(targetPosition);
    spotlight.target.updateMatrixWorld();
  }
  
  // Function to rotate gallery to show a specific project
  function rotateGallery(direction) {
    if (isRotating) return; // Don't allow multiple rotations simultaneously
    
    // Calculate the new rotation
    const angleStep = (2 * Math.PI) / count;
    rotationStartValue = galleryRoot.rotation.y;
    rotationTargetValue = rotationStartValue + (direction * angleStep);
    
    // Update the current project index
    currentProjectIndex = (currentProjectIndex - direction + count) % count;
    
    // Fade out current project info
    const projectInfo = document.getElementById('projectInfo');
    if (projectInfo) {
      projectInfo.style.opacity = '0';
    }
    
    console.log(`Rotating gallery ${direction < 0 ? 'right' : 'left'} to index ${currentProjectIndex}`);
    
    // Start rotation animation
    isRotating = true;
    rotationStartTime = Date.now();
  }
  
  // Set up HTML navigation arrow click handlers
  function setupArrowControls() {
    const leftArrow = document.getElementById('galleryLeftArrow');
    const rightArrow = document.getElementById('galleryRightArrow');
    
    if (leftArrow) {
      leftArrow.addEventListener('click', () => {
        if (galleryRoot.visible && !isRotating) {
          rotateGallery(-1);
        }
      });
    }
    
    if (rightArrow) {
      rightArrow.addEventListener('click', () => {
        if (galleryRoot.visible && !isRotating) {
          rotateGallery(1);
        }
      });
    }
  }
  
  // Handle keyboard events for gallery navigation
  function handleKeyDown(event) {
    if (galleryRoot.visible && !isRotating) {
      if (event.key === 'ArrowLeft') {
        rotateGallery(-1);
      } else if (event.key === 'ArrowRight') {
        rotateGallery(1);
      }
    }
  }
  
  // Handle mouse wheel events for gallery navigation
  function handleWheel(event) {
    if (galleryRoot.visible && !isRotating) {
      event.preventDefault();
      const direction = event.deltaY > 0 ? -1 : 1; // Inverted for natural scrolling
      rotateGallery(direction);
    }
  }
  
  // Save the original scene lighting
  function saveOriginalLighting() {
    originalLights = [];
    scene.traverse((object) => {
      if (object instanceof THREE.Light && !galleryRoot.children.includes(object)) {
        originalLights.push({
          light: object,
          parent: object.parent,
          visible: object.visible,
          intensity: object.intensity
        });
      }
    });
  }
  
  // Hide all scene lighting except for our gallery lighting
  function hideSceneLighting() {
    originalLights.forEach(item => {
      item.light.visible = false;
    });
  }
  
  // Restore original scene lighting
  function restoreSceneLighting() {
    originalLights.forEach(item => {
      item.light.visible = item.visible;
      if ('intensity' in item.light) {
        item.light.intensity = item.intensity;
      }
    });
  }
  
  // Function to show gallery when entering projects section
  function showGallery() {
    // Setup arrow controls
    setupArrowControls();
    
    // Save original camera state
    originalCameraPosition = camera.position;
    console.log(`Original camera position: ${originalCameraPosition}`);
    originalCameraRotation = camera.rotation.clone();
    
    // Save original background and set black background
    scene.background = new THREE.Color(0x000000);
    
    // Save and hide original lighting
    saveOriginalLighting();
    hideSceneLighting();
    
    // Add spotlight target to scene if it's not already there
    if (!scene.children.includes(spotlight.target)) {
      scene.add(spotlight.target);
    }
    
    // Make gallery visible
    galleryRoot.visible = true;
    
    // Reset gallery rotation to face first project
    galleryRoot.rotation.y = 0;
    currentProjectIndex = 0;
    
    // Position camera in the center of the gallery
    camera.position.set(0, 0, 0); 
    camera.lookAt(0, 0, -radius); 
    
    // Show project info and navigation arrows
    const projectInfo = document.getElementById('projectInfo');
    const galleryControls = document.getElementById('galleryControls');
    
    if (projectInfo) projectInfo.style.display = 'flex';
    if (galleryControls) galleryControls.style.display = 'flex';
    
    // Attach event handlers
    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('keydown', handleKeyDown);
    
    // Update project info and spotlight target with slight delay
    setTimeout(() => {
      updateProjectInfo(currentProjectIndex);
    }, 600);
  }
  
  // Function to hide gallery when leaving projects section
  function hideGallery() {
    galleryRoot.visible = false;
    
    const projectInfo = document.getElementById('projectInfo');
    const galleryControls = document.getElementById('galleryControls');
    
    if (projectInfo) {
      projectInfo.style.display = 'none';
      projectInfo.style.opacity = '0';
    }
    
    if (galleryControls) {
      galleryControls.style.display = 'none';
    }
    
    scene.background =  new THREE.Color(0xFFFFFF);
    
    // Restore original lighting
    restoreSceneLighting();
    
    // Restore original camera position and rotation
    if (originalCameraPosition && originalCameraRotation) {
      // Set up manual animation for camera repositioning
      const startPos = camera.position.clone();
      const startRot = camera.rotation.clone();
      const startTime = Date.now();
      const duration = 1000;
      
      function animateCameraReturn() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = easeInOutQuad(progress);
        
        // Interpolate position
        camera.position.x = startPos.x + (originalCameraPosition.x - startPos.x) * easeProgress;
        camera.position.y = startPos.y + (originalCameraPosition.y - startPos.y) * easeProgress;
        camera.position.z = startPos.z + (originalCameraPosition.z - startPos.z) * easeProgress;
        
        // Interpolate rotation
        camera.rotation.x = startRot.x + (originalCameraRotation.x - startRot.x) * easeProgress;
        camera.rotation.y = startRot.y + (originalCameraRotation.y - startRot.y) * easeProgress;
        camera.rotation.z = startRot.z + (originalCameraRotation.z - startRot.z) * easeProgress;
        
        if (progress < 1) {
          requestAnimationFrame(animateCameraReturn);
        }
      }
      
      animateCameraReturn();
    }
    
    // Remove event handlers
    document.removeEventListener('wheel', handleWheel);
    document.removeEventListener('keydown', handleKeyDown);
  }
  
  // Easing function for animations
  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  // Animation function for the gallery
  function animateGallery() {
    // Handle rotation animation if in progress
    if (isRotating) {
      const elapsed = Date.now() - rotationStartTime;
      const progress = Math.min(elapsed / rotationDuration, 1);
      const easeProgress = easeInOutQuad(progress);
      
      // Update rotation
      galleryRoot.rotation.y = rotationStartValue + (rotationTargetValue - rotationStartValue) * easeProgress;
      
      // Check if rotation is complete
      if (progress >= 1) {
        isRotating = false;
        galleryRoot.rotation.y = rotationTargetValue;
        updateProjectInfo(currentProjectIndex);
      }
    }
  }

  return {
    animateGallery,
    showGallery,
    hideGallery
  };
}