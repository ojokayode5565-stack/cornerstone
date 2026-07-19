/* ==========================================================================
   CHRIST THE CORNERSTONE MODEL COLLEGE — MAIN JAVASCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
  
  // Initialize Scroll shadow for Navbar
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', function () {
    if (nav) {
      nav.classList.toggle('scrolled', window.scrollY > 10);
    }
  }, { passive: true });

  /* ==========================================================================
     MEGA MENU (DESKTOP)
     ========================================================================== */
  const megaItems = document.querySelectorAll('.mega-item.has-mega');
  const CLOSE_DELAY = 350; // Grace period before panel hides
  const timers = new WeakMap();

  function cancelClose(item) {
    if (timers.has(item)) {
      clearTimeout(timers.get(item));
      timers.delete(item);
    }
  }

  function scheduleClose(item) {
    cancelClose(item);
    timers.set(item, setTimeout(function () {
      item.classList.remove('open');
      const caret = item.querySelector('.mega-caret');
      if (caret) caret.setAttribute('aria-expanded', 'false');
    }, CLOSE_DELAY));
  }

  function openItem(item) {
    cancelClose(item);
    // Close other open panels
    megaItems.forEach(function (other) {
      if (other !== item) {
        cancelClose(other);
        other.classList.remove('open');
        const oc = other.querySelector('.mega-caret');
        if (oc) oc.setAttribute('aria-expanded', 'false');
      }
    });
    item.classList.add('open');
    const caret = item.querySelector('.mega-caret');
    if (caret) caret.setAttribute('aria-expanded', 'true');
  }

  megaItems.forEach(function (item) {
    const trigger = item.querySelector('.mega-trigger');
    const caret = item.querySelector('.mega-caret');
    const panel = item.querySelector('.mega-panel');

    if (caret) {
      caret.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = item.classList.contains('open');
        if (isOpen) {
          cancelClose(item);
          item.classList.remove('open');
          caret.setAttribute('aria-expanded', 'false');
        } else {
          openItem(item);
        }
      });
    }

    if (trigger) {
      trigger.addEventListener('click', function (e) {
        e.stopPropagation();
      });
    }

    // Hover triggers
    item.addEventListener('mouseenter', function () { openItem(item); });
    item.addEventListener('mouseleave', function () { scheduleClose(item); });
    
    if (panel) {
      panel.addEventListener('mouseenter', function () { cancelClose(item); });
      panel.addEventListener('mouseleave', function () { scheduleClose(item); });
    }
  });

  // Close all open menus on outside click or Escape key
  document.addEventListener('click', function () {
    megaItems.forEach(function (item) {
      item.classList.remove('open');
      const c = item.querySelector('.mega-caret');
      if (c) c.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      megaItems.forEach(function (item) {
        item.classList.remove('open');
        const c = item.querySelector('.mega-caret');
        if (c) c.setAttribute('aria-expanded', 'false');
      });
    }
  });


  /* ==========================================================================
     MOBILE NAVIGATION
     ========================================================================== */
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  const mobileClose = document.getElementById('mobileClose');
  const mobileBackdrop = document.getElementById('mobileBackdrop');

  function openMobileNav() {
    if (mobileNav && mobileBackdrop && hamburger) {
      mobileNav.classList.add('open');
      mobileBackdrop.classList.add('open');
      hamburger.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      mobileNav.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeMobileNav() {
    if (mobileNav && mobileBackdrop && hamburger) {
      mobileNav.classList.remove('open');
      mobileBackdrop.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileNav.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  if (hamburger) hamburger.addEventListener('click', openMobileNav);
  if (mobileClose) mobileClose.addEventListener('click', closeMobileNav);
  if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeMobileNav);

  // Close mobile nav on resize
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 1025) {
      closeMobileNav();
    }
  });


  /* ==========================================================================
     HERO SLIDER
     ========================================================================== */
  const slides = document.querySelectorAll('.lsh-slide');
  const progFills = document.querySelectorAll('.lsh-prog-fill');
  const progItems = document.querySelectorAll('.lsh-prog-item');
  const counterNum = document.getElementById('lshCnum');
  const nextBtn = document.getElementById('lshNext');
  const prevBtn = document.getElementById('lshPrev');
  
  let currentSlide = 0;
  let slideInterval;
  let slideDuration = 6000; // 6 seconds per slide
  let startTimestamp;
  let progressAnimationId;

  function updateSlider(index) {
    if (slides.length === 0) return;
    
    // Deactivate current slide
    slides[currentSlide].classList.remove('active');
    progItems[currentSlide].classList.remove('active');
    progFills[currentSlide].style.width = '0%';
    
    // Activate next slide
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    progItems[currentSlide].classList.add('active');
    
    // Update text counter
    if (counterNum) {
      counterNum.textContent = String(currentSlide + 1).padStart(2, '0');
    }

    // Trigger video playback if applicable
    const video = slides[currentSlide].querySelector('video');
    if (video) {
      video.currentTime = 0;
      video.play().catch(e => console.log('Auto-play blocked by browser.'));
    }
    
    startProgressAnim();
  }

  function startProgressAnim() {
    cancelAnimationFrame(progressAnimationId);
    startTimestamp = performance.now();
    
    function animate(now) {
      const elapsed = now - startTimestamp;
      const progress = Math.min((elapsed / slideDuration) * 100, 100);
      
      if (progFills[currentSlide]) {
        progFills[currentSlide].style.width = `${progress}%`;
      }
      
      if (elapsed < slideDuration) {
        progressAnimationId = requestAnimationFrame(animate);
      } else {
        updateSlider(currentSlide + 1);
      }
    }
    progressAnimationId = requestAnimationFrame(animate);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      updateSlider(currentSlide + 1);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      updateSlider(currentSlide - 1);
    });
  }

  progItems.forEach(function (item) {
    item.addEventListener('click', function () {
      const targetIndex = parseInt(item.getAttribute('data-i'), 10);
      updateSlider(targetIndex);
    });
  });

  // Start the slider on homepage
  if (slides.length > 0) {
    slides[0].classList.add('active');
    startProgressAnim();
  }


  /* ==========================================================================
     METRICS COUNTER ANIMATION
     ========================================================================== */
  const metrics = document.querySelectorAll('.metric-num');
  
  function animateCounter(element) {
    const targetString = element.getAttribute('data-target');
    // Extract numerical value
    const targetValue = parseInt(targetString.replace(/[^0-9]/g, ''), 10);
    const suffix = targetString.replace(/[0-9]/g, '');
    let startValue = 0;
    const duration = 2000; // 2 seconds
    const startTime = performance.now();

    function updateCounter(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(progress * targetValue);
      
      if (isNaN(targetValue)) {
        element.textContent = targetString; // fallback
      } else {
        element.textContent = current + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = targetString;
      }
    }
    requestAnimationFrame(updateCounter);
  }


  /* ==========================================================================
     SCROLL INTERSECTION OBSERVER
     ========================================================================== */
  const fadeElements = document.querySelectorAll('.fade-up');
  
  const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
  };

  const scrollObserver = new IntersectionObserver(function (entries, observer) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        
        // If it is a metric strip element, animate counters
        if (entry.target.classList.contains('metrics-grid')) {
          metrics.forEach(metric => {
            if (!metric.classList.contains('counted')) {
              metric.classList.add('counted');
              animateCounter(metric);
            }
          });
        }
        
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  fadeElements.forEach(element => {
    scrollObserver.observe(element);
  });

  // Also observe metrics grid directly for immediate trigger
  const metricsGrid = document.querySelector('.metrics-grid');
  if (metricsGrid) {
    scrollObserver.observe(metricsGrid);
  }

});

/* ==========================================================================
   MOBILE SUB-MENU TOGGLE
   ========================================================================== */
function toggleMobSub(btn) {
  const sub = btn.nextElementSibling;
  const expanded = btn.getAttribute('aria-expanded') === 'true';
  const parentContainer = btn.closest('.mobile-nav');

  if (parentContainer) {
    // Collapse other submenus
    parentContainer.querySelectorAll('.mob-sub.open').forEach(function (el) {
      if (el !== sub) {
        el.classList.remove('open');
        const prevBtn = el.previousElementSibling;
        if (prevBtn) prevBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  if (sub) {
    sub.classList.toggle('open', !expanded);
    btn.setAttribute('aria-expanded', String(!expanded));
  }
}
