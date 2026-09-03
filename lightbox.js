/* ===================== COUTY — Lightbox / Visualizador de Imagens ===================== */
(function () {
  'use strict';

  var MIN_SCALE = 1;
  var MAX_SCALE = 4;
  var ZOOM_STEP = 0.6;

  var state = {
    images: [],       // array of { src, alt }
    index: 0,
    scale: 1,
    posX: 0,
    posY: 0,
    dragging: false,
    startX: 0,
    startY: 0,
    startPosX: 0,
    startPosY: 0,
    pinchDist: 0,
    pinchStartScale: 1
  };

  var overlay, stage, imgEl, captionEl, counterEl, closeBtn, prevBtn, nextBtn, zoomInBtn, zoomOutBtn;

  function buildOverlay() {
    if (document.getElementById('cty-lightbox')) return;

    overlay = document.createElement('div');
    overlay.id = 'cty-lightbox';
    overlay.className = 'cty-lightbox';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML =
      '<button type="button" class="cty-lb-close" aria-label="Fechar">&times;</button>' +
      '<button type="button" class="cty-lb-prev" aria-label="Imagem anterior">&#10094;</button>' +
      '<button type="button" class="cty-lb-next" aria-label="Próxima imagem">&#10095;</button>' +
      '<div class="cty-lb-stage">' +
        '<img class="cty-lb-img" src="" alt="">' +
      '</div>' +
      '<div class="cty-lb-zoomcontrols">' +
        '<button type="button" class="cty-lb-zoomout" aria-label="Diminuir zoom">&minus;</button>' +
        '<button type="button" class="cty-lb-zoomin" aria-label="Aumentar zoom">&plus;</button>' +
      '</div>' +
      '<div class="cty-lb-footer">' +
        '<span class="cty-lb-caption"></span>' +
        '<span class="cty-lb-counter"></span>' +
        '<span class="cty-lb-hint">Use a roda do mouse, pinça ou duplo clique para ampliar &middot; arraste para mover</span>' +
      '</div>';

    document.body.appendChild(overlay);

    stage = overlay.querySelector('.cty-lb-stage');
    imgEl = overlay.querySelector('.cty-lb-img');
    captionEl = overlay.querySelector('.cty-lb-caption');
    counterEl = overlay.querySelector('.cty-lb-counter');
    closeBtn = overlay.querySelector('.cty-lb-close');
    prevBtn = overlay.querySelector('.cty-lb-prev');
    nextBtn = overlay.querySelector('.cty-lb-next');
    zoomInBtn = overlay.querySelector('.cty-lb-zoomin');
    zoomOutBtn = overlay.querySelector('.cty-lb-zoomout');

    bindOverlayEvents();
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function applyTransform() {
    imgEl.style.transform =
      'translate(' + state.posX + 'px, ' + state.posY + 'px) scale(' + state.scale + ')';
    imgEl.classList.toggle('is-zoomed', state.scale > 1.001);
  }

  function resetZoom() {
    state.scale = 1;
    state.posX = 0;
    state.posY = 0;
    applyTransform();
  }

  function setScale(newScale, cx, cy) {
    newScale = clamp(newScale, MIN_SCALE, MAX_SCALE);
    if (newScale === state.scale) return;

    // Keep the point under the cursor/finger stable while zooming.
    if (cx !== undefined && cy !== undefined) {
      var rect = imgEl.getBoundingClientRect();
      var originX = (cx - rect.left - rect.width / 2) / state.scale;
      var originY = (cy - rect.top - rect.height / 2) / state.scale;
      state.posX -= originX * (newScale - state.scale);
      state.posY -= originY * (newScale - state.scale);
    }

    state.scale = newScale;
    if (state.scale <= 1.001) {
      state.posX = 0;
      state.posY = 0;
    }
    applyTransform();
  }

  function loadImage(idx) {
    var total = state.images.length;
    if (!total) return;
    state.index = ((idx % total) + total) % total;
    var item = state.images[state.index];

    imgEl.classList.remove('is-loaded');
    resetZoom();

    var preloader = new Image();
    preloader.onload = function () {
      imgEl.src = item.src;
      imgEl.alt = item.alt || '';
      requestAnimationFrame(function () {
        imgEl.classList.add('is-loaded');
      });
    };
    preloader.src = item.src;

    captionEl.textContent = item.alt || '';
    counterEl.textContent = total > 1 ? (state.index + 1) + ' / ' + total : '';
    prevBtn.style.display = total > 1 ? '' : 'none';
    nextBtn.style.display = total > 1 ? '' : 'none';
  }

  function open(images, startIndex) {
    buildOverlay();
    state.images = images;
    loadImage(startIndex || 0);
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    resetZoom();
  }

  function next() { loadImage(state.index + 1); }
  function prev() { loadImage(state.index - 1); }

  function distanceBetweenTouches(touches) {
    var dx = touches[0].clientX - touches[1].clientX;
    var dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function bindOverlayEvents() {
    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', function (e) { e.stopPropagation(); prev(); });
    nextBtn.addEventListener('click', function (e) { e.stopPropagation(); next(); });
    zoomInBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      setScale(state.scale + ZOOM_STEP);
    });
    zoomOutBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      setScale(state.scale - ZOOM_STEP);
    });

    // Click outside the image closes the lightbox.
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay || e.target === stage) close();
    });

    // Mouse wheel zoom.
    stage.addEventListener('wheel', function (e) {
      e.preventDefault();
      var delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
      setScale(state.scale + delta, e.clientX, e.clientY);
    }, { passive: false });

    // Double click / double tap to toggle zoom.
    imgEl.addEventListener('dblclick', function (e) {
      if (state.scale > 1.001) {
        resetZoom();
      } else {
        setScale(2.5, e.clientX, e.clientY);
      }
    });

    // Drag to pan when zoomed (mouse).
    imgEl.addEventListener('mousedown', function (e) {
      if (state.scale <= 1.001) return;
      e.preventDefault();
      state.dragging = true;
      state.startX = e.clientX;
      state.startY = e.clientY;
      state.startPosX = state.posX;
      state.startPosY = state.posY;
      imgEl.classList.add('is-dragging');
    });

    window.addEventListener('mousemove', function (e) {
      if (!state.dragging) return;
      state.posX = state.startPosX + (e.clientX - state.startX);
      state.posY = state.startPosY + (e.clientY - state.startY);
      applyTransform();
    });

    window.addEventListener('mouseup', function () {
      if (state.dragging) {
        state.dragging = false;
        imgEl.classList.remove('is-dragging');
      }
    });

    // Touch: pinch to zoom, single-finger drag to pan.
    stage.addEventListener('touchstart', function (e) {
      if (e.touches.length === 2) {
        state.pinchDist = distanceBetweenTouches(e.touches);
        state.pinchStartScale = state.scale;
      } else if (e.touches.length === 1 && state.scale > 1.001) {
        state.dragging = true;
        state.startX = e.touches[0].clientX;
        state.startY = e.touches[0].clientY;
        state.startPosX = state.posX;
        state.startPosY = state.posY;
      }
    }, { passive: true });

    stage.addEventListener('touchmove', function (e) {
      if (e.touches.length === 2) {
        e.preventDefault();
        var newDist = distanceBetweenTouches(e.touches);
        var ratio = newDist / (state.pinchDist || newDist);
        var midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        var midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        setScale(state.pinchStartScale * ratio, midX, midY);
      } else if (e.touches.length === 1 && state.dragging) {
        e.preventDefault();
        state.posX = state.startPosX + (e.touches[0].clientX - state.startX);
        state.posY = state.startPosY + (e.touches[0].clientY - state.startY);
        applyTransform();
      }
    }, { passive: false });

    stage.addEventListener('touchend', function (e) {
      if (e.touches.length === 0) state.dragging = false;
    });

    // Keyboard navigation.
    document.addEventListener('keydown', function (e) {
      if (!overlay.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === '+') setScale(state.scale + ZOOM_STEP);
      else if (e.key === '-') setScale(state.scale - ZOOM_STEP);
    });
  }

  /**
   * Wire up a container so that clicking any image matching `imgSelector`
   * opens the lightbox, using all matching images in the container as the
   * navigable gallery (in DOM order at click time).
   */
  function initGallery(containerSelector, imgSelector) {
    var container = document.querySelector(containerSelector);
    if (!container) return;

    container.addEventListener('click', function (e) {
      var target = e.target.closest(imgSelector);
      if (!target) return;
      var imgTag = target.tagName === 'IMG' ? target : target.querySelector('img');
      if (!imgTag) return;

      e.preventDefault();
      e.stopPropagation();

      var allImgs = Array.prototype.slice.call(container.querySelectorAll(imgSelector))
        .map(function (el) { return el.tagName === 'IMG' ? el : el.querySelector('img'); })
        .filter(Boolean);

      var images = allImgs.map(function (el) {
        var nameEl = el.closest('.card, .product-card');
        var caption = el.alt || (nameEl ? (nameEl.querySelector('.card-name') || {}).textContent : '') || '';
        return { src: el.currentSrc || el.src, alt: caption.trim() };
      });

      var idx = allImgs.indexOf(imgTag);
      open(images, idx < 0 ? 0 : idx);
    });
  }

  window.CoutyLightbox = {
    open: open,
    close: close,
    initGallery: initGallery
  };
})();
