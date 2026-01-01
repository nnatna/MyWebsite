fetch("../nav/nav.html")
    .then(res => res.text())
    .then(data => {
        document.getElementById('navbar').innerHTML = data;
    });

document.addEventListener('DOMContentLoaded', function() {
    const hero = document.querySelector('.about-hero');
    if (hero) {
        hero.addEventListener('click', function() {
            hero.classList.toggle('shadow-lg');
        });
    }
});