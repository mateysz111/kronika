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

let pinchStartDistance = 0;
let pinchStartZoom = 1;

let thumbsVisible = true;
let autoplay = false;
let autoplayInterval = null;
let autoplaySpeed = 2000;
/* ELEMENTS */

const img = document.getElementById("img");
const thumbs = document.getElementById("thumbs");
const folderSelect = document.getElementById("folderSelect");
const info = document.getElementById("info");
const viewer = document.getElementById("viewer");
const autoplayBtn = document.getElementById("autoplayBtn");
const speedSelect = document.getElementById("speedSelect");
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
stopAutoplay();
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

    im.src = src.replace("/big/", "/thumbs/");

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

  if (preload.decode) {
    preload
      .decode()
      .then(() => {
        img.src = nextSrc;
      })
      .catch(() => {
        img.src = nextSrc;
      });
  } else {
    img.src = nextSrc;
  }

  info.textContent = `${index + 1} / ${pages.length}`;

  document.querySelectorAll(".thumb").forEach((t, i) => {
    t.classList.toggle("active", i === index);
  });
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


/* AUTOPLAY */

function startAutoplay() {
  stopAutoplay();

  autoplay = true;

  autoplayBtn.textContent = "⏸ Stop";

  autoplayInterval = setInterval(() => {
    if (index >= pages.length - 1) {
      index = 0;

      resetView();
      render();

      return;
    }

    next();
  }, autoplaySpeed);
}
function stopAutoplay() {
  autoplay = false;

  autoplayBtn.textContent = "▶ Auto";

  clearInterval(autoplayInterval);
}

function toggleAutoplay() {
  if (autoplay) {
    stopAutoplay();
  } else {
    startAutoplay();
  }
}

/* DESKTOP WHEEL ZOOM */

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

/* MOUSE DRAG */

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

/* TOUCH HELPERS */

function getTouchDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;

  return Math.sqrt(dx * dx + dy * dy);
}

/* TOUCH */

viewer.addEventListener(
  "touchstart",
  (e) => {
    /* PINCH START */

    if (e.touches.length === 2) {
      dragging = false;

      pinchStartDistance = getTouchDistance(e.touches);

      pinchStartZoom = zoom;

      return;
    }

    /* DRAG START */

    if (e.touches.length === 1) {
      const touch = e.touches[0];

      dragging = true;

      startX = touch.clientX - offsetX;
      startY = touch.clientY - offsetY;
    }
  },
  { passive: true },
);

viewer.addEventListener(
  "touchmove",
  (e) => {
    /* PINCH ZOOM */

    if (e.touches.length === 2) {
      const currentDistance = getTouchDistance(e.touches);

      const scale = currentDistance / pinchStartDistance;

      zoom = pinchStartZoom * scale;

      zoom = Math.min(4, Math.max(0.5, zoom));


      updateTransform();

      return;
    }

    /* DRAG */

    if (e.touches.length === 1 && dragging) {
      const touch = e.touches[0];

      offsetX = touch.clientX - startX;
      offsetY = touch.clientY - startY;

      updateTransform();
    }
  },
  { passive: true },
);

viewer.addEventListener("touchend", () => {
  dragging = false;
});

/* TOGGLE SIDEBAR */

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
speedSelect.addEventListener("change", (e) => {
  autoplaySpeed = Number(e.target.value);

  if (autoplay) {
    startAutoplay();
  }
});
window.addEventListener("resize", fitImage);

/* INIT */

loadManifest();