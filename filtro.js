/**
 * SISTEMA DE FILTRO DE PRODUTOS — Couty
 * Filtragem por categoria + busca por nome + ordenação
 * Integra com o MutationObserver do orcamento.js
 */

(function () {
  'use strict';

  /* =========================================================
     Config
  ========================================================= */

  const CONFIG = {
    // Seletor da grade de produtos
    gridSelector: '.product-grid',
    // Seletor individual de cada card
    cardSelector: '.product-card',
    // Seletor do elemento de categoria dentro do card
    categorySelector: '.card-category',
    // Seletor do nome do produto dentro do card
    nameSelector: '.card-name',
    // Seletor de onde injetar os filtros (antes da grade)
    headerSelector: '.section-header',
    // Delay debounce para busca (ms)
    searchDebounce: 220,
  };

  /* =========================================================
     Classe principal
  ========================================================= */

  class FiltroManager {
    constructor() {
      this.grid       = document.querySelector(CONFIG.gridSelector);
      this.header     = document.querySelector(CONFIG.headerSelector);
      if (!this.grid || !this.header) return;

      this.categoriaAtiva = 'todos';
      this.termoBusca     = '';
      this.ordenacao      = 'padrao';
      this.cards          = [];        // cache de cards com metadados
      this._searchTimer   = null;

      this.init();
    }

    /* --------------------------------------------------
       Init
    -------------------------------------------------- */
    init() {
      this.buildCardsCache();
      this.buildUI();
      this.bindEvents();
      this.applyFilters();
    }

    /* --------------------------------------------------
       Cache dos cards com metadados extraídos do DOM
    -------------------------------------------------- */
    buildCardsCache() {
      const els = this.grid.querySelectorAll(CONFIG.cardSelector);
      this.cards = Array.from(els).map((el, idx) => {
        const catEl  = el.querySelector(CONFIG.categorySelector);
        const nameEl = el.querySelector(CONFIG.nameSelector);
        const cat    = (catEl?.textContent?.trim() || '').toLowerCase();
        const name   = (nameEl?.textContent?.trim() || '').toLowerCase();
        return { el, cat, name, originalIndex: idx };
      });
    }

    /* --------------------------------------------------
       Categorias únicas detectadas automaticamente
    -------------------------------------------------- */
    getCategories() {
      const seen = new Set();
      this.cards.forEach(c => { if (c.cat) seen.add(c.cat); });
      return Array.from(seen).sort();
    }

    /* --------------------------------------------------
       Constrói o HTML dos filtros e injeta no DOM
    -------------------------------------------------- */
    buildUI() {
      const cats = this.getCategories();
      const total = this.cards.length;

      const wrap = document.createElement('div');
      wrap.className = 'filtro-section';
      wrap.id = 'filtro-section';
      wrap.innerHTML = `
        <div class="filtro-wrap">

          <!-- Linha 1: Busca + Sort + Contador -->
          <div class="filtro-top">
            <div class="filtro-search-wrap">
              <span class="filtro-search-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
              </span>
              <input
                type="search"
                class="filtro-search"
                id="filtro-search"
                placeholder="Buscar modelo..."
                autocomplete="off"
                spellcheck="false"
                aria-label="Buscar produtos"
              >
              <button class="filtro-search-clear" id="filtro-search-clear" aria-label="Limpar busca" title="Limpar">✕</button>
            </div>

            <div class="filtro-sort-wrap">
              <span class="filtro-sort-label">Ordenar</span>
              <select class="filtro-sort" id="filtro-sort" aria-label="Ordenar produtos">
                <option value="padrao">Padrão</option>
                <option value="az">A → Z</option>
                <option value="za">Z → A</option>
              </select>
            </div>

            <span class="filtro-counter" id="filtro-counter">
              <strong>${total}</strong> produto${total !== 1 ? 's' : ''}
            </span>
          </div>

          <!-- Linha 2: Pills de categoria -->
          <div class="filtro-categorias" role="group" aria-label="Filtrar por categoria">
            <span class="filtro-label">Categoria</span>
            <button class="filtro-pill active" data-cat="todos" aria-pressed="true">
              <span class="filtro-pill-dot"></span>Todos
            </button>
            ${cats.map(cat => `
              <button class="filtro-pill" data-cat="${cat}" aria-pressed="false">
                <span class="filtro-pill-dot"></span>${this.capitalize(cat)}
              </button>
            `).join('')}
          </div>

          <div class="filtro-divider"></div>
        </div>
      `;

      // Insere APÓS o .section-header
      this.header.insertAdjacentElement('afterend', wrap);

      // Estado vazio — inserido dentro da grid
      const emptyEl = document.createElement('div');
      emptyEl.className = 'filtro-empty';
      emptyEl.id = 'filtro-empty';
      emptyEl.innerHTML = `
        <span class="filtro-empty-icon">🥾</span>
        <div class="filtro-empty-title">Nenhum modelo encontrado</div>
        <p class="filtro-empty-text">Tente outro termo ou remova os filtros.</p>
        <button class="filtro-empty-reset" id="filtro-empty-reset">Limpar filtros</button>
      `;
      this.grid.appendChild(emptyEl);
    }

    /* --------------------------------------------------
       Bind de eventos
    -------------------------------------------------- */
    bindEvents() {
      // Pills de categoria
      document.querySelectorAll('.filtro-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          this.categoriaAtiva = pill.dataset.cat;
          document.querySelectorAll('.filtro-pill').forEach(p => {
            p.classList.toggle('active', p === pill);
            p.setAttribute('aria-pressed', p === pill ? 'true' : 'false');
          });
          this.applyFilters();
        });
      });

      // Input de busca (com debounce)
      const searchInput = document.getElementById('filtro-search');
      const clearBtn    = document.getElementById('filtro-search-clear');

      if (searchInput) {
        searchInput.addEventListener('input', () => {
          this.termoBusca = searchInput.value.trim().toLowerCase();
          clearBtn?.classList.toggle('visible', this.termoBusca.length > 0);
          clearTimeout(this._searchTimer);
          this._searchTimer = setTimeout(() => this.applyFilters(), CONFIG.searchDebounce);
        });
      }

      // Limpar busca
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          if (searchInput) searchInput.value = '';
          this.termoBusca = '';
          clearBtn.classList.remove('visible');
          this.applyFilters();
          searchInput?.focus();
        });
      }

      // Ordenação
      const sortSelect = document.getElementById('filtro-sort');
      if (sortSelect) {
        sortSelect.addEventListener('change', () => {
          this.ordenacao = sortSelect.value;
          this.applyFilters();
        });
      }

      // Botão "Limpar filtros" no estado vazio
      document.getElementById('filtro-empty-reset')?.addEventListener('click', () => {
        this.resetAll();
      });
    }

    /* --------------------------------------------------
       Aplica filtros + ordenação + animação
    -------------------------------------------------- */
    applyFilters() {
      // 1. Filtra
      const visible = this.cards.filter(c => {
        const matchCat  = this.categoriaAtiva === 'todos' || c.cat === this.categoriaAtiva;
        const matchName = !this.termoBusca || c.name.includes(this.termoBusca);
        return matchCat && matchName;
      });

      // 2. Ordena
      const sorted = [...visible];
      if (this.ordenacao === 'az') {
        sorted.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
      } else if (this.ordenacao === 'za') {
        sorted.sort((a, b) => b.name.localeCompare(a.name, 'pt-BR'));
      } else {
        sorted.sort((a, b) => a.originalIndex - b.originalIndex);
      }

      // 3. Esconde todos
      this.cards.forEach(c => {
        c.el.classList.add('filtro-hidden');
        c.el.classList.remove('filtro-fade-in');
      });

      // 4. Reordena no DOM e exibe com animação escalonada
      sorted.forEach((c, i) => {
        c.el.classList.remove('filtro-hidden');
        this.grid.appendChild(c.el); // move para o fim (mantém ordem)
        // Animação escalonada leve
        c.el.style.animationDelay = `${Math.min(i * 35, 280)}ms`;
        c.el.classList.add('filtro-fade-in');
      });

      // 5. Atualiza contador
      const counter = document.getElementById('filtro-counter');
      if (counter) {
        const n = sorted.length;
        counter.innerHTML = `<strong>${n}</strong> produto${n !== 1 ? 's' : ''}`;
      }

      // 6. Estado vazio
      const emptyEl = document.getElementById('filtro-empty');
      if (emptyEl) {
        emptyEl.classList.toggle('visible', sorted.length === 0);
      }

      // 7. Move o empty para o final da grid sempre
      const empty = document.getElementById('filtro-empty');
      if (empty) this.grid.appendChild(empty);
    }

    /* --------------------------------------------------
       Reset completo
    -------------------------------------------------- */
    resetAll() {
      this.categoriaAtiva = 'todos';
      this.termoBusca     = '';
      this.ordenacao      = 'padrao';

      // Reseta pills
      document.querySelectorAll('.filtro-pill').forEach(p => {
        const isTodos = p.dataset.cat === 'todos';
        p.classList.toggle('active', isTodos);
        p.setAttribute('aria-pressed', isTodos ? 'true' : 'false');
      });

      // Reseta busca
      const searchInput = document.getElementById('filtro-search');
      if (searchInput) searchInput.value = '';
      document.getElementById('filtro-search-clear')?.classList.remove('visible');

      // Reseta sort
      const sortSelect = document.getElementById('filtro-sort');
      if (sortSelect) sortSelect.value = 'padrao';

      this.applyFilters();
    }

    /* --------------------------------------------------
       Utility
    -------------------------------------------------- */
    capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    debounce(fn, wait) {
      let t;
      return (...args) => { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), wait); };
    }
  }

  /* =========================================================
     Bootstrap — aguarda DOM
  ========================================================= */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new FiltroManager());
  } else {
    new FiltroManager();
  }

})();
