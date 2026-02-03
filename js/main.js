const nav = document.querySelector(".nav");
const toggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".nav a");
const galleryList = document.querySelector("#gallery-list");

const renderRouteMap = () => {};

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const setActiveLinkByPath = () => {
  const current = window.location.pathname.split("/").pop() || "index.html";
  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    const isActive = href === current;
    link.classList.toggle("active", isActive);
  });
};

setActiveLinkByPath();

const renderGallery = (items) => {
  if (!galleryList || !items.length) return;
  galleryList.innerHTML = "";
  items.forEach((item) => {
    const card = document.createElement("figure");
    card.className = "gallery-item";

    const img = document.createElement("img");
    img.src = item.full;
    img.alt = item.alt || "Immagine gallery";

    const caption = document.createElement("figcaption");
    caption.className = "gallery-caption";
    caption.textContent = item.alt || "";

    card.appendChild(img);
    card.appendChild(caption);
    galleryList.appendChild(card);
  });
};

const loadGallery = async () => {
  if (!galleryList) return;
  try {
    const res = await fetch("data/gallery.json");
    if (!res.ok) throw new Error("Gallery JSON not found");
    const data = await res.json();
    renderGallery(Array.isArray(data) ? data : []);
  } catch (err) {
    if (galleryList) {
      galleryList.innerHTML =
        "<p class='gallery-error'>Nessuna immagine trovata. Aggiungi file in data/gallery.json.</p>";
    }
  }
};

loadGallery();

const yearsSpan = document.querySelector("#years-since");
if (yearsSpan) {
  const years = new Date().getFullYear() - 1999;
  yearsSpan.textContent = String(years);
}
