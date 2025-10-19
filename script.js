function startTest() {
    const difficulty = document.getElementById('difficulty-select').value;
    const topic = document.getElementById('topic-select').value;
    const questionCount = document.getElementById('question-count').value;


    localStorage.setItem('testPreferences', JSON.stringify ({
        difficulty: difficulty,
        topic: topic,
        questionCount: parseInt(questionCount)
    }));

    window.location.href = 'test.html';
    console.log("starting test successfully")
}