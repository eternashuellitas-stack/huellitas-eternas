(() => {
  'use strict';

  const body = document.body;
  const themeBtn = document.querySelector('[data-theme-toggle]');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const backTop = document.querySelector('[data-back-top]');
  const toast = document.querySelector('[data-toast]');

  // ---------------------------------------------------------
  // Tema claro/oscuro: persistente, seguro y por memorial.
  // ---------------------------------------------------------
  const themeKey = 'memorial-theme';
  let savedTheme = null;
  try { savedTheme = localStorage.getItem(themeKey); } catch (_) {}

  const setTheme = (theme) => {
    const cleanTheme = theme === 'dark' ? 'dark' : 'light';
    body.dataset.theme = cleanTheme;
    document.documentElement.dataset.theme = cleanTheme;
    document.documentElement.style.colorScheme = cleanTheme;
    const dark = cleanTheme === 'dark';
    const label = themeBtn?.querySelector('.theme-label');
    const icon = themeBtn?.querySelector('.theme-icon');
    if (themeBtn) themeBtn.setAttribute('aria-pressed', String(dark));
    if (label) label.textContent = dark ? 'Modo claro' : 'Modo oscuro';
    if (icon) icon.textContent = dark ? '☀️' : '🌙';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#121117' : (getComputedStyle(body).getPropertyValue('--accent').trim() || '#e68bb0'));
    try { localStorage.setItem(themeKey, cleanTheme); } catch (_) {}
  };
  setTheme(savedTheme === 'dark' ? 'dark' : 'light');
  themeBtn?.addEventListener('click', () => {
    setTheme(body.dataset.theme === 'dark' ? 'light' : 'dark');
  });

  // ---------------------------------------------------------
  // Menú móvil
  // ---------------------------------------------------------
  const closeNav = () => {
    navLinks?.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
    const icon = navToggle?.querySelector('span');
    if (icon) icon.textContent = '☰';
  };
  navToggle?.addEventListener('click', () => {
    const open = navLinks?.classList.toggle('open') ?? false;
    navToggle.setAttribute('aria-expanded', String(open));
    const icon = navToggle.querySelector('span');
    if (icon) icon.textContent = open ? '✕' : '☰';
  });
  navLinks?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
  document.addEventListener('click', (event) => {
    if (!navLinks || !navToggle || !navLinks.classList.contains('open')) return;
    if (!navLinks.contains(event.target) && !navToggle.contains(event.target)) closeNav();
  });
  window.addEventListener('resize', () => { if (window.innerWidth > 720) closeNav(); });

  // ---------------------------------------------------------
  // Toast
  // ---------------------------------------------------------
  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(window.__memorialToastTimer);
    window.__memorialToastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  };

  // ---------------------------------------------------------
  // Compartir / copiar enlace
  // ---------------------------------------------------------
  document.querySelector('[data-share]')?.addEventListener('click', async () => {
    const title = document.querySelector('h1')?.textContent?.trim() || document.title;
    try {
      if (navigator.share) {
        await navigator.share({title, text: `Un recuerdo de ${title}`, url: location.href});
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(location.href);
        showToast('Enlace copiado');
      } else {
        window.prompt('Copia este enlace:', location.href);
      }
    } catch (_) {}
  });

  document.querySelector('[data-copy]')?.addEventListener('click', async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(location.href);
      showToast('Enlace del memorial copiado');
    } catch (_) {
      window.prompt('Copia este enlace:', location.href);
    }
  });

  // ---------------------------------------------------------
  // Visor completo de TODAS las imágenes reales del memorial.
  // Se crea una sola ventana reutilizable para evitar duplicados.
  // ---------------------------------------------------------
  let lightbox = document.querySelector('.image-lightbox');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.className = 'image-lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Imagen ampliada');
    lightbox.innerHTML = `
      <div class="image-lightbox-content">
        <span class="image-lightbox-hint">Esc para cerrar · clic fuera para cerrar</span>
        <button class="image-lightbox-close" type="button" aria-label="Cerrar imagen ampliada">✕</button>
        <img class="image-lightbox-img" alt="">
        <div class="image-lightbox-caption"></div>
      </div>`;
    document.body.appendChild(lightbox);
  }

  const lightboxImg = lightbox.querySelector('.image-lightbox-img');
  const lightboxCaption = lightbox.querySelector('.image-lightbox-caption');
  const lightboxClose = lightbox.querySelector('.image-lightbox-close');
  let lastFocusedElement = null;

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    body.classList.remove('lightbox-open');
    if (lightboxImg) lightboxImg.removeAttribute('src');
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') lastFocusedElement.focus();
  };

  const openLightbox = (img, event) => {
    if (!img?.src) return;
    event?.preventDefault();
    event?.stopPropagation();
    lastFocusedElement = img;
    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt || 'Imagen del memorial';
    const figureCaption = img.closest('figure')?.querySelector('figcaption')?.textContent?.trim();
    lightboxCaption.textContent = figureCaption || img.dataset.caption || img.alt || 'Imagen del memorial';
    lightbox.classList.add('open');
    body.classList.add('lightbox-open');
    lightboxClose?.focus();
  };

  document.addEventListener('click', (event) => {
    const img = event.target?.closest?.('img');
    if (!img || img.closest('.image-lightbox') || img.closest('.brand-mark')) return;
    openLightbox(img, event);
  }, true);
  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', event => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (lightbox.classList.contains('open')) closeLightbox();
      closeMediaModal();
    }
  });

  // ---------------------------------------------------------
  // Modal antiguo de recuerdos escritos.
  // ---------------------------------------------------------
  const modal = document.querySelector('[data-modal]');
  const modalVisual = document.querySelector('[data-modal-visual]');
  const modalTitle = document.querySelector('[data-modal-title]');
  const modalText = document.querySelector('[data-modal-text]');

  const closeMediaModal = () => {
    modal?.classList.remove('open');
    body.style.overflow = '';
  };
  document.querySelectorAll('.visual-card').forEach(card => {
    card.addEventListener('click', (event) => {
      // Si contiene una imagen, el visor de imagen tiene prioridad.
      if (event.target?.closest?.('img')) return;
      if (!modal) return;
      if (modalVisual) modalVisual.textContent = card.dataset.emoji || '♡';
      if (modalTitle) modalTitle.textContent = card.dataset.title || 'Recuerdo';
      if (modalText) modalText.textContent = card.dataset.text || '';
      modal.classList.add('open');
      body.style.overflow = 'hidden';
      modal.querySelector('.modal-close')?.focus();
    });
  });
  modal?.querySelector('.modal-close')?.addEventListener('click', closeMediaModal);
  modal?.addEventListener('click', event => { if (event.target === modal) closeMediaModal(); });

  // ---------------------------------------------------------
  // Botones de pantalla completa para videos.
  // ---------------------------------------------------------
  document.querySelectorAll('[data-fullscreen-video]').forEach(button => {
    button.addEventListener('click', async () => {
      const id = button.getAttribute('data-fullscreen-video');
      const video = id ? document.getElementById(id) : null;
      if (!video) return;
      try {
        if (video.requestFullscreen) await video.requestFullscreen();
        else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
      } catch (_) {}
    });
  });

  // ---------------------------------------------------------
  // Animaciones
  // ---------------------------------------------------------
  const animateItems = document.querySelectorAll('.animate');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, {threshold:.08});
    animateItems.forEach(el => io.observe(el));
  } else {
    animateItems.forEach(el => el.classList.add('in'));
  }

  // ---------------------------------------------------------
  // Volver arriba y anclas
  // ---------------------------------------------------------
  const updateBackTop = () => backTop?.classList.toggle('show', window.scrollY > 650);
  window.addEventListener('scroll', updateBackTop, {passive:true});
  updateBackTop();
  backTop?.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        event.preventDefault();
        target.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  });

  // Año automático.
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
