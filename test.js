
// 10 minute timer
let totalTime = 10 * 60;
let calculator;
let calculatorVisible = false;
let numberCalculatorVisible = false;

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

function initializeNumberCalculator() {
    const tab = document.getElementById('number-calculator-tab');
    if (tab) {
        tab.addEventListener('click', toggleNumberCalculator);
    }

    const closeBtn = document.getElementById('number-calculator-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeNumberCalculator);
    }
}

function closeNumberCalculator() {
    const calculatorContainer = document.getElementById('number-calculator-container');
    calculatorContainer.classList.remove('visible');
    calculatorContainer.classList.add('hidden');
    numberCalculatorVisible = false;
}
function appendToDisplay(value) {
    const display = document.getElementById('calculator-display');
    if(display.value === '0' && value !== '.') {
        display.value = value;
    } else {
        display.value += value;
    }
}
function clearDisplay() {
    document.getElementById('calculator-display').value = '0';
}
function deleteLast() {
    const display = document.getElementById('calculator-display');
    if (display.value.length > 1) {
        display.value = display.value.slice(0, -1);
    } else {
        display.value = '0'
    }
}
function calculateResult() {
    const display = document.getElementById('calculator-display');
    try {
        const expression = display.value.replace(/×/g, '*');
        const result = eval(expression);
        display.value = result;
    } catch (error) {
        display.value = 'Error';
    }
}


function toggleNumberCalculator() {
    const calculatorContainer = document.getElementById('number-calculator-container');
    numberCalculatorVisible = !numberCalculatorVisible;
    if (numberCalculatorVisible) {
        calculatorContainer.classList.remove('hidden');
        calculatorContainer.classList.add('visible');
    } else {
        calculatorContainer.classList.remove('visible');
        calculatorContainer.classList.add('hidden');
    }
}



function initializeCalculator() {
    try {
        calculator = Desmos.GraphingCalculator(document.getElementById('calculator'));
        
        calculator.updateSettings({
            expressionsCollapsed: true,
            showGrid: true,
            showAxes: true,
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            xAxisStep: 1,
            yAxisStep: 1,
            xAxisArrowMode: Desmos.AxisArrowModes.BOTH,
            yAxisArrowMode: Desmos.AxisArrowModes.BOTH
        });
        
    } catch (error) {
        console.error('Failed to initialize calculator:', error);
    }
}


function toggleCalculator() {
    const calculatorContainer = document.getElementById('calculator-container');
    
    calculatorVisible = !calculatorVisible;
    
    if (calculatorVisible) {
        calculatorContainer.classList.remove('hidden');
    } else {
        calculatorContainer.classList.add('hidden');
    }
}


function closeCalculator() {
    const calculatorContainer = document.getElementById('calculator-container');
    calculatorContainer.classList.add('hidden');
    calculatorVisible = false;
}


document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initializeCalculator();
        initializeNumberCalculator();

        const tab = document.getElementById('calculator-tab');
        if (tab) {
            tab.addEventListener('click', toggleCalculator);
        }
        

        const closeBtn = document.getElementById('calculator-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeCalculator);
        } 
    }, 100);
});

let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = {};

async function loadQuestionBank() {
    try {
        const response = await fetch('sat_question_bank.json');
        const questionBank = await response.json();
        return questionBank;
    } catch (error) {
        return [];
    }
}


function filterAndRandomizeQuestions(questionBank, preferences) {
    
    let filteredQuestions = questionBank.filter(question => {
        
        if (preferences.difficulty !== 'all' && 
            question.difficulty.toLowerCase() !== preferences.difficulty.toLowerCase()) {
            return false;
        }


        if (preferences.topic !== 'all-topics') {
            const questionTopic = question.topic.toLowerCase();
            const preferenceTopic = preferences.topic.toLowerCase();

            
            let topicMatches = false;
            
            switch(preferenceTopic) {
                case 'algebra':
                    topicMatches = questionTopic === 'algebra';
                    break;
                case 'advanced-math':
                    topicMatches = questionTopic === 'advanced math';
                    break;
                case 'problem-solving-data-analysis':
                    topicMatches = questionTopic === 'problem-solving and data analysis';
                    break;
                case 'geo-trig':
                    topicMatches = questionTopic === 'geometry and trigonometry';
                    break;
                default:
                    topicMatches = questionTopic.includes(preferenceTopic.replace('-', ' '));
            }
            
            if (!topicMatches) {
                return false;
            }
        }
        return true;
    });


    
    const shuffled = shuffleArray(filteredQuestions);
    const selectedQuestions = shuffled.slice(0, preferences.questionCount);

    
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

        return;
    }

    const questionBank = await loadQuestionBank();

    if (questionBank.length === 0) {
        return;
    }

    const selectedQuestions = filterAndRandomizeQuestions(questionBank, preferences); 
    startTest(selectedQuestions);
}


function startTest(questions) {
    currentQuestions = questions;
    currentQuestionIndex = 0;
    userAnswers = {};

    displayQuestion(0);

    setupNavigation();
}



function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const questionCache = new Map();

function displayQuestion(questionIndex) {
    if (questionIndex >= currentQuestions.length) {
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