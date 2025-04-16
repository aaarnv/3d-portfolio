// InteractiveModelViewers.js - Add to your project files

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Create and initialize the head model viewer in div2
export function initHeadModelViewer() {
  // Create canvas for the head viewer
  const headCanvas = document.createElement('canvas');
  headCanvas.id = 'headModelCanvas';
  headCanvas.className = 'w-full h-full';
  
  // Add canvas to div2
  const div2 = document.querySelector('.div2');
  div2.appendChild(headCanvas);
  
  // Set up scene, camera, and renderer
  const scene = new THREE.Scene();
  scene.background = null;
  
  const camera = new THREE.PerspectiveCamera(75, div2.clientWidth / div2.clientHeight, 0.1, 1000);
  camera.position.set(0, 0, 100);
  
  const renderer = new THREE.WebGLRenderer({
    canvas: headCanvas,
    antialias: true,
    alpha: true
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(div2.clientWidth, div2.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  
  // Add lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);
  
  // Add orbit controls
  const controls = new OrbitControls(camera, headCanvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 50;
  controls.maxDistance = 150;
  
  // Load the head model
  const loader = new GLTFLoader();
  let headModel;
  
  loader.load(
    '/aarnavhead.glb',
    (gltf) => {
      headModel = gltf.scene;
      headModel.position.set(0, -10, 0);
      headModel.scale.set(25, 25, 25);
      scene.add(headModel);
      
      // Create info panel
      const infoPanel = document.createElement('div');
      infoPanel.className = 'absolute bottom-4 self-center bg-black bg-opacity-70 text-white p-2 rounded text-sm product-sans';
      infoPanel.innerHTML = 'Have a look at your future employee :D';
      div2.appendChild(infoPanel);
      
      // Add click handler for head model to change its color
      const colorOptions = [0x368f8b, 0x246865, 0x163f38, 0xff5e5b];
      let colorIndex = 0;
      
      headCanvas.addEventListener('dblclick', () => {
        colorIndex = (colorIndex + 1) % colorOptions.length;
        
        // Apply new color to the head model materials
        headModel.traverse((child) => {
          if (child.isMesh && child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                mat.color = new THREE.Color(colorOptions[colorIndex]);
              });
            } else {
              child.material.color = new THREE.Color(colorOptions[colorIndex]);
            }
          }
        });
      });
    },
    (xhr) => {
      console.log(`Head model: ${(xhr.loaded / xhr.total * 100).toFixed(0)}% loaded`);
    },
    (error) => {
      console.error('An error occurred loading the head model:', error);
    }
  );
  
  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    
    if (headModel) {
      headModel.rotation.y += 0.002;
    }
    
    controls.update();
    renderer.render(scene, camera);
  }
  
  animate();
  
  // Handle resize
  window.addEventListener('resize', () => {
    camera.aspect = div2.clientWidth / div2.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(div2.clientWidth, div2.clientHeight);
  });
}

// Create and initialize the laptop model viewer in div5
export function initLaptopModelViewer() {
  // Create canvas for the laptop viewer
  const laptopCanvas = document.createElement('canvas');
  laptopCanvas.id = 'laptopModelCanvas';
  laptopCanvas.className = 'w-full h-full';
  
  // Add canvas to div5
  const div5 = document.querySelector('.div5');
  div5.appendChild(laptopCanvas);
  
  // Set up scene, camera, and renderer
  const scene = new THREE.Scene();
  scene.background = null;
  
  const camera = new THREE.PerspectiveCamera(75, div5.clientWidth / div5.clientHeight, 0.1, 1000);
  camera.position.set(0, 15, 70);
  
  const renderer = new THREE.WebGLRenderer({
    canvas: laptopCanvas,
    antialias: true,
    alpha: true
  });
  renderer.setSize(div5.clientWidth, div5.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000000, 0);
  // Add lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);
  
  // Add orbit controls
  const controls = new OrbitControls(camera, laptopCanvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  
  // Reference to original laptop controller that handles the state
  let isLaptopOpen = false;
  let targetRotation = 0;
  let laptop;
  let screen;
  
  // Create a mock laptop if the original isn't available
  function createLaptop() {
    const laptopGroup = new THREE.Group();
    
    // Base
    const baseGeometry = new THREE.BoxGeometry(2, 0.1, 1.5);
    const baseMaterial = new THREE.MeshPhongMaterial({ color: 0x303030 });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    laptopGroup.add(base);
    
    // Screen
    const screenGeometry = new THREE.BoxGeometry(2, 1.3, 0.05);
    const screenMaterial = new THREE.MeshPhongMaterial({ color: 0x303030 });
    screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.y = 0.65;
    screen.position.z = -0.75;
    screen.rotation.x = 0; // Closed position
    laptopGroup.add(screen);
    
    // Screen display
    const displayGeometry = new THREE.PlaneGeometry(1.9, 1.2);
    const displayMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x000000,
      map: createCodeTexture()
    });
    const display = new THREE.Mesh(displayGeometry, displayMaterial);
    display.position.z = 0.03;
    screen.add(display);
    
    // Keyboard
    const keyboardGeometry = new THREE.PlaneGeometry(1.8, 1.2);
    const keyboardMaterial = new THREE.MeshPhongMaterial({ color: 0x1a1a1a });
    const keyboard = new THREE.Mesh(keyboardGeometry, keyboardMaterial);
    keyboard.rotation.x = -Math.PI / 2;
    keyboard.position.y = 0.06;
    base.add(keyboard);
    
    return laptopGroup;
  }
  
  // Create a texture with code-like pattern
  function createCodeTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Black background
    ctx.fillStyle = '#000814';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Code-like text
    ctx.font = '8px monospace';
    
    // Add colorful code lines
    const colors = ['#368f8b', '#00ffff', '#ff5e5b', '#ffffff'];
    
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      let line = '';
      const lineLength = Math.floor(Math.random() * 20) + 5;
      for (let j = 0; j < lineLength; j++) {
        line += String.fromCharCode(Math.floor(Math.random() * 26) + 97);
      }
      ctx.fillText(line, 10, 10 + i * 8);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }
  
  // Try to load the laptop model or create a simple one
  const loader = new GLTFLoader();
  let laptopController;
  
  try {
    // First try to import the laptop controller
    import('./laptopController.js')
        .then(module => {
            laptopController = module.initLaptop(scene);
            laptop = laptopController.getLaptop();
            
            // Modify screen texture after laptop is loaded
            setTimeout(() => {
            // Find screen mesh in the laptop model
            laptop.traverse((child) => {
                if (child.isMesh && child.material && child.material.map) {                    
                    // Load and apply new texture
                    const textureLoader = new THREE.TextureLoader();
                    const newTexture = textureLoader.load('/hireme.png', (tex) => {
                    tex.flipY = false;
                    // Preserve original texture settings
                    if (child.material.map.wrapS) tex.wrapS = child.material.map.wrapS;
                    if (child.material.map.repeat) tex.repeat.copy(child.material.map.repeat);
                    
                    child.material.map = tex;
                    child.material.needsUpdate = true;
                });
                }
            });
            }, 1000); // Wait a bit for the laptop model to fully load
            
            laptop.position.set(0, 0, 0);
            laptop.rotation.set(0, 0, 0);
            laptop.scale.set(2, 2, 2);
            scene.add(laptop);
        })
  } catch (e) {
    console.log('Could not load laptop controller, creating simple model');
    laptop = createLaptop();
    scene.add(laptop);
  }
  
  // Create info panel
  const infoPanel = document.createElement('div');
  infoPanel.className = 'absolute bottom-4 self-center bg-black bg-opacity-70 text-white p-2 rounded text-sm';
  infoPanel.innerHTML = 'I code everything on my Macbook Air';
  div5.appendChild(infoPanel);
  
  // Add click handler to open/close laptop
  laptopCanvas.addEventListener('click', (event) => {
    if (event.detail === 1) { // Single click
      isLaptopOpen = !isLaptopOpen;
      targetRotation = isLaptopOpen ? -Math.PI / 2 : 0;
      
      // If using imported laptop controller
      if (laptopController) {
        if (isLaptopOpen) {
          laptopController.openLaptop();
        } else {
          laptopController.closeLaptop();
        }
      }
    }
  });
  
  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    
    // If using our simple laptop model, animate the screen opening/closing
    if (laptop && screen && !laptopController) {
      screen.rotation.x += (targetRotation - screen.rotation.x) * 0.1;
    }
    
    if (laptop) {
      laptop.rotation.y += 0.002;
    }
    
    controls.update();
    renderer.render(scene, camera);
  }
  
  animate();
  
  // Handle resize
  window.addEventListener('resize', () => {
    camera.aspect = div5.clientWidth / div5.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(div5.clientWidth, div5.clientHeight);
  });
}