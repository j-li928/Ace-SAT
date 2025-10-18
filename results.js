function loadResults() {
    const results = JSON.parse(localStorage.getItem('testResults'));

    if (!results) {
        console.error('No results found :(');
        return;
    }
    
    displayResults(results);
}
let currentQuestionIndex = 0;
let totalQuestions = 0;

function createQuestionPanels(results) {
    totalQuestions = results.questions.length;
    currentQuestionIndex = 0;

    updateQuestionCounter();
    displayQuestionReview(results, 0)
    setupQuestionNavigation(results);
}

function displayQuestionReview(results, questionIndex) {
    const question = results.questions[questionIndex]; 
    const userAnswer = results.userAnswers[questionIndex];
    const isCorrect = userAnswer === question.answer;

    const questionContent = document.querySelector('#question-content')

    questionContent.innerHTML = `
        <h3>Question ${questionIndex + 1}</h3>
        <p class="question-text">${question.prompt}</p>
        <div class="answers">
            ${Object.entries(question.choices).map(([letter, text]) => `
                 <div class="answer-option ${letter === question.answer ? 'correct' : ''} 
                                    ${letter === userAnswer ? 'user-selected' : ''}">
                    ${letter}) ${text}
                </div>
            `).join('')}
        </div>
        <div class="explanation">
            <p><strong>Your answer:</strong> ${userAnswer || 'No answer'}</p>
            <p><strong>Correct answer:</strong> ${question.answer}</p>
            <p><strong>Result:</strong> ${isCorrect ? 'Correct ✓' : 'Incorrect ✗'}</p>
        </div>
    `;
    
    updateQuestionCounter();
    updateQuestionStatus(results, questionIndex);
    updateProgressBar();
    updateNavigationButtons();
}
 

function updateQuestionCounter() {
    document.getElementById('current-question').textContent = currentQuestionIndex + 1;

    document.getElementById('total-questions').textContent = totalQuestions;
    document.getElementById('progress-total').textContent = totalQuestions;
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-question');
    const nextBtn = document.getElementById('next-question');

    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.disabled = currentQuestionIndex === totalQuestions -1;
}

function setupQuestionNavigation(results) {
    const prevBtn = document.getElementById('prev-question');
    const nextBtn = document.getElementById('next-question');

    prevBtn.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            displayQuestionReview(results, currentQuestionIndex);
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentQuestionIndex < totalQuestions -1) {
            currentQuestionIndex++;
            displayQuestionReview(results, currentQuestionIndex);
        }
    });
}
function updateQuestionStatus(results, questionIndex) {
    const question = results.questions[questionIndex];
    const userAnswer = results.userAnswers[questionIndex];
    const isCorrect = userAnswer === question.answer;

    const statusEl = document.getElementById('question-status');
    statusEl.textContent = isCorrect ? '✓ Correct' : '✗ Incorrect';
    statusEl.className = `question-status ${isCorrect ? 'correct' : 'incorrect'}`;
}
function updateProgressBar() {
    const progressFill = document.getElementById('progress-fill');
    const progressCurrent = document.getElementById('progress-current');

    const percentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;
    progressFill.style.width = `${percentage}%`;
    progressCurrent.textContent = currentQuestionIndex + 1;
}

function displayResults(results) {
    const scoreEl = document.getElementById('score');
    scoreEl.textContent = `${results.score}/${results.total} (${results.percentage}%)`;

    displayCompletionTime(results.timeUsed);
    createTopicCharts(results);
    createQuestionPanels(results);
}

function displayCompletionTime(timeUsed) {

    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    const minutes = Math.floor(timeUsed / 60);
    const seconds = timeUsed % 60;

    minutesEl.textContent = minutes.toString();
    secondsEl.textContent = seconds.toString();
}


function createTopicCharts(results) {
    const topicStats = {};

    results.questions.forEach((question, index) => {
        const topic = question.topic;
        if (!topicStats[topic]) {
            topicStats[topic] = {correct: 0, total: 0};
        }

        topicStats[topic].total++;
        
        if(results.userAnswers[index] === question.answer) {
            topicStats[topic].correct++;
        }

    });

    Object.entries(topicStats).forEach(([topic, stats]) => {
        createPieChart(topic, stats);
    });
}

function retakeTest() {
    localStorage.removeItem('testResults');
    window.location.href = 'test.html';
}
function goHome() {
    window.location.href = 'welcome_page/index.html';
}

function createPieChart(topic, stats) {
   const container = document.querySelector('#topic-grid');
  
   const chartWrapper = document.createElement('div');
   chartWrapper.className = 'pie-chart';

   const canvas = document.createElement('canvas');
   canvas.width = 200;
   canvas.height = 200;
  

   const ctx = canvas.getContext('2d');
   new Chart(ctx, {
       type: 'pie',
       data: {
           labels: ['Correct', 'Incorrect'],
           datasets: [{
               data: [stats.correct, stats.total - stats.correct],
               backgroundColor: ['#9cb292', '#ff6b6b']
           }]
       },
       options: {
           responsive: true,
           maintainAspectRatio: false,
            plugins: {
               title: {
                   display: true,
                   text: topic,
                   font: {
                       size: 14
                   }
               },
               legend: {
                   display: true,
                   position: 'bottom',
                   labels: {
                       font: {
                           size: 12
                       }
                   }
               }
           }
       }
   });
  
   chartWrapper.appendChild(canvas);
   container.appendChild(chartWrapper);
}


document.addEventListener('DOMContentLoaded', loadResults);
