document.addEventListener("DOMContentLoaded", () => {
  /* ==============================
          1. MOBILE NAVIGATION
       ============================== */

  const menuBtn = document.getElementById("menuBtn");
  const navLinks = document.getElementById("navLinks");

  function closeMenu() {
    navLinks.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.textContent = "☰";
  }

  menuBtn.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");

    menuBtn.setAttribute("aria-expanded", String(isOpen));
    menuBtn.textContent = isOpen ? "×" : "☰";
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  /* ==============================
          2. PROJECT FILTERS
       ============================== */

  const filters = document.querySelectorAll(".filter");
  const projects = document.querySelectorAll(".project");

  filters.forEach((button) => {
    button.addEventListener("click", () => {
      filters.forEach((filter) => {
        filter.classList.remove("active");
      });

      button.classList.add("active");

      const selectedCategory = button.dataset.filter;

      projects.forEach((project) => {
        project.hidden =
          selectedCategory !== "all" &&
          project.dataset.category !== selectedCategory;
      });
    });
  });

  /* ==============================
          3. PROJECT MODAL
       ============================== */

  const modal = document.getElementById("projectModal");
  const modalClose = document.getElementById("modalClose");

  const modalTitle = document.getElementById("modalTitle");
  const modalDesc = document.getElementById("modalDesc");
  const modalType = document.getElementById("modalType");

  const modalFiles = document.getElementById("modalFiles");
  const modalControls = document.getElementById("modalControls");

  const previousImage = document.getElementById("previousImage");
  const nextImage = document.getElementById("nextImage");
  const imageCounter = document.getElementById("imageCounter");

  let currentImages = [];
  let currentIndex = 0;
  let previousFocus = null;
  let scrollFrame = null;

  /* Render images and videos */

  function renderImages() {
    modalFiles.innerHTML = "";

    currentImages.forEach((file, index) => {
      const cleanPath = file.trim().split(/[?#]/)[0];
      const extension = cleanPath.split(".").pop().toLowerCase();

      const isVideo = ["mp4", "webm", "ogg"].includes(extension);

      let media;

      if (isVideo) {
        media = document.createElement("video");

        media.controls = true;
        media.preload = "metadata";
        media.playsInline = true;

        media.setAttribute(
          "aria-label",
          `${modalTitle.textContent} - Video ${index + 1}`,
        );

        const source = document.createElement("source");

        source.src = file.trim();

        source.type =
          extension === "mp4"
            ? "video/mp4"
            : extension === "webm"
              ? "video/webm"
              : "video/ogg";

        media.appendChild(source);

        media.addEventListener("error", () => {
          console.error("Video loading error:", file);
        });
      } else {
        media = document.createElement("img");

        media.src = file.trim();

        media.alt = `${modalTitle.textContent} - Image ${index + 1}`;

        media.loading = index === 0 ? "eager" : "lazy";
      }

      media.classList.add("gallery-media");

      modalFiles.appendChild(media);
    });

    modalControls.hidden = currentImages.length <= 1;

    updateImageCounter();
  }

  /* Update image counter */

  function updateImageCounter() {
    const mediaItems = modalFiles.querySelectorAll(".gallery-media");

    if (!mediaItems.length) {
      imageCounter.textContent = "0 / 0";
      return;
    }

    const containerRect = modalFiles.getBoundingClientRect();

    const containerCenter = containerRect.left + containerRect.width / 2;

    let closestIndex = 0;
    let smallestDistance = Infinity;

    mediaItems.forEach((media, index) => {
      const rect = media.getBoundingClientRect();

      const mediaCenter = rect.left + rect.width / 2;

      const distance = Math.abs(containerCenter - mediaCenter);

      if (distance < smallestDistance) {
        smallestDistance = distance;
        closestIndex = index;
      }
    });

    currentIndex = closestIndex;

    imageCounter.textContent = `${currentIndex + 1} / ${mediaItems.length}`;
  }

  /* Scroll to a specific image or video */

  function showImage(index) {
    const mediaItems = modalFiles.querySelectorAll(".gallery-media");

    if (!mediaItems.length) return;

    currentIndex = Math.max(0, Math.min(index, mediaItems.length - 1));

    // Pause all videos before changing slides
    mediaItems.forEach((media) => {
      if (media.tagName === "VIDEO") {
        media.pause();
      }
    });

    const target = mediaItems[currentIndex];

    // Scroll only the gallery horizontally
    modalFiles.scrollTo({
      left: target.offsetLeft - modalFiles.offsetLeft,
      behavior: "smooth",
    });

    imageCounter.textContent = `${currentIndex + 1} / ${mediaItems.length}`;
  }

  /* Open project modal */

  function openModal(project) {
    previousFocus = project;

    modalTitle.textContent = project.dataset.title || "Project details";

    modalDesc.textContent = project.dataset.desc || "";

    modalType.textContent = project.dataset.type || "PROJECT";

    currentImages = (project.dataset.files || "")
      .split(",")
      .map((file) => file.trim())
      .filter(Boolean);

    currentIndex = 0;

    modal.classList.add("open");

    modal.setAttribute("aria-hidden", "false");

    document.body.classList.add("modal-open");

    renderImages();

    // Start from the first slide
    modalFiles.scrollLeft = 0;

    modalClose.focus();

    requestAnimationFrame(updateImageCounter);
  }

  /* Close project modal */

  function closeModal() {
    // Pause videos before closing
    modalFiles.querySelectorAll("video").forEach((video) => {
      video.pause();
    });

    modal.classList.remove("open");

    modal.setAttribute("aria-hidden", "true");

    document.body.classList.remove("modal-open");

    modalFiles.innerHTML = "";

    currentImages = [];
    currentIndex = 0;

    if (scrollFrame) {
      cancelAnimationFrame(scrollFrame);
      scrollFrame = null;
    }

    previousFocus?.focus();

    previousFocus = null;
  }

  /* Project card click */

  projects.forEach((project) => {
    project.addEventListener("click", () => {
      openModal(project);
    });

    project.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();

        openModal(project);
      }
    });
  });

  /* Previous and next buttons */

  previousImage.addEventListener("click", () => {
    showImage(currentIndex - 1);
  });

  nextImage.addEventListener("click", () => {
    showImage(currentIndex + 1);
  });

  /* Update counter during manual scrolling */

  modalFiles.addEventListener("scroll", () => {
    if (scrollFrame) {
      cancelAnimationFrame(scrollFrame);
    }

    scrollFrame = requestAnimationFrame(() => {
      updateImageCounter();
      scrollFrame = null;
    });
  });

  /* Close modal */

  modalClose.addEventListener("click", closeModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  /* Keyboard navigation */

  document.addEventListener("keydown", (event) => {
    if (!modal.classList.contains("open")) return;

    if (event.key === "Escape") {
      closeModal();
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showImage(currentIndex - 1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      showImage(currentIndex + 1);
    }
  });

  /* ==============================
          4. CURRENT YEAR
       ============================== */

  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  /* ==============================
          5. SCROLL REVEAL
       ============================== */

  const revealElements = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");

            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
      },
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      element.classList.add("visible");
    });
  }

  /* ==============================
          6. ACTIVE NAVIGATION
       ============================== */

  const sections = document.querySelectorAll("main section[id]");

  const navItems = document.querySelectorAll(".nav-links a");

  if ("IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navItems.forEach((link) => {
              const isActive =
                link.getAttribute("href") === `#${entry.target.id}`;

              link.classList.toggle("active", isActive);
            });
          }
        });
      },
      {
        rootMargin: "-35% 0px -55% 0px",
      },
    );

    sections.forEach((section) => {
      navObserver.observe(section);
    });
  }
});
