/* =================================================================
   ADQ Solutions — Site Scripts
   Mobile nav, form validation, scroll-reveal, back-to-top, footer year
   ================================================================= */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initContactForm();
    initScrollReveal();
    initBackToTop();
    initActiveNavHighlight();
    initFooterYear();
  });

  /* ---------------------------------------------------------------
     Mobile Navigation Toggle
  --------------------------------------------------------------- */
  function initMobileNav() {
    var menuToggle = document.getElementById('menuToggle');
    var navLinks = document.getElementById('navLinks');
    if (!menuToggle || !navLinks) return;

    menuToggle.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('active');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close mobile nav when a link is clicked
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close mobile nav on outside click
    document.addEventListener('click', function (e) {
      if (!navLinks.classList.contains('active')) return;
      var withinNav = navLinks.contains(e.target) || menuToggle.contains(e.target);
      if (!withinNav) {
        navLinks.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.focus();
      }
    });
  }

  /* ---------------------------------------------------------------
     Contact Form: client-side validation + submission handling
     NOTE: This demo submits nowhere by default. To go live, either:
       1) Point the <form> at a form backend (e.g. Formspree/Getform)
          and set FORM_ENDPOINT below, or
       2) Wire up your own server endpoint and replace submitForm().
  --------------------------------------------------------------- */
  var FORM_ENDPOINT = ''; // e.g. 'https://formspree.io/f/your-id'

  function initContactForm() {
    var form = document.getElementById('leadForm');
    var status = document.getElementById('formStatus');
    if (!form || !status) return;

    var fields = {
      fullName: { el: document.getElementById('fullName'), label: 'full name' },
      companyName: { el: document.getElementById('companyName'), label: 'company name' },
      emailAddr: { el: document.getElementById('emailAddr'), label: 'business email' }
    };

    Object.keys(fields).forEach(function (key) {
      var field = fields[key].el;
      if (!field) return;
      field.addEventListener('blur', function () {
        validateField(key, fields[key]);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var isValid = true;
      Object.keys(fields).forEach(function (key) {
        if (!validateField(key, fields[key])) isValid = false;
      });

      if (!isValid) {
        showStatus(status, 'error', 'Please correct the highlighted fields and try again.');
        var firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      submitForm(form, status);
    });

    function validateField(key, field) {
      var el = field.el;
      var errorEl = document.getElementById(key + 'Error');
      var value = el.value.trim();
      var message = '';

      if (!value) {
        message = 'Please enter your ' + field.label + '.';
      } else if (key === 'emailAddr' && !isValidEmail(value)) {
        message = 'Please enter a valid email address.';
      }

      if (message) {
        el.setAttribute('aria-invalid', 'true');
        if (errorEl) errorEl.textContent = message;
        return false;
      }

      el.removeAttribute('aria-invalid');
      if (errorEl) errorEl.textContent = '';
      return true;
    }

    function isValidEmail(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }
  }

  function submitForm(form, status) {
    var submitBtn = form.querySelector('button[type="submit"]');
    var originalLabel = submitBtn.textContent;
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;
    status.className = '';
    status.style.display = 'none';

    var finish = function (ok, message) {
      showStatus(status, ok ? 'success' : 'error', message);
      submitBtn.textContent = originalLabel;
      submitBtn.disabled = false;
      if (ok) form.reset();
    };

    if (FORM_ENDPOINT) {
      var formData = new FormData(form);
      fetch(FORM_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      })
        .then(function (res) {
          if (res.ok) {
            finish(true, 'Thank you! Your inquiry has been received. We will contact you shortly.');
          } else {
            finish(false, 'Something went wrong sending your message. Please email us directly at anik.debnath@hotmail.com.');
          }
        })
        .catch(function () {
          finish(false, 'Network error — please try again or email anik.debnath@hotmail.com directly.');
        });
    } else {
      // Demo mode: no backend connected yet.
      window.setTimeout(function () {
        finish(true, 'Thank you! Your inquiry has been received. We will contact you shortly.');
      }, 900);
    }
  }

  function showStatus(status, type, message) {
    status.textContent = message;
    status.className = 'status-' + type;
    status.style.display = 'block';
    status.setAttribute('role', type === 'error' ? 'alert' : 'status');
  }

  /* ---------------------------------------------------------------
     Scroll-reveal: fade/slide sections in as they enter the viewport
  --------------------------------------------------------------- */
  function initScrollReveal() {
    var targets = document.querySelectorAll('.reveal');
    if (!targets.length) return;

    if (!('IntersectionObserver' in window)) {
      targets.forEach(function (t) { t.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(function (t) { observer.observe(t); });
  }

  /* ---------------------------------------------------------------
     Back-to-top button
  --------------------------------------------------------------- */
  function initBackToTop() {
    var btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', function () {
      btn.classList.toggle('is-visible', window.scrollY > 500);
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------------------------------------------------------------
     Highlight the current section's nav link while scrolling
  --------------------------------------------------------------- */
  function initActiveNavHighlight() {
    var sections = document.querySelectorAll('main section[id]');
    var navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    if (!sections.length || !navLinks.length || !('IntersectionObserver' in window)) return;

    var linkMap = {};
    navLinks.forEach(function (link) {
      linkMap[link.getAttribute('href').replace('#', '')] = link;
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = linkMap[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach(function (l) { l.removeAttribute('aria-current'); });
          link.setAttribute('aria-current', 'page');
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px' });

    sections.forEach(function (s) { observer.observe(s); });
  }

  /* ---------------------------------------------------------------
     Footer copyright year (kept accurate automatically)
  --------------------------------------------------------------- */
  function initFooterYear() {
    var el = document.getElementById('currentYear');
    if (el) el.textContent = new Date().getFullYear();
  }
})();
