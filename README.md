# Aarnav's 3D Portfolio

## Overview
This is a dynamic, interactive 3D portfolio website showcasing my skills, projects, and contact information. Built using Three.js for 3D rendering, Matter.js for physics simulations, and EmailJS for contact form functionality, the portfolio offers a visually engaging experience with smooth transitions, a projects gallery, and interactive elements. The website is designed to highlight my full-stack development capabilities with a creative and modern approach.

## Features
- **3D Head Model:** An interactive 3D head model that follows the cursor and toggles between a video texture and original materials based on the theme.
- **Skills Physics Simulation:** A physics-based pyramid of skills using Matter.js, with a hidden button revealed after the simulation settles.
- **Projects Gallery:** A circular gallery of projects with smooth animations, navigation arrows, and a reflective floor, built with Three.js.
- **Interactive Laptop Model:** A 3D laptop model that opens and closes based on the theme toggle.
- **Contact Form:** A fully functional contact form with EmailJS integration and reCAPTCHA for spam protection.
- **Responsive Design:** Optimized for larger screens (1200px+), with a warning for smaller screens to ensure the best experience.
- **Theme Toggle:** Switches between Education and Experience content with corresponding visual changes (background color, head model texture, laptop state).
- **Intro Animation:** A typing animation with a fade-out effect to introduce the portfolio.
- **Scroll Navigation:** Smooth scrolling between sections with snap scrolling and keyboard navigation.

## Tech Stack
- **Frontend:** HTML, CSS, JavaScript, Tailwind CSS
- **3D Rendering:** Three.js
- **Physics Simulation:** Matter.js
- **Email Service:** EmailJS
- **CAPTCHA:** Google reCAPTCHA
- **Build Tool:** Vite
- **Fonts:** Manifold Extended CF, Product Sans, Made Infinity
- **CDNs:** CDNJS, Unpkg
- **Deployment:** (Add deployment details if applicable, e.g., Netlify, Vercel)

## Installation
To run the project locally, follow these steps:

### Clone the repository:
```bash
git clone https://github.com/aaarnv/3d-portfolio.git
cd 3d-portfolio
```

### Install dependencies:
```bash
npm install
```

### Set up environment variables:
Create a `.env` file in the root directory and add your EmailJS credentials:
```env
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
```

### Run the development server:
```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173` (or the port specified by Vite).

## Project Structure
```
3d-portfolio/
├── public/
│   ├── aarnavhead.glb          # 3D head model
│   ├── coding.mp4              # Video texture for head model
│   ├── projects/               # Project images
│   └── currents.png            # Album cover image
├── src/
│   ├── main.js                 # Main JavaScript entry point
│   ├── skillsPhysics.js        # Physics simulation for skills section
│   ├── projectsGallery.js      # Projects gallery logic
│   ├── contactForm.js          # Contact form logic
│   ├── cameraController.js     # Camera movement and transitions
│   ├── laptopController.js     # Laptop model animations
│   ├── InteractiveModelViewers.js # Head and laptop model viewers
│   ├── style.css               # Custom CSS styles
│   └── splash.css              # Splash screen styles
├── index.html                  # Main HTML file
├── .env                        # Environment variables (not tracked)
├── package.json                # NPM dependencies and scripts
└── README.md                   # This file
```

## Usage
- **Navigate Sections:** Use the mouse wheel, arrow keys, or scroll to move between sections (Home, Skills, Projects, About, Contact).
- **Interact with Skills:** Click and drag skill bricks in the Skills section to interact with the physics simulation. A hidden button appears after the pyramid settles, leading to the Projects section.
- **View Projects:** Use the left/right arrows or mouse wheel to navigate the projects gallery. Click "Learn More" to visit the project's GitHub page.
- **Toggle Theme:** Use the theme toggle in the About section to switch between Education and Experience content.
- **Contact Form:** Fill out the form with your name, email, and message, and complete the reCAPTCHA to send a message.
- **Interact with Models:** Click the head model to toggle cursor-following behavior. The laptop model animates based on the theme.

## Deployment
To deploy the project, you can use platforms like Netlify, Vercel, or GitHub Pages. Ensure the following:

1. Set up the `.env` variables in the deployment platform's environment settings.
2. Build the project:
```bash
npm run build
```
3. Deploy the `dist/` folder to your hosting provider.

## Known Issues
- **Small Screens:** The portfolio is optimized for screens 1200px and wider. Smaller screens display a warning to encourage viewing on a larger device.
- **Model Loading:** The 3D head model (`aarnavhead.glb`) may take a moment to load, depending on network speed.
- **Video Texture:** The coding video texture may fail to load in some browsers if autoplay is blocked. A fallback material is applied in such cases.

## Future Improvements
- Add mobile/tablet support with a simplified layout.
- Optimize 3D model loading with progressive loading or lower-poly models.
- Add more interactive elements, such as hover effects for project cards.
- Implement a backend to store contact form submissions.
- Add unit tests for critical components (e.g., contact form validation).

## Contributing
Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a feature branch:
```bash
git checkout -b feature/your-feature
```
3. Commit your changes:
```bash
git commit -m 'Add your feature'
```
4. Push to the branch:
```bash
git push origin feature/your-feature
```
5. Open a pull request.

Please ensure your code follows the project's coding style and includes appropriate documentation.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Contact
For questions or feedback, please reach out:
- **Email:** aarnavsheth19@gmail.com
- **GitHub:** [aaarnv](https://github.com/aaarnv)
- **LinkedIn:** [Aarnav Sheth](https://linkedin.com/in/aarnavsheth)

Thank you for exploring my portfolio! 🚀

