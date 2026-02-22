(function () {
  const searchInput = document.getElementById('search');
  const searchStatus = document.getElementById('searchStatus');
  const expandAllBtn = document.getElementById('expandAll');
  const collapseAllBtn = document.getElementById('collapseAll');
  const toggleDenseBtn = document.getElementById('toggleDense');
  const searchable = Array.from(document.querySelectorAll('.searchable'));
  const detailCards = Array.from(document.querySelectorAll('details.deep-card'));
  const navLinks = Array.from(document.querySelectorAll('.side-nav a'));
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  function normalize(text) {
    return (text || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function searchableText(el) {
    const tags = el.getAttribute('data-search') || '';
    return normalize(tags + ' ' + el.textContent);
  }

  function updateSearch() {
    const query = normalize(searchInput.value);
    let visibleCount = 0;

    searchable.forEach((el) => {
      el.classList.remove('match-hit');
      if (!query) {
        el.classList.remove('search-hidden');
        visibleCount += 1;
        return;
      }

      const match = searchableText(el).includes(query);
      if (match) {
        el.classList.remove('search-hidden');
        el.classList.add('match-hit');
        visibleCount += 1;

        if (el.tagName.toLowerCase() === 'details') {
          el.open = true;
        }
      } else {
        el.classList.add('search-hidden');
      }
    });

    if (!query) {
      searchStatus.textContent = 'Showing all notes';
    } else {
      searchStatus.textContent = `Search: "${query}" · ${visibleCount} matching blocks`;
    }
  }

  function setDenseMode(enabled) {
    document.body.classList.toggle('dense', enabled);
    localStorage.setItem('notesDenseMode', enabled ? '1' : '0');
    toggleDenseBtn.textContent = enabled ? 'Comfort Mode' : 'Dense Mode';
  }

  function hydrateDenseMode() {
    const saved = localStorage.getItem('notesDenseMode');
    if (saved === '1') {
      setDenseMode(true);
    }
  }

  function copyIntro(e) {
    const btn = e.target.closest('.copy-btn');
    if (!btn) return;

    const targetId = btn.getAttribute('data-copy-target');
    const target = document.getElementById(targetId);
    if (!target) return;

    const text = target.value.trim();
    if (!navigator.clipboard) {
      return;
    }

    navigator.clipboard.writeText(text).then(
      function () {
        const original = btn.textContent;
        btn.textContent = 'Copied';
        setTimeout(function () {
          btn.textContent = original;
        }, 1000);
      },
      function () {
        btn.textContent = 'Copy Failed';
        setTimeout(function () {
          btn.textContent = 'Copy Intro';
        }, 1000);
      }
    );
  }

  function activateNavOnScroll() {
    if (!('IntersectionObserver' in window) || sections.length === 0) return;

    const byId = new Map(navLinks.map((link) => [link.getAttribute('href').slice(1), link]));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navLinks.forEach((link) => link.classList.remove('active'));
          const active = byId.get(id);
          if (active) active.classList.add('active');
        });
      },
      {
        rootMargin: '-20% 0px -65% 0px',
        threshold: [0.1, 0.3]
      }
    );

    sections.forEach((section) => observer.observe(section));
  }

  if (searchInput) {
    searchInput.addEventListener('input', updateSearch);
  }

  if (expandAllBtn) {
    expandAllBtn.addEventListener('click', function () {
      detailCards.forEach((d) => {
        if (!d.classList.contains('search-hidden')) d.open = true;
      });
    });
  }

  if (collapseAllBtn) {
    collapseAllBtn.addEventListener('click', function () {
      detailCards.forEach((d) => {
        d.open = false;
      });
    });
  }

  if (toggleDenseBtn) {
    toggleDenseBtn.addEventListener('click', function () {
      setDenseMode(!document.body.classList.contains('dense'));
    });
  }

  document.addEventListener('click', copyIntro);

  hydrateDenseMode();
  updateSearch();
  activateNavOnScroll();
})();
