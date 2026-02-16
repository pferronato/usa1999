const navLinks = document.querySelectorAll(".site-nav a");
const galleryList = document.querySelector("#gallery-list");

const renderRouteMap = () => {};

const setActiveLinkByPath = () => {
  const current = window.location.pathname.split("/").pop() || "index.html";
  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    const isActive = href === current;
    link.classList.toggle("active", isActive);
  });
};

setActiveLinkByPath();

const normalizeRouteName = (value) => {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
};

const syncRouteTimelineFromTable = () => {
  const table = document.querySelector(".route-table tbody");
  const timelineItems = document.querySelectorAll(".story-timeline-item");
  if (!table || !timelineItems.length) return;

  const rows = Array.from(table.querySelectorAll("tr"))
    .map((row) => {
      const cells = row.querySelectorAll("td");
      if (cells.length < 5) return null;
      return {
        start: cells[0].textContent.trim(),
        destination: cells[1].textContent.trim(),
        day: cells[2].textContent.trim(),
        km: cells[3].textContent.trim()
      };
    })
    .filter(Boolean);

  if (!rows.length) return;

  const first = rows[0];

  timelineItems.forEach((item, index) => {
    const labelEl = item.querySelector("span");
    const infoEl = item.querySelector("small");
    if (!labelEl || !infoEl) return;

    const timelineName = normalizeRouteName(labelEl.textContent);
    let matched = null;

    for (const row of rows) {
      const destination = normalizeRouteName(row.destination);
      if (
        destination === timelineName ||
        destination.includes(timelineName) ||
        timelineName.includes(destination)
      ) {
        matched = row;
        break;
      }
    }

    if (index === 0 && normalizeRouteName(first.start) === timelineName) {
      infoEl.textContent = `${first.day} Aug \u2022 0 km`;
      return;
    }

    if (matched) {
      infoEl.textContent = `${matched.day} Aug \u2022 ${matched.km} km`;
    }
  });
};

const renderGallery = (items) => {
  if (!galleryList || !items.length) return;
  galleryList.innerHTML = "";
  items.forEach((item) => {
    const card = document.createElement("figure");
    card.className = "gallery-item";

    const img = document.createElement("img");
    img.src = item.full;
    img.alt = item.alt || "Immagine gallery";
    img.loading = "lazy";
    img.addEventListener("click", () => openLightbox(item));

    const caption = document.createElement("figcaption");
    caption.className = "gallery-caption";
    caption.textContent = item.alt || "";

    card.appendChild(img);
    card.appendChild(caption);
    galleryList.appendChild(card);
  });
};

let lightboxEl = null;
let lightboxImg = null;
let lightboxCaption = null;

const ensureLightbox = () => {
  if (lightboxEl) return;
  lightboxEl = document.createElement("div");
  lightboxEl.className = "lightbox";
  lightboxEl.setAttribute("role", "dialog");
  lightboxEl.setAttribute("aria-modal", "true");

  lightboxEl.innerHTML = `
    <div class="lightbox-backdrop"></div>
    <div class="lightbox-content">
      <button class="lightbox-close" type="button" aria-label="Close">×</button>
      <img class="lightbox-image" alt="" />
      <p class="lightbox-caption"></p>
    </div>
  `;

  document.body.appendChild(lightboxEl);
  lightboxImg = lightboxEl.querySelector(".lightbox-image");
  lightboxCaption = lightboxEl.querySelector(".lightbox-caption");

  const closeBtn = lightboxEl.querySelector(".lightbox-close");
  const backdrop = lightboxEl.querySelector(".lightbox-backdrop");
  const close = () => lightboxEl.classList.remove("is-open");

  closeBtn.addEventListener("click", close);
  backdrop.addEventListener("click", close);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
};

const openLightbox = (item) => {
  ensureLightbox();
  lightboxImg.src = item.full;
  lightboxImg.alt = item.alt || "";
  lightboxCaption.textContent = item.alt || "";
  lightboxEl.classList.add("is-open");
};

const bindStoryLightbox = () => {
  const thumbs = document.querySelectorAll(".place-thumb");
  const inlineLinks = document.querySelectorAll(".photo-link");
  if (!thumbs.length && !inlineLinks.length) return;
  ensureLightbox();
  thumbs.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const img = link.querySelector("img");
      const alt = img ? img.getAttribute("alt") : "";
      openLightbox({ full: href, alt: alt || "" });
    });
  });

  inlineLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const alt = link.textContent || link.getAttribute("aria-label") || "";
      openLightbox({ full: href, alt });
    });
  });
};

const loadGallery = async () => {
  if (!galleryList) return;
  try {
    const isEnglish = window.location.pathname.includes("/en/");
    const dataPath = isEnglish ? "../data/gallery.json" : "data/gallery.json";
    const res = await fetch(dataPath);
    if (!res.ok) throw new Error("Gallery JSON not found");
    const data = await res.json();
    const items = Array.isArray(data) ? data : [];
    const normalized = isEnglish
      ? items.map((item) => ({
          ...item,
          full: item.full.startsWith("assets/") ? `../${item.full}` : item.full,
          thumb: item.thumb.startsWith("assets/") ? `../${item.thumb}` : item.thumb
        }))
      : items;
    renderGallery(normalized);
  } catch (err) {
    if (galleryList) {
      galleryList.innerHTML =
        "<p class='gallery-error'>Nessuna immagine trovata. Aggiungi file in data/gallery.json.</p>";
    }
  }
};

loadGallery();
bindStoryLightbox();
syncRouteTimelineFromTable();

const yearsSpan = document.querySelector("#years-since");
if (yearsSpan) {
  const years = new Date().getFullYear() - 1999;
  yearsSpan.textContent = String(years);
}

document.addEventListener('DOMContentLoaded', () => {

  document.querySelectorAll('.photo-link').forEach((link) => {
    if (link.children.length === 0) {
      const icon = document.createElement('span');
      icon.className = 'photo-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = '📷';
      link.appendChild(icon);
    }
  });
});
