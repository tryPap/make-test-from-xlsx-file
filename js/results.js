"use strict";
document.addEventListener("DOMContentLoaded", () => {
  const resultsData = JSON.parse(sessionStorage.getItem("quizResults"));

  if (!resultsData) {
    document.body.innerHTML =
      "<h2>No results found. Please take the quiz first.</h2>";
    return;
  }

  displayResults(resultsData);
});

function displayResults(resultsData) {
  const { correctAnswers, wrongAnswers, questions, passThreshold } =
    resultsData;
  const container = document.querySelector(".container");
  const resultsContainer = document.querySelector("#results-container");

  const passed = correctAnswers.length >= passThreshold;

  const resultMessageDiv = document.createElement("div");
  resultMessageDiv.classList.add("result-message");


  const resultMessage = `
  <h2 class="result-title ${passed ? 'passed' : 'failed'}">
    ${passed ? "🎉 Συγχαρητήρια! Πέρασες!" : "❌ Απέτυχες."} 
    (${correctAnswers.length}/${questions.length})
  </h2>
`;

  // const resultMessage = `
  //       <h2  style="text-align: center; color: ${
  //         passed ? "#00e357" : "#ff3b3b"
  //       };">
  //           ${passed ? "🎉 Συγχαρητήρια! Πέρασες!" : "❌ Απέτυχες."} (${
  //   correctAnswers.length
  // }/${questions.length})
  //       </h2>
  //   `;

  const progress = `
        <div style="width: 100%; border-radius: 5px; margin: 10px 0;">
            <div style="width: ${
              (correctAnswers.length / questions.length) * 100
            }%; 
                height: 10px; background: ${passed ? "#00e357" : "#ff3b3b"};
                border-radius: 5px; transition: width 1s ease-in-out;">
            </div>
        </div>
    `;

  resultMessageDiv.innerHTML = resultMessage + progress;

  container.insertBefore(resultMessageDiv, resultsContainer);
  const correctSection = `
        <h3 style="color: #00e357;">✅ Σωστές Απαντήσεις (${
          correctAnswers.length
        })</h3>
        ${correctAnswers
          .map(
            (item) => `
            <details style="border: 1px solid #00e357; padding: 10px; border-radius: 5px; margin-bottom: 5px;">
                <summary><strong>Q${item.number}:</strong> ${item.question}</summary>
                ✅ <strong>Correct Answer:</strong> ${item.correctAnswer}
            </details>
        `
          )
          .join("")}
    `;

  const wrongSection = `
        <h3 style="color: #ff3b3b;">❌ Λάθος Απαντήσεις (${
          wrongAnswers.length
        })</h3>
        ${wrongAnswers
          .map(
            (item) => `
            <details style="border: 1px solid #ff3b3b; padding: 10px; border-radius: 5px; margin-bottom: 5px;">
                <summary><strong>Q${item.number}:</strong> ${item.question}</summary>
                ❌ <strong>Your Answer:</strong> ${item.selectedAnswer} <br>
                ✅ <strong>Correct Answer:</strong> ${item.correctAnswer}
            </details>
        `
          )
          .join("")}
    `;

  const wrongAnswersDiv = document.createElement("div");
  wrongAnswersDiv.classList.add("wrong-answers");
  wrongAnswersDiv.innerHTML = wrongSection;

  const correctAnswersDiv = document.createElement("div");
  correctAnswersDiv.classList.add("correct-answers");
  correctAnswersDiv.innerHTML = correctSection;

  resultsContainer.appendChild(correctAnswersDiv);
  resultsContainer.appendChild(wrongAnswersDiv);

  const buttonsDiv = document.createElement("div");
  buttonsDiv.classList.add("buttons-div");
  container.appendChild(buttonsDiv);
  
  // Restart button
  const restartButton = document.createElement("button");
  restartButton.classList.add("btn", "restart");
  restartButton.innerText = "Restart Quiz";
  restartButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to restart the quiz?")) restartQuiz();
  });

  // Print button
  const printButton = document.createElement("button");
  printButton.classList.add("btn", "printBtn");
  printButton.innerText = "Print Results";
  printButton.addEventListener("click", printResults);

  // Append buttons to results container
  buttonsDiv.appendChild(restartButton);
  buttonsDiv.appendChild(printButton);
}

// Print Results
function printResults() {
  const resultsData = JSON.parse(sessionStorage.getItem("quizResults"));
  if (!resultsData) {
    alert("No results found to print.");
    return;
  }

  const { correctAnswers, wrongAnswers, questions, passThreshold } =
    resultsData;

  const printWindow = window.open("", "_blank");

  let printContent = `
          <html>
          <head>
              <title>Exam Results</title>
              <link rel="stylesheet" href="../css/print-results.css">
          </head>
          <body>
              <h2>Αποτελέσματα Εξέτασης Χειριστή Κλαρκ</h2>
              <p><strong><strong>Score:</strong> ${correctAnswers.length} / ${
    questions.length
  } ${
    correctAnswers.length >= passThreshold
      ? "Επιτυχία Εξετάσεων"
      : "Αποτυχία Εξετάσεων"
  }</strong></p>
              <div class="results">
              `;

  // ✅ Mark correct and wrong answers
  questions.forEach((question, index) => {
    const correct = correctAnswers.find((q) => q.number === index + 1);
    const wrong = wrongAnswers.find((q) => q.number === index + 1);

    const status = correct ? "&#x2713;" : "&#x2718;";
    const answerText = correct
      ? `Correct: ${correct.correctAnswer}`
      : wrong
      ? `Your Answer: ${wrong.selectedAnswer} | Correct: ${wrong.correctAnswer}`
      : `No Answer | Correct: ${question.correctAnswer}`;

    printContent += `
          <div class="question">${status} Q${index + 1}: ${
      question.questionTitle
    }</div>
          <div class="answer">${answerText}</div>
      `;
  });

  printContent += `
      </div>
          <br><button onclick="window.print()">Print / Save as PDF</button>
          </body></html>
      `;

  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.focus();
}

function restartQuiz() {
  sessionStorage.removeItem("quizResults");
  sessionStorage.removeItem("questions");
  sessionStorage.removeItem("examPercentages");
  window.location.href = "../index.html"; // Redirect to quiz start
}
