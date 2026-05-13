/* STATE */

let manifest = {};
let pages = [];
let index = 0;

let zoom = 1;
let baseScale = 1;

let rotation = 0;

let offsetX = 0;
let offsetY = 0;

let dragging = false;
let startX, startY;

let thumbsVisible = true;

/* ELEMENTS */

const img = document.getElementById("img");
const thumbs = document.getElementById("thumbs");
const folderSelect = document.getElementById("folderSelect");
const zoomSlider = document.getElementById("zoom");
const info = document.getElementById("info");
const viewer = document.getElementById("viewer");

/* LOAD */

async function loadManifest() {
  const res = await fetch("data/manifest.json");

  manifest = await res.json();

  initFolders();

  loadFolder(Object.keys(manifest)[0]);
}

function initFolders() {
  Object.keys(manifest).forEach((name) => {
    const opt = document.createElement("option");

    opt.value = name;
    opt.textContent = name;

    folderSelect.appendChild(opt);
  });
}

/* FOLDER */

function loadFolder(name) {
  pages = manifest[name];

  index = 0;

  renderThumbs();

  resetView();

  render();
}

/* FIT */

function fitImage() {
  const vw = viewer.clientWidth;
  const vh = viewer.clientHeight;

  const imgW = 5109;
  const imgH = 3507;

  const scaleX = vw / imgW;
  const scaleY = vh / imgH;

  baseScale = Math.min(scaleX, scaleY) * 0.95;

  updateTransform();
}

/* RESET */

function resetView() {
  zoom = 1;

  rotation = 0;

  offsetX = 0;
  offsetY = 0;

  zoomSlider.value = 100;

  fitImage();
}

/* THUMBS */

function renderThumbs() {
  thumbs.innerHTML = "";

  pages.forEach((src, i) => {
    const div = document.createElement("div");

    div.className = "thumb";

    const im = document.createElement("img");

    im.loading = "lazy";
    im.decoding = "async";

    im.src = src;

    div.appendChild(im);

    div.onclick = () => {
      index = i;

      resetView();

      render();

      if (window.innerWidth <= 900) {
        thumbs.classList.remove("show");
      }
    };

    thumbs.appendChild(div);
  });
}

/* KEYBOARD */

window.addEventListener("keydown", (e) => {
  const tag = document.activeElement.tagName;

  if (
    tag === "INPUT" ||
    tag === "SELECT" ||
    tag === "TEXTAREA"
  )
    return;

  if (e.key === "ArrowRight") {
    e.preventDefault();

    next();
  }

  if (e.key === "ArrowLeft") {
    e.preventDefault();

    prev();
  }
});

/* RENDER */

function render() {
  const nextSrc = pages[index];

  const preload = new Image();

  preload.src = nextSrc;

  preload.decode().then(() => {
    img.src = nextSrc;
  });

  info.textContent = `${index + 1} / ${pages.length}`;

  document.querySelectorAll(".thumb").forEach((t, i) => {
    t.classList.toggle("active", i === index);
  });

  window.focus();
}

/* TRANSFORM */

function updateTransform() {
  const finalScale = baseScale * zoom;

  img.style.transform = `
    translate(${offsetX}px, ${offsetY}px)
    translate(-50%, -50%)
    scale(${finalScale})
    rotate(${rotation}deg)
  `;
}

/* NAV */

function next() {
  if (index < pages.length - 1) {
    index++;

    resetView();

    render();
  }
}

function prev() {
  if (index > 0) {
    index--;

    resetView();

    render();
  }
}

/* ROTATE */

function rotateLeft() {
  rotation -= 90;

  updateTransform();
}

function rotateRight() {
  rotation += 90;

  updateTransform();
}

/* ZOOM */

zoomSlider.addEventListener("input", (e) => {
  zoom = e.target.value / 100;

  updateTransform();
});

/* POINT ZOOM */

viewer.addEventListener(
  "wheel",
  (e) => {
    if (!e.ctrlKey) return;

    e.preventDefault();

    const prevZoom = zoom;

    const rect = img.getBoundingClientRect();

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    zoom += e.deltaY < 0 ? 0.15 : -0.15;

    zoom = Math.min(4, Math.max(0.5, zoom));

    offsetX -= (mouseX - offsetX) * (zoom / prevZoom - 1);

    offsetY -= (mouseY - offsetY) * (zoom / prevZoom - 1);

    updateTransform();
  },
  { passive: false },
);

/* DRAG */

img.addEventListener("mousedown", (e) => {
  dragging = true;

  startX = e.clientX - offsetX;
  startY = e.clientY - offsetY;
});

window.addEventListener("mouseup", () => {
  dragging = false;
});

window.addEventListener("mousemove", (e) => {
  if (!dragging) return;

  offsetX = e.clientX - startX;
  offsetY = e.clientY - startY;

  updateTransform();
});

/* TOUCH */

img.addEventListener(
  "touchstart",
  (e) => {
    const touch = e.touches[0];

    dragging = true;

    startX = touch.clientX - offsetX;
    startY = touch.clientY - offsetY;
  },
  { passive: true },
);

window.addEventListener(
  "touchmove",
  (e) => {
    if (!dragging) return;

    const touch = e.touches[0];

    offsetX = touch.clientX - startX;
    offsetY = touch.clientY - startY;

    updateTransform();
  },
  { passive: true },
);

window.addEventListener("touchend", () => {
  dragging = false;
});

/* TOGGLE */

function toggleThumbs() {
  if (window.innerWidth <= 900) {
    thumbs.classList.toggle("show");
  } else {
    thumbsVisible = !thumbsVisible;

    thumbs.classList.toggle("hidden", !thumbsVisible);
  }
}

/* EVENTS */

folderSelect.addEventListener("change", (e) => {
  loadFolder(e.target.value);
});

window.addEventListener("resize", fitImage);

/* INIT */

loadManifest();