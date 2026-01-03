let quizData = [];
let currentQuestionIndex = 0;
let selectedDeck = '';
let quizName = '';
let requireCorrectAnswers = true;
let score = 0;
let totalQuestions = 0;
let maxQuestions = null;
let selectedChoice = null;
let uploadedDeckData = null;

// DOM elements
const mainTitle = document.getElementById('main-title');
const deckSelection = document.getElementById('deck-selection');
const deckSummary = document.getElementById('deck-summary');
const summaryContent = document.getElementById('summary-content');
const startQuizBtn = document.getElementById('start-quiz-btn');
const backBtn = document.getElementById('back-btn');
const deckUpload = document.getElementById('deck-upload');
const quizScreen = document.getElementById('quiz-screen');
const stepNumber = document.getElementById('step-number');
const questionText = document.getElementById('question-text');
const answerInput = document.getElementById('answer-input');
const submitBtn = document.getElementById('submit-btn');
const messageDisplay = document.getElementById('message-display');
const imageContainer = document.getElementById('image-container');
const resultImage = document.getElementById('result-image');
const nextBtn = document.getElementById('next-btn');
const questionContainer = document.getElementById('question-container');
const multipleChoiceContainer = document.getElementById('multiple-choice-container');
const choicesContainer = document.getElementById('choices');
const progressBar = document.getElementById('progress-bar');
const scoreCard = document.getElementById('score-card');
const scoreText = document.getElementById('score-text');

// Sound effects using Web Audio API
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playCorrectSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

function playWrongSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

// Shuffle array function
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Deck selection
document.querySelectorAll('.deck-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        selectedDeck = btn.getAttribute('data-deck');
        loadQuizData(selectedDeck);
    });
});

// Load quiz data from file
async function loadQuizData(deckFile) {
    try {
        const response = await fetch(deckFile);
        const data = await response.json();

        quizName = data.name;
        requireCorrectAnswers = data.requireCorrectAnswers !== undefined ? data.requireCorrectAnswers : true;
        maxQuestions = data.maxQuestions || null;

        // Shuffle questions if random is enabled
        if (data.random) {
            quizData = shuffleArray(data.steps);
        } else {
            quizData = data.steps;
        }

        // Limit questions if maxQuestions is set
        if (maxQuestions && quizData.length > maxQuestions) {
            quizData = quizData.slice(0, maxQuestions);
        }

        totalQuestions = quizData.length;
        score = 0;
        currentQuestionIndex = 0;

        // Update main title with quiz name
        mainTitle.textContent = quizName;

        // Hide deck selection and show quiz screen
        deckSelection.classList.add('hidden');
        quizScreen.classList.remove('hidden');

        displayCurrentQuestion();
        updateProgressBar();
    } catch (error) {
        console.error('Error loading quiz data:', error);
        messageDisplay.textContent = 'Error loading quiz data!';
        messageDisplay.classList.remove('hidden');
        messageDisplay.classList.add('error');
    }
}

// Update progress bar
function updateProgressBar() {
    const progress = (currentQuestionIndex / quizData.length) * 100;
    progressBar.style.width = `${progress}%`;
}

// Display the current question
function displayCurrentQuestion() {
    if (currentQuestionIndex >= quizData.length) {
        // All questions completed
        showCompletion();
        return;
    }

    const currentQuestion = quizData[currentQuestionIndex];
    stepNumber.textContent = `Question ${currentQuestionIndex + 1}`;
    questionText.textContent = currentQuestion.question;

    // Check if this is a multiple choice question
    if (currentQuestion.choices && currentQuestion.choices.length > 0) {
        // Show multiple choice - hide text input
        questionContainer.style.display = 'none';
        multipleChoiceContainer.style.display = 'block';
        displayMultipleChoice(currentQuestion.choices);
    } else {
        // Show text input - hide multiple choice
        multipleChoiceContainer.style.display = 'none';
        questionContainer.style.display = 'flex';
        answerInput.value = '';
        answerInput.focus();
    }
}

// Display multiple choice options
function displayMultipleChoice(choices) {
    choicesContainer.innerHTML = '';
    selectedChoice = null;

    choices.forEach(choice => {
        const button = document.createElement('button');
        button.className = 'choice-btn';
        button.textContent = choice;
        button.addEventListener('click', () => {
            selectChoice(button, choice);
        });
        choicesContainer.appendChild(button);
    });
}

// Select a choice
function selectChoice(button, choice) {
    // Prevent selection if already checking an answer
    if (selectedChoice !== null) return;

    selectedChoice = choice;

    // Automatically check answer after selection
    checkAnswer(button);
}

// Show completion
function showCompletion() {
    questionContainer.style.display = 'none';
    multipleChoiceContainer.style.display = 'none';
    stepNumber.style.display = 'none';
    questionText.style.display = 'none';

    if (!requireCorrectAnswers) {
        // Show score card
        scoreCard.classList.remove('hidden');
        const percentage = Math.round((score / totalQuestions) * 100);
        scoreText.innerHTML = `You answered <strong>${score} out of ${totalQuestions}</strong> questions correctly!<br>Score: <strong>${percentage}%</strong>`;
    } else {
        // Show celebration message
        messageDisplay.innerHTML = '🎉 CONGRATULATIONS! 🎉<br>You completed the quiz!<br>Amazing job! 🏆';
        messageDisplay.classList.remove('hidden', 'error', 'success');
        messageDisplay.classList.add('final-success');
    }

    progressBar.style.width = '100%';
}

// Check if answer is correct (supports multiple answers)
function isAnswerCorrect(userAnswer, correctAnswer) {
    const normalizedUserAnswer = userAnswer.trim().toLowerCase();

    if (Array.isArray(correctAnswer)) {
        // Multiple correct answers
        return correctAnswer.some(ans => ans.toLowerCase() === normalizedUserAnswer);
    } else {
        // Single correct answer
        return correctAnswer.toLowerCase() === normalizedUserAnswer;
    }
}

// Check the answer
function checkAnswer(selectedButton = null) {
    let userAnswer;
    const currentQuestion = quizData[currentQuestionIndex];

    // Get answer based on question type
    if (currentQuestion.choices && currentQuestion.choices.length > 0) {
        // Multiple choice
        if (!selectedChoice) return;
        userAnswer = selectedChoice;
    } else {
        // Text input
        userAnswer = answerInput.value.trim();
        if (!userAnswer) return;
    }

    if (isAnswerCorrect(userAnswer, currentQuestion.answer)) {
        // Correct answer - play success sound
        playCorrectSound();
        score++;

        questionContainer.style.display = 'none';
        multipleChoiceContainer.style.display = 'none';

        // Check if this is text input mode (not multiple choice)
        const isTextInput = !currentQuestion.choices || currentQuestion.choices.length === 0;

        // Check if there's an image to display
        if (currentQuestion.image) {
            // Try to load the image first
            const img = new Image();
            img.onload = () => {
                // Image loaded successfully, display it
                resultImage.src = currentQuestion.image;
                imageContainer.classList.remove('hidden');

                // Show success message for text input mode
                if (isTextInput) {
                    messageDisplay.textContent = '✓ CORRECT! Well done!';
                    messageDisplay.classList.remove('hidden', 'error', 'final-success');
                    messageDisplay.classList.add('success');
                }
            };
            img.onerror = () => {
                // Image failed to load, proceed to next question
                console.warn(`Image ${currentQuestion.image} failed to load, skipping...`);
                moveToNextQuestion();
            };
            img.src = currentQuestion.image;
        } else {
            // No image, proceed to next question after a brief delay
            setTimeout(() => {
                moveToNextQuestion();
            }, 1000);
        }
    } else {
        // Wrong answer - play error sound
        playWrongSound();

        if (currentQuestion.choices && currentQuestion.choices.length > 0) {
            // Multiple choice wrong answer - show visual feedback
            showMultipleChoiceFeedback(selectedButton, currentQuestion.answer);
        } else {
            // Text input wrong answer
            if (requireCorrectAnswers) {
                // Must get correct answer to proceed
                messageDisplay.textContent = 'WRONG ANSWER';
                messageDisplay.classList.remove('hidden', 'success', 'final-success');
                messageDisplay.classList.add('error');
                answerInput.value = '';
                answerInput.focus();
            } else {
                // Can continue to next question
                questionContainer.style.display = 'none';

                messageDisplay.textContent = 'WRONG ANSWER';
                messageDisplay.classList.remove('hidden', 'success', 'final-success');
                messageDisplay.classList.add('error');

                setTimeout(() => {
                    messageDisplay.classList.add('hidden');
                    moveToNextQuestion();
                }, 1500);
            }
        }
    }
}

// Show visual feedback for multiple choice questions
function showMultipleChoiceFeedback(selectedButton, correctAnswer) {
    const allButtons = document.querySelectorAll('.choice-btn');

    // Disable all buttons during feedback
    allButtons.forEach(btn => {
        btn.style.pointerEvents = 'none';
    });

    // Mark selected button as incorrect
    if (selectedButton) {
        selectedButton.classList.add('incorrect');
    }

    // Find and mark correct answer as green
    allButtons.forEach(btn => {
        if (isAnswerCorrect(btn.textContent, correctAnswer)) {
            btn.classList.add('correct');
        }
    });

    // Show error message
    messageDisplay.textContent = 'WRONG ANSWER';
    messageDisplay.classList.remove('hidden', 'success', 'final-success');
    messageDisplay.classList.add('error');

    // Wait 2.5 seconds before proceeding or resetting
    setTimeout(() => {
        messageDisplay.classList.add('hidden');

        // Clear feedback classes and re-enable buttons
        allButtons.forEach(btn => {
            btn.classList.remove('incorrect', 'correct');
            btn.style.pointerEvents = '';
        });

        if (requireCorrectAnswers) {
            // Strict mode - reset and allow retry
            selectedChoice = null;
        } else {
            // Practice mode - proceed to next question
            moveToNextQuestion();
        }
    }, 2500);
}

// Move to next question
function moveToNextQuestion() {
    currentQuestionIndex++;
    imageContainer.classList.add('hidden');
    messageDisplay.classList.add('hidden');
    // Let displayCurrentQuestion() handle showing the right container type
    displayCurrentQuestion();
    updateProgressBar();
}

// Handle file upload
deckUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            uploadedDeckData = data;
            showDeckSummary(data);
        } catch (error) {
            alert('Error parsing JSON file: ' + error.message);
        }
    };
    reader.readAsText(file);
});

// Show deck summary
function showDeckSummary(data) {
    // Validate data structure
    if (!data.name || !data.steps || !Array.isArray(data.steps)) {
        alert('Invalid deck format. Must have "name" and "steps" array.');
        return;
    }

    const totalSteps = data.steps.length;
    const maxQ = data.maxQuestions || totalSteps;
    const actualQuestions = Math.min(maxQ, totalSteps);
    const quizMode = data.requireCorrectAnswers !== false ? 'Strict Mode' : 'Practice Mode';
    const isRandom = data.random ? 'Yes' : 'No';

    // Count questions with images and choices
    const withImages = data.steps.filter(s => s.image).length;
    const multipleChoice = data.steps.filter(s => s.choices && s.choices.length > 0).length;
    const textInput = totalSteps - multipleChoice;

    summaryContent.innerHTML = `
        <p><strong>Deck Name:</strong> ${data.name}</p>
        <p><strong>Total Questions:</strong> ${totalSteps}</p>
        <p><strong>Questions to Ask:</strong> ${actualQuestions}</p>
        <p><strong>Quiz Mode:</strong> ${quizMode}</p>
        <p><strong>Random Order:</strong> ${isRandom}</p>
        <p><strong>Question Types:</strong></p>
        <ul style="margin-left: 2rem; margin-bottom: 1rem;">
            <li>${textInput} Text Input</li>
            <li>${multipleChoice} Multiple Choice</li>
        </ul>
        <p><strong>Questions with Images:</strong> ${withImages}</p>
    `;

    deckSelection.classList.add('hidden');
    deckSummary.classList.remove('hidden');
}

// Start quiz from uploaded deck
startQuizBtn.addEventListener('click', () => {
    if (uploadedDeckData) {
        deckSummary.classList.add('hidden');
        loadQuizDataFromObject(uploadedDeckData);
    }
});

// Back to selection
backBtn.addEventListener('click', () => {
    deckSummary.classList.add('hidden');
    deckSelection.classList.remove('hidden');
    uploadedDeckData = null;
    deckUpload.value = '';
});

// Load quiz data from object (used for uploaded files)
function loadQuizDataFromObject(data) {
    quizName = data.name;
    requireCorrectAnswers = data.requireCorrectAnswers !== undefined ? data.requireCorrectAnswers : true;
    maxQuestions = data.maxQuestions || null;

    // Shuffle questions if random is enabled
    if (data.random) {
        quizData = shuffleArray(data.steps);
    } else {
        quizData = data.steps;
    }

    // Limit questions if maxQuestions is set
    if (maxQuestions && quizData.length > maxQuestions) {
        quizData = quizData.slice(0, maxQuestions);
    }

    totalQuestions = quizData.length;
    score = 0;
    currentQuestionIndex = 0;

    // Update main title with quiz name
    mainTitle.textContent = quizName;

    // Show quiz screen
    quizScreen.classList.remove('hidden');

    displayCurrentQuestion();
    updateProgressBar();
}

// Event listeners
submitBtn.addEventListener('click', checkAnswer);
nextBtn.addEventListener('click', moveToNextQuestion);

// Allow Enter key to submit answer
answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        checkAnswer();
    }
});

// Allow Enter key to proceed when viewing image
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !imageContainer.classList.contains('hidden')) {
        moveToNextQuestion();
    }
});
