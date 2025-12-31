fetch("../nav/nav.html")
    .then(res => res.text())
    .then(data => {
        document.getElementById('navbar').innerHTML = data;
    });


function removeFavorite(button) {
    const cardWrapper = button.closest('.fav-card-wrapper');


    cardWrapper.classList.add('fade-out');


    setTimeout(() => {
        cardWrapper.remove();
        updateCount();
        checkEmptyState();
    }, 400);
}


function updateCount() {
    const items = document.querySelectorAll('.fav-card-wrapper');
    const countDisplay = document.getElementById('fav-count');
    if (countDisplay) {
        countDisplay.innerText = `${items.length} ${items.length === 1 ? 'Item' : 'Items'}`;
    }
}


function checkEmptyState() {
    const container = document.getElementById('favorites-container');
    const emptyState = document.getElementById('empty-state');
    const items = document.querySelectorAll('.fav-card-wrapper');

    if (items.length === 0) {
        if (container) container.classList.add('d-none');
        if (emptyState) {
            emptyState.classList.remove('d-none');
            emptyState.classList.add('animate__animated', 'animate__fadeIn');
        }
    }
}


document.addEventListener('DOMContentLoaded', () => {
    updateCount();
    checkEmptyState();
});

document.addEventListener('DOMContentLoaded', function() {
    const productCards = document.querySelectorAll('[id^="P"]');

    productCards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.closest('.cart-heart') || e.target.closest('a')) {
                return;
            }

            const productId = card.id.replace('P', '');
            window.location.href = `../Detail/Detail.html?id=${productId}`;
        });


        card.style.cursor = 'pointer';
    });
});