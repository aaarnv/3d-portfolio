// EmailJS Contact Form Implementation

// Create a new file named contactForm.js
function initContactForm() {
    // Initialize EmailJS with your user ID
    (function() {
      // Replace 'YOUR_USER_ID' with your actual EmailJS user ID
      emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
    })();
  
    const contactForm = document.querySelector('.contact-form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const submitButton = contactForm.querySelector('button[type="submit"]');
    
    // Create feedback element if it doesn't exist
    let feedbackContainer = contactForm.querySelector('.feedback-container');
    if (!feedbackContainer) {
      feedbackContainer = document.createElement('div');
      feedbackContainer.className = 'feedback-container mt-3 text-center hidden';
      contactForm.appendChild(feedbackContainer);
    }
    
    // Add event listener for form submission
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Validate form
      if (!validateForm()) {
        showFeedback('Please fill in all fields and provide a valid email address.', 'error');
        return;
      }
      
      // Disable button and show loading state
      submitButton.disabled = true;
      submitButton.classList.add('opacity-50', 'cursor-not-allowed');
      showFeedback('Sending message...', 'loading');
      
      // Prepare the template parameters
      const templateParams = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        message: messageInput.value.trim(),
        'g-recaptcha-response': grecaptcha.getResponse() 
      };
      
      try {
        const result = await emailjs.send(
            import.meta.env.VITE_EMAILJS_SERVICE_ID,
            import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
            templateParams,
            import.meta.env.VITE_EMAILJS_PUBLIC_KEY
          );
        
        console.log('Email sent:', result.text);
        
        // Show success message
        showFeedback('Message sent successfully! I\'ll get back to you soon.', 'success');
        
        // Reset form after successful submission
        contactForm.reset();
        grecaptcha.reset(); // Reset CAPTCHA
        
        // Reset form field classes
        nameInput.classList.remove('border-green-500', 'border-red-500');
        emailInput.classList.remove('border-green-500', 'border-red-500');
        messageInput.classList.remove('border-green-500', 'border-red-500');
        
        // Hide feedback after 5 seconds
        setTimeout(() => {
          feedbackContainer.classList.add('hidden');
        }, 5000);
        
      } catch (error) {
        console.error('Email sending failed:', error);
        showFeedback('Failed to send message. Please try again later.', 'error');
      } finally {
        // Re-enable button
        submitButton.disabled = false;
        submitButton.classList.remove('opacity-50', 'cursor-not-allowed');
      }
    });
    
    function validateForm() {
        const nameValue = nameInput.value.trim();
        const emailValue = emailInput.value.trim();
        const messageValue = messageInput.value.trim();
        
        // Check if fields are empty
        if (!nameValue || !emailValue || !messageValue) {
          return false;
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailValue)) {
          return false;
        }
        
        // Validate reCAPTCHA
        const recaptchaResponse = grecaptcha.getResponse();
        if (!recaptchaResponse) {
          showFeedback('Please complete the CAPTCHA verification.', 'error');
          return false;
        }
        
        return true;
      }
    
    // Show feedback message
    function showFeedback(message, type) {
      feedbackContainer.classList.remove('hidden', 'text-green-500', 'text-red-500', 'text-blue-500');
      feedbackContainer.textContent = message;
      
      switch (type) {
        case 'success':
          feedbackContainer.classList.add('text-green-500');
          break;
        case 'error':
          feedbackContainer.classList.add('text-red-500');
          break;
        case 'loading':
          feedbackContainer.classList.add('text-blue-500');
          break;
      }
    }
    
    // Add real-time input validation with feedback
    nameInput.addEventListener('blur', () => validateInputFeedback(nameInput, nameInput.value.trim() !== ''));
    emailInput.addEventListener('blur', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      validateInputFeedback(emailInput, emailRegex.test(emailInput.value.trim()));
    });
    messageInput.addEventListener('blur', () => validateInputFeedback(messageInput, messageInput.value.trim() !== ''));
    
    function validateInputFeedback(inputElement, isValid) {
      if (inputElement.value.trim() === '') {
        // If empty, remove all validation classes
        inputElement.classList.remove('border-red-500', 'border-green-500');
        return;
      }
      
      if (isValid) {
        inputElement.classList.remove('border-red-500');
        inputElement.classList.add('border-green-500');
      } else {
        inputElement.classList.remove('border-green-500');
        inputElement.classList.add('border-red-500');
      }
    }
  }
  
  // Export the function to use in main.js
  export { initContactForm };