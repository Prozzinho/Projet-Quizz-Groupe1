let token = window.localStorage.getItem("Token");
let headerNav = document.querySelector('.header-nav');
// La déclaration 'newProfilImage' ici est inutile car elle est recréée plus loin.
// Les sélecteurs doivent être corrigés pour les liens:
let inscrire = document.querySelector('a[href="Inscription.html"]');
let seConnecter = document.querySelector('a[href="Connexion.html"]'); 


if (token){
    (async () => {
        try {
            const response = await fetch('https://quizz.adrardev.fr/api/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                 }
            });

             const data = await response.json().catch(() => ({}));
            
             // --- Gérer la déconnexion / l'expiration du Token (401) en premier ---
             if(response.status === 401) {
                console.log("Token invalide ou expiré. Nettoyage du localStorage.");
                window.localStorage.removeItem("Token");
                return; // Arrête l'exécution si le token est invalide
            }

            // --- Gérer les autres erreurs serveur ---
            if (!response.ok) {
                alert(data.error || 'Erreur serveur');
                return;
            }
     
            // --- Logique de Succès (Mise à jour de l'UI IMMÉDIATE) ---
            if (response.ok) {
                
                // 1. Masquer les liens
                // Utilisez la classe que vous avez définie en CSS (ex: .hidden ou .pasConnecter)
                if (seConnecter) seConnecter.classList.add("pasConnecter"); 
                if (inscrire) inscrire.classList.add('pasConnecter');

                // 2. Créer et ajouter l'image de profil
                // On déclare la variable ici pour ne pas avoir de conflit de portée
                let newProfilImageElement = document.createElement('img');
                newProfilImageElement.src = '../Assets/img/profil-image.png'; // Utiliser l'avatar de l'API si possible
                newProfilImageElement.style.width = '40px'; 
                newProfilImageElement.style.height = '40px';
                newProfilImageElement.style.borderRadius = '50%';
                newProfilImageElement.className = 'profile-icon';

                // 3. Ajouter au header
                if (headerNav) {
                    headerNav.appendChild(newProfilImageElement);
                }
            }
        
        }
        catch (error) {
            console.error('Erreur réseau ou JavaScript :', error);
            alert('Erreur: ' + (error && error.message ? error.message : String(error)));
        }
    })();
}