function openAlbum(id) {
    closeAll();
    const album = document.getElementById('album-' + id);
    const card = document.getElementById('card-' + id);
    album.classList.add('album--active');
    card.classList.add('card--active');
}

function closeAll() {
    const albumActv = document.querySelector('.album--active');
    const cardActv = document.querySelector('.card--active');
    if (albumActv) {
        albumActv.classList.remove('album--active');
    }
    if (cardActv) {
        cardActv.classList.remove('card--active');
    }
}

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
        const imageUrl = entry.target.getAttribute('data-bg');
        entry.target.style.backgroundImage = `url(${imageUrl})`;
        observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1
});

const landscape_images = document.querySelectorAll('.album-image');
landscape_images.forEach(element => {
    observer.observe(element);
});

const portrait_images = document.querySelectorAll('.album-image-portrait');
portrait_images.forEach(element => {
    observer.observe(element);
});