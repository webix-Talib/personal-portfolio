const loader = document.getElementById("page-loader");
const cursorGlow = document.querySelector(".cursor-glow");
const progressBar = document.querySelector(".scroll-progress__bar");
const backToTop = document.querySelector(".back-to-top");
const navLinks = document.querySelectorAll(".nav-link");
const sections = Array.from(document.querySelectorAll("main section"));
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");
const canvas = document.getElementById("network-canvas");
const context = canvas ? canvas.getContext("2d") : null;

const state = {
  nodes: [],
  width: 0,
  height: 0,
};

const setupCanvas = () => {
  if (!canvas || !context) return;
  state.width = canvas.offsetWidth;
  state.height = canvas.offsetHeight;
  canvas.width = state.width * window.devicePixelRatio;
  canvas.height = state.height * window.devicePixelRatio;
  context.scale(window.devicePixelRatio, window.devicePixelRatio);

  const nodeCount = window.innerWidth < 768 ? 28 : 48;
  state.nodes = Array.from({ length: nodeCount }, () => ({
    x: Math.random() * state.width,
    y: Math.random() * state.height,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
  }));
};

const drawNetwork = () => {
  if (!canvas || !context) return;
  context.clearRect(0, 0, state.width, state.height);
  context.fillStyle = "rgba(79, 140, 255, 0.4)";

  state.nodes.forEach((node) => {
    node.x += node.vx;
    node.y += node.vy;

    if (node.x <= 0 || node.x >= state.width) node.vx *= -1;
    if (node.y <= 0 || node.y >= state.height) node.vy *= -1;

    context.beginPath();
    context.arc(node.x, node.y, 2, 0, Math.PI * 2);
    context.fill();
  });

  for (let i = 0; i < state.nodes.length; i += 1) {
    for (let j = i + 1; j < state.nodes.length; j += 1) {
      const dx = state.nodes[i].x - state.nodes[j].x;
      const dy = state.nodes[i].y - state.nodes[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 140) {
        const opacity = 1 - distance / 140;
        context.strokeStyle = `rgba(6, 182, 212, ${opacity * 0.35})`;
        context.beginPath();
        context.moveTo(state.nodes[i].x, state.nodes[i].y);
        context.lineTo(state.nodes[j].x, state.nodes[j].y);
        context.stroke();
      }
    }
  }

  requestAnimationFrame(drawNetwork);
};

const updateProgress = () => {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const progress = total > 0 ? (window.scrollY / total) * 100 : 0;
  progressBar.style.width = `${progress}%`;
  backToTop.classList.toggle("visible", window.scrollY > 480);
};

const revealSections = () => {
  const trigger = window.innerHeight * 0.85;
  document.querySelectorAll("[data-reveal]").forEach((section) => {
    if (section.getBoundingClientRect().top < trigger) {
      section.classList.add("revealed");
    }
  });
};

const highlightNav = () => {
  const offset = window.scrollY + 120;
  let activeId = "hero";
  sections.forEach((section) => {
    if (section.offsetTop <= offset) {
      activeId = section.id;
    }
  });

  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${activeId}`);
  });
};

const handleMouseMove = (event) => {
  if (!cursorGlow) return;
  cursorGlow.style.opacity = "1";
  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;
};

const handleMenuToggle = () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  mobileMenu.hidden = isExpanded;
};

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (!mobileMenu.hidden) {
      mobileMenu.hidden = true;
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
});

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

window.addEventListener("scroll", () => {
  updateProgress();
  revealSections();
  highlightNav();
});

window.addEventListener("mousemove", handleMouseMove);
window.addEventListener("resize", () => {
  setupCanvas();
});

if (menuToggle) {
  menuToggle.addEventListener("click", handleMenuToggle);
}

window.addEventListener("load", () => {
  if (loader) {
    loader.classList.add("hidden");
  }
  setupCanvas();
  drawNetwork();
  updateProgress();
  revealSections();
  highlightNav();
});
