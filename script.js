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

artworks.forEach((art) => {
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.category = art.category;
  card.tabIndex = 0;
  card.innerHTML = `
    <img src="images/thumb/${art.file}" alt="${art.title}" loading="lazy" />
    <div class="info"><h3>${art.title}</h3><span>${art.label}</span></div>`;
  card.addEventListener("click", () => open(art));
  card.addEventListener("keydown", (e) => { if (e.key === "Enter") open(art); });
  grid.appendChild(card);
});

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

document.getElementById("year").textContent = new Date().getFullYear();
