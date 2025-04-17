import * as THREE from 'three';

export function initCameraController(scene, camera) {
  const initialCameraPos = new THREE.Vector3(0, 0, 50);
  const skillsSectionCameraPos = new THREE.Vector3(50, 8, -40);
  const projectsSectionCameraPos = new THREE.Vector3(0, 0, 0);
  const initialHeadPos = new THREE.Vector3(50, 0, -60);
  let currentSection = 0;
  let maxScrollEffect = window.innerHeight * 0.8;

  camera.position.copy(initialCameraPos);

  const sceneState = {
    originalBackground: new THREE.Color(0xf7f6f9)
  };

  const blackPlaneGeometry = new THREE.PlaneGeometry(5000, 5000);
  const blackPlaneMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0
  });
  const blackPlane = new THREE.Mesh(blackPlaneGeometry, blackPlaneMaterial);
  blackPlane.visible = false;
  scene.add(blackPlane);

  function animateCameraMove(startPos, endPos, startLookAt, endLookAt, duration = 1000) {
    const startTime = Date.now();
    return new Promise((resolve) => {
      function updateCamera() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = easeInOutQuad(progress);
        camera.position.lerpVectors(startPos, endPos, easeProgress);
        if (startLookAt && endLookAt) {
          const currentLookAt = new THREE.Vector3();
          currentLookAt.lerpVectors(startLookAt, endLookAt, easeProgress);
          camera.lookAt(currentLookAt);
        }
        if (progress < 1) {
          requestAnimationFrame(updateCamera);
        } else {
          resolve();
        }
      }
      updateCamera();
    });
  }

  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function handleScrollTransition(scrollTop, headModel) {
    const sectionHeight = window.innerHeight;
    if (scrollTop >= 0 && scrollTop <= sectionHeight) {
        const zoomFactor = Math.min(scrollTop / maxScrollEffect, 1);
        camera.position.x = THREE.MathUtils.lerp(initialCameraPos.x, initialHeadPos.x, zoomFactor);
        camera.position.y = THREE.MathUtils.lerp(initialCameraPos.y, initialHeadPos.y + 8, zoomFactor);
        camera.position.z = THREE.MathUtils.lerp(initialCameraPos.z, initialHeadPos.z, zoomFactor);
        camera.position.z += THREE.MathUtils.lerp(0, 20, zoomFactor);
        
        // Update scene background color based on zoom factor
        if (zoomFactor < 0.5) {
            scene.background = new THREE.Color(0xFFFFFF); // White background for landing page
        } else if (zoomFactor >= 0.5 && zoomFactor <= 0.8) {
            // Gradually transition from white to black
            const colorValue = 1 - (zoomFactor - 0.5) * 3.33;
            scene.background = new THREE.Color(colorValue, colorValue, colorValue);
        } else {
            scene.background = new THREE.Color(0x000000); // Black background for skills section
        }
        
        blackPlane.visible = zoomFactor > 0;
        blackPlane.material.opacity = zoomFactor;
        blackPlane.position.copy(camera.position);
        blackPlane.position.z -= 5;
        blackPlane.lookAt(camera.position);
        if (headModel) {
            headModel.visible = zoomFactor < 0.92;
        }
        if (zoomFactor >= 0.9) {
            currentSection = 1;
        } else {
            currentSection = 0;
        }
        return true;
    }
    return false;
}

  async function handleSectionChange(newSection, headModel, scrollTop) {
    if (handleScrollTransition(scrollTop, headModel)) {
      return;
    }
    const prevSection = currentSection;
    currentSection = newSection;
    console.log(`Camera moving from section ${prevSection} to ${newSection}`);
    scene.background = sceneState.originalBackground;
    blackPlane.visible = false;
    switch (newSection) {
      case 0:
        scene.background = new THREE.Color(0xFFFFFF);
        await animateCameraMove(
          camera.position.clone(),
          initialCameraPos,
          null,
          new THREE.Vector3(0, 0, 0)
        );
        if (headModel) {
          headModel.visible = true;
        }
        break;
      case 1:
        camera.position.copy(skillsSectionCameraPos);
        scene.background = new THREE.Color(0x000000);
        if (headModel) {
          headModel.visible = false;
        }
        break;
      case 2:
        camera.position.copy(projectsSectionCameraPos);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
        scene.background = new THREE.Color(0x000000);
        break; 
      case 3: //about me
        scene.background = new THREE.Color(0x000000);
        camera.position.set(130, 0, 55);
        camera.lookAt(130, 0, 0);
        if (headModel) {
            headModel.visible = true;
          }
        break;
      case 4: //contact
        scene.background = new THREE.Color(0x000000);
        camera.position.set(-130, 0, 55);
        camera.lookAt(-130, 0, 0);
        if (headModel) {
            headModel.visible = false;
          }
        break;
    }
  }

  return {
    handleSectionChange,
    handleScrollTransition,
    getCurrentSection: () => currentSection,
    resetCamera: () => {
      camera.position.copy(initialCameraPos);
      camera.lookAt(new THREE.Vector3(0, 0, 0));
    },
    getBlackPlane: () => blackPlane
  };
}
