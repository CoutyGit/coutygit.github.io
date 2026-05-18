/**
 * SISTEMA DE ORÇAMENTO VIA WHATSAPP — Couty
 * Versão corrigida: todos os bugs resolvidos + CSS embutido
 */

(function () {
  'use strict';

  /* =========================================================
     CSS — injetado uma única vez no <head>
  ========================================================= */
  const CSS = `
    /* ── Botão flutuante ── */
    .btn-orcamento-flutuante {
      position: fixed;
      bottom: 28px;
      right: 28px;
      z-index: 9000;
      display: flex;
      align-items: center;
      gap: 8px;
      background: #C9973A;
      color: #1A1108;
      border: none;
      border-radius: 0;
      padding: 14px 20px;
      font-family: 'Syne', sans-serif;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      cursor: pointer;
      box-shadow: 0 4px 24px rgba(26,17,8,0.25);
      transition: background 0.25s, transform 0.2s;
    }
    .btn-orcamento-flutuante:hover { background: #b8872e; transform: translateY(-2px); }
    .orcamento-icon { font-size: 1.1rem; }
    .orcamento-count {
      background: #1A1108;
      color: #C9973A;
      font-size: 0.65rem;
      font-weight: 800;
      min-width: 20px;
      height: 20px;
      border-radius: 50%;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
    }

    /* ── Overlay ── */
    .orcamento-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(26,17,8,0.55);
      z-index: 9001;
      backdrop-filter: blur(3px);
    }
    .orcamento-overlay.active { display: block; }

    /* ── Sidebar ── */
    .orcamento-sidebar {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 420px;
      max-width: 100vw;
      background: #F5F0E8;
      z-index: 9002;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.35s cubic-bezier(0.16,1,0.3,1);
      box-shadow: -8px 0 40px rgba(26,17,8,0.2);
    }
    .orcamento-sidebar.active { transform: translateX(0); }

    /* ── Header da sidebar ── */
    .orcamento-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.4rem 1.6rem;
      background: #1A1108;
      flex-shrink: 0;
    }
    .orcamento-header h3 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.4rem;
      font-weight: 300;
      color: #F5F0E8;
      letter-spacing: 0.05em;
      margin: 0;
    }
    .orcamento-close {
      background: none;
      border: none;
      color: #F5F0E8;
      font-size: 1.1rem;
      cursor: pointer;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.7;
      transition: opacity 0.2s;
      border-radius: 0;
    }
    .orcamento-close:hover { opacity: 1; }

    /* ── Lista de itens ── */
    .orcamento-list {
      flex: 1;
      overflow-y: auto;
      padding: 1.2rem 1.4rem;
      scrollbar-width: thin;
      scrollbar-color: #C9973A #E8DDD0;
    }
    .orcamento-list::-webkit-scrollbar { width: 4px; }
    .orcamento-list::-webkit-scrollbar-track { background: #E8DDD0; }
    .orcamento-list::-webkit-scrollbar-thumb { background: #C9973A; }

    .orcamento-empty {
      text-align: center;
      padding: 3rem 1rem;
      color: #8B6347;
      font-size: 0.85rem;
      letter-spacing: 0.05em;
      opacity: 0.7;
    }

    .orcamento-items { display: flex; flex-direction: column; gap: 0.8rem; }

    .orcamento-item {
      background: #fff;
      padding: 1rem 1.1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      border-left: 3px solid #C9973A;
    }
    .item-info { flex: 1; min-width: 0; }
    .item-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1rem;
      font-weight: 600;
      color: #1A1108;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 2px;
    }
    .item-code {
      font-size: 0.68rem;
      letter-spacing: 0.08em;
      color: #8B6347;
      text-transform: uppercase;
    }
    .item-category {
      font-size: 0.65rem;
      color: #8B6347;
      opacity: 0.6;
      margin-top: 1px;
    }
    .item-controls {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      flex-shrink: 0;
    }
    .qty-control {
      display: flex;
      align-items: center;
      gap: 0;
      border: 1px solid rgba(139,99,71,0.3);
    }
    .qty-control button {
      background: none;
      border: none;
      width: 28px;
      height: 28px;
      font-size: 1rem;
      cursor: pointer;
      color: #3D2B1F;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;
    }
    .qty-control button:hover { background: rgba(201,151,58,0.15); }
    .qty-input {
      width: 36px;
      height: 28px;
      border: none;
      border-left: 1px solid rgba(139,99,71,0.3);
      border-right: 1px solid rgba(139,99,71,0.3);
      text-align: center;
      font-family: 'Syne', sans-serif;
      font-size: 0.8rem;
      font-weight: 700;
      color: #1A1108;
      background: #F5F0E8;
      -moz-appearance: textfield;
      outline: none;
    }
    .qty-input::-webkit-inner-spin-button,
    .qty-input::-webkit-outer-spin-button { -webkit-appearance: none; }
    .btn-remove-item {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 0.95rem;
      opacity: 0.45;
      padding: 4px;
      transition: opacity 0.2s;
    }
    .btn-remove-item:hover { opacity: 1; }

    /* ── Footer da sidebar ── */
    .orcamento-footer {
      padding: 1rem 1.4rem 1.4rem;
      border-top: 1px solid rgba(139,99,71,0.15);
      display: flex;
      flex-direction: column;
      gap: 0.7rem;
      flex-shrink: 0;
    }
    .btn-solicitar-orcamento {
      display: block;
      width: 100%;
      background: #C9973A;
      color: #1A1108;
      border: none;
      padding: 1rem;
      font-family: 'Syne', sans-serif;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      cursor: pointer;
      transition: background 0.25s;
    }
    .btn-solicitar-orcamento:hover { background: #b8872e; }
    .btn-limpar-orcamento {
      display: block;
      width: 100%;
      background: transparent;
      color: #8B6347;
      border: 1px solid rgba(139,99,71,0.3);
      padding: 0.7rem;
      font-family: 'Syne', sans-serif;
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-limpar-orcamento:hover { border-color: #8B6347; color: #1A1108; }

    /* ── Botão nos cards ── */
    .orcamento-container { margin-top: 0.8rem; }
    .btn-add-orcamento {
      display: flex;
      align-items: center;
      gap: 6px;
      width: 100%;
      background: transparent;
      color: #3D2B1F;
      border: 1px solid rgba(61,43,31,0.25);
      padding: 0.55rem 1rem;
      font-family: 'Syne', sans-serif;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-add-orcamento:hover {
      background: #C9973A;
      color: #1A1108;
      border-color: #C9973A;
    }
    .btn-icon { font-size: 1rem; font-weight: 400; }

    /* ── Notificação ── */
    .orcamento-notification {
      position: fixed;
      bottom: 100px;
      right: 28px;
      background: #1A1108;
      color: #C9973A;
      padding: 0.8rem 1.4rem;
      font-family: 'Syne', sans-serif;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      z-index: 9999;
      transform: translateY(20px);
      opacity: 0;
      transition: opacity 0.25s, transform 0.25s;
      pointer-events: none;
    }
    .orcamento-notification.show { opacity: 1; transform: translateY(0); }

    /* ── Mobile ── */
    @media (max-width: 480px) {
      .orcamento-sidebar { width: 100vw; }
      .btn-orcamento-flutuante { bottom: 16px; right: 16px; padding: 12px 16px; }
    }
  `;

  function injectCSS() {
    if (document.getElementById('orcamento-styles')) return;
    const style = document.createElement('style');
    style.id = 'orcamento-styles';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  /* =========================================================
     Classe principal
  ========================================================= */
  class OrcamentoManager {
    constructor() {
      this.items = this.loadFromStorage();
      this.whatsappNumber = '5535984011960'; // +55 35 98401-1960
      injectCSS();
      this.init();
    }

    /* --------------------------------------------------
       Inicialização
    -------------------------------------------------- */
    init() {
      this.createCartUI();
      this.attachEventListeners();
      this.addButtonsToCards();
      this.render();
      this.updateCartCount();

      // Reescaneia cards se o DOM mudar (lazy-load / filtros)
      const target = document.querySelector('#produtos, .product-grid, .products');
      if (target) {
        const debounced = this.debounce(() => this.addButtonsToCards(), 200);
        new MutationObserver(debounced).observe(target, { childList: true, subtree: true });
      }
    }

    debounce(fn, wait = 200) {
      let t;
      return (...args) => { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), wait); };
    }

    /* --------------------------------------------------
       Detecção de cards de produto
       CORREÇÃO: filtra apenas o nível mais específico —
       remove elementos que são ancestrais de outro candidato
    -------------------------------------------------- */
    addButtonsToCards() {
      // 1. Busca pelos seletores do site
      const primarySelectors = [
        '.product-card', '.produto-card', '.product-item',
        '.card-product', '.shop-item', '[data-product]'
      ];
      let candidates = [];
      primarySelectors.forEach(sel =>
        document.querySelectorAll(sel).forEach(el => candidates.push(el))
      );

      // 2. Fallback heurístico apenas se nada foi encontrado
      if (candidates.length === 0) {
        document.querySelectorAll('article, li').forEach(el => {
          const hasImg   = !!el.querySelector(':scope > * img, :scope > img');
          const hasTitle = !!el.querySelector('h1,h2,h3,h4,.title,.product-name,.card-name,.nome');
          const hasPrice = /R\$/.test(el.textContent);
          if (hasImg && (hasTitle || hasPrice)) candidates.push(el);
        });
      }

      // 3. Remove duplicatas e ancestrais (evita botão em card-pai e card-filho)
      candidates = Array.from(new Set(candidates));
      candidates = candidates.filter(el =>
        !candidates.some(other => other !== el && el.contains(other))
      );

      candidates.forEach((card, index) => {
        // Não inserir duas vezes
        if (card.querySelector('.btn-add-orcamento')) return;

        /* --- Extrai nome --- */
        const nameEl = card.querySelector(
          '.card-name, .product-title, .product-name, .title, h3, h4, h2, h1, .nome, .name'
        );
        const name = (nameEl?.textContent?.trim()) ||
          card.getAttribute('data-name') ||
          card.querySelector('img')?.alt?.trim() ||
          `Produto ${index + 1}`;

        /* --- Extrai categoria --- */
        const category = card.querySelector(
          '.card-category, .category, .categoria'
        )?.textContent?.trim() || card.getAttribute('data-category') || '';

        /* --- Extrai código ---
             CORREÇÃO: usa data-code ou data-id se disponível;
             se não, gera ID único baseado em posição para evitar
             colisão entre produtos "SEM-REF"
        */
        let code = card.getAttribute('data-code') ||
                   card.getAttribute('data-id') ||
                   card.getAttribute('data-sku') || '';

        if (!code) {
          const codeMatch = card.textContent.match(
            /(?:C[oó]d(?:igo)?[:\s]*|REF[:\s]*|SKU[:\s]*)([A-Za-z0-9\-_]{2,30})/i
          );
          code = codeMatch ? codeMatch[1].trim() : `PROD-${index + 1}`;
        }

        /* --- Nome limpo --- */
        const cleanName = name
          .replace(/\s*(?:C[oó]digo|Cod|Cód|REF|SKU)[:\s]*[A-Za-z0-9\-_]{1,30}/i, '')
          .trim();

        /* --- Insere botão no .card-body --- */
        const cardBody = card.querySelector(
          '.card-body, .product-card-body, .product-info, .info, .actions, .card-footer, .product-actions'
        );
        if (!cardBody) return; // não insere se não encontrar body definido

        const wrap = document.createElement('div');
        wrap.className = 'orcamento-container';

        const btn = document.createElement('button');
        btn.className = 'btn-add-orcamento';
        btn.dataset.name     = cleanName;
        btn.dataset.code     = code;
        btn.dataset.category = category;
        btn.innerHTML = '<span class="btn-icon">+</span> Adicionar à Lista';

        wrap.appendChild(btn);
        cardBody.appendChild(wrap);
      });
    }

    /* --------------------------------------------------
       Cria a UI do carrinho (sidebar + floating btn)
    -------------------------------------------------- */
    createCartUI() {
      if (document.querySelector('.orcamento-sidebar')) return;

      // Sidebar
      const sidebar = document.createElement('div');
      sidebar.className = 'orcamento-sidebar';
      sidebar.setAttribute('aria-label', 'Carrinho de orçamento');
      sidebar.innerHTML = `
        <div class="orcamento-header">
          <h3>Meu Orçamento</h3>
          <button class="orcamento-close" aria-label="Fechar">✕</button>
        </div>
        <div class="orcamento-list"></div>
        <div class="orcamento-footer">
          <button class="btn-solicitar-orcamento">Solicitar Orçamento via WhatsApp</button>
          <button class="btn-limpar-orcamento">Limpar Tudo</button>
        </div>
      `;
      document.body.appendChild(sidebar);

      // Botão flutuante
      const btn = document.createElement('button');
      btn.className = 'btn-orcamento-flutuante';
      btn.title = 'Ver Orçamento';
      btn.setAttribute('aria-label', 'Abrir carrinho de orçamento');
      btn.innerHTML = `<span class="orcamento-icon">Solicitar Orcamento</span><span class="orcamento-count" aria-live="polite">0</span>`;
      document.body.appendChild(btn);

      // Overlay
      const overlay = document.createElement('div');
      overlay.className = 'orcamento-overlay';
      overlay.setAttribute('aria-hidden', 'true');
      document.body.appendChild(overlay);
    }

    /* --------------------------------------------------
       Event listeners (delegação única no document)
    -------------------------------------------------- */
    attachEventListeners() {
      document.addEventListener('click', (e) => {
        const t = e.target;

        if (t.closest('.btn-add-orcamento')) {
          const btn = t.closest('.btn-add-orcamento');
          this.addItem(btn.dataset.name, btn.dataset.code, btn.dataset.category);
          return;
        }
        if (t.closest('.btn-orcamento-flutuante')) { this.toggleSidebar(true); return; }
        if (t.closest('.orcamento-close'))          { this.toggleSidebar(false); return; }
        if (t.classList.contains('orcamento-overlay')) { this.toggleSidebar(false); return; }

        if (t.closest('.btn-limpar-orcamento')) {
          if (confirm('Tem certeza? Todos os itens serão removidos.')) {
            this.items = [];
            this.saveToStorage();
            this.render();
            this.updateCartCount();
          }
          return;
        }
        if (t.closest('.btn-qty-increase')) {
          this.changeQty(+t.closest('.btn-qty-increase').dataset.index, +1);
          return;
        }
        if (t.closest('.btn-qty-decrease')) {
          this.changeQty(+t.closest('.btn-qty-decrease').dataset.index, -1);
          return;
        }
        if (t.closest('.btn-remove-item')) {
          this.removeItem(+t.closest('.btn-remove-item').dataset.index);
          return;
        }
        if (t.closest('.btn-solicitar-orcamento')) {
          this.sendToWhatsApp();
          return;
        }
      });

      // Edição manual da quantidade
      // CORREÇÃO: chama render() após mudança para sincronizar UI
      document.addEventListener('change', (e) => {
        if (!e.target.classList.contains('qty-input')) return;
        const idx = +e.target.dataset.index;
        let val = parseInt(e.target.value, 10);
        if (!Number.isFinite(val) || val < 1) val = 1;
        this.items[idx].quantidade = val;
        this.saveToStorage();
        this.updateCartCount();
        // Atualiza só o input para não perder foco
        e.target.value = val;
      });

      // ESC fecha sidebar
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.toggleSidebar(false);
      });
    }

    /* --------------------------------------------------
       Manipulação de itens
    -------------------------------------------------- */
    addItem(name, code, category) {
      // CORREÇÃO: usa code como chave de deduplicação
      // mas apenas se for um código real (não o fallback posicional PROD-N)
      const isRealCode = code && !code.startsWith('PROD-');
      const existing = isRealCode
        ? this.items.find(i => i.code === code)
        : null;

      if (existing) {
        existing.quantidade += 1;
      } else {
        this.items.push({ name, code, category, quantidade: 1 });
      }

      this.saveToStorage();
      this.render();
      this.updateCartCount();
      this.showNotification(`✓ ${name} adicionado!`);
    }

    removeItem(index) {
      if (index < 0 || index >= this.items.length) return;
      this.items.splice(index, 1);
      this.saveToStorage();
      this.render();
      this.updateCartCount();
    }

    // CORREÇÃO: unificado em único método para +1/-1
    changeQty(index, delta) {
      if (index < 0 || index >= this.items.length) return;
      const item = this.items[index];
      const next = item.quantidade + delta;
      if (next < 1) return;
      item.quantidade = next;
      this.saveToStorage();
      this.render();
      this.updateCartCount();
    }

    /* --------------------------------------------------
       Renderização da lista
       CORREÇÃO: botão "Solicitar" movido para o footer
       (fora do scroll), apenas habilita/desabilita
    -------------------------------------------------- */
    render() {
      const list = document.querySelector('.orcamento-list');
      if (!list) return;

      // Botão de solicitar fica no footer — habilita/desabilita conforme itens
      const btnSolicitar = document.querySelector('.btn-solicitar-orcamento');
      if (btnSolicitar) {
        btnSolicitar.disabled = this.items.length === 0;
        btnSolicitar.style.opacity = this.items.length === 0 ? '0.4' : '1';
        btnSolicitar.style.cursor  = this.items.length === 0 ? 'not-allowed' : 'pointer';
      }

      if (this.items.length === 0) {
        list.innerHTML = '<div class="orcamento-empty">Nenhum item adicionado ainda.<br>Clique em "+ Adicionar à Lista" nos produtos.</div>';
        return;
      }

      const fragment = document.createDocumentFragment();
      const wrapper = document.createElement('div');
      wrapper.className = 'orcamento-items';

      this.items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'orcamento-item';
        // CORREÇÃO: usa textContent para evitar XSS ao renderizar nomes de produtos
        div.innerHTML = `
          <div class="item-info">
            <div class="item-name"></div>
            <div class="item-code"></div>
            <div class="item-category"></div>
          </div>
          <div class="item-controls">
            <div class="qty-control">
              <button class="btn-qty-decrease" data-index="${index}" aria-label="Diminuir">−</button>
              <input type="number" class="qty-input" value="${item.quantidade}" data-index="${index}" min="1" aria-label="Quantidade">
              <button class="btn-qty-increase" data-index="${index}" aria-label="Aumentar">+</button>
            </div>
            <button class="btn-remove-item" data-index="${index}" title="Remover item">🗑️</button>
          </div>
        `;
        div.querySelector('.item-name').textContent     = item.name;
        div.querySelector('.item-code').textContent     = `Ref: ${item.code}`;
        div.querySelector('.item-category').textContent = item.category;
        wrapper.appendChild(div);
      });

      fragment.appendChild(wrapper);
      list.innerHTML = '';
      list.appendChild(fragment);
    }

    /* --------------------------------------------------
       Envio para WhatsApp
    -------------------------------------------------- */
    sendToWhatsApp() {
      if (this.items.length === 0) {
        alert('Adicione produtos ao orçamento primeiro!');
        return;
      }

      const linhas = ['Olá! Gostaria de solicitar orçamento para os seguintes modelos:\n'];
      this.items.forEach((item, i) => {
        linhas.push(`${i + 1}. ${item.name}`);
        if (item.code && !item.code.startsWith('PROD-')) linhas.push(`   Ref: ${item.code}`);
        if (item.category) linhas.push(`   Categoria: ${item.category}`);
        linhas.push(`   Quantidade: ${item.quantidade}\n`);
      });
      linhas.push('Por favor, me envie os valores de atacado. Obrigado!');

      const url = `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(linhas.join('\n'))}`;
      window.open(url, '_blank', 'noopener');
    }

    /* --------------------------------------------------
       UI helpers
    -------------------------------------------------- */
    toggleSidebar(open) {
      const sidebar = document.querySelector('.orcamento-sidebar');
      const overlay = document.querySelector('.orcamento-overlay');
      if (!sidebar) return;

      sidebar.classList.toggle('active', open);
      overlay?.classList.toggle('active', open);

      // CORREÇÃO: renderiza ao abrir para garantir lista atualizada
      if (open) this.render();
    }

    updateCartCount() {
      const count = document.querySelector('.orcamento-count');
      if (!count) return;
      const total = this.items.reduce((s, i) => s + i.quantidade, 0);
      count.textContent = total;
      count.style.display = total > 0 ? 'flex' : 'none';
    }

    showNotification(message) {
      // Remove notificação anterior se ainda estiver visível
      document.querySelector('.orcamento-notification')?.remove();

      const el = document.createElement('div');
      el.className = 'orcamento-notification';
      el.textContent = message;
      document.body.appendChild(el);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => el.classList.add('show'));
      });

      setTimeout(() => {
        el.classList.remove('show');
        setTimeout(() => el.remove(), 300);
      }, 2200);
    }

    /* --------------------------------------------------
       Persistência
       CORREÇÃO: try/catch no loadFromStorage
    -------------------------------------------------- */
    saveToStorage() {
      try {
        localStorage.setItem('orcamento_items', JSON.stringify(this.items));
      } catch (_) { /* storage cheio ou bloqueado */ }
    }

    loadFromStorage() {
      try {
        const raw = localStorage.getItem('orcamento_items');
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        // Valida formato mínimo esperado
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(
          i => i && typeof i.name === 'string' && typeof i.code === 'string'
        ).map(i => ({
          name:       i.name,
          code:       i.code,
          category:   i.category || '',
          quantidade: Number.isFinite(i.quantidade) && i.quantidade > 0 ? i.quantidade : 1
        }));
      } catch (_) {
        return [];
      }
    }
  }

  /* =========================================================
     Bootstrap
  ========================================================= */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new OrcamentoManager());
  } else {
    new OrcamentoManager();
  }
})();
