/* ==========================================================================
   CORNERSTONE COLLEGE — ADMIN JAVASCRIPT ENGINE
   All data persisted in localStorage. Images stored as base64 Data URLs.
   ========================================================================== */

'use strict';

// ============================================================
// CONSTANTS
// ============================================================
const ADMIN_CREDS = { username: 'cornerstone', password: 'cornerstone@2026' };
const SESSION_KEY  = 'ccmc_admin_session';
const KEYS = {
  videos   : 'ccmc_videos',
  stem     : 'ccmc_gallery_stem',
  clubs    : 'ccmc_gallery_clubs',
  sports   : 'ccmc_gallery_sports',
  arts     : 'ccmc_gallery_arts',
};

// Default seed videos (YouTube embeds)
const DEFAULT_VIDEOS = [
  { id: uid(), title: 'Robotics & STEM Showcase',    description: 'Watch our senior students present robotics projects and coding challenges.',   type: 'youtube', src: 'https://www.youtube.com/embed/1DymrR07VKo', thumb: '' },
  { id: uid(), title: 'Boarding Life at Cornerstone', description: 'A glimpse into the daily structured routines, study hours, and fellowship of our boarders.', type: 'youtube', src: 'https://www.youtube.com/embed/Y6Kuc_Hn1c8', thumb: '' },
];

// Default seed gallery images (Unsplash URLs, stored as src links not base64 for defaults)
const DEFAULT_GALLERIES = {
  stem: [
    { id: uid(), caption: 'Python Workshop', src: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop', type:'url' },
    { id: uid(), caption: 'Robotics Lab', src: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop', type:'url' },
    { id: uid(), caption: 'Electronics Projects', src: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop', type:'url' },
  ],
  clubs: [
    { id: uid(), caption: 'Debate Competition', src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop', type:'url' },
    { id: uid(), caption: 'Music Orchestra', src: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&h=600&fit=crop', type:'url' },
    { id: uid(), caption: 'Press Club Meeting', src: 'https://images.unsplash.com/photo-1503428593586-e225b39bddfe?w=800&h=600&fit=crop', type:'url' },
  ],
  sports: [
    { id: uid(), caption: 'Inter-house Athletics', src: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=600&fit=crop', type:'url' },
    { id: uid(), caption: 'Football Training', src: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=600&fit=crop', type:'url' },
    { id: uid(), caption: 'Basketball Court', src: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop', type:'url' },
  ],
  arts: [
    { id: uid(), caption: 'Painting Workshop', src: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=600&fit=crop', type:'url' },
    { id: uid(), caption: 'Drama Performance', src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop', type:'url' },
    { id: uid(), caption: 'Cultural Display', src: 'https://images.unsplash.com/photo-1519671282429-b44660ead0a7?w=800&h=600&fit=crop', type:'url' },
  ],
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function getData(key, defaultVal = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch { return defaultVal; }
}

function setData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function isLoggedIn() {
  return sessionStorage.getItem(SESSION_KEY) === 'active';
}

function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'admin-login.html';
  }
}

function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  window.location.href = 'admin-login.html';
}

// ============================================================
// SEED DEFAULTS (only runs once if storage is empty)
// ============================================================
function seedDefaults() {
  if (!localStorage.getItem(KEYS.videos)) setData(KEYS.videos, DEFAULT_VIDEOS);
  if (!localStorage.getItem(KEYS.stem))   setData(KEYS.stem,   DEFAULT_GALLERIES.stem);
  if (!localStorage.getItem(KEYS.clubs))  setData(KEYS.clubs,  DEFAULT_GALLERIES.clubs);
  if (!localStorage.getItem(KEYS.sports)) setData(KEYS.sports, DEFAULT_GALLERIES.sports);
  if (!localStorage.getItem(KEYS.arts))   setData(KEYS.arts,   DEFAULT_GALLERIES.arts);
}

// ============================================================
// TOAST NOTIFICATION
// ============================================================
function showToast(msg, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    container.id = 'toastContainer';
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${icons[type] || '📌'}</span> ${msg}`;
  container.appendChild(t);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { t.classList.add('show'); });
  });
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 400);
  }, 3500);
}

// ============================================================
// MODAL HELPERS
// ============================================================
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}
function closeAllModals() {
  document.querySelectorAll('.modal-backdrop.open').forEach(m => m.classList.remove('open'));
}

// Close modal on backdrop click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-backdrop')) closeAllModals();
});

// ============================================================
// FILE READER HELPER (returns promise with base64 data url)
// ============================================================
function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ============================================================
// DRAG-AND-DROP UPLOAD ZONE SETUP
// ============================================================
function initUploadZone(zoneEl, acceptTypes, onFiles) {
  if (!zoneEl) return;
  zoneEl.addEventListener('click', () => {
    const inp = zoneEl.querySelector('input[type="file"]');
    if (inp) inp.click();
  });
  zoneEl.addEventListener('dragover', e => {
    e.preventDefault();
    zoneEl.classList.add('dragover');
  });
  zoneEl.addEventListener('dragleave', () => zoneEl.classList.remove('dragover'));
  zoneEl.addEventListener('drop', e => {
    e.preventDefault();
    zoneEl.classList.remove('dragover');
    const files = Array.from(e.dataTransfer.files);
    onFiles(files);
  });
}

// ============================================================
// STATS UPDATER
// ============================================================
function updateStats() {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  set('stat-videos',  getData(KEYS.videos).length);
  set('stat-stem',    getData(KEYS.stem).length);
  set('stat-clubs',   getData(KEYS.clubs).length);
  set('stat-sports',  getData(KEYS.sports).length);
  set('stat-arts',    getData(KEYS.arts).length);
  const total = getData(KEYS.stem).length + getData(KEYS.clubs).length +
                getData(KEYS.sports).length + getData(KEYS.arts).length;
  set('stat-total-gallery', total);
}

// ============================================================
// SECTION / TAB NAVIGATION
// ============================================================
function initNavigation() {
  const links  = document.querySelectorAll('.sidebar-link[data-section]');
  const panels = document.querySelectorAll('.admin-section');

  function activateSection(sectionId) {
    panels.forEach(p => p.classList.remove('active'));
    links.forEach(l => l.classList.remove('active'));
    const panel = document.getElementById('section-' + sectionId);
    const link  = document.querySelector(`.sidebar-link[data-section="${sectionId}"]`);
    if (panel) panel.classList.add('active');
    if (link)  link.classList.add('active');

    // Update topbar title
    const topTitle = document.getElementById('topbarTitle');
    const topSub   = document.getElementById('topbarSub');
    const labels = {
      overview : { title: 'Dashboard Overview',      sub: 'Welcome back, Administrator' },
      videos   : { title: 'Video Management',        sub: 'Upload and manage website videos' },
      stem     : { title: 'STEM & Code Lab Gallery', sub: 'Manage STEM gallery images' },
      clubs    : { title: 'Recreational Clubs Gallery', sub: 'Manage Clubs gallery images' },
      sports   : { title: 'Sports & Athletics Gallery', sub: 'Manage Sports gallery images' },
      arts     : { title: 'Arts & Culture Gallery',  sub: 'Manage Arts gallery images' },
      settings : { title: 'Settings',                sub: 'Admin configuration' },
    };
    if (topTitle && labels[sectionId]) topTitle.textContent = labels[sectionId].title;
    if (topSub   && labels[sectionId]) topSub.textContent   = labels[sectionId].sub;

    // Render appropriate panel
    if (sectionId === 'videos') renderVideos();
    if (sectionId === 'stem')   renderGallery('stem');
    if (sectionId === 'clubs')  renderGallery('clubs');
    if (sectionId === 'sports') renderGallery('sports');
    if (sectionId === 'arts')   renderGallery('arts');
    if (sectionId === 'overview') updateStats();
  }

  links.forEach(link => {
    link.addEventListener('click', () => {
      const s = link.getAttribute('data-section');
      activateSection(s);
      // Close mobile sidebar
      document.getElementById('adminSidebar')?.classList.remove('open');
    });
  });

  // Default section
  activateSection('overview');
}

// ============================================================
// SIDEBAR MOBILE TOGGLE
// ============================================================
function initMobileSidebar() {
  const btn     = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('adminSidebar');
  if (btn && sidebar) {
    btn.addEventListener('click', () => sidebar.classList.toggle('open'));
  }
}

// ============================================================
// VIDEO MANAGER
// ============================================================
function renderVideos() {
  const container = document.getElementById('videoList');
  if (!container) return;
  const videos = getData(KEYS.videos);

  if (!videos.length) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🎬</span>
        <h4>No Videos Yet</h4>
        <p>Click "Add Video" to upload or embed your first video.</p>
      </div>`;
    return;
  }

  container.innerHTML = videos.map(v => `
    <div class="video-card" data-id="${v.id}">
      <div class="video-card-thumb">
        ${videoThumb(v)}
        <span class="video-type-badge">${v.type === 'youtube' ? '▶ YouTube' : '📁 Uploaded'}</span>
      </div>
      <div class="video-card-info">
        <h4>${esc(v.title)}</h4>
        <p>${esc(v.description)}</p>
        <div class="video-card-actions">
          <button class="btn btn-outline btn-sm" onclick="editVideo('${v.id}')">✏️ Edit</button>
          <button class="btn btn-danger btn-sm"  onclick="deleteVideo('${v.id}')">🗑️ Delete</button>
        </div>
      </div>
    </div>
  `).join('');
}

function videoThumb(v) {
  if (v.type === 'youtube') {
    // Extract YouTube ID for thumbnail
    const ytId = extractYTId(v.src);
    if (ytId) {
      return `<img src="https://img.youtube.com/vi/${ytId}/mqdefault.jpg" alt="${esc(v.title)}" style="width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0;" />`;
    }
    return `<iframe src="${esc(v.src)}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;" allowfullscreen></iframe>`;
  }
  if (v.type === 'file') {
    return `<video src="${v.src}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" muted></video>`;
  }
  return `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.4);">No preview</div>`;
}

function extractYTId(url) {
  const m = url.match(/(?:youtube\.com\/embed\/|youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ADD VIDEO MODAL
let _editingVideoId = null;
let _pendingVideoSrc = null;
let _pendingVideoType = null;

function openAddVideoModal(editId = null) {
  _editingVideoId = editId;
  _pendingVideoSrc = null;
  _pendingVideoType = null;

  const modal    = document.getElementById('modalAddVideo');
  const titleEl  = document.getElementById('videoModalTitle');
  const form     = document.getElementById('videoForm');
  if (!modal) return;

  if (editId) {
    const v = getData(KEYS.videos).find(x => x.id === editId);
    if (v) {
      document.getElementById('vTitle').value = v.title;
      document.getElementById('vDesc').value  = v.description;
      document.getElementById('vType').value  = v.type === 'youtube' ? 'youtube' : 'file';
      document.getElementById('vYTUrl').value = v.type === 'youtube' ? v.src : '';
      updateVideoTypeUI();
      _pendingVideoSrc  = v.src;
      _pendingVideoType = v.type;
      titleEl.textContent = 'Edit Video';
    }
  } else {
    form.reset();
    document.getElementById('videoPrv').innerHTML = '<span style="font-size:2rem;">🎬</span><p>Preview appears here</p>';
    updateVideoTypeUI();
    titleEl.textContent = 'Add New Video';
  }

  openModal('modalAddVideo');
}

function editVideo(id) { openAddVideoModal(id); }

function deleteVideo(id) {
  if (!confirm('Delete this video? This cannot be undone.')) return;
  let videos = getData(KEYS.videos).filter(v => v.id !== id);
  setData(KEYS.videos, videos);
  renderVideos();
  updateStats();
  showToast('Video deleted successfully.', 'success');
}

function updateVideoTypeUI() {
  const type     = document.getElementById('vType')?.value;
  const ytRow    = document.getElementById('ytUrlRow');
  const fileRow  = document.getElementById('fileUploadRow');
  if (!ytRow || !fileRow) return;
  ytRow.style.display   = type === 'youtube' ? 'block' : 'none';
  fileRow.style.display = type === 'file'    ? 'block' : 'none';
}

async function saveVideo() {
  const id    = _editingVideoId;
  const title = document.getElementById('vTitle')?.value.trim();
  const desc  = document.getElementById('vDesc')?.value.trim();
  const type  = document.getElementById('vType')?.value;
  const ytUrl = document.getElementById('vYTUrl')?.value.trim();

  if (!title) { showToast('Please enter a video title.', 'error'); return; }

  let src  = _pendingVideoSrc;
  let vtype = _pendingVideoType;

  if (type === 'youtube') {
    if (!ytUrl) { showToast('Please enter a YouTube embed URL.', 'error'); return; }
    // Normalize to embed URL
    src  = normalizeYTUrl(ytUrl);
    vtype = 'youtube';
  } else {
    if (!src) { showToast('Please upload a video file.', 'error'); return; }
  }

  let videos = getData(KEYS.videos);

  if (id) {
    videos = videos.map(v => v.id === id ? { ...v, title, description: desc, src, type: vtype } : v);
    showToast('Video updated successfully!', 'success');
  } else {
    videos.push({ id: uid(), title, description: desc, src, type: vtype });
    showToast('Video added successfully!', 'success');
  }

  setData(KEYS.videos, videos);
  closeModal('modalAddVideo');
  renderVideos();
  updateStats();
}

function normalizeYTUrl(url) {
  // Accept full YT URL or embed URL
  const m = url.match(/(?:watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  if (url.includes('/embed/')) return url;
  return url;
}

async function handleVideoFileUpload(files) {
  const file = files[0];
  if (!file) return;
  if (!file.type.startsWith('video/')) {
    showToast('Please select a valid video file.', 'error');
    return;
  }
  if (file.size > 100 * 1024 * 1024) {
    showToast('File too large (max 100MB). Consider YouTube embed.', 'error');
    return;
  }
  showToast('Reading video file...', 'info');
  try {
    const dataUrl = await readFile(file);
    _pendingVideoSrc  = dataUrl;
    _pendingVideoType = 'file';
    const prv = document.getElementById('videoPrv');
    if (prv) prv.innerHTML = `<video src="${dataUrl}" controls style="width:100%;height:100%;object-fit:cover;border-radius:8px;"></video>`;
    showToast('Video loaded! Click Save to confirm.', 'success');
  } catch {
    showToast('Failed to read video file.', 'error');
  }
}

// ============================================================
// GALLERY MANAGER
// ============================================================
let _currentGalleryKey = 'stem';

function renderGallery(cat) {
  _currentGalleryKey = cat;
  const container = document.getElementById('galleryGrid');
  if (!container) return;
  const items = getData(KEYS[cat]);

  let html = items.map(item => `
    <div class="gallery-item" data-id="${item.id}">
      <img src="${item.src}" alt="${esc(item.caption)}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300?text=Image'"/>
      <div class="gallery-item-overlay">
        <button class="btn btn-sm" style="background:rgba(255,255,255,0.15);color:white;border:1px solid rgba(255,255,255,0.3);" onclick="editGalleryItem('${cat}','${item.id}')">✏️ Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteGalleryItem('${cat}','${item.id}')">🗑️ Delete</button>
      </div>
      <div class="gallery-item-caption">${esc(item.caption)}</div>
    </div>
  `).join('');

  // Add button
  html += `
    <button class="gallery-add-btn" onclick="openAddImageModal('${cat}')">
      <span class="plus-icon">+</span>
      <span>Add Image</span>
    </button>`;

  container.innerHTML = html;

  // Update gallery tab badge counts
  ['stem','clubs','sports','arts'].forEach(k => {
    const badge = document.getElementById(`badge-${k}`);
    if (badge) badge.textContent = getData(KEYS[k]).length;
  });
}

// GALLERY TAB SWITCH
function switchGalleryTab(cat) {
  document.querySelectorAll('.gallery-tab-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`.gallery-tab-btn[data-cat="${cat}"]`);
  if (btn) btn.classList.add('active');
  renderGallery(cat);
}

// ADD / EDIT IMAGE MODAL
let _editingGalleryId = null;
let _pendingImgSrc    = null;

function openAddImageModal(cat, editId = null) {
  _currentGalleryKey = cat;
  _editingGalleryId  = editId;
  _pendingImgSrc     = null;

  const modal   = document.getElementById('modalAddImage');
  const titleEl = document.getElementById('imgModalTitle');
  if (!modal) return;

  if (editId) {
    const item = getData(KEYS[cat]).find(x => x.id === editId);
    if (item) {
      document.getElementById('iCaption').value = item.caption;
      _pendingImgSrc = item.src;
      const prv = document.getElementById('imgPreview');
      if (prv) prv.innerHTML = `<img src="${item.src}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" />`;
      titleEl.textContent = 'Edit Image';
    }
  } else {
    document.getElementById('imgForm')?.reset();
    const prv = document.getElementById('imgPreview');
    if (prv) prv.innerHTML = '<span style="font-size:2rem;">🖼️</span><p>Preview appears here</p>';
    titleEl.textContent = 'Add Image';
  }

  openModal('modalAddImage');
}

function editGalleryItem(cat, id) { openAddImageModal(cat, id); }

function deleteGalleryItem(cat, id) {
  if (!confirm('Delete this image?')) return;
  let items = getData(KEYS[cat]).filter(x => x.id !== id);
  setData(KEYS[cat], items);
  renderGallery(cat);
  updateStats();
  showToast('Image deleted.', 'success');
}

async function handleImageFileUpload(files) {
  const file = files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showToast('Please select a valid image file.', 'error');
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    showToast('Image too large (max 10MB). Please compress first.', 'error');
    return;
  }
  try {
    const dataUrl = await readFile(file);
    _pendingImgSrc = dataUrl;
    const prv = document.getElementById('imgPreview');
    if (prv) prv.innerHTML = `<img src="${dataUrl}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" />`;
    showToast('Image loaded!', 'success');
  } catch {
    showToast('Failed to read image.', 'error');
  }
}

function saveGalleryImage() {
  const caption = document.getElementById('iCaption')?.value.trim() || 'Gallery Image';
  const cat     = _currentGalleryKey;
  const editId  = _editingGalleryId;

  if (!_pendingImgSrc) {
    showToast('Please upload an image first.', 'error');
    return;
  }

  let items = getData(KEYS[cat]);

  if (editId) {
    items = items.map(x => x.id === editId ? { ...x, caption, src: _pendingImgSrc, type: 'upload' } : x);
    showToast('Image updated!', 'success');
  } else {
    items.push({ id: uid(), caption, src: _pendingImgSrc, type: 'upload' });
    showToast('Image added to gallery!', 'success');
  }

  setData(KEYS[cat], items);
  closeModal('modalAddImage');
  renderGallery(cat);
  updateStats();
}

// ============================================================
// PUBLIC WEBSITE: GALLERY SLIDER (programmes.html)
// ============================================================
function initPublicGalleries() {
  seedDefaults();
  const galleryConfigs = [
    { key: 'stem',   containerId: 'gallerySlider-stem',   dotId: 'galleryDots-stem',   thumbId: 'galleryThumbs-stem'   },
    { key: 'clubs',  containerId: 'gallerySlider-clubs',  dotId: 'galleryDots-clubs',  thumbId: 'galleryThumbs-clubs'  },
    { key: 'sports', containerId: 'gallerySlider-sports', dotId: 'galleryDots-sports', thumbId: 'galleryThumbs-sports' },
    { key: 'arts',   containerId: 'gallerySlider-arts',   dotId: 'galleryDots-arts',   thumbId: 'galleryThumbs-arts'   },
  ];

  galleryConfigs.forEach(cfg => {
    const images = getData(KEYS[cfg.key]);
    buildPublicSlider(images, cfg.containerId, cfg.dotId, cfg.thumbId);
  });
}

function buildPublicSlider(images, sliderId, dotsId, thumbsId) {
  const sliderEl = document.getElementById(sliderId);
  const dotsEl   = document.getElementById(dotsId);
  const thumbsEl = document.getElementById(thumbsId);
  const wrapEl   = sliderEl?.closest('.pub-gallery-wrap');
  const emptyEl  = sliderEl?.closest('.gallery-section')?.querySelector('.gallery-placeholder-empty');

  if (!sliderEl) return;

  if (!images || images.length === 0) {
    if (wrapEl) wrapEl.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'flex';
    return;
  }

  if (wrapEl) wrapEl.style.display = 'block';
  if (emptyEl) emptyEl.style.display = 'none';

  let current = 0;
  let timer = null;

  // Build slides
  sliderEl.innerHTML = images.map((img, i) => `
    <div class="pub-gallery-slide ${i === 0 ? 'active' : ''}" data-idx="${i}">
      <img src="${img.src}" alt="${esc(img.caption)}" loading="${i === 0 ? 'eager' : 'lazy'}"
           onerror="this.src='https://via.placeholder.com/800x500?text=Image+Not+Found'" />
      <div class="pub-gallery-caption">${esc(img.caption)}</div>
    </div>
  `).join('');

  // Build dots
  if (dotsEl) {
    dotsEl.innerHTML = images.map((_, i) => `
      <button class="pub-gallery-dot ${i === 0 ? 'active' : ''}" data-idx="${i}" aria-label="Slide ${i+1}"></button>
    `).join('');
    dotsEl.querySelectorAll('.pub-gallery-dot').forEach(dot => {
      dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.idx)));
    });
  }

  // Build thumbnails
  if (thumbsEl) {
    thumbsEl.innerHTML = images.map((img, i) => `
      <div class="pub-gallery-thumb ${i === 0 ? 'active' : ''}" data-idx="${i}">
        <img src="${img.src}" alt="${esc(img.caption)}"
             onerror="this.src='https://via.placeholder.com/80x60?text=?'" />
      </div>
    `).join('');
    thumbsEl.querySelectorAll('.pub-gallery-thumb').forEach(th => {
      th.addEventListener('click', () => goToSlide(parseInt(th.dataset.idx)));
    });
  }

  // Nav arrows
  const sliderSection = sliderEl.closest('.gallery-section');
  if (sliderSection) {
    const prevBtn = sliderSection.querySelector('.pub-gallery-prev');
    const nextBtn = sliderSection.querySelector('.pub-gallery-next');
    if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(current - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(current + 1));
  }

  function goToSlide(idx) {
    const slides = sliderEl.querySelectorAll('.pub-gallery-slide');
    const count  = slides.length;
    current = ((idx % count) + count) % count;

    slides.forEach((s, i) => s.classList.toggle('active', i === current));

    if (dotsEl)   dotsEl.querySelectorAll('.pub-gallery-dot').forEach((d, i) => d.classList.toggle('active', i === current));
    if (thumbsEl) thumbsEl.querySelectorAll('.pub-gallery-thumb').forEach((t, i) => t.classList.toggle('active', i === current));

    resetTimer();
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(() => goToSlide(current + 1), 10000); // 10s
  }

  resetTimer();
}

// ============================================================
// PUBLIC WEBSITE: VIDEOS (index.html)
// ============================================================
function initPublicVideos() {
  seedDefaults();
  const container = document.getElementById('publicVideoGrid');
  if (!container) return;

  const videos = getData(KEYS.videos);
  if (!videos.length) {
    container.innerHTML = '<p style="color:rgba(255,255,255,0.5);text-align:center;grid-column:1/-1;">No videos available. Check back soon.</p>';
    return;
  }

  container.innerHTML = videos.map(v => `
    <div class="video-test-card fade-up">
      <div class="video-iframe-wrapper">
        ${publicVideoEmbed(v)}
      </div>
      <div class="video-info">
        <h4>${esc(v.title)}</h4>
        <p>${esc(v.description)}</p>
      </div>
    </div>
  `).join('');
}

function publicVideoEmbed(v) {
  if (v.type === 'youtube') {
    return `<iframe src="${esc(v.src)}" title="${esc(v.title)}" allowfullscreen loading="lazy"></iframe>`;
  }
  if (v.type === 'file') {
    return `<video src="${v.src}" controls preload="metadata" style="position:absolute;top:0;left:0;width:100%;height:100%;background:#000;"></video>`;
  }
  return '';
}

// ============================================================
// LOGIN PAGE LOGIC
// ============================================================
function initLoginPage() {
  const form       = document.getElementById('loginForm');
  const errorMsg   = document.getElementById('loginError');
  const pwToggle   = document.getElementById('pwToggle');
  const pwInput    = document.getElementById('loginPassword');
  const roleTabs   = document.querySelectorAll('.login-role-tab');

  if (!form) return;

  // Role tabs
  roleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      roleTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  // Password toggle
  if (pwToggle && pwInput) {
    pwToggle.addEventListener('click', () => {
      const isText = pwInput.type === 'text';
      pwInput.type = isText ? 'password' : 'text';
      pwToggle.textContent = isText ? '👁️' : '🙈';
    });
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const username = document.getElementById('loginUsername')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;

    if (username === ADMIN_CREDS.username && password === ADMIN_CREDS.password) {
      sessionStorage.setItem(SESSION_KEY, 'active');
      showToast('Welcome back, Admin!', 'success');
      setTimeout(() => { window.location.href = 'admin-dashboard.html'; }, 600);
    } else {
      if (errorMsg) {
        errorMsg.style.display = 'flex';
        errorMsg.textContent   = '⚠️ Invalid username or password. Please try again.';
      }
      document.getElementById('loginUsername')?.classList.add('error');
      document.getElementById('loginPassword')?.classList.add('error');
      setTimeout(() => {
        document.getElementById('loginUsername')?.classList.remove('error');
        document.getElementById('loginPassword')?.classList.remove('error');
      }, 2000);
    }
  });
}

// ============================================================
// DASHBOARD INIT
// ============================================================
function initDashboard() {
  requireAuth();
  seedDefaults();

  initNavigation();
  initMobileSidebar();
  updateStats();

  // Logout button
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    if (confirm('Log out of the admin portal?')) logout();
  });
  document.getElementById('logoutBtn2')?.addEventListener('click', () => {
    if (confirm('Log out of the admin portal?')) logout();
  });

  // Video modal: type select
  document.getElementById('vType')?.addEventListener('change', updateVideoTypeUI);

  // Video file upload zone
  const videoZone = document.getElementById('videoUploadZone');
  if (videoZone) {
    initUploadZone(videoZone, ['video/*'], handleVideoFileUpload);
    const inp = document.getElementById('videoFileInput');
    if (inp) inp.addEventListener('change', e => handleVideoFileUpload(Array.from(e.target.files)));
  }

  // Image file upload zone
  const imgZone = document.getElementById('imageUploadZone');
  if (imgZone) {
    initUploadZone(imgZone, ['image/*'], handleImageFileUpload);
    const inp = document.getElementById('imageFileInput');
    if (inp) inp.addEventListener('change', e => handleImageFileUpload(Array.from(e.target.files)));
  }

  // Gallery category tabs inside Gallery sections
  document.querySelectorAll('.gallery-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-cat');
      document.querySelectorAll('.gallery-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _currentGalleryKey = cat;
      renderGallery(cat);
    });
  });

  // Modal save buttons
  document.getElementById('saveVideoBtn')?.addEventListener('click', saveVideo);
  document.getElementById('saveImageBtn')?.addEventListener('click', saveGalleryImage);

  // Modal close buttons
  document.querySelectorAll('.modal-close, [data-close-modal]').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  // Quick gallery nav links (from overview)
  document.querySelectorAll('[data-goto]').forEach(el => {
    el.addEventListener('click', () => {
      const sectionId = el.getAttribute('data-goto');
      const link = document.querySelector(`.sidebar-link[data-section="${sectionId}"]`);
      if (link) link.click();
    });
  });
}

// ============================================================
// AUTO-INIT on page load
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.getAttribute('data-page');
  if (page === 'admin-login')     initLoginPage();
  if (page === 'admin-dashboard') initDashboard();
  if (page === 'programmes')      initPublicGalleries();
  if (page === 'home')            initPublicVideos();
});
