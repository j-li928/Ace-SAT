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

    if (totalTime <= 9 * 60) {
        timerEl.style.color = 'red';
    } else {
        timerEl.style.color = 'black';
    }

    if (totalTime < 0) {
        clearInterval(countdown);
    }
}, 1000)