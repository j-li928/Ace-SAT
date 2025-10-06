// 10 minute timer
let totalTime = 10 * 60;

const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const timerEl = document.querySelector('.timer');

const countdown = setInterval(() => {
    const minutes = Math.floor(totalTime/60);
    const seconds = totalTime % 60;

    minutesEl.textContent = minutes.toString().padStart(2, '0');
    secondsEl.textContent = seconds.toString().padStart(2, '0');

    totalTime--;

    if (totalTime <= 3 * 60) {
        timerEl.style.color = 'red';
    } else {
        timerEl.style.color = '#faf9eb;';
    }

    if (totalTime < 0) {
        clearInterval(countdown);
        submitTest();
    }
}, 1000)



let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = {};

async function loadQuestionBank() {
    try {
        const response = await fetch('sat_question_bank.json');
        const questionBank = await response.json();
        return questionBank;
    } catch (error) {
        console.error('Error loading question bank:', error);
        return [];
    }
}


function filterAndRandomizeQuestions(questionBank, preferences) {
    console.log("Filtering with preferences:", preferences);
    
    let filteredQuestions = questionBank.filter(question => {

        if (preferences.difficulty !== 'all' && 
            question.difficulty.toLowerCase() !== preferences.difficulty.toLowerCase()) {
            return false;
        }


        if (preferences.topic !== 'all-topics') {
            const questionTopic = question.topic.toLowerCase();
            const preferenceTopic = preferences.topic.toLowerCase();
            

            if (!questionTopic.includes(preferenceTopic.replace('-', ' '))) {
                return false;
            }
        }
        return true;
    });

    console.log("Filtered questions:", filteredQuestions.length);
    
    const shuffled = shuffleArray(filteredQuestions);
    const selectedQuestions = shuffled.slice(0, preferences.questionCount);
    console.log("Final selected questions:", selectedQuestions.length);
    
    return selectedQuestions;
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i=shuffled.length-1; i > 0; i--) {
        const j = Math.floor(Math.random()* (i+1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

async function initializeTest() {
    const preferences = JSON.parse(localStorage.getItem('testPreferences')); 
    if (!preferences) {
        console.error("no test preferences found");
        return;
    }

    const questionBank = await loadQuestionBank();

    if (questionBank.length === 0) {
        console.error('Failed to load question bank');
        return;
    }

    const selectedQuestions = filterAndRandomizeQuestions(questionBank, preferences); 
    startTest(selectedQuestions);
}


function startTest(questions) {
    console.log("test starting");
    currentQuestions = questions;
    currentQuestionIndex = 0;
    userAnswers = {};

    displayQuestion(0);

    setupNavigation();
}


function displayQuestion(questionIndex) {
    if (questionIndex >= currentQuestions.length) {
        console.log('no more questions');
        return;
    }

    const question = currentQuestions[questionIndex]

    const questionCounter = document.querySelector('.question-counter');
    const questionText = document.querySelector('.question-text');
    const answerContainer = document.querySelector('.answer');

    questionCounter.textContent = `Question ${questionIndex + 1} of ${currentQuestions.length}`;  
    questionText.textContent = question.prompt;

    answerContainer.innerHTML = '';
    Object.entries(question.choices).forEach(([letter, text]) => {
        const label = document.createElement('label');
        label.innerHTML = `
            <input type="radio" name="q${questionIndex + 1}" value="${letter}"> 
            ${letter}) ${text}
        `;
        answerContainer.appendChild(label);
    });

    const savedAnswer = userAnswers[questionIndex];
    if (savedAnswer) {
        const radioButton = document.querySelector(`input[name="q${questionIndex + 1}"][value="${savedAnswer}"]`);
        if (radioButton) {
            radioButton.checked = true;
        }
    }
}


function setupNavigation() {
    const prevButton = document.querySelector("#previous-btn");
    const nextButton = document.querySelector("#next-btn");
    const submitButton = document.querySelector("#submit-btn");


    prevButton.addEventListener('click', ()=> {
        saveCurrentAnswer();
        if(currentQuestionIndex > 0) {
            currentQuestionIndex--;
            displayQuestion(currentQuestionIndex);
        }
    });

    nextButton.addEventListener('click', () => {
        saveCurrentAnswer();
        if(currentQuestionIndex < currentQuestions.length - 1) {
            currentQuestionIndex++;
            displayQuestion(currentQuestionIndex);
        }
    });

    submitButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to submit your test?')) {
            submitTest();
        }
    })
}

function saveCurrentAnswer() {
    const selectedAnswer = document.querySelector(`input[name="q${currentQuestionIndex + 1}"]:checked`);
    if (selectedAnswer) {
        userAnswers[currentQuestionIndex] = selectedAnswer.value;
    }

}


function submitTest() {
    saveCurrentAnswer();

    let correctAnswers = 0;
    const results = {
        score: 0,
        total: currentQuestions.length,
        percentage: 0,
        questions: currentQuestions,
        userAnswers: userAnswers,
        timeUsed: (10 * 60) - totalTime
    };

    currentQuestions.forEach((question, index) => {
       if(userAnswers[index] == question.answer) {
           correctAnswers++;
       }
   });

   results.score = correctAnswers;
   results.percentage = Math.round(correctAnswers/currentQuestions.length *100);

   localStorage.setItem('testResults', JSON.stringify(results));
   window.location.href = 'results.html';

}






document.addEventListener('DOMContentLoaded', initializeTest);