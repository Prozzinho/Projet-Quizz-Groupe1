let form = document.getElementById("connexion-form");
let button = document.getElementById("bouton-inscription");

if (form) {
    form.addEventListener('submit', async(event) =>{
        event.preventDefault();

        const infoLogin = {
            username: form.email.value,
            password: form.password.value
        }

        try {
            // Code à essayer
            const response = await fetch('https://quizz.adrardev.fr/api/login_check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(infoLogin)
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                alert(data.error || 'Erreur serveur');
                return;
            }
            window.localStorage.setItem("Token", data.token);
            alert("Vous etes connecté");
            window.location.href = 'Accueil.html';
    }
    catch (error) {
        // Gère les erreurs réseau ou exceptions JS
        alert('Erreur: ' + (error && error.message ? error.message : String(error)));
    }
})
}