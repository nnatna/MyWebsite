document.addEventListener('DOMContentLoaded', () => {
    window.Reloadsignup = function() {
        const loginForm = document.querySelector('form.login');
        const signupForm = document.querySelector('form.signup');
        if (!signupForm || !loginForm) return;
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        const firstInput = signupForm.querySelector('input, button');
        if (firstInput) firstInput.focus();
    };

    const signupForm = document.querySelector('form.signup');
    if (signupForm) signupForm.style.display = 'none';

    document.querySelectorAll('a').forEach(a => {
        if (a.textContent && a.textContent.trim().toLowerCase().includes('create')) {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                window.Reloadsignup();
            });
        }
    });
});