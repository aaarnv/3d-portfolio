import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'https://cdn.skypack.dev/gsap@3.12.5';

export function initLaptop(scene) {
  let macGroup, lidGroup, bottomGroup, screenMesh, screenLight;
  let darkPlasticMaterial, cameraMaterial, baseMetalMaterial, logoMaterial, screenMaterial, keyboardMaterial;
  let screenImageTexture, screenCameraTexture;
  const videoEl = document.createElement('video');
  const screenSize = [29.4, 20];
  let laptopOpeningTl, screenOnTl, cameraOnTl, textureScrollTl, laptopAppearTl;
  let isLaptopOpen = true; // Start with laptop open for Education

  function createLaptopMaterials() {
    const textLoader = new THREE.TextureLoader();
    screenImageTexture = textLoader.load("/rebelsnmisfits.png", tex => {
      tex.flipY = false;
      tex.wrapS = THREE.RepeatWrapping;
      tex.repeat.y = tex.image.width / tex.image.height / screenSize[0] * screenSize[1];
    });

    screenCameraTexture = new THREE.VideoTexture(videoEl);
    screenCameraTexture.flipY = false;
    screenMaterial = new THREE.MeshBasicMaterial({
      map: screenImageTexture,
      transparent: true,
      opacity: 0,
      side: THREE.BackSide
    });
    const keyboardTexture = textLoader.load("https://ksenia-k.com/img/threejs/keyboard-overlay.png");
    keyboardMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      alphaMap: keyboardTexture,
      transparent: true,
    });

    darkPlasticMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      roughness: 0.9,
      metalness: 0.9,
    });
    cameraMaterial = new THREE.MeshBasicMaterial({
      color: 0x333333
    });
    baseMetalMaterial = new THREE.MeshStandardMaterial({
      color: 0xCECFD3
    });
    logoMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff
    });
  }

  function parseLaptopModel(glb) {
    [...glb.scene.children].forEach(child => {
      if (child.name === "_top") {
        lidGroup.add(child);
        [...child.children].forEach(mesh => {
          if (mesh.name === "lid") {
            mesh.material = baseMetalMaterial;
          } else if (mesh.name === "logo") {
            mesh.material = logoMaterial;
          } else if (mesh.name === "screen-frame") {
            mesh.material = darkPlasticMaterial;
          } else if (mesh.name === "camera") {
            mesh.material = cameraMaterial;
          }
        });
      } else if (child.name === "_bottom") {
        bottomGroup.add(child);
        [...child.children].forEach(mesh => {
          if (mesh.name === "base") {
            mesh.material = baseMetalMaterial;
          } else if (mesh.name === "legs") {
            mesh.material = darkPlasticMaterial;
          } else if (mesh.name === "keyboard") {
            mesh.material = darkPlasticMaterial;
          } else if (mesh.name === "inner") {
            mesh.material = darkPlasticMaterial;
          }
        });
      }
    });
  }

  function addLaptopScreen() {
    screenMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(screenSize[0], screenSize[1]),
      screenMaterial
    );
    screenMesh.position.set(0, 10.5, -0.11);
    screenMesh.rotation.set(Math.PI, 0, 0);
    lidGroup.add(screenMesh);

    screenLight = new THREE.RectAreaLight(0xffffff, 0, screenSize[0], screenSize[1]);
    screenLight.position.set(0, 10.5, 0);
    screenLight.rotation.set(Math.PI, 0, 0);
    lidGroup.add(screenLight);

    const darkScreen = screenMesh.clone();
    darkScreen.position.set(0, 10.5, -0.111);
    darkScreen.rotation.set(Math.PI, Math.PI, 0);
    darkScreen.material = darkPlasticMaterial;
    lidGroup.add(darkScreen);
  }

  function addLaptopKeyboard() {
    const keyboardKeys = new THREE.Mesh(
      new THREE.PlaneGeometry(27.7, 11.6),
      keyboardMaterial
    );
    keyboardKeys.rotation.set(-0.5 * Math.PI, 0, 0);
    keyboardKeys.position.set(0, 0.045, 7.21);
    bottomGroup.add(keyboardKeys);
  }

  function createLaptopTimelines() {
    screenOnTl = gsap.timeline({
      paused: true,
    })
      .to(screenMaterial, {
        duration: 0.1,
        opacity: 0.96
      }, 0)
      .to(screenLight, {
        duration: 0.1,
        intensity: 1.5
      }, 0);

    laptopOpeningTl = gsap.timeline({
      paused: true,
    })
      .from(lidGroup.position, {
        duration: 0.75,
        z: "+=0.5"
      }, 0)
      .fromTo(lidGroup.rotation, {
        duration: 1,
        x: 0.5 * Math.PI
      }, {
        x: 0
      }, 0)
      .to(screenOnTl, {
        duration: 0.06,
        progress: 1
      }, 0.05);

    cameraOnTl = gsap.timeline({
      paused: true,
      reversed: true
    })
      .to(cameraMaterial.color, {
        duration: 0.01,
        r: 0,
        g: 255,
        b: 0
      }, 0);

    textureScrollTl = gsap.timeline({
      paused: true,
    })
      .to(screenImageTexture.offset, {
        duration: 2,
        y: 0.4,
        ease: "power1.inOut",
      });

      // Add the laptopAppearTl initialization
    laptopAppearTl = gsap.timeline({
        paused: true,
    })
        .from(macGroup.position, {
        duration: 0.5,
        y: "-=2",
        ease: "power1.out"
        })
        .from(macGroup.scale, {
        duration: 0.5,
        x: 0.9,
        y: 0.9,
        z: 0.9,
        ease: "power1.out"
        }, 0);
  }

  macGroup = new THREE.Group();
  lidGroup = new THREE.Group();
  macGroup.add(lidGroup);
  bottomGroup = new THREE.Group();
  macGroup.add(bottomGroup);

  createLaptopMaterials();
  const laptopLoader = new GLTFLoader();
  laptopLoader.load(
    "https://ksenia-k.com/models/mac-noUv.glb",
    (glb) => {
      parseLaptopModel(glb);
      addLaptopScreen();
      addLaptopKeyboard();
      createLaptopTimelines();
      laptopAppearTl.play();
      laptopOpeningTl.play(); // Start with laptop open for Education
    }
  );

  return {
    getLaptop: () => macGroup,
    openLaptop: () => {
      laptopOpeningTl.play();
      isLaptopOpen = true;
    },
    closeLaptop: () => {
      laptopOpeningTl.reverse();
      isLaptopOpen = false;
    },
    isLaptopOpen: () => isLaptopOpen
  };
}