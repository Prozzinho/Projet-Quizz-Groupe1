// Configuration API
const API_BASE_URL = 'https://quizz.adrardev.fr/api';

// Structure pour stocker les données du quiz
let quizData = {
    title: '',
    description: '',
    categories: [], // Tableau d'IDs de catégories
    questions: []   // Tableau d'IDs de questions créées
};

let questionCount = 0;

// Fonction pour récupérer le token depuis le localStorage
function getAuthToken() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Vous devez être connecté pour créer un quiz.');
        window.location.href = 'Connexion.html';
        return null;
    }
    return token;
}

// Fonction pour faire des requêtes API avec authentification
async function apiRequest(endpoint, method = 'GET', body = null) {
    const token = getAuthToken();
    if (!token) return null;
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `bearer ${token}`
    };
    
    const options = {
        method: method,
        headers: headers
    };
    
    if (body && method !== 'GET') {
        options.body = JSON.stringify(body);
        console.log('📤 Envoi API:', endpoint, body);
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        console.log(`📥 Réponse ${endpoint}:`, response.status, response.statusText);
        
        if (response.status === 401) {
            alert('Session expirée. Veuillez vous reconnecter.');
            localStorage.removeItem('authToken');
            window.location.href = 'Connexion.html';
            return null;
        }
        
        // Vérifier si la réponse est du JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('❌ Réponse non-JSON:', text.substring(0, 200));
            throw new Error(`Le serveur a renvoyé une réponse non-JSON (${response.status})`);
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || data.message || `Erreur ${response.status}`);
        }
        
        console.log('✅ Données reçues:', data);
        return data;
        
    } catch (error) {
        console.error('❌ Erreur API:', error);
        throw error;
    }
}

// Charger les catégories existantes depuis l'API (endpoint PUBLIC, pas de token)
async function loadCategories() {
    try {
        console.log('🔄 Chargement des catégories...');
        
        const response = await fetch(`${API_BASE_URL}/category/all`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erreur ${response.status}`);
        }
        
        const categories = await response.json();
        console.log('✅ Catégories chargées:', categories);
        
        const categorySelect = document.getElementById('quizCategory');
        
        // Vider les options existantes (sauf la première)
        categorySelect.innerHTML = '<option value="">Sélectionnez une catégorie</option>';
        
        // Ajouter les catégories depuis l'API
        if (categories && categories.length > 0) {
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.title;
                categorySelect.appendChild(option);
            });
            console.log(`✅ ${categories.length} catégories ajoutées au select`);
        } else {
            console.warn('⚠️ Aucune catégorie disponible');
            alert('Aucune catégorie disponible. Contactez un administrateur.');
        }
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des catégories:', error);
        alert('Impossible de charger les catégories. Vérifiez votre connexion.');
    }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    
    console.log('🚀 Initialisation de la page de création de quiz');
    
    // Vérifier l'authentification
    const token = getAuthToken();
    if (!token) {
        return;
    }
    console.log('✅ Token trouvé:', token.substring(0, 20) + '...');
    
    // Charger les catégories existantes
    loadCategories();
    
    // Bouton pour ajouter une question
    const addQuestionBtn = document.getElementById('addQuestionBtn');
    addQuestionBtn.addEventListener('click', addQuestion);
    
    // Bouton annuler
    const cancelBtn = document.getElementById('cancelBtn');
    cancelBtn.addEventListener('click', function() {
        if (confirm('Êtes-vous sûr de vouloir annuler ? Toutes les données seront perdues.')) {
            window.location.href = 'Quizz.html';
        }
    });
    
    // Soumission du formulaire
    const quizForm = document.getElementById('quizForm');
    quizForm.addEventListener('submit', handleSubmit);
    
    // Ajouter une première question par défaut
    addQuestion();
});

// Fonction pour ajouter une question (UI uniquement, pas encore créée dans l'API)
function addQuestion() {
    questionCount++;
    const questionsContainer = document.getElementById('questionsContainer');
    
    const questionCard = document.createElement('div');
    questionCard.className = 'question-card';
    questionCard.dataset.questionId = questionCount;
    
    questionCard.innerHTML = `
        <div class="question-header">
            <span class="question-number">Question ${questionCount}</span>
            <button type="button" class="btn-remove-question" onclick="removeQuestion(${questionCount})">
                Supprimer
            </button>
        </div>
        
        <div class="form-group">
            <label class="form-label">Titre de la question *</label>
            <input type="text" class="form-input question-title" 
                   placeholder="Entrez votre question" required maxlength="100">
        </div>
        
        <div class="form-group">
            <label class="form-label">Description (optionnelle)</label>
            <textarea class="form-textarea question-description" rows="2" 
                      placeholder="Informations complémentaires..."></textarea>
        </div>
        
        <div class="form-group">
            <label class="form-label">Points attribués</label>
            <input type="number" class="form-input question-points" 
                   placeholder="Nombre de points" min="1" value="1">
        </div>
        
        <div class="form-group">
            <label class="form-label">Réponses *</label>
            <div class="answers-container" data-question="${questionCount}">
                <div class="answer-item">
                    <input type="text" class="form-input answer-text" 
                           placeholder="Réponse 1" required>
                    <input type="checkbox" class="answer-valid" title="Réponse correcte">
                    <span>Correcte</span>
                </div>
                <div class="answer-item">
                    <input type="text" class="form-input answer-text" 
                           placeholder="Réponse 2" required>
                    <input type="checkbox" class="answer-valid" title="Réponse correcte">
                    <span>Correcte</span>
                </div>
            </div>
            <button type="button" class="btn-add-answer" onclick="addAnswer(${questionCount})">
                + Ajouter une réponse
            </button>
        </div>
    `;
    
    questionsContainer.appendChild(questionCard);
    console.log(`✅ Question ${questionCount} ajoutée`);
}

// Fonction pour supprimer une question
function removeQuestion(questionId) {
    if (confirm('Supprimer cette question ?')) {
        const questionCard = document.querySelector(`[data-question-id="${questionId}"]`);
        if (questionCard) {
            questionCard.remove();
            renumberQuestions();
            console.log(`✅ Question ${questionId} supprimée`);
        }
    }
}

// Fonction pour renuméroter les questions
function renumberQuestions() {
    const questions = document.querySelectorAll('.question-card');
    questions.forEach((question, index) => {
        const questionNumber = question.querySelector('.question-number');
        questionNumber.textContent = `Question ${index + 1}`;
    });
}

// Fonction pour ajouter une réponse
function addAnswer(questionId) {
    const answersContainer = document.querySelector(`.answers-container[data-question="${questionId}"]`);
    const answerCount = answersContainer.querySelectorAll('.answer-item').length + 1;
    
    const answerItem = document.createElement('div');
    answerItem.className = 'answer-item';
    answerItem.innerHTML = `
        <input type="text" class="form-input answer-text" 
               placeholder="Réponse ${answerCount}" required>
        <input type="checkbox" class="answer-valid" title="Réponse correcte">
        <span>Correcte</span>
    `;
    
    answersContainer.appendChild(answerItem);
    console.log(`✅ Réponse ${answerCount} ajoutée à la question ${questionId}`);
}

// Fonction pour créer une question via l'API
async function createQuestion(questionData) {
    try {
        console.log('📤 Création de question:', questionData);
        const response = await apiRequest('/question', 'POST', questionData);
        console.log('✅ Question créée avec ID:', response.id);
        return response;
    } catch (error) {
        console.error('❌ Erreur lors de la création de la question:', error);
        throw error;
    }
}

// Fonction pour créer le quiz final via l'API
async function createQuiz(quizData) {
    try {
        console.log('📤 Création du quiz final:', quizData);
        const response = await apiRequest('/quizz', 'POST', quizData);
        console.log('✅ Quiz créé:', response);
        return response;
    } catch (error) {
        console.error('❌ Erreur lors de la création du quiz:', error);
        throw error;
    }
}

// Fonction pour gérer la soumission du formulaire
async function handleSubmit(event) {
    event.preventDefault();
    
    console.log('🚀 Début de la soumission du formulaire');
    
    // Désactiver le bouton de soumission
    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Création en cours...';
    
    try {
        // 1. Récupérer les informations générales
        quizData.title = document.getElementById('quizTitle').value.trim();
        quizData.description = document.getElementById('quizDescription').value.trim();
        
        console.log('📝 Titre:', quizData.title);
        console.log('📝 Description:', quizData.description);
        
        // 2. Gérer les catégories
        const categoryId = document.getElementById('quizCategory').value;
        if (!categoryId) {
            alert('⚠️ Veuillez sélectionner une catégorie.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Créer le quiz';
            return;
        }
        quizData.categories = [parseInt(categoryId)];
        console.log('📂 Catégorie sélectionnée (ID):', categoryId);
        
        // 3. Créer toutes les questions via l'API
        const questionCards = document.querySelectorAll('.question-card');
        const questionIds = [];
        
        console.log(`📋 ${questionCards.length} question(s) à créer`);
        
        for (let i = 0; i < questionCards.length; i++) {
            const card = questionCards[i];
            
            const questionTitle = card.querySelector('.question-title').value.trim();
            const questionDescription = card.querySelector('.question-description').value.trim();
            const questionPoints = parseInt(card.querySelector('.question-points').value) || 1;
            
            // Récupérer les réponses
            const answerItems = card.querySelectorAll('.answer-item');
            const answers = [];
            let hasCorrectAnswer = false;
            
            answerItems.forEach(item => {
                const text = item.querySelector('.answer-text').value.trim();
                const valid = item.querySelector('.answer-valid').checked;
                
                if (text !== '') {
                    answers.push({
                        text: text,
                        valid: valid
                    });
                    
                    if (valid) {
                        hasCorrectAnswer = true;
                    }
                }
            });
            
            // Vérifier qu'il y a au moins une bonne réponse
            if (!hasCorrectAnswer) {
                alert(`⚠️ Question ${i + 1}: Vous devez sélectionner au moins une réponse correcte.`);
                submitBtn.disabled = false;
                submitBtn.textContent = 'Créer le quiz';
                return;
            }
            
            // Vérifier qu'il y a au moins 2 réponses
            if (answers.length < 2) {
                alert(`⚠️ Question ${i + 1}: Vous devez avoir au moins 2 réponses.`);
                submitBtn.disabled = false;
                submitBtn.textContent = 'Créer le quiz';
                return;
            }
            
            // Créer la question via l'API
            const questionData = {
                title: questionTitle,
                description: questionDescription,
                pointNumber: questionPoints,
                answers: answers
            };
            
            console.log(`📤 Création question ${i + 1}/${questionCards.length}:`, questionData);
            
            const createdQuestion = await createQuestion(questionData);
            questionIds.push(createdQuestion.id);
            
            console.log(`✅ Question ${i + 1} créée avec ID: ${createdQuestion.id}`);
        }
        
        // 4. Créer le quiz final avec les IDs des questions
        quizData.questions = questionIds;
        
        // ✅ FORMAT CORRIGÉ : Transformer les IDs en objets {id: X}
        const quizPayload = {
            title: quizData.title,
            description: quizData.description,
            categories: quizData.categories.map(id => ({ id: id })),  // [{id: 1}]
            questions: quizData.questions.map(id => ({ id: id }))     // [{id: 6}, {id: 7}]
        };
        
        console.log('📦 Payload final envoyé à l\'API:', quizPayload);
        
        const finalQuiz = await createQuiz(quizPayload);
        
        // 5. Afficher le succès et rediriger
        console.log('🎉 Quiz créé avec succès:', finalQuiz);
        alert(`✅ Quiz créé avec succès !\n\nTitre: ${finalQuiz.title}\nNombre de questions: ${quizData.questions.length}`);
        
        // Rediriger vers la page des quiz
        setTimeout(() => {
            window.location.href = 'Quizz.html';
        }, 1000);
        
    } catch (error) {
        console.error('❌ Erreur complète:', error);
        alert(`❌ Erreur lors de la création du quiz:\n${error.message}`);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Créer le quiz';
    }
}
