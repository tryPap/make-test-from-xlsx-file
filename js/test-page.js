document.addEventListener("DOMContentLoaded", async () => {
  const questionAnswers = document.querySelector(".question-answers");
  const quests = document.querySelector(".quests");

  let { questions, percentages } = await retrieveData();

  let correctAnswers = [];
  let wrongAnswers = [];

  // Initialize timeLeft properly
  let examDuration = parseInt(
    JSON.parse(sessionStorage.getItem("examDuration") || "0"),
    10
  );
  let remainingTime = parseInt(sessionStorage.getItem("remainingTime"), 10);

  let timeLeft =
    !isNaN(remainingTime) && remainingTime > 0
      ? remainingTime
      : examDuration * 60;

  // Modified startTimer function
  function startTimer() {
    timerInterval = setInterval(() => {
      if (timeLeft <= 0) {
        handleTimeExpiration();
        return;
      }

      timeLeft--;
      sessionStorage.setItem("remainingTime", timeLeft);
      updateTimerDisplay();
    }, 1000);
  }

  // New helper function
  function handleTimeExpiration() {
    clearInterval(timerInterval);
    sessionStorage.removeItem("remainingTime");
    sessionStorage.removeItem("examDuration");
    alert("Time's up!");
    endQuiz();
  }

  // Updated display function
  function updateTimerDisplay() {
    const displayTime = Math.max(timeLeft, 0);
    const minutes = Math.floor(displayTime / 60);
    const seconds = displayTime % 60;

    const timerElement = document.getElementById("timer");
    timerElement.textContent = `Time Left: ${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;

    // Add warning when 5 minutes left
    timerElement.classList.toggle("low-time", timeLeft <= 5 * 60);
  }

  function scrollToNextQuestion() {
    const questionBlocks = document.querySelectorAll(".question-block");
    const currentQuestion = document.activeElement.closest(".question-block");
  
    // Find the index of the current question
    const currentIndex = Array.from(questionBlocks).indexOf(currentQuestion);
  
    // Scroll to the next question if it exists
    if (currentIndex >= 0 && currentIndex < questionBlocks.length - 1) {
      const nextQuestion = questionBlocks[currentIndex + 1];
      nextQuestion.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }
    

  function startTestFunc() {
    quests.style.display = "block";
    correctAnswers = [];
    wrongAnswers = [];

    passThreshold = Math.ceil(
      questions.length * (percentages.passPercentage / 100)
    );
    startTimer();
    showQuestions();
  }

  startTestFunc();

  function showQuestions() {
    questionAnswers.innerHTML = "";

    questions.forEach((question, index) => {
      const questionDiv = document.createElement("div");
      questionDiv.classList.add("question-block");

      questionDiv.innerHTML = `
          <h3>Q${index + 1}: ${question.questionTitle}</h3>
          <p>Module: ${question.module} | Difficulty: ${
        question.difficultyLevel
      }</p>
        `;

      const answersDiv = document.createElement("div");
      answersDiv.classList.add("answers");

      // Shuffle the possible answers
      let shuffledAnswers = [...question.possibleAnswers].filter(
        (answer) => answer.trim() !== ""
      );

      shuffledAnswers.forEach((answer) => {
        const label = document.createElement("label");
        label.classList.add("answer-option");

        const input = document.createElement("input");
        input.type = "radio";
        input.name = `question-${index}`;
        input.value = answer;
        input.dataset.correct =
          answer === question.correctAnswer ? "true" : "false";


          input.addEventListener("change", () => {
            scrollToNextQuestion();
          });

        label.appendChild(input);
        label.append(` ${answer}`);
        answersDiv.appendChild(label);
      });

      questionDiv.appendChild(answersDiv);
      questionAnswers.appendChild(questionDiv);
    });

    const submitButton = document.createElement("button");
    submitButton.innerText = "Submit";
    submitButton.classList.add("btn", "submit-quiz");

    submitButton.addEventListener("click", () => {
      // Check if all questions have been answered
      const allAnswered = questions.every((_, index) => {
        return document.querySelector(
          `input[name="question-${index}"]:checked`
        );
      });

      if (!allAnswered) {
        // Find the unanswered questions and display their numbers
        const unansweredQuestionNumbers = questions
          .map((_, index) => index + 1) // Get the question numbers (1-based index)
          .filter((number) => {
            return !document.querySelector(
              `input[name="question-${number - 1}"]:checked`
            ); // Check if the question is unanswered
          })
          .map((number) => `Q${number}`) // Format the question numbers
          .join(", ");

        alert(
          `You have unanswered questions.\nUnanswered Questions: ${unansweredQuestionNumbers}`
        );
        return;
      }

      if (confirm("Are you sure you want to submit the quiz?")) {
        clearInterval(timerInterval);
        sessionStorage.removeItem("examDuration");
        sessionStorage.removeItem("remainingTime");
        endQuiz();
      }
    });

    questionAnswers.appendChild(submitButton);
  }

  function endQuiz() {
    correctAnswers = [];
    wrongAnswers = [];
    clearInterval(timerInterval);
    sessionStorage.removeItem("examDuration");
    sessionStorage.removeItem("remainingTime");

    questions.forEach((question, index) => {
      const selectedAnswer = document.querySelector(
        `input[name="question-${index}"]:checked`
      );

      if (selectedAnswer) {
        const isCorrect = selectedAnswer.dataset.correct === "true";
        if (isCorrect) {
          correctAnswers.push({
            number: index + 1,
            question: question.questionTitle,
            correctAnswer: question.correctAnswer,
          });
        } else {
          wrongAnswers.push({
            number: index + 1,
            question: question.questionTitle,
            selectedAnswer: selectedAnswer.value,
            correctAnswer: question.correctAnswer,
          });
        }
      } else {
        wrongAnswers.push({
          number: index + 1,
          question: question.questionTitle,
          selectedAnswer: "No Answer",
          correctAnswer: question.correctAnswer,
        });
      }
    });
    // Store results in sessionStorage
    sessionStorage.setItem(
      "quizResults",
      JSON.stringify({
        correctAnswers,
        wrongAnswers,
        totalQuestions: questions.length,
        questions,
        passThreshold,
      })
    );

    // Redirect to results page
    window.location.href = "../pages/results-page.html";
  }
});
