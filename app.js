/* Mormo BD demo: shared data helpers, cart store and page chrome. */
(function () {
  const P = window.PRODUCTS || [];
  const byId = new Map(P.map((p) => [p.id, p]));
  const CATS = ['Winter Collection', 'Baggy Pant', 'Crop Top Set', 'Combo Set', 'Shorts'];
  const WA = 'https://wa.me/8801847305873';

  const ls = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode: keep in memory */ } }
  };

  window.M = {
    P, CATS, WA, ls,
    byId: (id) => byId.get(Number(id)),
    fmt: (n) => Number(n || 0).toLocaleString('en-US') + '৳',
    url: (p) => 'product.html?id=' + p.id,
    q: (k) => new URLSearchParams(location.search).get(k),
    newest: (n) => P.filter((p) => p.stock).slice(0, n),
    inCat: (c) => P.filter((p) => p.cat === c),
    search(term) {
      const t = term.toLowerCase().trim();
      const syn = { 'বেগি': 'baggy', 'প্যান্ট': 'pant', 'হুডি': 'hoodie', 'ক্রপ': 'crop', 'টপ': 'top', 'কার্গো': 'cargo', 'কালো': 'black', 'সাদা': 'white', 'কো-অর্ড': 'co-ord', 'সেট': 'set' };
      const words = t.split(/\s+/).map((w) => syn[w] || w).filter(Boolean);
      return P.filter((p) => words.every((w) => (p.t + ' ' + p.cat).toLowerCase().includes(w)));
    },
    // size chart published on the product pages (crop top / co-ord sets, XS-3XL)
    chart: [
      { s: 'XS', chest: 36, top: 16, waist: '24–28', pant: 36, mid: 26 },
      { s: 'S', chest: 38, top: 17, waist: '26–30', pant: 37, mid: 28 },
      { s: 'M', chest: 40, top: 18, waist: '28–32', pant: 38, mid: 30 },
      { s: 'L', chest: 42, top: 19, waist: '30–34', pant: 39, mid: 32 },
      { s: 'XL', chest: 44, top: 20, waist: '32–36', pant: 40, mid: 34 },
      { s: 'XXL', chest: 46, top: 21, waist: '34–38', pant: 41, mid: 36 },
      { s: '3XL', chest: 48, top: 22, waist: '36–40', pant: 42, mid: 38 }
    ],
    recommend(w) {
      const c = window.M.chart;
      return c.reduce((b, r) => (Math.abs(r.mid - w) < Math.abs(b.mid - w) ? r : b), c[0]);
    }
  };

  const ICON = {
    search: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    bag: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M5 7h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>',
    home: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l8-7 8 7v9H4z"/></svg>',
    grid: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
    heart: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
    wa: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z"/></svg>'
  };
  window.ICON = ICON;
  const page = new URLSearchParams(location.search).get('wish') ? 'wish' : (document.body.dataset.page || '');

  const header = `
<header class="hdr"><div class="wrap hdr-in">
  <a class="logo" href="index.html" aria-label="Mormo BD হোম">MORMO<span>.</span></a>
  <nav class="nav desk" aria-label="ক্যাটাগরি">
    ${CATS.slice(0, 4).map((c) => `<a href="category.html?cat=${encodeURIComponent(c)}">${c.replace(' Collection', '')}</a>`).join('')}
  </nav>
  <form class="search desk" role="search" action="category.html">
    <label for="q" class="sr">প্রোডাক্ট খুঁজুন</label>${ICON.search}
    <input id="q" name="q" type="search" placeholder="কী খুঁজছেন? যেমন: baggy, hoodie, crop">
  </form>
  <div style="flex:1" class="mob"></div>
  <a href="category.html?focus=1" class="icon-btn mob" aria-label="খুঁজুন">${ICON.search}</a>
  <button type="button" class="cart-btn desk" x-data @click="$store.shop.cartOpen=true" :aria-label="'কার্ট খুলুন, '+$store.shop.count+'টি প্রোডাক্ট'">${ICON.bag}<span x-text="$store.shop.count"></span></button>
  <button type="button" class="icon-btn mob" x-data @click="$store.shop.cartOpen=true" style="background:#121212;color:#fff" :aria-label="'কার্ট, '+$store.shop.count+'টি'">${ICON.bag}<span class="badge" x-show="$store.shop.count" x-text="$store.shop.count"></span></button>
</div></header>`;

  const bnav = `
<nav class="bnav" aria-label="মোবাইল মেনু" x-data>
  <a href="index.html" class="${page === 'home' ? 'on' : ''}">${ICON.home}হোম</a>
  <a href="category.html" class="${page === 'cat' ? 'on' : ''}">${ICON.grid}ক্যাটাগরি</a>
  <a href="category.html?wish=1" class="${page === 'wish' ? 'on' : ''}">${ICON.heart}পছন্দ</a>
  <button type="button" @click="$store.shop.cartOpen=true">${ICON.bag}কার্ট<span class="badge" x-show="$store.shop.count" x-text="$store.shop.count" style="top:4px;right:18px"></span></button>
</nav>`;

  const sheets = `
<div x-data x-cloak>
  <template x-if="$store.shop.cartOpen">
    <div class="scrim" @keydown.escape.window="$store.shop.cartOpen=false">
      <button type="button" class="bg" aria-label="বন্ধ করুন" @click="$store.shop.cartOpen=false"></button>
      <aside class="sheet" role="dialog" aria-label="আপনার কার্ট">
        <span class="grip" aria-hidden="true"></span>
        <div class="sheet-h"><strong style="font-size:20px">আপনার কার্ট (<span x-text="$store.shop.count"></span>)</strong><button type="button" class="x" aria-label="বন্ধ করুন" @click="$store.shop.cartOpen=false">×</button></div>
        <div class="sheet-b">
          <template x-for="(it, i) in $store.shop.items" :key="it.key">
            <div class="line-item">
              <a :href="M.url(it.p)"><img :src="it.p.img" alt=""></a>
              <div style="flex:1;min-width:0"><div style="font-weight:700;font-size:14px;line-height:1.35" x-text="it.p.t"></div><div class="muted" style="font-size:13px" x-text="'সাইজ '+it.size"></div>
                <div style="display:flex;align-items:center;gap:10px;margin-top:6px"><span class="qty"><button type="button" aria-label="কমান" @click="$store.shop.setQty(i, it.qty-1)">−</button><span x-text="it.qty"></span><button type="button" aria-label="বাড়ান" @click="$store.shop.setQty(i, it.qty+1)">+</button></span><button type="button" style="border:0;background:none;color:#8A1C2B;text-decoration:underline;font-size:13px;min-height:40px" @click="$store.shop.remove(i)">বাদ দিন</button></div></div>
              <strong x-text="M.fmt(it.p.p*it.qty)"></strong>
            </div>
          </template>
          <p class="muted" x-show="!$store.shop.count" style="text-align:center;padding:40px 0">কার্ট খালি। পছন্দের প্রোডাক্টে সাইজ বেছে যোগ করুন।</p>
        </div>
        <div class="sheet-f" x-show="$store.shop.count">
          <div style="display:flex;justify-content:space-between;font-size:17px"><span>সাবটোটাল</span><strong x-text="M.fmt($store.shop.subtotal)"></strong></div>
          <span class="muted" style="font-size:13px">ডেলিভারি চার্জ চেকআউটে যোগ হবে · ক্যাশ অন ডেলিভারি</span>
          <a href="checkout.html" class="btn block">চেকআউট করুন →</a>
        </div>
      </aside>
    </div>
  </template>

  <template x-if="$store.shop.quick">
    <div class="scrim" @keydown.escape.window="$store.shop.quick=null">
      <button type="button" class="bg" aria-label="বন্ধ করুন" @click="$store.shop.quick=null"></button>
      <aside class="sheet" role="dialog" aria-label="সাইজ বাছুন" style="height:auto;align-self:flex-end">
        <span class="grip" aria-hidden="true"></span>
        <div class="sheet-h"><div class="line-item"><img :src="$store.shop.quick.img" alt=""><div><div style="font-weight:700;font-size:15px;line-height:1.35" x-text="$store.shop.quick.t"></div><strong style="font-size:18px" x-text="M.fmt($store.shop.quick.p)"></strong></div></div><button type="button" class="x" aria-label="বন্ধ করুন" @click="$store.shop.quick=null">×</button></div>
        <div class="sheet-b">
          <strong>সাইজ বাছুন</strong>
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            <template x-for="s in $store.shop.quick.sizes"><button type="button" class="size" :class="$store.shop.qSize===s && 'on'" :aria-pressed="$store.shop.qSize===s" @click="$store.shop.qSize=s" x-text="s"></button></template>
          </div>
          <a :href="M.url($store.shop.quick)" style="font-size:14px;text-decoration:underline">বিস্তারিত আর সাইজ চার্ট দেখুন</a>
        </div>
        <div class="sheet-f"><button type="button" class="btn block" :disabled="!$store.shop.qSize" @click="$store.shop.add($store.shop.quick.id, $store.shop.qSize, 1); $store.shop.quick=null" x-text="$store.shop.qSize ? 'সাইজ '+$store.shop.qSize+' · কার্টে যোগ করুন' : 'আগে সাইজ বাছুন'"></button></div>
      </aside>
    </div>
  </template>

  <template x-if="$store.shop.toast">
    <div class="toast" role="status"><span x-text="$store.shop.toast"></span><a href="checkout.html">চেকআউট →</a></div>
  </template>
</div>`;

  const footer = `
<footer class="ftr"><div class="wrap ftr-in">
  <div style="flex:2 1 260px;display:flex;flex-direction:column;gap:12px;min-width:0">
    <div class="logo">MORMO<span style="color:#E07A86">.</span></div>
    <p style="margin:0;line-height:1.7;color:#CFC8BC;max-width:380px">বাংলাদেশের মেয়েদের জন্য স্ট্রিটওয়্যার। বেগি প্যান্ট, কো-অর্ড সেট, হুডি আর ক্রপ টপ।</p>
    <a href="${WA}" style="color:#fff;display:inline-flex;align-items:center;gap:8px;font-weight:700;min-height:44px">${ICON.wa}WhatsApp: +880 1847-305873</a>
  </div>
  <nav aria-label="শপ"><strong style="color:#fff">শপ</strong>${CATS.map((c) => `<a href="category.html?cat=${encodeURIComponent(c)}">${c}</a>`).join('')}</nav>
  <nav aria-label="সাহায্য"><strong style="color:#fff">সাহায্য</strong><a href="${WA}">অর্ডার ট্র্যাক করুন</a><a href="index.html#faq">ডেলিভারি ও চার্জ</a><a href="index.html#faq">রিফান্ড ও এক্সচেঞ্জ</a><a href="${WA}">যোগাযোগ</a></nav>
</div>
<p class="wrap" style="margin:0;padding-bottom:110px;font-size:13px;color:#8A8580">ডেমো সাইট। এখান থেকে আসল অর্ডার যায় না।</p>
</footer>`;

  const put = (id, html) => { const el = document.getElementById(id); if (el) el.outerHTML = html; };
  put('site-header', header);
  put('site-footer', footer + bnav + sheets);

  document.addEventListener('alpine:init', () => {
    const saved = ls.get('mormo_cart', []);
    Alpine.store('shop', {
      cart: Array.isArray(saved) ? saved.filter((c) => byId.has(c.id)) : [],
      wish: ls.get('mormo_wish', []),
      cartOpen: false, quick: null, qSize: null, toast: '', _t: null,
      get items() { return this.cart.map((c) => ({ ...c, key: c.id + c.size, p: byId.get(c.id) })); },
      get count() { return this.cart.reduce((s, c) => s + c.qty, 0); },
      get subtotal() { return this.cart.reduce((s, c) => s + byId.get(c.id).p * c.qty, 0); },
      save() { ls.set('mormo_cart', this.cart); },
      add(id, size, qty) {
        const f = this.cart.find((c) => c.id === id && c.size === size);
        if (f) f.qty += qty; else this.cart.push({ id, size, qty });
        this.save();
        this.say('সাইজ ' + size + ' কার্টে যোগ হয়েছে');
      },
      setQty(i, n) { if (n < 1) return this.remove(i); this.cart[i].qty = Math.min(10, n); this.save(); },
      remove(i) { this.cart.splice(i, 1); this.save(); },
      clear() { this.cart = []; this.save(); },
      openQuick(id) { const p = byId.get(id); this.qSize = p.sizes.length === 1 ? p.sizes[0] : null; this.quick = p; },
      isWished(id) { return this.wish.includes(id); },
      toggleWish(id) { this.wish = this.isWished(id) ? this.wish.filter((x) => x !== id) : [...this.wish, id]; ls.set('mormo_wish', this.wish); },
      say(msg) { this.toast = msg; clearTimeout(this._t); this._t = setTimeout(() => { this.toast = ''; }, 3500); }
    });
  });
})();
