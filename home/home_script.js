fetch("../nav/nav.html")
    .then(res => res.text())
    .then(data => {
        document.getElementById('navbar').innerHTML = data;
    });

document.addEventListener('DOMContentLoaded', function() {
    // (P1, P2, P3, etc.)
    const productCards = document.querySelectorAll('[id^="P"]');

    productCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // cart or favorite buttons
            if (e.target.closest('.cart-heart') || e.target.closest('a')) {
                return;
            }

            const productId = card.id.replace('P', ''); //from P1, P2, etc.
            window.location.href = `../Detail/Detail.html?id=${productId}`;
        });

        //clickable
        card.style.cursor = 'pointer';
    });
});