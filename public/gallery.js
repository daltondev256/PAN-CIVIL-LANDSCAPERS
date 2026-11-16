document.addEventListener('DOMContentLoaded', () => {
  const filterButtons = [...document.querySelectorAll('.filter-btn')];
  const items = [...document.querySelectorAll('.gallery-item')];
  const lightbox = document.getElementById('gallery-lightbox');
  const image = document.getElementById('lightbox-img');
  const caption = document.getElementById('lightbox-caption');
  const close = document.querySelector('.close-lightbox');
  let lastFocused = null;

  filterButtons.forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter || 'all';
    filterButtons.forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    items.forEach(item => item.classList.toggle('hide', filter !== 'all' && item.dataset.category !== filter));
  }));

  if (!lightbox || !image || !caption || !close) return;
  function closeLightbox() {
    lightbox.style.display = 'none';
    image.classList.remove('zoomed');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }
  items.forEach(item => {
    const trigger = item.querySelector('.gallery-img-wrapper');
    const source = item.querySelector('img');
    const title = item.querySelector('.gallery-card-copy h3');
    if (!trigger || !source) return;
    trigger.addEventListener('click', () => {
      lastFocused = trigger;
      image.src = source.currentSrc || source.src;
      image.alt = source.alt || 'Outdoor landscaping project';
      caption.textContent = title ? title.textContent : source.alt;
      image.classList.remove('zoomed');
      lightbox.style.display = 'block';
      document.body.style.overflow = 'hidden';
      close.focus();
    });
  });
  image.addEventListener('click', event => {
    event.stopPropagation();
    image.classList.toggle('zoomed');
  });
  close.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', event => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && lightbox.style.display === 'block') closeLightbox();
  });
});