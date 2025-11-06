// Configuration API
const API_BASE_URL = 'https://quizz.adrardev.fr/api';
const LOGIN_ENDPOINT = '/login_check';

// Éléments du DOM
let loginForm;
let emailInput;
let passwordInput;
let errorMessage;
let submitBtn;

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    
    // Récupérer les éléments du DOM
    loginForm = document.getElementById('loginForm');
    emailInput = document.getElementById('email');
    passwordInput = document.getElementById('password');
    errorMessage = document.getElementById('errorMessage');
    submitBtn = loginForm.querySelector('button[type="submit"]');
    
    // Vérifier si l'utilisateur est déjà connecté
    const token = localStorage.getItem('authToken');
    if (token) {
        // Vérifier si le token est toujours valide
        verifyToken(token);
    }
    
    // Gérer la soumission du formulaire
    loginForm.addEventListener('submit', handleLogin);
});

// Fonction pour afficher un message d'erreur
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.className = 'form-message error';
}

// Fonction pour afficher un message de succès
function showSuccess(message) {
    errorMessage.textContent = message;
    errorMessage.className = 'form-message success';
}

// Fonction pour cacher le message
function hideMessage() {
    errorMessage.style.display = 'none';
    errorMessage.className = 'form-message';
}

// Fonction pour vérifier si le token est valide
async function verifyToken(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/user/me`, {
            method: 'GET',
            headers: {
                'Authorization': `bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            // Token valide, rediriger vers la page d'accueil
            window.location.href = 'Accueil.html';
        } else {
            // Token invalide, le supprimer
            localStorage.removeItem('authToken');
            localStorage.removeItem('userEmail');
        }
    } catch (error) {
        console.error('Erreur lors de la vérification du token:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
    }
}

// Fonction pour gérer la connexion
async function handleLogin(event) {
    event.preventDefault();
    
    // Récupérer les valeurs du formulaire
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Validation basique
    if (!email || !password) {
        showError('Veuillez remplir tous les champs.');
        return;
    }
    
    // Désactiver le bouton et afficher un état de chargement
    submitBtn.disabled = true;
    submitBtn.textContent = 'Connexion en cours...';
    hideMessage();
    
    try {
        // Préparer les données de connexion
        const loginData = {
            username: email,  // L'API utilise "username" pour l'email
            password: password
        };
        
        // Envoyer la requête de connexion
        const response = await fetch(`${API_BASE_URL}${LOGIN_ENDPOINT}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        
        // Vérifier la réponse
        if (response.ok) {
            const data = await response.json();
            
            // Stocker le token dans le localStorage
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userEmail', email);
            
            // Afficher un message de succès
            showSuccess('✅ Connexion réussie ! Redirection...');
            
            // Rediriger vers la page d'accueil après un court délai
            setTimeout(() => {
                window.location.href = 'Accueil.html';
            }, 1500);
            
        } else {
            // Gérer les erreurs
            const errorData = await response.json().catch(() => null);
            
            if (response.status === 401) {
                showError('❌ Email ou mot de passe incorrect.');
            } else if (errorData && errorData.error) {
                showError(`❌ ${errorData.error}`);
            } else {
                showError('❌ Une erreur est survenue. Veuillez réessayer.');
            }
            
            // Réactiver le bouton
            submitBtn.disabled = false;
            submitBtn.textContent = 'Se connecter';
        }
        
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        showError('❌ Erreur de connexion. Vérifiez votre connexion internet.');
        
        // Réactiver le bouton
        submitBtn.disabled = false;
        submitBtn.textContent = 'Se connecter';
    }
}

// Fonction utilitaire pour déconnecter l'utilisateur (peut être utilisée ailleurs)
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    window.location.href = 'Connexion.html';
}
