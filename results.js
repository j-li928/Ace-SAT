function loadResults() {
    const results = JSON.parse(localStorage.getItem('testResults'));

    if (!results) {
        console.error('No results found :(');
        return;
    }
    
    displayResults(results);
}

loadResults()
const score = results.score;
const totalQuestions = results.total;
const percentageCorrect = results.percentage;
const questions = results.questions;
const timeUsed = results.timeUsed;  //in seconds currently


function displayCompletionTime(timeUsed) {

    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    const minutes = Math.floor(timeUsed / 60);
    const seconds = timeUsed % 60;

    minutesEl.textContent = minutes.toString();
    secondsEl.textContent = seconds.toString();
}

displayCompletionTime(timeUsed);

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

    Object.entries(topicStats).forEach(([topic, stats]) {
        createPieChart(topic, stats);
    });
}

function createPieChart() {
    // to be implemented
    const container = document.querySelector('.pie-chartcontainer')
}