/**
 * CombinedTution - Modern Single Page Application (SPA) Router
 * Provides seamless client-side routing, instant view switching,
 * smooth crossfade animations, browser history management (pushState/popstate),
 * and dynamic component lifecycle re-initialization.
 */

(function () {
  'use strict';

  const ROUTE_MAP = {
    '/': 'view-home',
    '/home': 'view-home',
    '/index': 'view-home',
    '/index.html': 'view-home',
    '/jobs': 'view-jobs',
    '/jobs.html': 'view-jobs',
    '/why-combined': 'view-why-combined',
    '/why-combined.html': 'view-why-combined',
    '/how-it-works': 'view-how-it-works',
    '/how-it-works.html': 'view-how-it-works',
    '/become-a-tutor': 'view-become-a-tutor',
    '/become-a-tutor.html': 'view-become-a-tutor',
    '/contact-coordinator': 'view-contact-coordinator',
    '/contact-coordinator.html': 'view-contact-coordinator',
    '/tutor-dashboard': 'view-tutor-dashboard',
    '/tutor-dashboard.html': 'view-tutor-dashboard',
    '/admin-dashboard': 'view-admin-dashboard',
    '/admin-dashboard.html': 'view-admin-dashboard'
  };

  const VIEW_TITLES = {
    'view-home': "CombinedTution - Find Verified Private Tutors & Tuition Jobs in Bangladesh",
    'view-jobs': "CombinedTution - Live Tuition Job Board & Openings in Dhaka",
    'view-why-combined': "Why CombinedTution - Bangladesh's Most Trusted Learning Network",
    'view-how-it-works': "How It Works - Simple, Safe & Transparent Process | CombinedTution",
    'view-become-a-tutor': "Become a Verified Tutor - Earn with Flexibility | CombinedTution",
    'view-contact-coordinator': "Contact Tuition Coordinator - Academic Support Desk | CombinedTution",
    'view-tutor-dashboard': "Tutor Portal - Assigned & Routed Applications | CombinedTution",
    'view-admin-dashboard': "Academic Coordinator Desk - Applications Master Hub | CombinedTution"
  };

  const SECTION_LOADING_INFO = {
    'view-home': {
      title: "Loading Home...",
      sub: "Preparing verified mentors and tuition spotlights..."
    },
    'view-jobs': {
      title: "Loading Tuition Job Board...",
      sub: "Filtering latest live tuition postings in Dhaka..."
    },
    'view-why-combined': {
      title: "Loading Why Combined...",
      sub: "Fetching safety standards & university mentor criteria..."
    },
    'view-how-it-works': {
      title: "Loading How It Works...",
      sub: "Setting up guardian workflows and trial demo guide..."
    },
    'view-become-a-tutor': {
      title: "Loading Tutor Portal...",
      sub: "Configuring educator application & income calculator..."
    },
    'view-contact-coordinator': {
      title: "Loading Coordinator Desk...",
      sub: "Connecting to direct academic coordinator hotlines..."
    },
    'view-tutor-dashboard': {
      title: "Opening Tutor Portal...",
      sub: "Retrieving your auto-routed tuition requests and alerts..."
    },
    'view-admin-dashboard': {
      title: "Opening Coordinator Desk...",
      sub: "Synchronizing system applications, routes & live monitors..."
    }
  };

  let currentViewId = 'view-home';
  let isNavigating = false;

  // Dynamic Section Loading Overlay Helpers
  function showSectionLoader(viewId) {
    const loader = document.getElementById('spaSectionLoader');
    if (!loader) return;
    const titleEl = document.getElementById('spaLoaderTitle');
    const subEl = document.getElementById('spaLoaderSub');

    const info = SECTION_LOADING_INFO[viewId] || {
      title: "Loading Section...",
      sub: "Syncing verified curriculum details..."
    };

    if (titleEl) titleEl.textContent = info.title;
    if (subEl) subEl.textContent = info.sub;

    loader.classList.add('active');
  }

  function hideSectionLoader() {
    const loader = document.getElementById('spaSectionLoader');
    if (!loader) return;
    loader.classList.remove('active');
  }

  // Ensure Top Micro-Progress Bar exists
  function ensureTopLoader() {
    let loader = document.getElementById('spaTopLoader');
    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'spaTopLoader';
      loader.className = 'spa-top-loader';
      document.body.appendChild(loader);
    }
    return loader;
  }

  function startLoader() {
    const loader = ensureTopLoader();
    loader.classList.remove('finished');
    loader.classList.add('loading');
  }

  function finishLoader() {
    const loader = ensureTopLoader();
    loader.classList.remove('loading');
    loader.classList.add('finished');
    setTimeout(() => {
      loader.classList.remove('finished');
    }, 400);
  }

  // Normalize path into matching route key
  function normalizePath(path) {
    if (!path) return '/';
    let clean = path.split('?')[0].split('#')[0];
    if (clean.length > 1 && clean.endsWith('/')) {
      clean = clean.slice(0, -1);
    }
    return clean || '/';
  }

  // Update active state on Navigation Bars
  function updateNavHighlight(targetRoute) {
    const clean = normalizePath(targetRoute);

    // Desktop navbar links
    document.querySelectorAll('.navbar .nav-menu .nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      const linkNorm = normalizePath(href);
      const isMatch = (linkNorm === clean) ||
        (clean === '/' && (linkNorm === 'index.html' || linkNorm === '/')) ||
        (clean.includes('jobs') && linkNorm.includes('jobs')) ||
        (clean.includes('why-combined') && linkNorm.includes('why-combined')) ||
        (clean.includes('how-it-works') && linkNorm.includes('how-it-works')) ||
        (clean.includes('become-a-tutor') && linkNorm.includes('become-a-tutor'));

      if (isMatch) {
        link.classList.add('active-nav');
      } else {
        link.classList.remove('active-nav');
      }
    });

    // Mobile drawer links
    document.querySelectorAll('.mobile-drawer .mobile-nav-item').forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      const linkNorm = normalizePath(href);
      const isMatch = (linkNorm === clean) ||
        (clean === '/' && (linkNorm === 'index.html' || linkNorm === '/')) ||
        (clean.includes('jobs') && linkNorm.includes('jobs')) ||
        (clean.includes('why-combined') && linkNorm.includes('why-combined')) ||
        (clean.includes('how-it-works') && linkNorm.includes('how-it-works')) ||
        (clean.includes('become-a-tutor') && linkNorm.includes('become-a-tutor'));

      if (isMatch) {
        link.classList.add('highlight');
      } else {
        link.classList.remove('highlight');
      }
    });
  }

  // Switch SPA Views with smooth transition and dynamic section loader
  function switchView(targetViewId, targetPath, isInitialBoot = false) {
    const currentView = document.getElementById(currentViewId);
    const targetView = document.getElementById(targetViewId);

    if (!targetView) {
      console.warn('Target SPA view not found in DOM:', targetViewId);
      return;
    }

    if (currentViewId === targetViewId && currentView && currentView.classList.contains('active')) {
      // Already on this view; scroll to top or target anchor
      window.scrollTo({ top: 0, behavior: 'smooth' });
      finishLoader();
      return;
    }

    startLoader();
    isNavigating = true;

    if (!isInitialBoot) {
      showSectionLoader(targetViewId);
    }

    // Smooth exit transition for current view
    if (currentView) {
      currentView.classList.add('spa-view-leaving');
    }

    const transitionDelay = isInitialBoot ? 0 : 300;

    setTimeout(() => {
      // Hide all other views
      document.querySelectorAll('.spa-view').forEach(v => {
        v.classList.remove('active', 'spa-view-leaving');
      });

      // Reveal target view with entry animation
      targetView.classList.add('active');
      currentViewId = targetViewId;

      // Update Document Title
      if (VIEW_TITLES[targetViewId]) {
        document.title = VIEW_TITLES[targetViewId];
      }

      // Update navigation highlighting
      updateNavHighlight(targetPath);

      // Close mobile drawer if open
      const mobileDrawer = document.getElementById('mobileDrawer');
      const menuOpenIcon = document.getElementById('menuOpenIcon');
      const menuCloseIcon = document.getElementById('menuCloseIcon');
      if (mobileDrawer && mobileDrawer.classList.contains('open')) {
        mobileDrawer.classList.remove('open');
        if (menuOpenIcon) menuOpenIcon.classList.remove('hidden');
        if (menuCloseIcon) menuCloseIcon.classList.add('hidden');
      }

      // Scroll smoothly to top
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Lifecycle hooks: re-initialize dynamic view components
      initViewComponents(targetViewId);

      finishLoader();
      hideSectionLoader();
      isNavigating = false;
    }, transitionDelay);
  }

  // Lifecycle component initializers
  function initViewComponents(viewId) {
    // Re-create Lucide icons for new DOM elements
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }

    // View-specific logic hooks
    if (viewId === 'view-home') {
      if (typeof window.setupCounterAnimations === 'function') {
        window.setupCounterAnimations();
      }
    } else if (viewId === 'view-jobs') {
      if (typeof window.setupJobBoard === 'function') {
        window.setupJobBoard();
      }
      if (typeof window.setupJobDetailModal === 'function') {
        window.setupJobDetailModal();
      }
    } else if (viewId === 'view-how-it-works') {
      if (typeof window.setupHowItWorksPage === 'function') {
        window.setupHowItWorksPage();
      }
    } else if (viewId === 'view-become-a-tutor') {
      if (typeof window.setupBecomeTutorPage === 'function') {
        window.setupBecomeTutorPage();
      }
    } else if (viewId === 'view-tutor-dashboard') {
      if (typeof window.loadTutorDashboard === 'function') {
        window.loadTutorDashboard();
      }
    } else if (viewId === 'view-admin-dashboard') {
      if (typeof window.loadAdminDashboard === 'function') {
        window.loadAdminDashboard();
      }
    }

    // Broadcast SPA navigation event for any other modules
    window.dispatchEvent(new CustomEvent('spa:navigated', {
      detail: { viewId }
    }));
  }

  // Public navigateTo function
  window.spaNavigate = function (targetUrl, pushState = true) {
    if (!targetUrl) return;

    // Handle hash anchors on current page
    if (targetUrl.startsWith('#')) {
      const el = document.querySelector(targetUrl);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // Parse path and hash
    const url = new URL(targetUrl, window.location.origin);
    const path = url.pathname;
    const cleanPath = normalizePath(path);

    // If target is external origin, allow regular navigation
    if (url.origin !== window.location.origin) {
      window.location.href = targetUrl;
      return;
    }

    // Check if path is in route map
    let viewId = ROUTE_MAP[cleanPath];

    // Check relative or direct file matching
    if (!viewId) {
      const filename = cleanPath.split('/').pop();
      if (filename && ROUTE_MAP['/' + filename]) {
        viewId = ROUTE_MAP['/' + filename];
      }
    }

    // If route matches an SPA view, transition smoothly without reload
    if (viewId) {
      if (pushState && window.location.pathname !== cleanPath) {
        history.pushState({ viewId, path: cleanPath }, '', cleanPath + (url.search || '') + (url.hash || ''));
      }
      switchView(viewId, cleanPath);

      // Handle hash anchor if provided
      if (url.hash) {
        setTimeout(() => {
          const anchorEl = document.querySelector(url.hash);
          if (anchorEl) anchorEl.scrollIntoView({ behavior: 'smooth' });
        }, 250);
      }
    } else {
      // Fallback: standard navigation
      window.location.href = targetUrl;
    }
  };

  // Intercept all internal link clicks
  function setupLinkInterception() {
    document.addEventListener('click', (e) => {
      // Find closest anchor tag
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      // Ignore download links, external protocols, and javascript:
      if (
        link.hasAttribute('download') ||
        link.getAttribute('target') === '_blank' ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:') ||
        href.includes('wa.me') ||
        href.includes('facebook.com') ||
        href.includes('x.com')
      ) {
        return;
      }

      // Check if it's an internal link
      const url = new URL(href, window.location.origin);
      if (url.origin === window.location.origin) {
        const cleanPath = normalizePath(url.pathname);
        const filename = cleanPath.split('/').pop();

        if (ROUTE_MAP[cleanPath] || ROUTE_MAP['/' + filename]) {
          e.preventDefault();
          window.spaNavigate(href, true);
        }
      }
    });
  }

  // Handle Browser Back and Forward Buttons (popstate)
  window.addEventListener('popstate', (e) => {
    const cleanPath = normalizePath(window.location.pathname);
    const filename = cleanPath.split('/').pop();
    const viewId = ROUTE_MAP[cleanPath] || ROUTE_MAP['/' + filename] || 'view-home';
    switchView(viewId, cleanPath);
  });

  // Initial Boot
  function initRouter() {
    ensureTopLoader();
    setupLinkInterception();

    // Determine initial view from URL
    const cleanPath = normalizePath(window.location.pathname);
    const filename = cleanPath.split('/').pop();
    const initialViewId = ROUTE_MAP[cleanPath] || ROUTE_MAP['/' + filename] || 'view-home';

    const targetView = document.getElementById(initialViewId);
    if (targetView) {
      document.querySelectorAll('.spa-view').forEach(v => v.classList.remove('active'));
      targetView.classList.add('active');
      currentViewId = initialViewId;
      updateNavHighlight(cleanPath);
      if (VIEW_TITLES[initialViewId]) {
        document.title = VIEW_TITLES[initialViewId];
      }
      initViewComponents(initialViewId);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRouter);
  } else {
    initRouter();
  }
})();
