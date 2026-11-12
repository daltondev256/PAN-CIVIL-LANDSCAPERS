document.addEventListener('DOMContentLoaded', () => {
  const filterButtons = [...document.querySelectorAll('.filter-btn')];
  const items = [...document.querySelectorAll('.gallery-item')];
  const lightbox = document.getElementById('gallery-lightbox');
  const image = document.getElementById('lightbox-img');
  const caption = document.getElementById('lightbox-caption');
  const close = document.querySelector('.close-lightbox');

  filterButtons.forEach(button => button.addEventListener('click', () => {
    filterButtons.forEach(item => item.classList.toggle('active', item === button));
    const filter = button.dataset.filter || 'all';
    items.forEach(item => item.classList.toggle('hide', filter !== 'all' && item.dataset.category !== filter));
  }));

  if (!lightbox || !image || !caption || !close) return;
  function closeLightbox() {
    lightbox.style.display = 'none';
    image.classList.remove('zoomed');
  }
  items.forEach(item => {
    const wrapper = item.querySelector('.gallery-img-wrapper');
    const source = item.querySelector('img');
    const title = item.querySelector('.gallery-overlay h3');
    if (!wrapper || !source) return;
    wrapper.addEventListener('click', () => {
      image.src = source.currentSrc || source.src;
      image.alt = source.alt || 'Pancivil landscaping project';
      caption.textContent = title ? title.textContent : source.alt;
      image.classList.remove('zoomed');
      lightbox.style.display = 'block';
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
    if (event.key === 'Escape') closeLightbox();
  });
});