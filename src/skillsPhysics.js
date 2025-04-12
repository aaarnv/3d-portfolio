// skillsPhysics.js
import Matter from 'matter-js';

export function initSkillsPhysics() {
  const skillsCanvas = document.getElementById('skillsCanvas');
  if (!skillsCanvas) {
    console.error('Skills canvas not found');
    return;
  }

  // Hide the canvas initially
  skillsCanvas.classList.add('hidden');
  
  // **Create a hidden button that will be revealed**
  const createHiddenButton = () => {
    // Check if button already exists
    if (document.getElementById('hiddenButton')) {
      return document.getElementById('hiddenButton');
    }
    
    const button = document.createElement('button');
    button.id = 'hiddenButton';
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <polyline points="19 12 12 19 5 12"></polyline>
      </svg>
      <span>Explore deeper</span>
    `;
    
    // Style the button
    button.style.cssText = `
      position: absolute;
      left: 55%; /* Position under the physics pyramid */
      top: 70%; /* Position under the physics pyramid */
      transform: translate(-50%, -50%);
      background-color: #000;
      color: #fff;
      border: 2px solid #fff;
      border-radius: 30px;
      padding: 10px 20px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: "Manifold Extended CF", Arial, sans-serif;
      font-weight: 600;
      z-index: 15; /* Lower z-index than canvas but higher than background */
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.5s ease, transform 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    `;
    
    // Add click event to scroll to the next section
    button.addEventListener('click', () => {
      const sections = document.querySelectorAll('section');
      if (sections.length >= 3) {
        const nextSection = sections[2]; // Third section
        nextSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        // If there's no third section, scroll to the bottom of the current view
        window.scrollBy({
          top: window.innerHeight,
          behavior: 'smooth'
        });
      }
    });
    
    // Add hover effects
    button.addEventListener('mouseover', () => {
      button.style.backgroundColor = '#333';
      button.style.transform = 'translate(-50%, -50%) scale(1.05)';
    });
    
    button.addEventListener('mouseout', () => {
      button.style.backgroundColor = '#000';
      button.style.transform = 'translate(-50%, -50%) scale(1)';
    });
    
    // Add button to the skills section
    const sections = document.querySelectorAll('section');
    if (sections.length >= 2) {
      const skillsSection = sections[1];
      skillsSection.appendChild(button);
    } else {
      document.body.appendChild(button);
    }
    
    return button;
  };
  
  let physicsInstance = null;
  let hiddenButton = null;
  let buttonRevealed = false; // Track if button has been revealed

  // **Intersection Observer to manage visibility**
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.9) {
        skillsCanvas.classList.remove('hidden');
        
        // Initialize physics if not already done
        if (!physicsInstance) {
          physicsInstance = startPhysics();
        }
        
        // Create the hidden button
        if (!hiddenButton) {
          hiddenButton = createHiddenButton();
        }
      } else {
        // Hide canvas and stop physics when scrolling away
        skillsCanvas.classList.add('hidden');
        
        if (physicsInstance) {
          physicsInstance.stop();
          physicsInstance = null;
        }
        
        // Remove hidden button
        if (hiddenButton && hiddenButton.parentNode) {
          hiddenButton.parentNode.removeChild(hiddenButton);
          hiddenButton = null;
          buttonRevealed = false;
        }
      }
    });
  }, { 
    threshold: [0.1, 0.5, 0.9, 1.0] // Multiple thresholds for visibility detection
  });

  // Observe the second section
  const sections = document.querySelectorAll('section');
  if (sections.length >= 2) {
    const skillsSection = sections[1];
    observer.observe(skillsSection);
  }

  // **Start Physics Simulation**
  function startPhysics() {
    const Engine = Matter.Engine,
          Render = Matter.Render,
          Runner = Matter.Runner,
          MouseConstraint = Matter.MouseConstraint,
          Mouse = Matter.Mouse,
          Composite = Matter.Composite,
          Bodies = Matter.Bodies,
          Events = Matter.Events;

    // Create engine
    const engine = Engine.create();
    const world = engine.world;
    
    engine.world.gravity.y = 1; // Adjust gravity

    // Create renderer
    const render = Render.create({
      canvas: skillsCanvas,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: 'transparent',
        showAngleIndicator: false,
        showCollisions: false,
        showVelocity: false
      }
    });

    Render.run(render);

    // Create runner
    const runner = Runner.create();
    Runner.run(runner, engine);

    // **Skills Data**
    const skills = [
        { name: 'Java', color: '#000000', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg' },
        { name: 'C', color: '#000000', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg' },
        { name: 'Python', color: '#000000', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
        { name: 'TypeScript', color: '#000000', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' },
        { name: 'React', color: '#000000', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
        { name: 'Node.js', color: '#000000', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' },
        { name: 'Next', color: '#000000', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg' },
        { name: 'Prisma', color: '#000000', icon: 'https://cdn.worldvectorlogo.com/logos/prisma-2.svg' },
        { name: 'MongoDB', color: '#000000', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg' },
        { name: 'PostgreSQL', color: '#000000', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg' },
        { name: 'Git', color: '#000000', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg' },
        { name: 'Azure', color: '#000000', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg' },
        { name: 'Postman', color: '#000000', icon: 'https://www.vectorlogo.zone/logos/getpostman/getpostman-icon.svg' },
        { name: 'Docker', color: '#000000', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg' },
        { name: 'Firebase', color: '#000000', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg' }
      ];

    // **Calculate Responsive Dimensions**
    function calculateResponsiveDimensions() {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      
      const baseBrickWidth = screenWidth * 0.18;
      const baseBrickHeight = baseBrickWidth * 0.4;
      const iconSize = baseBrickWidth * 0.2;
      
      let pyramidStructure = [5, 4, 3, 2, 1];

      return {
        brickWidth: baseBrickWidth,
        brickHeight: baseBrickHeight,
        iconSize: iconSize,
        pyramidStructure: pyramidStructure
      };
    }
    
    const dimensions = calculateResponsiveDimensions();
    const brickWidth = dimensions.brickWidth;
    const brickHeight = dimensions.brickHeight;
    const iconSize = dimensions.iconSize;
    const pyramidStructure = dimensions.pyramidStructure;
    
    // **Create Skill Bodies in Pyramid**
    const skillBodies = [];
    const rightSideCenter = window.innerWidth * 0.55;
    const pyramidBottom = window.innerHeight * 0.7;
    const horizontalGap = brickWidth * 1.05;
    const verticalGap = brickHeight * 1.2;
    
    let brickIndex = 0;
    
    for (let rowIndex = 0; rowIndex < pyramidStructure.length; rowIndex++) {
      const bricksInThisRow = pyramidStructure[rowIndex];
      const rowWidth = bricksInThisRow * horizontalGap - (horizontalGap - brickWidth);
      const rowStartX = rightSideCenter - (rowWidth / 2) + (brickWidth / 2);
      const rowY = pyramidBottom - (rowIndex * verticalGap);
      
      for (let colIndex = 0; colIndex < bricksInThisRow; colIndex++) {
        if (brickIndex >= skills.length) break;
        
        const skill = skills[brickIndex];
        const x = rowStartX + (colIndex * horizontalGap);
        const y = rowY;
        
        const body = Bodies.rectangle(x, y, brickWidth, brickHeight, {
          restitution: 0.3,
          friction: 0.01,
          frictionAir: 0.001,
          render: {
            fillStyle: skill.color,
            strokeStyle: '#333',
            lineWidth: 3
          },
          skillName: skill.name,
          isImageLoaded: false,
          iconSize: iconSize
        });
        
        skillBodies.push(body);
        brickIndex++;
      }
    }

    Composite.add(world, skillBodies);

    // **Preload Images**
    const preloadedImages = {};
    let imagesLoaded = 0;
    const totalImages = skills.length;
    
    skills.forEach(skill => {
      const img = new Image();
      img.onload = () => {
        const bodyIndex = skillBodies.findIndex(body => body.skillName === skill.name);
        if (bodyIndex >= 0) {
          skillBodies[bodyIndex].isImageLoaded = true;
        }
        imagesLoaded++;
      };
      img.onerror = () => {
        console.error(`Failed to load image for ${skill.name}`);
        imagesLoaded++;
      };
      img.src = skill.icon;
      preloadedImages[skill.name] = img;
    });

    // **Render Text and Icons**
    Events.on(render, 'afterRender', () => {
      const context = render.context;
      for (let i = 0; i < skillBodies.length; i++) {
        const body = skillBodies[i];
        if (body.skillName) {
          const angle = body.angle;
          const currentIconSize = body.iconSize || iconSize;
          const fontSize = Math.max(12, Math.min(18, brickWidth * 0.09));
          
          context.save();
          context.translate(body.position.x, body.position.y);
          context.rotate(angle);
          
          const img = preloadedImages[body.skillName];
          if (body.isImageLoaded && img && img.complete && img.naturalWidth !== 0) {
            context.drawImage(img, -currentIconSize/2, -currentIconSize/2, currentIconSize, currentIconSize);
          }
          
          context.font = `bold ${fontSize}px "Manifold Extended CF", Arial, sans-serif`;
          context.fillStyle = '#FFFFFF';
          context.textAlign = 'center';
          context.textBaseline = 'middle';
          context.fillText(body.skillName, 0, currentIconSize/2 + fontSize/2);
          
          context.restore();
        }
      }
      
      // **Reveal Button Logic**
      if (hiddenButton && !buttonRevealed) {
        const rect = hiddenButton.getBoundingClientRect();
        const buttonArea = {
          minX: rect.left,
          maxX: rect.right,
          minY: rect.top,
          maxY: rect.bottom
        };
        
        let buttonCovered = false;
        for (let i = 0; i < skillBodies.length; i++) {
          const body = skillBodies[i];
          if (
            body.position.x > buttonArea.minX &&
            body.position.x < buttonArea.maxX &&
            body.position.y > buttonArea.minY &&
            body.position.y < buttonArea.maxY
          ) {
            buttonCovered = true;
            break;
          }
        }
        
        if (!buttonCovered) {
          buttonRevealed = true;
          hiddenButton.style.opacity = '1';
        }
      }
    });

    // **Add Walls**
    const wallOptions = { 
      isStatic: true, 
      render: { visible: false } 
    };
    const wallThickness = 50;
    const walls = [
      Bodies.rectangle(window.innerWidth / 2, window.innerHeight, window.innerWidth, wallThickness, wallOptions),
      Bodies.rectangle(0, window.innerHeight / 2, wallThickness, window.innerHeight, wallOptions),
      Bodies.rectangle(window.innerWidth, window.innerHeight / 2, wallThickness, window.innerHeight, wallOptions),
      Bodies.rectangle(window.innerWidth / 2, 0, window.innerWidth, wallThickness, wallOptions)
    ];
    Composite.add(world, walls);

    // **Add Mouse Control**
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      }
    });
    Composite.add(world, mouseConstraint);
    render.mouse = mouse;

    // **Handle Mouse Clicks**
    Events.on(mouseConstraint, 'mousedown', (event) => {
      const clickedBody = mouseConstraint.body;
      if (clickedBody) {
        Matter.Body.applyForce(clickedBody, clickedBody.position, {
          x: (Math.random() - 0.5) * 0.1,
          y: -0.1
        });
      } else if (buttonRevealed && hiddenButton) {
        const mousePosition = event.mouse.position;
        const rect = hiddenButton.getBoundingClientRect();
        if (
          mousePosition.x >= rect.left &&
          mousePosition.x <= rect.right &&
          mousePosition.y >= rect.top &&
          mousePosition.y <= rect.bottom
        ) {
          hiddenButton.click();
        }
      }
    });

    // **Change Cursor on Hover**
    Events.on(mouseConstraint, 'mousemove', (event) => {
      if (buttonRevealed && hiddenButton) {
        const mousePosition = event.mouse.position;
        const rect = hiddenButton.getBoundingClientRect();
        if (
          mousePosition.x >= rect.left &&
          mousePosition.x <= rect.right &&
          mousePosition.y >= rect.top &&
          mousePosition.y <= rect.bottom
        ) {
          render.canvas.style.cursor = 'pointer';
        } else {
          render.canvas.style.cursor = 'default';
        }
      } else {
        render.canvas.style.cursor = 'default';
      }
    });

    // **Shake Bricks Initially**
    const shakeAllBricks = () => {
      skillBodies.forEach(body => {
        const forceMagnitude = 0.01 * body.mass;
        Matter.Body.applyForce(body, body.position, {
          x: (Math.random() - 0.5) * forceMagnitude,
          y: (Math.random() - 0.5) * forceMagnitude
        });
      });
    };
    setTimeout(shakeAllBricks, 1000);

    // **Handle Window Resize**
    const resizeHandler = () => {
      render.options.width = window.innerWidth;
      render.options.height = window.innerHeight;
      render.canvas.width = window.innerWidth;
      render.canvas.height = window.innerHeight;
      
      Composite.remove(world, walls);
      const newWalls = [
        Bodies.rectangle(window.innerWidth / 2, window.innerHeight, window.innerWidth, wallThickness, wallOptions),
        Bodies.rectangle(0, window.innerHeight / 2, wallThickness, window.innerHeight, wallOptions),
        Bodies.rectangle(window.innerWidth, window.innerHeight / 2, wallThickness, window.innerHeight, wallOptions),
        Bodies.rectangle(window.innerWidth / 2, 0, window.innerWidth, wallThickness, wallOptions)
      ];
      Composite.add(world, newWalls);
    };
    window.addEventListener('resize', resizeHandler);

    return {
      engine,
      runner,
      render,
      canvas: render.canvas,
      stop: () => {
        window.removeEventListener('resize', resizeHandler);
        Events.off(render, 'afterRender');
        Matter.Render.stop(render);
        Matter.Runner.stop(runner);
        Matter.World.clear(world);
        Matter.Engine.clear(engine);
      }
    };
  }
}