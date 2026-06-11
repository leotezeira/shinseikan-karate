/**
 * Visual Page Builder — editor.js
 * Dojo Shinseikan
 *
 * Improvements over v1:
 *  - Full class-based architecture with clear separation
 *  - Toast notifications instead of alert()
 *  - Live preview while editing (no save needed for visual)
 *  - Breadcrumb path display for selected element
 *  - Color swatch + text input synced properly
 *  - Viewport switcher (desktop / tablet / mobile)
 *  - Debounced iframe re-init to handle slow loads
 *  - Keyboard shortcut Ctrl+Z to undo last change (per session)
 *  - JSON panel for exporting overrides inline
 *  - Proper selector uniqueness (index-based fallback)
 *  - Null-safe everything
 */

/* ============================================================
   Utilities
   ============================================================ */

function rgbToHex(rgb) {
  if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return '#000000';
  if (rgb.startsWith('#')) return rgb;
  const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return '#000000';
  return '#' + [match[1], match[2], match[3]]
    .map(n => parseInt(n).toString(16).padStart(2, '0'))
    .join('');
}

function debounce(fn, ms) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

function pathToPageId(pagePath) {
  const match = String(pagePath || "").match(/\/([^/]+)\/index\.html$/i);
  if (match) return match[1];
  if (pagePath === "/" || pagePath === "/index.html") return "home";
  return String(pagePath || "")
    .replace(/^.*\//, "")
    .replace(/\.html$/i, "") || "home";
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("No se pudo leer la imagen"));
    reader.readAsDataURL(file);
  });
}

/* ============================================================
   StorageManager
   ============================================================ */

class StorageManager {
  constructor() {
    this.KEY = 'shinseikan_builder_v2';
  }

  _load() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY)) || {};
    } catch {
      return {};
    }
  }

  _save(data) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('[Builder] localStorage write failed:', e);
    }
  }

  getPageOverrides(page) {
    return this._load()[page] || {};
  }

  setPageOverrides(page, overrides) {
    const all = this._load();
    all[page] = overrides;
    this._save(all);
  }

  clearPage(page) {
    const all = this._load();
    delete all[page];
    this._save(all);
  }

  exportAll() {
    return JSON.stringify(this._load(), null, 2);
  }

  exportPage(page) {
    return JSON.stringify(this.getPageOverrides(page), null, 2);
  }
}

/* ============================================================
   Toast
   ============================================================ */

class Toast {
  constructor() {
    this.rack = document.createElement('div');
    this.rack.className = 'e-toast-rack';
    document.body.appendChild(this.rack);
  }

  show(message, type = 'info', duration = 2800) {
    const icons = { success: '✓', error: '✕', info: 'i' };
    const toast = document.createElement('div');
    toast.className = `e-toast e-toast--${type}`;
    toast.innerHTML = `
      <span class="e-toast__icon">${icons[type] || 'i'}</span>
      <span>${message}</span>
    `;
    this.rack.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('is-out');
      toast.addEventListener('animationend', () => toast.remove(), { once: true });
    }, duration);
  }

  success(msg) { this.show(msg, 'success'); }
  error(msg)   { this.show(msg, 'error'); }
  info(msg)    { this.show(msg, 'info'); }
}

/* ============================================================
   UndoStack
   ============================================================ */

class UndoStack {
  constructor(limit = 40) {
    this.stack = [];
    this.limit = limit;
  }

  push(action) {
    this.stack.push(action);
    if (this.stack.length > this.limit) this.stack.shift();
  }

  pop() {
    return this.stack.pop() || null;
  }

  get length() { return this.stack.length; }
}

/* ============================================================
   OverlayManager
   ============================================================ */

class OverlayManager {
  constructor(overlayEl, iframeEl) {
    this.overlay    = overlayEl;
    this.iframe     = iframeEl;
    this.iframeDoc  = null;
    this.hoverEl    = null;
    this.selectedEl = null;
    this.onSelect   = null; // callback(el)

    this._hover   = this._createHighlight('editor-overlay__highlight');
    this._select  = this._createHighlight('editor-overlay__selected');
    this._tag     = document.createElement('span');
    this._tag.className = 'editor-overlay__tag';

    overlayEl.appendChild(this._hover);
    overlayEl.appendChild(this._select);
    overlayEl.appendChild(this._tag);
  }

  _createHighlight(cls) {
    const el = document.createElement('div');
    el.className = cls;
    return el;
  }

  attach(iframeDoc) {
    this.iframeDoc = iframeDoc;

    iframeDoc.addEventListener('mousemove', (e) => {
      if (!builderCore.editMode) return;
      const el = iframeDoc.elementFromPoint(e.clientX, e.clientY);
      if (el && el !== this.hoverEl) {
        this.hoverEl = el;
        this._pos(el, this._hover);
      }
    });

    iframeDoc.addEventListener('mouseleave', () => {
      this._hover.style.display = 'none';
    });

    iframeDoc.addEventListener('click', (e) => {
      if (!builderCore.editMode) return;
      e.preventDefault();
      e.stopPropagation();
      const el = iframeDoc.elementFromPoint(e.clientX, e.clientY);
      if (!el || el === iframeDoc.documentElement || el === iframeDoc.body) return;
      this.selectElement(el);
    });
  }

  _pos(el, highlight) {
    if (!el || !this.iframe) return;
    const rect     = el.getBoundingClientRect();
    const iRect    = this.iframe.getBoundingClientRect();
    const top      = rect.top  - iRect.top  + this.iframe.scrollTop;
    const left     = rect.left - iRect.left + this.iframe.scrollLeft;

    highlight.style.cssText = `
      display: block;
      left:   ${left}px;
      top:    ${top}px;
      width:  ${rect.width}px;
      height: ${rect.height}px;
    `;
  }

  selectElement(el) {
    this.selectedEl = el;
    this._pos(el, this._select);
    this._hover.style.display = 'none';

    // Tag label
    const tag = el.tagName.toLowerCase();
    const id  = el.id  ? `#${el.id}` : '';
    const cls = el.classList.length ? `.${el.classList[0]}` : '';
    this._tag.textContent = `${tag}${id || cls}`;
    const selRect = this._select.getBoundingClientRect();
    const iRect   = this.iframe.getBoundingClientRect();
    this._tag.style.left = `${parseFloat(this._select.style.left)}px`;
    this._tag.style.top  = `${parseFloat(this._select.style.top)}px`;
    this._tag.style.display = 'flex';

    if (this.onSelect) this.onSelect(el);
  }

  clear() {
    this._hover.style.display  = 'none';
    this._select.style.display = 'none';
    this._tag.style.display    = 'none';
    this.hoverEl    = null;
    this.selectedEl = null;
  }

  enable()  { this.overlay.classList.add('is-active'); }
  disable() { this.overlay.classList.remove('is-active'); this.clear(); }
}

/* ============================================================
   SidebarManager
   ============================================================ */

class SidebarManager {
  constructor(sidebarEl, storage, toast, undoStack) {
    this.sidebar   = sidebarEl;
    this.storage   = storage;
    this.toast     = toast;
    this.undo      = undoStack;
    this.currentEl = null;
    this.currentPage = '';

    this._header = sidebarEl.querySelector('.editor-sidebar__header');
    this._body   = sidebarEl.querySelector('.editor-sidebar__body');
    this._footer = sidebarEl.querySelector('.editor-sidebar__footer');

    this._renderEmpty();
  }

  // ---- Empty state ------------------------------------------------

  _renderEmpty() {
    if (this._header) {
      this._header.innerHTML = `
        <div class="editor-sidebar__title">
          <span>Inspector</span>
        </div>
      `;
    }
    if (this._body) {
      this._body.innerHTML = `
        <div class="editor-sidebar__empty">
          <div class="editor-sidebar__empty-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M9 9h6M9 13h4"/>
            </svg>
          </div>
          <p>Activá el modo edición y hacé clic en un elemento para editarlo.</p>
        </div>
      `;
    }
    if (this._footer) this._footer.innerHTML = '';
  }

  // ---- Selector builder ------------------------------------------

  _getSelector(el, doc) {
    if (el.id) return `#${el.id}`;

    // Build class-based selector
    const classes = Array.from(el.classList)
      .filter(c => !c.startsWith('editor-'));
    const tag = el.tagName.toLowerCase();

    if (classes.length) {
      const candidate = `${tag}.${classes[0]}`;
      if (doc.querySelectorAll(candidate).length === 1) return candidate;
    }

    // Index-based fallback
    const parent = el.parentElement;
    if (!parent) return tag;
    const siblings = Array.from(parent.children).filter(c => c.tagName === el.tagName);
    const idx = siblings.indexOf(el);
    const parentSel = this._getSelector(parent, doc);
    return `${parentSel} > ${tag}:nth-of-type(${idx + 1})`;
  }

  // ---- Breadcrumb ------------------------------------------------

  _breadcrumb(el) {
    const parts = [];
    let node = el;
    while (node && node.tagName && node !== document.body) {
      const tag = node.tagName.toLowerCase();
      const id  = node.id ? `#${node.id}` : '';
      parts.unshift(`${tag}${id}`);
      node = node.parentElement;
      if (parts.length >= 4) { parts.unshift('…'); break; }
    }
    return parts;
  }

  // ---- Render editor for element ---------------------------------

  renderForElement(el, pagePath) {
    this.currentEl   = el;
    this.currentPage = pagePath;

    const tag      = el.tagName.toLowerCase();
    const selector = this._getSelector(el, el.ownerDocument);
    const computed = el.ownerDocument.defaultView.getComputedStyle(el);

    // Header
    if (this._header) {
      this._header.innerHTML = `
        <div class="editor-sidebar__title">
          <span>Inspector</span>
          <span class="editor-sidebar__tag-badge">&lt;${tag}&gt;</span>
        </div>
      `;
    }

    // Body content
    const breadcrumb = this._breadcrumb(el);
    let html = `
      <div class="editor-sidebar__breadcrumb">
        ${breadcrumb.map((p, i) =>
          `<span class="editor-sidebar__breadcrumb-item">${p}</span>` +
          (i < breadcrumb.length - 1 ? '<span class="editor-sidebar__breadcrumb-sep">›</span>' : '')
        ).join('')}
      </div>
    `;

    // Content section
    html += '<div class="editor-sidebar__section">';
    html += '<div class="editor-sidebar__section-title">Contenido</div>';

    if (tag === 'img') {
      html += this._field('Src', `<input class="editor-sidebar__input" id="e-img-src" type="text" value="${this._esc(el.getAttribute('src') || '')}" />`);
      html += this._field('Alt', `<input class="editor-sidebar__input" id="e-img-alt" type="text" value="${this._esc(el.getAttribute('alt') || '')}" />`);
      html += this._field('Carga rápida', `
        <input class="editor-sidebar__input" id="e-img-upload" type="file" accept="image/*" />
        <div class="field__hint" id="e-img-preview">Podés subir una imagen y se convierte a base64 al instante.</div>
      `);
    } else if (tag === 'a') {
      html += this._field('Texto', `<input class="editor-sidebar__input" id="e-link-text" type="text" value="${this._esc(el.textContent || '')}" />`);
      html += this._field('Href',  `<input class="editor-sidebar__input" id="e-link-href" type="text" value="${this._esc(el.getAttribute('href') || '')}" />`);
    } else {
      html += this._field('Texto', `<textarea class="editor-sidebar__textarea" id="e-text">${this._esc(el.textContent || '')}</textarea>`);
    }
    html += '</div>';

    // Style section
    const color   = rgbToHex(computed.color);
    const bg      = rgbToHex(computed.backgroundColor);
    const fs      = parseInt(computed.fontSize) || 0;
    const lh      = parseFloat(computed.lineHeight) || 0;
    const pad     = parseInt(computed.padding) || 0;
    const mar     = parseInt(computed.margin) || 0;
    const br      = parseInt(computed.borderRadius) || 0;
    const fw      = parseInt(computed.fontWeight) || 400;
    const disp    = computed.display || 'block';
    const opac    = parseFloat(computed.opacity) || 1;

    html += `
      <div class="editor-sidebar__section">
        <div class="editor-sidebar__section-title">Estilos</div>

        ${this._colorField('Color de texto', 'e-color', color)}
        ${this._colorField('Fondo', 'e-bg', bg)}

        <div class="editor-sidebar__style-grid">
          ${this._numField('Font size', 'e-font-size', fs, 'px')}
          ${this._numField('Weight', 'e-font-weight', fw, '')}
          ${this._numField('Line height', 'e-line-height', lh.toFixed(1), '', 'number', '.1')}
          ${this._numField('Opacity', 'e-opacity', opac.toFixed(2), '', 'number', '.01')}
          ${this._numField('Padding', 'e-padding', pad, 'px')}
          ${this._numField('Margin', 'e-margin', mar, 'px')}
          ${this._numField('Border radius', 'e-border-radius', br, 'px')}
        </div>

        <div class="editor-sidebar__field">
          <label class="editor-sidebar__label">Display</label>
          <select class="editor-sidebar__select" id="e-display">
            ${['block','flex','grid','inline','inline-flex','none'].map(d =>
              `<option value="${d}" ${disp === d ? 'selected' : ''}>${d}</option>`
            ).join('')}
          </select>
        </div>
      </div>
    `;

    if (this._body) this._body.innerHTML = html;

    // Footer: save button
    if (this._footer) {
      this._footer.innerHTML = `
        <button class="editor-sidebar__save-btn" id="e-save">Guardar cambios</button>
      `;
      document.getElementById('e-save')?.addEventListener('click', () =>
        this._saveChanges(el, selector, pagePath)
      );
    }

    this._bindLiveEdits(el);
    this._bindImageUpload(el);
  }

  // ---- Helpers for HTML generation --------------------------------

  _esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  _field(label, inputHTML) {
    return `
      <div class="editor-sidebar__field">
        <label class="editor-sidebar__label">${label}</label>
        ${inputHTML}
      </div>
    `;
  }

  _colorField(label, id, hex) {
    return `
      <div class="editor-sidebar__field">
        <label class="editor-sidebar__label">${label}</label>
        <div class="editor-sidebar__color-row">
          <label class="editor-sidebar__color-swatch" title="Elegir color">
            <div class="editor-sidebar__color-preview" id="${id}-preview" style="background:${hex}"></div>
            <input type="color" id="${id}-picker" value="${hex}" />
          </label>
          <input type="text" class="editor-sidebar__input" id="${id}-text" value="${hex}" maxlength="25" />
        </div>
      </div>
    `;
  }

  _numField(label, id, val, unit = '', type = 'number', step = '1') {
    return `
      <div class="editor-sidebar__field">
        <label class="editor-sidebar__label" style="font-size:10px">${label}</label>
        <div class="editor-sidebar__row">
          <input type="${type}" step="${step}" class="editor-sidebar__input editor-sidebar__input--num" id="${id}" value="${val}" />
          ${unit ? `<span class="editor-sidebar__unit">${unit}</span>` : ''}
        </div>
      </div>
    `;
  }

  // ---- Live bindings ----------------------------------------------

  _bindLiveEdits(el) {
    const bind = (id, fn) => {
      document.getElementById(id)?.addEventListener('input', (e) => fn(e.target.value));
    };
    const bindChange = (id, fn) => {
      document.getElementById(id)?.addEventListener('change', (e) => fn(e.target.value));
    };

    // Content
    bind('e-img-src',   v => el.setAttribute('src', v));
    bind('e-img-alt',   v => el.setAttribute('alt', v));
    bind('e-link-text', v => { el.textContent = v; });
    bind('e-link-href', v => el.setAttribute('href', v));
    bind('e-text',      v => { el.textContent = v; });

    // Styles
    this._bindColor('e-color', el, 'color');
    this._bindColor('e-bg',    el, 'backgroundColor');

    bind('e-font-size',    v => el.style.fontSize    = `${v}px`);
    bind('e-font-weight',  v => el.style.fontWeight  = v);
    bind('e-line-height',  v => el.style.lineHeight  = v);
    bind('e-opacity',      v => el.style.opacity     = v);
    bind('e-padding',      v => el.style.padding     = `${v}px`);
    bind('e-margin',       v => el.style.margin      = `${v}px`);
    bind('e-border-radius',v => el.style.borderRadius= `${v}px`);
    bindChange('e-display',v => el.style.display     = v);
  }

  _bindColor(id, el, prop) {
    const picker  = document.getElementById(`${id}-picker`);
    const textIn  = document.getElementById(`${id}-text`);
    const preview = document.getElementById(`${id}-preview`);

    const apply = (val) => {
      el.style[prop] = val;
      if (preview) preview.style.background = val;
    };

    picker?.addEventListener('input', (e) => {
      apply(e.target.value);
      if (textIn) textIn.value = e.target.value;
    });

    textIn?.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (/^#[0-9a-fA-F]{3,8}$/.test(val) || /^rgb/.test(val)) {
        apply(val);
        if (picker) {
          try { picker.value = rgbToHex(val); } catch {}
        }
      }
    });
  }

  _bindImageUpload(el) {
    if (el.tagName.toLowerCase() !== 'img') return;
    const upload = document.getElementById('e-img-upload');
    const preview = document.getElementById('e-img-preview');
    upload?.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        this.toast.error('Elegí un archivo de imagen válido');
        return;
      }
      try {
        const dataUrl = await readFileAsDataURL(file);
        el.setAttribute('src', dataUrl);
        if (preview) preview.textContent = file.name;
        this.toast.success('Imagen cargada');
      } catch (err) {
        console.error(err);
        this.toast.error('No se pudo cargar la imagen');
      }
    });
  }

  // ---- Save to localStorage ---------------------------------------

  _saveChanges(el, selector, page) {
    const pageOverrides = this.storage.getPageOverrides(page);
    const tag = el.tagName.toLowerCase();

    // Push to undo stack (snapshot before save)
    this.undo.push({ page, selector, prev: JSON.parse(JSON.stringify(pageOverrides[selector] || {})) });

    const changes = {};

    // Content
    if (tag === 'img') {
      changes.src = el.getAttribute('src');
      changes.alt = el.getAttribute('alt');
    } else if (tag === 'a') {
      changes.text = el.textContent;
      changes.href = el.getAttribute('href');
    } else {
      changes.text = el.textContent;
    }

    // Styles (only non-empty)
    const styles = {};
    const props = ['color','backgroundColor','fontSize','fontWeight','lineHeight',
                   'opacity','padding','margin','borderRadius','display'];
    props.forEach(p => {
      if (el.style[p]) styles[p] = el.style[p];
    });
    if (Object.keys(styles).length) changes.styles = styles;

    pageOverrides[selector] = { tag, changes };
    this.storage.setPageOverrides(page, pageOverrides);

    // Feedback
    const btn = document.getElementById('e-save');
    if (btn) {
      btn.textContent = '✓ Guardado';
      btn.classList.add('saved');
      setTimeout(() => {
        btn.textContent = 'Guardar cambios';
        btn.classList.remove('saved');
      }, 1800);
    }
    this.toast.success('Cambios guardados');
  }
}

class ProBlockStudio {
  constructor(storage, toast) {
    this.storage = storage;
    this.toast = toast;
    this.pageId = 'home';
    this.currentPage = '';
    this.blocks = [];
    this.activeIndex = 0;
    this.blockTypes = ['hero', 'banner', 'text', 'cards', 'stats', 'image', 'wa', 'form', 'video', 'map', 'divider'];
    this.root = document.createElement('div');
    this.root.className = 'block-studio';
    this.root.innerHTML = `
      <div class="editor-sidebar__section">
        <div class="editor-sidebar__section-title">Bloques</div>
        <div class="block-studio__hint">Armá la página con bloques editables, reordenables y con vista previa instantánea.</div>
        <div class="block-studio__toolbar">
          <select class="editor-sidebar__select" id="pbs-type"></select>
          <button type="button" class="btn btn--sm" id="pbs-add">Agregar</button>
          <button type="button" class="btn btn--ghost btn--sm" id="pbs-reset">Restaurar demo</button>
          <button type="button" class="editor-sidebar__save-btn" id="pbs-save">Guardar</button>
        </div>
        <div class="block-studio__layout">
          <div class="block-studio__list" id="pbs-list"></div>
          <div class="block-studio__editor">
            <div class="block-studio__editor-head">
              <div>
                <div class="block-studio__editor-kicker">Inspector</div>
                <div class="block-studio__editor-title" id="pbs-title">Seleccioná un bloque</div>
              </div>
              <label class="e-toggle" style="padding:0">
                <span class="e-toggle__label">Visible</span>
                <span class="e-toggle__track">
                  <input type="checkbox" id="pbs-visible">
                  <span class="e-toggle__thumb"></span>
                </span>
              </label>
            </div>
            <div class="block-studio__meta" id="pbs-meta"></div>
            <div class="block-studio__form" id="pbs-form"></div>
            <div class="block-studio__json-wrap">
              <label class="field__label">JSON sincronizado</label>
              <textarea class="editor-sidebar__textarea" id="pbs-json" rows="10" spellcheck="false"></textarea>
            </div>
          </div>
        </div>
      </div>
    `;
    this.typeSelect = this.root.querySelector('#pbs-type');
    this.listEl = this.root.querySelector('#pbs-list');
    this.titleEl = this.root.querySelector('#pbs-title');
    this.metaEl = this.root.querySelector('#pbs-meta');
    this.formEl = this.root.querySelector('#pbs-form');
    this.jsonEl = this.root.querySelector('#pbs-json');
    this.addBtn = this.root.querySelector('#pbs-add');
    this.resetBtn = this.root.querySelector('#pbs-reset');
    this.saveBtn = this.root.querySelector('#pbs-save');
    this.visibleEl = this.root.querySelector('#pbs-visible');
    this.typeSelect.innerHTML = this.blockTypes.map(type => `<option value="${type}">${type}</option>`).join('');
    this.addBtn.addEventListener('click', () => this.addBlock(this.typeSelect.value));
    this.resetBtn.addEventListener('click', () => this.reset());
    this.saveBtn.addEventListener('click', () => this.save());
    this.visibleEl.addEventListener('change', () => this.patchActive({ visible: this.visibleEl.checked }));
    this.jsonEl.addEventListener('input', debounce(() => {
      try {
        const parsed = JSON.parse(this.jsonEl.value || '[]');
        if (Array.isArray(parsed)) {
          this.blocks = parsed;
          this.activeIndex = Math.min(this.activeIndex, Math.max(this.blocks.length - 1, 0));
          this.render();
        }
      } catch {}
    }, 350));
  }

  mount(sidebarBody) {
    if (!sidebarBody || sidebarBody.contains(this.root)) return;
    sidebarBody.appendChild(this.root);
  }

  getInitialData(pageId) {
    return {
      pages: [{
        id: pageId,
        blocks: [
          { type: 'hero', visible: true, data: { eyebrow: 'Dojo Shinseikan', title: 'Entrená con enfoque y presencia', lead: 'Una experiencia visual más clara y profesional para comunicar clases, inscripción y shop.', btnText: 'Consultar', btnUrl: '#contacto', cardTitle: 'Próximas clases', cardVal: 'Horarios abiertos', cardLink: 'Ver más', cardLinkUrl: '#clases' } },
          { type: 'text', visible: true, data: { title: 'Disciplina, técnica y comunidad', body: 'Bloques editables desde el admin para construir páginas más ricas sin tocar código.', align: 'left' } },
        ]
      }]
    };
  }

  load(pagePath) {
    this.currentPage = pagePath;
    this.pageId = pathToPageId(pagePath);
    let data;
    try {
      data = JSON.parse(localStorage.getItem('dojo.builder.pages') || 'null');
    } catch {
      data = null;
    }
    if (!data || !Array.isArray(data.pages)) data = this.getInitialData(this.pageId);
    let page = data.pages.find(p => p.id === this.pageId);
    if (!page) {
      page = { id: this.pageId, blocks: this.getInitialData(this.pageId).pages[0].blocks };
      data.pages.push(page);
    }
    this.data = data;
    this.blocks = page.blocks || [];
    this.activeIndex = Math.min(this.activeIndex, Math.max(this.blocks.length - 1, 0));
    this.render();
  }

  render() {
    if (!this.blocks.length) this.blocks = this.getInitialData(this.pageId).pages[0].blocks.slice();
    if (this.activeIndex >= this.blocks.length) this.activeIndex = 0;
    this.listEl.innerHTML = this.blocks.map((block, index) => `
      <div class="block-item ${index === this.activeIndex ? 'is-active' : ''}" data-index="${index}">
        <button type="button" class="block-item__main">
          <span class="block-item__eyebrow">${block.type}</span>
          <span class="block-item__title">${this._esc(this._title(block))}</span>
          <span class="block-item__meta">${block.visible === false ? 'Oculto' : 'Visible'}</span>
        </button>
        <div class="block-item__controls">
          <button type="button" class="block-item__ctrl" data-action="up" data-index="${index}">↑</button>
          <button type="button" class="block-item__ctrl" data-action="down" data-index="${index}">↓</button>
          <button type="button" class="block-item__ctrl" data-action="dup" data-index="${index}">Dup</button>
          <button type="button" class="block-item__ctrl block-item__ctrl--danger" data-action="del" data-index="${index}">Del</button>
        </div>
      </div>
    `).join('');

    const active = this.blocks[this.activeIndex];
    if (!active) return;
    this.visibleEl.checked = active.visible !== false;
    this.titleEl.textContent = `${active.type.toUpperCase()} · Bloque ${this.activeIndex + 1}`;
    this.metaEl.textContent = `Página ${this.pageId} · ${this.blocks.length} bloques`;
    this.formEl.innerHTML = this._fields(active);
    this.jsonEl.value = JSON.stringify(this.blocks, null, 2);
    this._bindList();
    this._bindFields();
  }

  _bindList() {
    this.listEl.querySelectorAll('[data-index]').forEach(item => {
      item.addEventListener('click', (e) => {
        const action = e.target?.dataset?.action;
        const index = parseInt(item.dataset.index, 10);
        if (!action) {
          this.activeIndex = index;
          this.render();
          return;
        }
        e.stopPropagation();
        if (action === 'up') this._move(index, -1);
        if (action === 'down') this._move(index, 1);
        if (action === 'dup') this._dup(index);
        if (action === 'del') this._del(index);
      });
    });
  }

  _fields(block) {
    const d = block.data || {};
    const input = (label, key, value = '', type = 'text') => `
      <div class="block-field">
        <label class="field__label">${label}</label>
        <input class="editor-sidebar__input" data-bind="${key}" type="${type}" value="${this._esc(String(value ?? ''))}" />
      </div>`;
    const area = (label, key, value = '') => `
      <div class="block-field">
        <label class="field__label">${label}</label>
        <textarea class="editor-sidebar__textarea" data-bind="${key}" rows="4">${this._esc(String(value ?? ''))}</textarea>
      </div>`;
    const file = (label, key) => `
      <div class="block-field">
        <label class="field__label">${label}</label>
        <input class="editor-sidebar__input" data-upload="${key}" type="file" accept="image/*" />
      </div>`;
    let html = input('Tipo', 'type', block.type);
    switch (block.type) {
      case 'hero':
        html += input('Eyebrow', 'eyebrow', d.eyebrow);
        html += input('Título', 'title', d.title);
        html += area('Lead', 'lead', d.lead);
        html += input('Botón', 'btnText', d.btnText);
        html += input('URL botón', 'btnUrl', d.btnUrl);
        html += input('Tarjeta título', 'cardTitle', d.cardTitle);
        html += input('Tarjeta valor', 'cardVal', d.cardVal);
        html += input('Tarjeta link', 'cardLink', d.cardLink);
        html += input('Tarjeta URL', 'cardLinkUrl', d.cardLinkUrl);
        break;
      case 'banner':
        html += input('Título', 'title', d.title);
        html += area('Subtítulo', 'subtitle', d.subtitle);
        html += input('Altura', 'height', d.height);
        html += input('Imagen', 'imageUrl', d.imageUrl);
        html += file('Subir imagen', 'imageUrl');
        html += input('Opacidad overlay', 'overlayOpacity', d.overlayOpacity, 'number');
        html += input('Botón 1', 'btn1Text', d.btn1Text);
        html += input('Botón 1 URL', 'btn1Url', d.btn1Url);
        html += input('Botón 2', 'btn2Text', d.btn2Text);
        html += input('Botón 2 URL', 'btn2Url', d.btn2Url);
        break;
      case 'text':
        html += input('Título', 'title', d.title);
        html += area('Cuerpo', 'body', d.body);
        html += input('Alineación', 'align', d.align);
        break;
      case 'cards':
        html += input('Título', 'title', d.title);
        html += input('Columnas', 'cols', d.cols, 'number');
        html += area('Items JSON', 'items', JSON.stringify(d.items || [], null, 2));
        break;
      case 'stats':
        html += area('Items JSON', 'items', JSON.stringify(d.items || [], null, 2));
        break;
      case 'image':
        html += input('Leyenda', 'caption', d.caption);
        html += input('URL imagen', 'imageUrl', d.imageUrl);
        html += file('Subir imagen', 'imageUrl');
        html += input('Ancho', 'width', d.width);
        html += input('Redondeado', 'rounded', d.rounded ? 'true' : 'false');
        break;
      case 'wa':
        html += input('Título', 'title', d.title);
        html += area('Subtítulo', 'sub', d.sub);
        html += input('Texto botón', 'btnText', d.btnText);
        html += input('Color botón', 'btnColor', d.btnColor);
        break;
      case 'form':
        html += input('Título', 'title', d.title);
        html += input('Label botón', 'btnLabel', d.btnLabel);
        html += input('Color botón', 'btnColor', d.btnColor);
        break;
      case 'video':
        html += input('Título', 'title', d.title);
        html += input('URL video', 'url', d.url);
        break;
      case 'map':
        html += input('Embed URL', 'embedUrl', d.embedUrl);
        html += input('Altura', 'height', d.height, 'number');
        break;
      case 'divider':
        html += input('Texto', 'text', d.text);
        html += input('Color de línea', 'lineColor', d.lineColor);
        break;
    }
    return html;
  }

  _bindFields() {
    this.formEl.querySelectorAll('[data-bind]').forEach(el => {
      el.addEventListener('input', () => {
        const key = el.getAttribute('data-bind');
        const block = this.blocks[this.activeIndex];
        if (!block) return;
        let value = el.value;
        if (key === 'type') return;
        if (key === 'rounded') value = el.value === 'true';
        if (key === 'cols' || key === 'overlayOpacity' || key === 'height') {
          const parsed = parseFloat(el.value);
          value = Number.isNaN(parsed) ? el.value : parsed;
        }
        if (key === 'items') {
          try { value = JSON.parse(el.value || '[]'); } catch { return; }
        }
        if (block.data == null) block.data = {};
        block.data[key] = value;
        this.jsonEl.value = JSON.stringify(this.blocks, null, 2);
      });
    });
    this.formEl.querySelectorAll('[data-upload]').forEach(el => {
      el.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) return this.toast.error('Archivo inválido');
        const dataUrl = await readFileAsDataURL(file);
        const block = this.blocks[this.activeIndex];
        if (!block) return;
        block.data[el.getAttribute('data-upload')] = dataUrl;
        this.formEl.querySelector(`[data-bind="${el.getAttribute('data-upload')}"]`)?.setAttribute('value', dataUrl);
        this.jsonEl.value = JSON.stringify(this.blocks, null, 2);
        this.toast.success('Imagen cargada');
      });
    });
  }

  _move(index, delta) {
    const target = index + delta;
    if (target < 0 || target >= this.blocks.length) return;
    const copy = this.blocks.slice();
    const [item] = copy.splice(index, 1);
    copy.splice(target, 0, item);
    this.blocks = copy;
    this.activeIndex = target;
    this.render();
  }

  _dup(index) {
    const item = this.blocks[index];
    if (!item) return;
    this.blocks.splice(index + 1, 0, JSON.parse(JSON.stringify(item)));
    this.activeIndex = index + 1;
    this.render();
  }

  _del(index) {
    if (this.blocks.length <= 1) return this.toast.info('No se puede borrar el último bloque');
    this.blocks.splice(index, 1);
    this.activeIndex = Math.max(0, index - 1);
    this.render();
  }

  addBlock(type) {
    this.blocks.splice(this.activeIndex + 1, 0, this._template(type));
    this.activeIndex += 1;
    this.render();
    this.toast.success('Bloque agregado');
  }

  _template(type) {
    const templates = {
      hero: { type, visible: true, data: { eyebrow: 'Nuevo bloque', title: 'Título principal', lead: 'Texto introductorio', btnText: 'Acción', btnUrl: '#', cardTitle: 'Tarjeta', cardVal: 'Dato', cardLink: 'Ver más', cardLinkUrl: '#' } },
      banner: { type, visible: true, data: { title: 'Banner destacado', subtitle: 'Subtítulo', height: 'medium', overlayOpacity: 45, btn1Text: 'Acción 1', btn2Text: 'Acción 2' } },
      text: { type, visible: true, data: { title: 'Título', body: 'Texto del bloque', align: 'left' } },
      cards: { type, visible: true, data: { title: 'Tarjetas', cols: 3, items: [{ tag: 'Tag', title: 'Item', text: 'Descripción', link: '#' }] } },
      stats: { type, visible: true, data: { items: [{ num: '01', label: 'Dato' }] } },
      image: { type, visible: true, data: { caption: 'Leyenda', width: 'full', rounded: true, imageUrl: '' } },
      wa: { type, visible: true, data: { title: '¿Querés más info?', sub: 'Escribinos por WhatsApp', btnText: 'Hablar', btnColor: '#d10a0a' } },
      form: { type, visible: true, data: { title: 'Inscripción', btnLabel: 'Enviar por WhatsApp', btnColor: '#d10a0a' } },
      video: { type, visible: true, data: { title: 'Video', url: '' } },
      map: { type, visible: true, data: { embedUrl: '', height: 180 } },
      divider: { type, visible: true, data: { text: 'Sección', lineColor: 'rgba(0,0,0,.12)' } },
    };
    return JSON.parse(JSON.stringify(templates[type] || templates.text));
  }

  patchActive(patch) {
    const block = this.blocks[this.activeIndex];
    if (!block) return;
    Object.assign(block, patch);
    this.jsonEl.value = JSON.stringify(this.blocks, null, 2);
  }

  save() {
    if (!this.data) return;
    const page = this.data.pages.find(p => p.id === this.pageId);
    if (!page) return;
    page.blocks = this.blocks;
    localStorage.setItem('dojo.builder.pages', JSON.stringify(this.data));
    this.toast.success('Bloques guardados');
  }

  reset() {
    const demo = this.getInitialData(this.pageId);
    localStorage.setItem('dojo.builder.pages', JSON.stringify(demo));
    this.data = demo;
    this.blocks = demo.pages[0].blocks;
    this.activeIndex = 0;
    this.render();
    this.toast.success('Bloques demo restaurados');
  }

  _title(block) {
    const d = block.data || {};
    return d.title || d.eyebrow || d.text || d.subtitle || 'Sin título';
  }

  _esc(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}

/* ============================================================
   BuilderCore
   ============================================================ */

class BuilderCore {
  constructor() {
    this.editMode    = false;
    this.currentPage = '';
    this.viewport    = 'desktop';

    // DOM refs
    this.iframe      = document.getElementById('builder-frame');
    this.frameWrap   = this.iframe?.parentElement;
    this.overlay     = document.getElementById('editor-overlay');
    this.sidebarEl   = document.getElementById('editor-sidebar');
    this.pageSelect  = document.getElementById('page-select');
    this.toggleBtn   = document.getElementById('toggle-edit-mode');
    this.resetBtn    = document.getElementById('reset-page');
    this.exportBtn   = document.getElementById('export-json');
    this.copyBtn     = document.getElementById('copy-overrides');
    this.statusEl    = document.getElementById('builder-status-text');
    this.statusWrap  = this.statusEl?.closest('.builder-status-bar') || null;

    // Managers
    this.storage = new StorageManager();
    this.toast   = new Toast();
    this.undo    = new UndoStack();
    this.overlayMgr = new OverlayManager(this.overlay, this.iframe);
    this.sidebarMgr = new SidebarManager(this.sidebarEl, this.storage, this.toast, this.undo);
    this.blockStudio = new ProBlockStudio(this.storage, this.toast);

    // Wire overlay select callback
    this.overlayMgr.onSelect = (el) => {
      this.sidebarMgr.renderForElement(el, this.currentPage);
      this.blockStudio?.mount(this.sidebarMgr._body);
      if (window.innerWidth <= 820) {
        this.sidebarEl?.classList.add('is-open');
      }
    };

    this._init();
  }

  /* ---- Init ----------------------------------------------------- */

  _init() {
    // Page navigation
    this.pageSelect?.addEventListener('change', (e) => this.loadPage(e.target.value));

    // Toggle edit mode
    this.toggleBtn?.addEventListener('click', () => this.toggleEditMode());

    // Reset
    this.resetBtn?.addEventListener('click', () => this._resetPage());

    // Export all JSON
    this.exportBtn?.addEventListener('click', () => this._exportAll());

    // Copy page JSON
    this.copyBtn?.addEventListener('click', () => this._copyPage());

    // Viewport switcher buttons
    document.querySelectorAll('[data-vp]').forEach(btn => {
      btn.addEventListener('click', () => {
        const vp = btn.dataset.vp;
        this._setViewport(vp);
        document.querySelectorAll('[data-vp]').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
      });
    });

    // JSON panel toggle
    document.getElementById('toggle-json-panel')?.addEventListener('click', () => {
      document.getElementById('json-panel')?.classList.toggle('is-open');
    });

    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'e') { e.preventDefault(); this.toggleEditMode(); }
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); this._undoLast(); }
      if (e.key === 'Escape' && this.editMode) this.toggleEditMode();
    });

    // Load initial page
    this.loadPage(this.pageSelect?.value || '/');
  }

  /* ---- Page loading --------------------------------------------- */

  loadPage(pagePath) {
    this.currentPage = pagePath;
    this.blockStudio?.load(pagePath);
    this.frameWrap?.classList.add('loading');
    if (this.iframe) this.iframe.src = pagePath;

    const onLoad = () => {
      this.frameWrap?.classList.remove('loading');
      const doc = this.iframe?.contentDocument;
      if (!doc) return;

      this.overlayMgr.attach(doc);
      this._applyOverrides(doc, pagePath);

      // Ctrl+E inside iframe
      doc.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'e') { e.preventDefault(); this.toggleEditMode(); }
      });

      this._setStatus(`Cargado: ${pagePath}`, 2000);
    };

    if (this.iframe) {
      this.iframe.addEventListener('load', onLoad, { once: true });
    }

    // Reset state
    if (this.editMode) this.toggleEditMode();
  }

  /* ---- Edit mode ------------------------------------------------ */

  toggleEditMode() {
    this.editMode = !this.editMode;

    if (this.editMode) {
      this.toggleBtn?.classList.add('is-active');
      if (this.toggleBtn) this.toggleBtn.textContent = 'Edición activa';
      this.overlayMgr.enable();
      this.sidebarEl?.style.removeProperty('display');
      this.blockStudio?.mount(this.sidebarMgr._body);
      this._setStatus('Clic en cualquier elemento para editarlo', 0);
      this.toast.info('Modo edición activado — Ctrl+E para salir');
    } else {
      this.toggleBtn?.classList.remove('is-active');
      if (this.toggleBtn) this.toggleBtn.textContent = 'Editar (Ctrl+E)';
      this.overlayMgr.disable();
      this.sidebarMgr._renderEmpty();
      if (window.innerWidth <= 820) this.sidebarEl?.classList.remove('is-open');
      this.statusWrap?.classList.remove('is-visible');
    }
  }

  /* ---- Viewport ------------------------------------------------- */

  _setViewport(vp) {
    this.viewport = vp;
    if (!this.frameWrap) return;
    this.frameWrap.className = 'builder-frame-container';
    if (vp !== 'desktop') this.frameWrap.classList.add(`device-${vp}`);
  }

  /* ---- Apply saved overrides ------------------------------------ */

  _applyOverrides(doc, page) {
    const overrides = this.storage.getPageOverrides(page);
    let count = 0;
    Object.entries(overrides).forEach(([selector, override]) => {
      try {
        const el = doc.querySelector(selector);
        if (!el) return;
        const ch = override.changes || {};

        if (ch.text !== undefined && el.tagName !== 'IMG') el.textContent = ch.text;
        if (ch.src)  el.setAttribute('src',  ch.src);
        if (ch.alt)  el.setAttribute('alt',  ch.alt);
        if (ch.href) el.setAttribute('href', ch.href);
        if (ch.styles) Object.assign(el.style, ch.styles);
        count++;
      } catch (err) {
        console.warn('[Builder] Could not apply override for selector:', selector, err);
      }
    });
    if (count > 0) this._setStatus(`${count} override${count > 1 ? 's' : ''} aplicado${count > 1 ? 's' : ''}`, 2500);
  }

  /* ---- Reset ---------------------------------------------------- */

  _resetPage() {
    const confirmed = window.confirm(`¿Resetear todos los cambios de "${this.currentPage}"? Esta acción no se puede deshacer.`);
    if (!confirmed) return;
    this.storage.clearPage(this.currentPage);
    this.iframe?.contentWindow?.location.reload();
    this.toast.success('Página reseteada');
  }

  /* ---- Undo ----------------------------------------------------- */

  _undoLast() {
    if (!this.undo.length) { this.toast.info('Nada para deshacer'); return; }
    const { page, selector, prev } = this.undo.pop();
    const overrides = this.storage.getPageOverrides(page);
    if (Object.keys(prev).length === 0) {
      delete overrides[selector];
    } else {
      overrides[selector] = prev;
    }
    this.storage.setPageOverrides(page, overrides);

    // Reapply in iframe
    const doc = this.iframe?.contentDocument;
    if (doc) {
      const el = doc.querySelector(selector);
      if (el) {
        if (prev.changes?.styles) Object.assign(el.style, prev.changes.styles);
        if (prev.changes?.text)   el.textContent = prev.changes.text;
        if (prev.changes?.src)    el.setAttribute('src', prev.changes.src);
        if (prev.changes?.href)   el.setAttribute('href', prev.changes.href);
      }
    }

    this.toast.info('Deshacer aplicado');
  }

  /* ---- Export --------------------------------------------------- */

  _exportAll() {
    const json = this.storage.exportAll();
    this._copyToClipboard(json, 'JSON completo copiado al portapapeles');
    this._showJsonPanel(json);
  }

  _copyPage() {
    const json = this.storage.exportPage(this.currentPage);
    this._copyToClipboard(json, 'Overrides de la página copiados');
    this._showJsonPanel(json);
  }

  _copyToClipboard(text, successMsg) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(
        () => this.toast.success(successMsg),
        () => this._fallbackCopy(text, successMsg)
      );
    } else {
      this._fallbackCopy(text, successMsg);
    }
  }

  _fallbackCopy(text, successMsg) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    this.toast.success(successMsg);
  }

  _showJsonPanel(json) {
    const panel = document.getElementById('json-panel');
    const code  = document.getElementById('json-panel-code');
    if (code) code.textContent = json;
    if (panel) panel.classList.add('is-open');
  }

  /* ---- Status bar ----------------------------------------------- */

  _setStatus(msg, duration = 0) {
    if (!this.statusEl) return;
    this.statusEl.textContent = msg;
    this.statusWrap?.classList.add('is-visible');
    if (duration > 0) {
      clearTimeout(this._statusTimer);
      this._statusTimer = setTimeout(() => {
        this.statusWrap?.classList.remove('is-visible');
      }, duration);
    }
  }
}

/* ============================================================
   Global boot
   ============================================================ */

let builderCore;

window.initBuilder = () => {
  if (!builderCore) {
    builderCore = new BuilderCore();
    window.builderCore = builderCore;
  }
};

// Auto-boot if the builder shell is present
if (document.getElementById('builder-frame')) {
  window.initBuilder();
}

class BlockStudio {
  constructor(storage, toast) {
    this.storage = storage;
    this.toast = toast;
    this.currentPage = 'home';
    this.pageId = 'home';
    this.root = document.createElement('div');
    this.root.className = 'block-studio';
    this.root.innerHTML = `
      <div class="editor-sidebar__section">
        <div class="editor-sidebar__section-title">Bloques</div>
        <div class="block-studio__hint">Editá la estructura visual de la página con bloques reutilizables.</div>
        <div class="block-studio__actions">
          <button type="button" class="editor-sidebar__save-btn" id="block-studio-save">Guardar bloques</button>
          <button type="button" class="btn btn--ghost btn--sm" id="block-studio-reset">Restaurar demo</button>
        </div>
        <div class="field" style="margin-top:12px">
          <label class="field__label">JSON de bloques</label>
          <textarea class="editor-sidebar__textarea" id="block-studio-json" rows="14" spellcheck="false"></textarea>
          <div class="field__hint">Podés pegar o editar el JSON completo. También admite imágenes en base64 para carga rápida.</div>
        </div>
      </div>
    `;
    this.jsonEl = this.root.querySelector('#block-studio-json');
    this.saveBtn = this.root.querySelector('#block-studio-save');
    this.resetBtn = this.root.querySelector('#block-studio-reset');
    this.saveBtn?.addEventListener('click', () => this.save());
    this.resetBtn?.addEventListener('click', () => this.reset());
  }

  mount(sidebarBody) {
    if (!sidebarBody || sidebarBody.querySelector('.block-studio')) return;
    sidebarBody.appendChild(this.root);
  }

  getInitialData(pageId) {
    const demo = {
      pages: [
        {
          id: pageId,
          blocks: [
            {
              type: 'hero',
              visible: true,
              data: {
                eyebrow: 'Dojo Shinseikan',
                title: 'Entrená con enfoque y presencia',
                lead: 'Una experiencia visual más clara y profesional para comunicar clases, inscripción y shop.',
                btnText: 'Consultar',
                btnUrl: '#contacto',
                cardTitle: 'Próximas clases',
                cardVal: 'Horarios abiertos',
                cardLink: 'Ver más',
                cardLinkUrl: '#clases'
              }
            },
            {
              type: 'text',
              visible: true,
              data: {
                title: 'Disciplina, técnica y comunidad',
                body: 'Bloques editables desde el admin para construir páginas más ricas sin tocar código.',
                align: 'left'
              }
            }
          ]
        }
      ]
    };
    return demo;
  }

  load(pagePath) {
    this.currentPage = pagePath;
    this.pageId = pathToPageId(pagePath);
    const raw = localStorage.getItem('dojo.builder.pages');
    let data;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      data = null;
    }
    if (!data || !Array.isArray(data.pages)) data = this.getInitialData(this.pageId);
    let page = data.pages.find(p => p.id === this.pageId);
    if (!page) {
      page = { id: this.pageId, blocks: this.getInitialData(this.pageId).pages[0].blocks };
      data.pages.push(page);
    }
    this.data = data;
    this.jsonEl.value = JSON.stringify(page.blocks, null, 2);
  }

  save() {
    if (!this.data) return;
    try {
      const blocks = JSON.parse(this.jsonEl.value || '[]');
      const page = this.data.pages.find(p => p.id === this.pageId);
      if (!page) return;
      page.blocks = Array.isArray(blocks) ? blocks : [];
      localStorage.setItem('dojo.builder.pages', JSON.stringify(this.data));
      this.toast.success('Bloques guardados');
    } catch (err) {
      this.toast.error('JSON inválido');
    }
  }

  reset() {
    const demo = this.getInitialData(this.pageId);
    localStorage.setItem('dojo.builder.pages', JSON.stringify(demo));
    this.data = demo;
    this.jsonEl.value = JSON.stringify(demo.pages[0].blocks, null, 2);
    this.toast.success('Bloques demo restaurados');
  }
}
