/* =================================================================
   ADQ Solutions — Site Scripts
   Mobile nav, form validation, scroll-reveal, back-to-top, footer year
   ================================================================= */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initNavbarScrollShadow();
    initContactForm();
    initScrollReveal();
    initBackToTop();
    initActiveNavHighlight();
    initFooterYear();
  });

  /* ---------------------------------------------------------------
     Navbar: add elevated shadow once the page is scrolled
  --------------------------------------------------------------- */
  function initNavbarScrollShadow() {
    var navbar = document.querySelector('.navbar');
    if (!navbar) return;

    var updateShadow = function () {
      navbar.classList.toggle('is-scrolled', window.scrollY > 8);
    };

    updateShadow();
    window.addEventListener('scroll', updateShadow, { passive: true });
  }

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
     Submissions are sent to a Google Apps Script Web App, which
     writes each inquiry as a new row in a connected Google Sheet.
  --------------------------------------------------------------- */
  var FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxUWf4CGuAys2kRc2xgfUQwrmqRRfLp9Z3fzD8Tg1jHuMpLC5efVTU_BwzSq82BfHcl/exec';

  function initContactForm() {
    var form = document.getElementById('leadForm');
    var status = document.getElementById('formStatus');
    if (!form || !status) return;

    var fields = {
      fullName: { el: document.getElementById('fullName'), label: 'full name' },
      companyName: { el: document.getElementById('companyName'), label: 'company name' },
      phoneNumber: { el: document.getElementById('phoneNumber'), label: 'contact number' },
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

      // Honeypot check: if this hidden field is filled, silently drop (bot).
      var honeypot = document.getElementById('website');
      if (honeypot && honeypot.value.trim() !== '') {
        showStatus(status, 'success', 'Thank you! Your inquiry has been received. We will contact you shortly.');
        form.reset();
        return;
      }

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
      } else if (key === 'phoneNumber' && !isValidPhone(value)) {
        message = 'Please enter a valid contact number.';
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

    function isValidPhone(value) {
      // Accepts digits, spaces, +, -, () — requires at least 7 digits total.
      var digitCount = (value.match(/\d/g) || []).length;
      return /^[0-9+\-()\s]+$/.test(value) && digitCount >= 7;
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
      // Your Apps Script's doPost reads JSON.parse(e.postData.contents),
      // so we must send a raw JSON body — NOT FormData/multipart.
      // Content-Type: text/plain keeps this a CORS "simple request"
      // (Apps Script doesn't handle preflight OPTIONS requests).
      var payload = {
        fullName: form.fullName.value.trim(),
        companyName: form.companyName.value.trim(),
        phoneNumber: form.phoneNumber.value.trim(),
        emailAddr: form.emailAddr.value.trim(),
        serviceInterest: form.serviceInterest.value,
        message: form.message.value.trim(),
        source: 'adqsolutions.in website',
        timestamp: new Date().toISOString()
      };

      // Google Apps Script Web Apps don't return CORS headers, so the
      // response is opaque in the browser. We send with mode: 'no-cors'
      // and treat a resolved fetch (no network error) as success — this
      // is the standard pattern for posting to Apps Script from a
      // static site. The data still lands correctly in the Google Sheet.
      fetch(FORM_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      })
        .then(function () {
          finish(true, 'Thank you! Your inquiry has been received. We will contact you shortly.');
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
