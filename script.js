document.addEventListener('DOMContentLoaded', () => {
  // --- Nav Bar Dynamic Scroll Blur ---
  const nav = document.querySelector('nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.style.background = 'rgba(8, 4, 27, 0.85)';
      nav.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
    } else {
      nav.style.background = 'rgba(15, 10, 42, 0.7)';
      nav.style.boxShadow = 'none';
    }
  });

  // --- Interactive FAQ Accordion ---
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-q');
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all items
      faqItems.forEach(i => i.classList.remove('active'));
      
      // Toggle current
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // --- Dynamic Screenshot Carousel Slider ---
  const track = document.querySelector('.carousel-track');
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');
  const slides = Array.from(document.querySelectorAll('.carousel-slide'));
  
  let currentIndex = 0;
  
  function getSlidesPerView() {
    if (window.innerWidth <= 600) return 1;
    if (window.innerWidth <= 900) return 2;
    return 3;
  }

  function updateCarousel() {
    const slidesPerView = getSlidesPerView();
    const slideWidth = slides[0].getBoundingClientRect().width;
    const gap = 32; // Matches gap (2rem) in CSS
    
    // Max index we can scroll to
    const maxIndex = slides.length - slidesPerView;
    if (currentIndex > maxIndex) currentIndex = maxIndex;
    if (currentIndex < 0) currentIndex = 0;
    
    // Scroll transition
    const offset = currentIndex * (slideWidth + gap);
    track.style.transform = `translateX(-${offset}px)`;
    
    // Set active states
    slides.forEach((slide, index) => {
      slide.classList.remove('active');
      if (index >= currentIndex && index < currentIndex + slidesPerView) {
        // Highlight the middle or first slide in view
        if (slidesPerView === 3 && index === currentIndex + 1) {
          slide.classList.add('active');
        } else if (slidesPerView < 3 && index === currentIndex) {
          slide.classList.add('active');
        }
      }
    });
  }

  nextBtn.addEventListener('click', () => {
    const maxIndex = slides.length - getSlidesPerView();
    if (currentIndex < maxIndex) {
      currentIndex++;
      updateCarousel();
    }
  });

  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  });

  window.addEventListener('resize', updateCarousel);
  
  // Set initial position
  setTimeout(updateCarousel, 300);

  // --- AJAX Release Notification Subscription ---
  const subscribeForm = document.getElementById('subscribe-form');
  const subEmail = document.getElementById('sub-email');
  const subHoneypot = document.getElementById('sub-honeypot');
  const subConsent = document.getElementById('sub-consent');
  const subSubmit = document.getElementById('sub-submit');
  const subMessage = document.getElementById('subscribe-message');

  if (subscribeForm) {
    subscribeForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Clear previous messages
      subMessage.style.display = 'none';
      subMessage.style.color = '';
      subMessage.textContent = '';

      // Disable button
      subSubmit.disabled = true;
      subSubmit.textContent = 'Registering...';

      const payload = {
        email: subEmail.value,
        honeypot: subHoneypot.value,
        consent: subConsent.checked
      };

      fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      .then(response => response.json().then(data => ({ status: response.status, body: data })))
      .then(({ status, body }) => {
        subMessage.style.display = 'block';
        if (status === 200 && body.success) {
          subMessage.style.color = '#06D6A0'; // Success green
          subMessage.textContent = body.message || 'Success! You have been registered.';
          subscribeForm.reset();
        } else {
          subMessage.style.color = '#EF476F'; // Error coral/red
          subMessage.textContent = body.error || 'An operational registration error occurred.';
        }
      })
      .catch(err => {
        console.error('Subscription error:', err);
        subMessage.style.display = 'block';
        subMessage.style.color = '#EF476F';
        subMessage.textContent = 'Connection failed. Please check your network or try again.';
      })
      .finally(() => {
        subSubmit.disabled = false;
        subSubmit.textContent = 'Notify Me';
      });
    });
  }

  // --- Executive Fatigue Diagnostic Quiz State Controller ---
  const quizForm = document.getElementById('diagnostic-quiz-form');
  if (quizForm) {
    let currentStep = 1;
    const totalSteps = 5;
    const prevBtn = document.getElementById('quiz-prev-btn');
    const nextBtn = document.getElementById('quiz-next-btn');
    const progressBar = document.getElementById('quiz-progress');
    const loadingOverlay = document.getElementById('quiz-loading');
    const resultsContainer = document.getElementById('quiz-results');
    const errorBox = document.getElementById('quiz-error');

    function updateStepVisibility() {
      // Toggle steps
      document.querySelectorAll('.quiz-step').forEach(step => {
        const stepNum = parseInt(step.getAttribute('data-step'));
        step.style.display = stepNum === currentStep ? 'block' : 'none';
      });

      // Update progress bar
      const progressPercent = (currentStep / totalSteps) * 100;
      progressBar.style.width = `${progressPercent}%`;

      // Toggle Prev button
      prevBtn.style.display = currentStep > 1 ? 'block' : 'none';

      // Toggle Next/Submit text
      if (currentStep === totalSteps) {
        nextBtn.textContent = 'Submit Diagnostic';
        nextBtn.style.background = 'linear-gradient(135deg, #00B0FF, #00E5FF)';
        nextBtn.style.boxShadow = '0 4px 15px rgba(0, 176, 255, 0.4)';
      } else {
        nextBtn.textContent = 'Next Step';
        nextBtn.style.background = 'linear-gradient(135deg, var(--violet), var(--violet-light))';
        nextBtn.style.boxShadow = '0 4px 15px rgba(123, 47, 190, 0.3)';
      }

      // Smooth scroll back to quiz header for mobile usability
      if (currentStep > 1) {
        document.getElementById('quiz-container').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    // Make quiz options clickable on their whole card
    document.querySelectorAll('.quiz-option').forEach(option => {
      option.addEventListener('click', function(e) {
        // Highlight active radio selection
        const radio = this.querySelector('input[type="radio"]');
        if (radio) {
          radio.checked = true;
          // Apply active styling
          const parent = this.parentElement;
          if (parent) {
            parent.querySelectorAll('.quiz-option').forEach(opt => {
              opt.style.border = '1px solid rgba(255,255,255,0.08)';
              opt.style.background = 'rgba(8,4,27,0.4)';
            });
          }
          this.style.border = '1px solid #00E5FF';
          this.style.background = 'rgba(0,229,255,0.05)';
        }
      });
    });

    nextBtn.addEventListener('click', () => {
      // 1. Validation for Radio inputs in active step
      if (currentStep < totalSteps) {
        const activeRadio = quizForm.querySelector(`.quiz-step[data-step="${currentStep}"] input[type="radio"]:checked`);
        if (!activeRadio) {
          errorBox.style.display = 'block';
          errorBox.textContent = 'Please choose an option to advance to the next step.';
          return;
        }
        errorBox.style.display = 'none';
        currentStep++;
        updateStepVisibility();
      } else {
        // 2. Step 5 Submission Checks
        const emailInput = document.getElementById('quiz-email');
        const consentCheckbox = document.getElementById('quiz-consent');
        const honeypot = document.getElementById('quiz-honeypot');

        if (!emailInput.value || !emailInput.checkValidity()) {
          errorBox.style.display = 'block';
          errorBox.textContent = 'Please enter a valid email address to lock in your score.';
          return;
        }
        if (!consentCheckbox.checked) {
          errorBox.style.display = 'block';
          errorBox.textContent = 'You must consent to the privacy policy to secure your metrics profile.';
          return;
        }

        errorBox.style.display = 'none';
        loadingOverlay.style.display = 'flex';

        // Gather payloads
        const getVal = (name) => {
          const el = quizForm.querySelector(`input[name="${name}"]:checked`);
          return el ? parseInt(el.value) : 1;
        };

        const payload = {
          q1: getVal('q1'),
          q2: getVal('q2'),
          q3: getVal('q3'),
          q4: getVal('q4'),
          q5: 1, // Default local privacy score
          email: emailInput.value,
          consent: consentCheckbox.checked,
          honeypot: honeypot.value
        };

        // Dispatch AJAX to secure rule processor
        fetch('/api/diagnostic-quiz', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => {
          loadingOverlay.style.display = 'none';
          if (data.success) {
            // Hide the active form steps and header texts
            quizForm.style.display = 'none';
            progressBar.parentElement.style.display = 'none';
            
            // Populate and reveal results
            document.getElementById('res-primary-coach').textContent = data.primaryCoach;
            document.getElementById('res-primary-desc').textContent = data.primaryDescription;
            document.getElementById('res-secondary-coach').textContent = data.secondaryCoach;
            document.getElementById('res-secondary-desc').textContent = data.secondaryDescription;
            document.getElementById('res-fatigue-tier').textContent = data.fatigueTier;
            document.getElementById('res-custom-tool').textContent = data.customTool;
            document.getElementById('res-shame-trigger').textContent = data.shameTrigger;
            document.getElementById('res-streak-strategy').textContent = data.streakStrategy;
            document.getElementById('res-diagnostic-id').textContent = data.diagnosticId;
            
            resultsContainer.style.display = 'flex';
          } else {
            errorBox.style.display = 'block';
            errorBox.textContent = data.error || 'A validation processing error occurred.';
          }
        })
        .catch(err => {
          loadingOverlay.style.display = 'none';
          errorBox.style.display = 'block';
          errorBox.textContent = 'Connection timeout. Please check your network or try again.';
          console.error('Quiz submit error:', err);
        });
      }
    });

    prevBtn.addEventListener('click', () => {
      if (currentStep > 1) {
        errorBox.style.display = 'none';
        currentStep--;
        updateStepVisibility();
      }
    });
  }

  // --- Page Visit Counter Loader ---
  const visitCountEl = document.getElementById('visit-count');
  if (visitCountEl) {
    fetch('/api/visit-counter')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.count) {
          // Format count with commas and pad to at least 6 digits
          const formatted = String(data.count).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          const padded = formatted.padStart(7, '0');
          visitCountEl.textContent = padded;
        } else {
          visitCountEl.textContent = '000,000';
        }
      })
      .catch(err => {
        console.error('Counter fetch error:', err);
        visitCountEl.textContent = '000,000';
      });
  }
});
