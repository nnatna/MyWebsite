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