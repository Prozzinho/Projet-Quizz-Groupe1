// Récupère le formulaire et éléments utiles
const form = document.getElementById('inscription-form');
const submitBtn = document.getElementById('bouton-inscription');

// Fonction pour nettoyer les inputs
function normalizeWhitespace(value) {
    return value.replace(/\s+/g, ' ').trim();
}

// Fonction pour nettoyer les inputs
function sanitizePayload(raw) {
    return {
        firstname: normalizeWhitespace(String(raw.firstname || '')),
        lastname: normalizeWhitespace(String(raw.lastname || '')),
        email: String(raw.email || '').trim().toLowerCase(),
        password: String(raw.password || '').trim()
    };
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email);
}


function isValidPayload(p) {
    return (
        p.firstname.length >= 1 &&
        p.lastname.length >= 1 &&
        isValidEmail(p.email) &&
        p.password.length >= 5
    );
}

// Si le formulaire existe sur la page, on écoute l'évènement de soumission
if (form) {
    form.addEventListener('submit', async (event) => {
        // Empêche le rechargement de la page et la soumission HTML par défaut
        event.preventDefault();

        // Convertit et nettoie les champs du formulaire
        const formData = new FormData(form);
        const payload = sanitizePayload({
            firstname: formData.get('firstname'),
            lastname: formData.get('lastname'),
            email: formData.get('email'),
            password: formData.get('password')
        });

        // Bloque si invalide
        if (!isValidPayload(payload)) {
            alert('Veuillez renseigner des données valides. (email, mot de passe ≥ 8)');
            return;
        }

        try {
            // Envoie la requête POST au backend en JSON
            const response = await fetch('https://quizz.adrardev.fr/api/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            // Tente de parser la réponse JSON; renvoie {} si le corps est vide
            const data = await response.json().catch(() => ({}));

            // Gère les erreurs HTTP (ex: 400 avec { error: "..." })
            if (!response.ok) {
                alert(data.error || 'Erreur serveur');
                return;
            }
            document.getElementById('popup-inscription').classList.add('is-open');
            const backdrop = document.getElementById('modal-backdrop');
            if (backdrop) backdrop.classList.add('is-open');
            document.body.style.overflow = 'hidden';
        } catch (error) {
            // Gère les erreurs réseau ou exceptions JS
            alert('Erreur: ' + (error && error.message ? error.message : String(error)));
        }
    });
}

// Activation/désactivation du bouton suivant la validité
if (form && submitBtn) {
    const inputs = form.querySelectorAll('input[name="firstname"], input[name="lastname"], input[name="email"], input[name="password"]');
    const reevaluate = () => {
        const current = sanitizePayload({
            firstname: form.firstname?.value,
            lastname: form.lastname?.value,
            email: form.email?.value,
            password: form.password?.value
        });
        submitBtn.disabled = !isValidPayload(current);
    };
    inputs.forEach((el) => {
        el.addEventListener('input', reevaluate);
        el.addEventListener('blur', (e) => {
            // Nettoie visuellement les champs texte (pas le mot de passe)
            const target = e.target;
            if (target && target.name !== 'password') {
                target.value = normalizeWhitespace(target.value);
                if (target.name === 'email') {
                    target.value = target.value.trim().toLowerCase();
                }
            }
            reevaluate();
        });
    });
    // Évalue à l'initialisation
    reevaluate();
}

const modal = document.getElementById('popup-inscription');
const loginBtn = document.getElementById('bouton-connecter');

if (loginBtn && modal) {
    loginBtn.addEventListener('click', () => {
        modal.classList.remove('is-open');
        const backdrop = document.getElementById('modal-backdrop');
        if (backdrop) backdrop.classList.remove('is-open');
        document.body.style.overflow = '';
        window.location.href = 'Connexion.html';
    });
}