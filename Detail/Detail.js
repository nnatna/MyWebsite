fetch("../nav/nav.html")
    .then(res => res.text())
    .then(data => {
        document.getElementById('navbar').innerHTML = data;
    });

function changeImage(src, element) {
    const mainImg = document.getElementById('mainImage');

    mainImg.style.opacity = '0.3';

    setTimeout(() => {
        mainImg.src = src;
        mainImg.style.opacity = '1';
    }, 150);

    document.querySelectorAll('.thumb-img').forEach(thumb => {
        thumb.classList.remove('active');
    });
    element.classList.add('active');
}

function increment(btn) {
    const input = btn.parentElement.querySelector('input');
    input.value = parseInt(input.value) + 1;
}

function decrement(btn) {
    const input = btn.parentElement.querySelector('input');
    if (parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
    }
}

function addToCart() {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.style.display = 'block';
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '9999';
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.5s';
            setTimeout(() => {
                notification.style.display = 'none';
            }, 500);
        }, 3000);
    }
}