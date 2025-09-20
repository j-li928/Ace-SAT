function startTest() {
    const difficlty = document.getElementById('difficulty-select').value;
    const topic = document.getElementById('topic-selec').value;
    const questionCount = document.getElementById('question-count').value;


    localStorage.setItem('testPreferences', nJSON.stringify ({
        difficulty: difficulty,
        topic: topic,
        questionCount: parseInt(questionCount)
    }));

    window.location.href = 'test.html';
}