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
