fetch("../nav/nav.html")
    .then(res => res.text())
    .then(data => {
        document.getElementById('navbar').innerHTML = data;
    });

document.addEventListener('DOMContentLoaded', () => {
    updateCount();
    checkEmptyState();
});

document.addEventListener('DOMContentLoaded', function() {
    const productCards = document.querySelectorAll('[id^="P"]');

    productCards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.closest('.cart-heart') ||
                e.target.closest('a') ||
                e.target.closest('button')) {
                return;
            }

            const productId = card.id.replace('P', '');
            window.location.href = `../Detail/Detail.html?id=${productId}`;
        });


        card.style.cursor = 'pointer';
    });
});