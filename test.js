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
        timerEl.style.color = 'black';
    }

    if (totalTime < 0) {
        clearInterval(countdown);
    }
}, 1000)

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
    let filteredQuestions = questionBank.filter(question => {
        if (preferences.difficulty !== 'all' && question.difficulty !== preferences.difficulty) {
            return false;
        }

        if (preferences.topic !== 'all-topics' && question.topic !== preferences.topic){
            return false;
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