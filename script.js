

// ============================================================
// VOICE SUBTRACTION QUIZ
// ============================================================


// ------------------------------------------------------------
// ELEMENTS
// ------------------------------------------------------------

const questionCountSelect = document.getElementById("questionCount");

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const resultBtn = document.getElementById("resultBtn");
const restartBtn = document.getElementById("restartBtn");

const questionNumber = document.getElementById("questionNumber");
const timerDisplay = document.getElementById("timer");
const questionDisplay = document.getElementById("question");
const listeningDisplay = document.getElementById("listening");
const answerDisplay = document.getElementById("answerDisplay");
const feedbackDisplay = document.getElementById("feedback");

const resultPanel = document.getElementById("resultPanel");


// Live score elements
const totalScore = document.getElementById("totalScore");
const answeredScore = document.getElementById("answeredScore");
const correctScore = document.getElementById("correctScore");
const incorrectScore = document.getElementById("incorrectScore");
const unansweredScore = document.getElementById("unansweredScore");


// Result elements
const resultTotal = document.getElementById("resultTotal");
const resultAnswered = document.getElementById("resultAnswered");
const resultUnanswered = document.getElementById("resultUnanswered");
const resultCorrect = document.getElementById("resultCorrect");
const resultIncorrect = document.getElementById("resultIncorrect");


// ------------------------------------------------------------
// QUIZ VARIABLES
// ------------------------------------------------------------

let totalQuestions = 20;

let currentQuestion = 0;

let correctAnswers = 0;

let incorrectAnswers = 0;

let unansweredAnswers = 0;

let answeredQuestions = 0;

let currentAnswer = null;

let questionActive = false;

let quizRunning = false;

let questionTimer = null;

let countdownTimer = null;


// Speech recognition
let recognition = null;


// Prevent multiple answers for same question
let answerProcessed = false;


// ------------------------------------------------------------
// NUMBER WORDS
// ------------------------------------------------------------

const numberWords = {

    "zero": 0,
    "oh": 0,

    "one": 1,
    "won": 1,

    "two": 2,
    "to": 2,
    "too": 2,

    "three": 3,

    "four": 4,
    "for": 4,

    "five": 5,

    "six": 6,

    "seven": 7,

    "eight": 8,
    "ate": 8,

    "nine": 9

};


// ------------------------------------------------------------
// SPEECH RECOGNITION SETUP
// ------------------------------------------------------------

function setupSpeechRecognition() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        alert(
            "Speech Recognition is not supported in this browser.\n\n" +
            "Please use Google Chrome or Microsoft Edge."
        );

        return false;
    }


    recognition = new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.continuous = true;

    recognition.interimResults = true;

    recognition.maxAlternatives = 5;


    recognition.onstart = function () {

        if (questionActive) {

            listeningDisplay.textContent =
                "🎤 Listening...";
        }
    };


    recognition.onresult = function (event) {

        processSpeech(event);
    };


    recognition.onerror = function (event) {

        console.log(
            "Speech recognition error:",
            event.error
        );

        if (questionActive) {

            listeningDisplay.textContent =
                "🎤 Listening...";
        }
    };


    recognition.onend = function () {

        // Restart recognition while quiz is active

        if (quizRunning && questionActive) {

            try {

                recognition.start();

            } catch (error) {

                console.log(error);

            }
        }
    };


    return true;
}


// ------------------------------------------------------------
// START QUIZ
// ------------------------------------------------------------

startBtn.addEventListener("click", function () {

    startQuiz();

});


function startQuiz() {

    totalQuestions =
        parseInt(questionCountSelect.value);


    // Reset everything

    currentQuestion = 0;

    correctAnswers = 0;

    incorrectAnswers = 0;

    unansweredAnswers = 0;

    answeredQuestions = 0;

    quizRunning = true;

    questionActive = false;


    resultPanel.classList.remove("show");


    startBtn.disabled = true;

    stopBtn.disabled = false;

    questionCountSelect.disabled = true;


    updateScore();


    // Setup speech recognition

    if (!recognition) {

        const success =
            setupSpeechRecognition();

        if (!success) {

            stopQuiz();

            return;
        }
    }


    // Start microphone

    try {

        recognition.start();

    } catch (error) {

        console.log(error);

    }


    // Start first question

    showNextQuestion();
}


// ------------------------------------------------------------
// GENERATE SUBTRACTION QUESTION
// ------------------------------------------------------------

function generateQuestion() {

    let firstNumber =
        Math.floor(Math.random() * 10);


    let secondNumber =
        Math.floor(Math.random() * 10);


    // Make sure first number >= second number

    if (secondNumber > firstNumber) {

        const temp = firstNumber;

        firstNumber = secondNumber;

        secondNumber = temp;
    }


    return {

        first: firstNumber,

        second: secondNumber,

        answer: firstNumber - secondNumber

    };
}


// ------------------------------------------------------------
// SHOW NEXT QUESTION
// ------------------------------------------------------------

function showNextQuestion() {

    if (!quizRunning) {

        return;
    }


    // Check if quiz completed

    if (currentQuestion >= totalQuestions) {

        finishQuiz();

        return;
    }


    currentQuestion++;


    const question =
        generateQuestion();


    currentAnswer =
        question.answer;


    answerProcessed = false;

    questionActive = true;


    // Display question

    questionNumber.textContent =
        `Question ${currentQuestion} / ${totalQuestions}`;


    questionDisplay.textContent =
        `${question.first} − ${question.second} = ?`;


    answerDisplay.textContent =
        "Your answer will appear here";


    feedbackDisplay.textContent = "";


    listeningDisplay.textContent =
        "🎤 Listening...";


    // Start 3 second timer

    startThreeSecondTimer();
}


// ------------------------------------------------------------
// THREE SECOND TIMER
// ------------------------------------------------------------

function startThreeSecondTimer() {

    let remainingSeconds = 3;


    timerDisplay.textContent =
        remainingSeconds;


    clearInterval(countdownTimer);

    clearTimeout(questionTimer);


    countdownTimer =
        setInterval(function () {

            remainingSeconds--;

            timerDisplay.textContent =
                remainingSeconds;


            if (remainingSeconds <= 0) {

                clearInterval(countdownTimer);
            }

        }, 1000);


    questionTimer =
        setTimeout(function () {

            finishCurrentQuestion();

        }, 3000);
}


// ------------------------------------------------------------
// FINISH CURRENT QUESTION
// ------------------------------------------------------------

function finishCurrentQuestion() {

    if (!questionActive) {

        return;
    }


    questionActive = false;


    clearTimeout(questionTimer);

    clearInterval(countdownTimer);


    timerDisplay.textContent = "0";


    // If user did not answer

    if (!answerProcessed) {

        unansweredAnswers++;


        listeningDisplay.textContent =
            "⏱ Not Answered";


        answerDisplay.textContent =
            "No answer received";


        feedbackDisplay.textContent =
            "—";


        feedbackDisplay.style.color =
            "#f59e0b";


        updateScore();
    }


    // Wait briefly so the user can see the result,
    // then show next question.

    setTimeout(function () {

        showNextQuestion();

    }, 400);
}


// ------------------------------------------------------------
// PROCESS SPEECH
// ------------------------------------------------------------

function processSpeech(event) {

    if (!questionActive) {

        return;
    }


    // Don't process another answer

    if (answerProcessed) {

        return;
    }


    let transcript = "";


    // Read latest speech result

    for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
    ) {

        transcript +=
            event.results[i][0].transcript;
    }


    transcript =
        transcript
            .trim()
            .toLowerCase();


    if (!transcript) {

        return;
    }


    console.log("Heard:", transcript);


    const detectedNumber =
        extractNumber(transcript);


    if (detectedNumber === null) {

        return;
    }


    // Answer found

    answerProcessed = true;


    answerDisplay.textContent =
        `You said: ${detectedNumber}`;


    listeningDisplay.textContent =
        "🎤 Answer received";


    if (detectedNumber === currentAnswer) {

        // CORRECT

        correctAnswers++;

        answeredQuestions++;


        feedbackDisplay.textContent =
            "✓";


        feedbackDisplay.style.color =
            "#16a34a";

    } else {

        // INCORRECT

        incorrectAnswers++;

        answeredQuestions++;


        feedbackDisplay.textContent =
            "✗";


        feedbackDisplay.style.color =
            "#dc2626";
    }


    updateScore();
}


// ------------------------------------------------------------
// EXTRACT NUMBER FROM SPEECH
// ------------------------------------------------------------

function extractNumber(text) {

    // Remove punctuation

    text =
        text.replace(/[.,!?]/g, " ");


    // Check if spoken number exists as digit

    const digitMatch =
        text.match(/\b([0-9])\b/);


    if (digitMatch) {

        return parseInt(
            digitMatch[1]
        );
    }


    // Check spoken number words

    const words =
        text.split(/\s+/);


    for (const word of words) {

        if (
            Object.prototype.hasOwnProperty.call(
                numberWords,
                word
            )
        ) {

            return numberWords[word];
        }
    }


    return null;
}


// ------------------------------------------------------------
// UPDATE LIVE SCORE
// ------------------------------------------------------------

function updateScore() {

    const totalCompleted =
        correctAnswers +
        incorrectAnswers +
        unansweredAnswers;


    totalScore.textContent =
        totalCompleted;


    answeredScore.textContent =
        answeredQuestions;


    correctScore.textContent =
        correctAnswers;


    incorrectScore.textContent =
        incorrectAnswers;


    unansweredScore.textContent =
        unansweredAnswers;
}


// ------------------------------------------------------------
// FINISH QUIZ
// ------------------------------------------------------------

function finishQuiz() {

    quizRunning = false;

    questionActive = false;


    clearTimeout(questionTimer);

    clearInterval(countdownTimer);


    stopSpeechRecognition();


    startBtn.disabled = false;

    stopBtn.disabled = true;

    questionCountSelect.disabled = false;


    questionDisplay.textContent =
        "Quiz Completed! 🎉";


    questionNumber.textContent =
        `Completed ${totalQuestions} Questions`;


    timerDisplay.textContent = "✓";


    listeningDisplay.textContent =
        "Well done!";


    feedbackDisplay.textContent =
        "🎉";


    showResult();
}


// ------------------------------------------------------------
// STOP QUIZ
// ------------------------------------------------------------

stopBtn.addEventListener("click", function () {

    stopQuiz();

});


function stopQuiz() {

    quizRunning = false;

    questionActive = false;


    clearTimeout(questionTimer);

    clearInterval(countdownTimer);


    stopSpeechRecognition();


    startBtn.disabled = false;

    stopBtn.disabled = true;

    questionCountSelect.disabled = false;


    listeningDisplay.textContent =
        "Quiz stopped";


    questionDisplay.textContent =
        "Quiz Stopped";


    timerDisplay.textContent =
        "—";


    showResult();
}


// ------------------------------------------------------------
// STOP SPEECH RECOGNITION
// ------------------------------------------------------------

function stopSpeechRecognition() {

    if (recognition) {

        try {

            recognition.stop();

        } catch (error) {

            console.log(error);

        }
    }
}


// ------------------------------------------------------------
// RESULT BUTTON
// ------------------------------------------------------------

resultBtn.addEventListener("click", function () {

    showResult();

});


function showResult() {

    resultPanel.classList.add("show");


    resultTotal.textContent =
        totalQuestions;


    resultAnswered.textContent =
        answeredQuestions;


    resultUnanswered.textContent =
        unansweredAnswers;


    resultCorrect.textContent =
        correctAnswers;


    resultIncorrect.textContent =
        incorrectAnswers;


    // Scroll result into view

    resultPanel.scrollIntoView({

        behavior: "smooth",

        block: "center"

    });
}


// ------------------------------------------------------------
// RESTART BUTTON
// ------------------------------------------------------------

restartBtn.addEventListener("click", function () {

    resultPanel.classList.remove("show");

    startQuiz();

});


// ------------------------------------------------------------
// INITIAL DISPLAY
// ------------------------------------------------------------

updateScore();

questionNumber.textContent =
    `Question 0 / ${questionCountSelect.value}`;


// Update question count display when changed

questionCountSelect.addEventListener(
    "change",
    function () {

        questionNumber.textContent =
            `Question 0 / ${this.value}`;

    }
);