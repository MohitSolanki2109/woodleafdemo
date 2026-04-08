/* WoodLeaf Interior — main.js v2 */
(function () {
  "use strict";

  /* ---- NAV SCROLL ---- */
  const nav = document.querySelector(".nav");
  if (nav) {
    window.addEventListener("scroll", () => {
      nav.classList.toggle("scrolled", window.scrollY > 50);
    }, { passive: true });
  }

  /* ---- MOBILE MENU ---- */
  const burger = document.querySelector(".nav__burger");
  const drawer = document.querySelector(".nav__drawer");

  if (burger && drawer) {
    burger.addEventListener("click", () => {
      const isOpen = drawer.classList.toggle("open");
      burger.classList.toggle("open", isOpen);
      // prevent body scroll when menu is open
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    // Close on link click
    drawer.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", closeMenu);
    });

    // Close on backdrop click (outside drawer)
    document.addEventListener("click", e => {
      if (drawer.classList.contains("open") && !drawer.contains(e.target) && !burger.contains(e.target)) {
        closeMenu();
      }
    });
  }

  function closeMenu() {
    if (drawer) drawer.classList.remove("open");
    if (burger) burger.classList.remove("open");
    document.body.style.overflow = "";
  }

  /* ---- ACTIVE NAV LINK ---- */
  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav__links a, .nav__drawer a").forEach(a => {
    const href = a.getAttribute("href");
    if (href === page || (page === "" && href === "index.html")) {
      a.classList.add("active");
    }
  });

  /* ---- SCROLL REVEAL ---- */
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    revealEls.forEach(el => obs.observe(el));
  } else {
    // Fallback: show all immediately
    revealEls.forEach(el => el.classList.add("visible"));
  }

  /* ---- COUNTER ANIMATION ---- */
  function animateCount(el, target, dur = 1400) {
    let start = null;
    function step(ts) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.floor(p * target);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window) {
    const countEls = document.querySelectorAll("[data-count]");
    const countObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCount(e.target, parseInt(e.target.dataset.count));
          countObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    countEls.forEach(el => countObs.observe(el));
  }

  /* ---- PRODUCT / GALLERY FILTER ---- */
  document.querySelectorAll("[data-filter-group]").forEach(group => {
    const btns  = group.querySelectorAll(".filter-btn");
    const items = group.parentElement.querySelectorAll("[data-cat]");
    btns.forEach(btn => {
      btn.addEventListener("click", () => {
        btns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const f = btn.dataset.filter;
        items.forEach(item => {
          item.style.display = (f === "all" || item.dataset.cat === f) ? "" : "none";
        });
      });
    });
  });

  /* ---- PRODUCT PAGE FILTER (standalone) ---- */
  const filterBtns  = document.querySelectorAll(".filter-btn[data-filter]");
  const productCards = document.querySelectorAll(".p-card[data-category]");
  if (filterBtns.length && productCards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const cat = btn.dataset.filter;
        productCards.forEach(card => {
          card.style.display = (cat === "all" || card.dataset.category === cat) ? "" : "none";
        });
      });
    });
  }

  /* ---- GALLERY FILTER ---- */
  const gBtns  = document.querySelectorAll(".gfilter-btn");
  const gItems = document.querySelectorAll(".g-item[data-cat]");
  if (gBtns.length) {
    gBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        gBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const f = btn.dataset.filter;
        gItems.forEach(item => {
          item.style.display = (f === "all" || item.dataset.cat === f) ? "" : "none";
        });
      });
    });
  }

  /* ---- LIGHTBOX ---- */
  const lb      = document.getElementById("lb");
  const lbImg   = document.getElementById("lb-img");
  const lbClose = document.getElementById("lb-close");

  if (lb && lbImg) {
    document.querySelectorAll(".g-item").forEach(item => {
      item.addEventListener("click", () => {
        const src = item.querySelector("img")?.src;
        if (src) { lbImg.src = src; lb.classList.add("open"); document.body.style.overflow = "hidden"; }
      });
    });
    function closeLb() { lb.classList.remove("open"); document.body.style.overflow = ""; }
    lb.addEventListener("click", e => { if (e.target === lb) closeLb(); });
    if (lbClose) lbClose.addEventListener("click", closeLb);
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeLb(); });
  }

  /* ---- WEB3FORMS CONTACT FORM ---- */
  const form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", async e => {
      e.preventDefault();

      const btn       = document.getElementById("submitBtn");
      const btnTxt    = document.getElementById("btnTxt");
      const btnSpin   = document.getElementById("btnSpin");
      const successEl = document.getElementById("msgSuccess");
      const errorEl   = document.getElementById("msgError");

      successEl.style.display = "none";
      errorEl.style.display   = "none";
      btn.disabled = true;
      btnTxt.style.display  = "none";
      btnSpin.style.display = "inline";

      try {
        const data   = new FormData(form);
        const object = Object.fromEntries(data);
        const res    = await fetch("https://api.web3forms.com/submit", {
          method : "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body   : JSON.stringify(object)
        });
        const result = await res.json();
        if (res.ok && result.success) {
          successEl.style.display = "block";
          form.reset();
        } else {
          errorEl.style.display = "block";
        }
      } catch (_) {
        errorEl.style.display = "block";
      } finally {
        btn.disabled = false;
        btnTxt.style.display  = "inline";
        btnSpin.style.display = "none";
      }
    });
  }

  /* ---- CODE PROTECTION ---- */
  document.addEventListener("contextmenu", e => e.preventDefault());
  document.addEventListener("keydown", e => {
    if (e.key === "F12" || (e.ctrlKey && e.shiftKey && ["I","J","C"].includes(e.key)) || (e.ctrlKey && e.key === "U")) {
      e.preventDefault();
    }
  });

})();
