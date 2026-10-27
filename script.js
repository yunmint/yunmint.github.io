// Add new artwork here: drop the files in images/full and images/thumb, then add an entry.
const artworks = [
  { file: "strawberry-bear.jpg",    title: "Strawberry Bear",     category: "digital",  label: "Digital" },
  { file: "pumpkin-gentleman.jpg",  title: "The Pumpkin Gentleman", category: "digital", label: "Digital" },
  { file: "psyduck-canvas.jpg",     title: "Psyduck on Tiles",    category: "painting", label: "Acrylic on canvas" },
  { file: "snowy-mailbox.jpg",      title: "Snowy Mailbox",       category: "digital",  label: "Digital" },
  { file: "pumpkin-patch.jpg",      title: "Pumpkin Patch",       category: "lineart",  label: "Line art" },
  { file: "christmas-cat.png",      title: "Christmas Kitty",     category: "digital",  label: "Digital" },
  { file: "city-lights.jpg",        title: "City Lights",         category: "painting", label: "Acrylic on canvas" },
  { file: "my-best-friend.png",     title: "My Best Friend",      category: "lineart",  label: "Line art" },
  { file: "honey-bear-pancake.png", title: "Honey Bear Pancake",  category: "digital",  label: "Digital" },
  { file: "pumpkin-party.jpg",      title: "Pumpkin Party",       category: "lineart",  label: "Line art" },
  { file: "dragon-sketch.jpg",      title: "Dragon in the Wild",  category: "lineart",  label: "Ink sketch" },
];

const grid = document.getElementById("grid");
const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lb-img");
const lbCaption = document.getElementById("lb-caption");
let visibleList = [...artworks];
let current = 0;
const cards = [];
let layoutQueued = false;

artworks.forEach((art) => {
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.category = art.category;
  card.tabIndex = 0;
  card.innerHTML = `
    <img src="images/thumb/${art.file}" alt="${art.title}" />
    <div class="info"><h3>${art.title}</h3><span>${art.label}</span></div>`;
  card.addEventListener("click", () => open(art));
  card.addEventListener("keydown", (e) => { if (e.key === "Enter") open(art); });
  const entry = { el: card, art, ratio: 1 };
  const img = card.querySelector("img");
  const setRatio = () => { entry.ratio = img.naturalWidth / img.naturalHeight; scheduleLayout(); };
  if (img.complete && img.naturalWidth) setRatio(); else img.addEventListener("load", setRatio);
  cards.push(entry);
  grid.appendChild(card);
});

// Justified gallery: every row fills the full width, so all edges line up.
// Splits the pieces into rows of roughly equal total width, keeping their order.
function partition(ratios, k) {
  const n = ratios.length;
  const prefix = [0];
  ratios.forEach((r) => prefix.push(prefix[prefix.length - 1] + r));
  const target = prefix[n] / k;
  const cost = (i, j) => (prefix[j] - prefix[i] - target) ** 2;
  // best[r][j] = lowest cost of putting the first j pieces into r rows
  const best = Array.from({ length: k + 1 }, () => Array(n + 1).fill(Infinity));
  const cut = Array.from({ length: k + 1 }, () => Array(n + 1).fill(0));
  best[0][0] = 0;
  for (let r = 1; r <= k; r++) {
    for (let j = r; j <= n; j++) {
      for (let i = r - 1; i < j; i++) {
        const c = best[r - 1][i] + cost(i, j);
        if (c < best[r][j]) { best[r][j] = c; cut[r][j] = i; }
      }
    }
  }
  const rows = [];
  for (let r = k, j = n; r > 0; r--) { const i = cut[r][j]; rows.unshift([i, j]); j = i; }
  return rows;
}

function layout() {
  const width = grid.clientWidth;
  if (!width) return;
  const gap = parseFloat(getComputedStyle(grid).rowGap) || 16;
  const targetHeight = width < 600 ? 170 : width < 1000 ? 260 : 340;
  const visible = cards.filter((c) => !c.el.classList.contains("hidden"));
  if (!visible.length) return;
  const ratios = visible.map((c) => c.ratio);
  const total = ratios.reduce((a, b) => a + b, 0);
  const k = Math.min(visible.length, Math.max(1, Math.round((total * targetHeight) / width)));

  grid.replaceChildren();
  const rows = partition(ratios, k);
  rows.forEach(([i, j]) => {
    const row = document.createElement("div");
    row.className = "row";
    const items = visible.slice(i, j);
    const sum = ratios.slice(i, j).reduce((a, b) => a + b, 0);
    // Height that makes the row exactly fill the width (capped for short rows)
    const fullHeight = (width - gap * (items.length - 1)) / sum;
    // A lone row (e.g. a filter with only a few pieces) is capped so tiles don't get huge
    const h = rows.length === 1 ? Math.min(fullHeight, targetHeight * 1.2) : fullHeight;
    const fills = h === fullHeight;
    items.forEach((c, idx) => {
      c.el.style.height = `${h}px`;
      c.el.style.width = `${c.ratio * h}px`;
      // Last tile absorbs rounding only in full rows; short rows stay centered at their true shape
      c.el.style.flexGrow = fills && idx === items.length - 1 ? "1" : "0";
      row.appendChild(c.el);
    });
    grid.appendChild(row);
  });
  cards.filter((c) => c.el.classList.contains("hidden")).forEach((c) => grid.appendChild(c.el));
}

function scheduleLayout() {
  if (layoutQueued) return;
  layoutQueued = true;
  requestAnimationFrame(() => { layoutQueued = false; layout(); });
}
let lastWidth = 0;
window.addEventListener("resize", () => {
  if (grid.clientWidth !== lastWidth) { lastWidth = grid.clientWidth; scheduleLayout(); }
});
scheduleLayout();

// Fade cards in as they scroll into view
const observer = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("visible"); observer.unobserve(e.target); }
  });
}, { threshold: 0.1 });
document.querySelectorAll(".card").forEach((c) => observer.observe(c));

// Filters
document.querySelectorAll(".filter").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(".filter.active").classList.remove("active");
    btn.classList.add("active");
    const f = btn.dataset.filter;
    visibleList = artworks.filter((a) => f === "all" || a.category === f);
    document.querySelectorAll(".card").forEach((card) => {
      card.classList.toggle("hidden", f !== "all" && card.dataset.category !== f);
    });
    layout();
  });
});

// Lightbox
function show(i) {
  current = (i + visibleList.length) % visibleList.length;
  const art = visibleList[current];
  lbImg.src = `images/full/${art.file}`;
  lbImg.alt = art.title;
  lbCaption.textContent = `${art.title} — ${art.label}`;
}
function open(art) {
  show(visibleList.indexOf(art));
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function close() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
lightbox.querySelector(".lb-close").addEventListener("click", close);
lightbox.querySelector(".lb-prev").addEventListener("click", () => show(current - 1));
lightbox.querySelector(".lb-next").addEventListener("click", () => show(current + 1));
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) close(); });
document.addEventListener("keydown", (e) => {
  if (!lightbox.classList.contains("open")) return;
  if (e.key === "Escape") close();
  if (e.key === "ArrowLeft") show(current - 1);
  if (e.key === "ArrowRight") show(current + 1);
});

// Swipe left/right in the lightbox on touch screens
let touchX = null;
lightbox.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener("touchend", (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
  touchX = null;
});

document.getElementById("year").textContent = new Date().getFullYear();
