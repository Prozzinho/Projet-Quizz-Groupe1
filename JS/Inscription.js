const form = document.getElementById('inscription-form');
const submitBtn = document.getElementById('bouton-inscription');
const backdrop = document.getElementById('modal-backdrop');
const modal = document.getElementById('popup-inscription');
const loginBtn = document.getElementById('bouton-connecter');

if (form) {
    form.addEventListener('submit', async (event) => {

        const login = {
            firstname: form.firstname,
            lastname: form.lastname,
            email: form.email,
            password: form.password
        }

        try {
            // Code à essayer
            const response = await fetch('https://quizz.adrardev.fr/api/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        
            const data = await response.json().catch(() => ({}));
        
            if (!response.ok) {
                alert(data.error || 'Erreur serveur');
                return;
            }
        
            document.getElementById('popup-inscription').classList.add('is-open');
            if (backdrop) {
                backdrop.classList.add('is-open');
            }
            document.body.style.overflow = 'hidden';
        } 
        catch (error) {
            // Gère les erreurs réseau ou exceptions JS
            alert('Erreur: ' + (error && error.message ? error.message : String(error)));
        }
    })}

    if (loginBtn && modal) {
    loginBtn.addEventListener('click', () => {
        modal.classList.remove('is-open');
        const backdrop = document.getElementById('modal-backdrop');
        if (backdrop) backdrop.classList.remove('is-open');
        document.body.style.overflow = '';
        window.location.href = 'Connexion.html';
    });
}