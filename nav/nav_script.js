 (function() {
     var btn = document.getElementById('navToggle');
     var links = document.getElementById('navLinks');
     if (!btn || !links) return;
     btn.addEventListener('click', function() {
         var shown = links.classList.toggle('show');
         btn.setAttribute('aria-expanded', shown);
     });
     document.addEventListener('keydown', function(e) {
         if (e.key === 'Escape' && links.classList.contains('show')) {
             links.classList.remove('show');
             btn.setAttribute('aria-expanded', 'false');
             btn.focus();
         }
     });
 })();