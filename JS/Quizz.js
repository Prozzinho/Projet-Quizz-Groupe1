// Gestion du bouton "Créer un quiz"
document.addEventListener('DOMContentLoaded', function() {
    const createQuizBtn = document.getElementById('createQuizBtn');
    
    if (createQuizBtn) {
        createQuizBtn.addEventListener('click', function() {
            // Redirection vers la page de création de quiz
            window.location.href = 'CreationQuizz.html';
        });
    }
});
