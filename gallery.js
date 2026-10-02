document.addEventListener('DOMContentLoaded', () => {
    // --- Filter Functionality ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and add to clicked one
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            galleryItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                if (filterValue === 'all' || category === filterValue) {
                    item.classList.remove('hide');
                } else {
                    item.classList.add('hide');
                }
            });
        });
    });

    // --- Lightbox Functionality ---
    const lightbox = document.getElementById('gallery-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeLightbox = document.querySelector('.close-lightbox');

    galleryItems.forEach(item => {
        const img = item.querySelector('img');
        const title = item.querySelector('.gallery-overlay h3').innerText;

        item.querySelector('.gallery-img-wrapper').addEventListener('click', () => {
            lightbox.style.display = 'block';
            lightboxImg.src = img.src;
            lightboxCaption.innerText = title;
        });
    });

    // Close Lightbox on 'X' click
    closeLightbox.addEventListener('click', () => {
        lightbox.style.display = 'none';
    });

    // Close Lightbox when clicking outside the image
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.style.display = 'none';
        }
    });
});
document.addEventListener('DOMContentLoaded', () => {
    // --- Category Filtering Logic ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            galleryItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                if (filterValue === 'all' || category === filterValue) {
                    item.classList.remove('hide');
                } else {
                    item.classList.add('hide');
                }
            });
        });
    });

    // --- Lightbox & Image Zoom Functionality ---
    const lightbox = document.getElementById('gallery-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeLightbox = document.querySelector('.close-lightbox');

    galleryItems.forEach(item => {
        const imgWrapper = item.querySelector('.gallery-img-wrapper');
        const img = item.querySelector('img');
        const title = item.querySelector('.gallery-overlay h3').innerText;

        imgWrapper.addEventListener('click', () => {
            // Reset zoom state when opening a new image
            lightboxImg.classList.remove('zoomed');
            
            lightbox.style.display = 'block';
            lightboxImg.src = img.src;
            lightboxCaption.innerText = title;
        });
    });

    // Click on image inside lightbox to Toggle Zoom In / Zoom Out
    lightboxImg.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevents closing the lightbox when clicking the image
        lightboxImg.classList.toggle('zoomed');
    });

    // Close Lightbox when clicking the 'X' button
    closeLightbox.addEventListener('click', () => {
        lightbox.style.display = 'none';
        lightboxImg.classList.remove('zoomed');
    });

    // Close Lightbox when clicking the dark background outside the image
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.style.display = 'none';
            lightboxImg.classList.remove('zoomed');
        }
    });

    // Close Lightbox with the 'Escape' key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.style.display === 'block') {
            lightbox.style.display = 'none';
            lightboxImg.classList.remove('zoomed');
        }
    });
});