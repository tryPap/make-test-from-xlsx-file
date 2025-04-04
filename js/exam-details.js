document.addEventListener("DOMContentLoaded", async () => {
  // Make sure to load and process the questions
  await retrieveData();
  const { totalQuestions, questions, percentages } = await prepareQuestions();

  if (questions.length === 0) {
    console.error("No questions found in sessionStorage!");
    return;
  }

  console.log("✅ Loaded Percentages:", percentages);

  // Retrieve values from the URL
  const params = new URLSearchParams(window.location.search);
  const examName = params.get("name") || "Unknown Exam";
  const examDate = params.get("date") || "Unknown Date";
  const examTime = params.get("time") || "Unknown Time";

  // Get modal element and buttons
  const modal = document.getElementById("darkModal");
  const openModalBtn = document.getElementById("openModalBtn");
  const closeBtn = document.querySelector(".close-btn");
  const saveBtn = document.getElementById("saveBtn");
  const examDuration = parseInt(
    document.getElementById("exam-duration").textContent
  );
  sessionStorage.setItem("examDuration", JSON.stringify(examDuration));
  console.log("✅ Exam Duration:", examDuration);

  // Open the modal
  openModalBtn.onclick = function () {
    modal.style.display = "block";
  };

  // Close the modal when the close button is clicked
  closeBtn.onclick = function () {
    modal.style.display = "none";
  };

  // Close the modal if clicked outside of the modal content
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

  const instructionsPassPercentage = document.getElementById(
    "instructions-pass-percentage"
  );
  const instructionsMustAnswered = document.getElementById(
    "instructions-must-answered"
  );

  saveBtn.addEventListener("click", async () => {
    const totalQuestions =
      parseInt(document.getElementById("total-questions-input").value, 10) || 0;
    const passPercent =
      parseInt(document.getElementById("pass-percent-input").value, 10) || 0;
    const difficultyA =
      parseInt(document.getElementById("difficulty-a-input").value, 10) || 0;
    const difficultyB =
      parseInt(document.getElementById("difficulty-b-input").value, 10) || 0;
    const difficultyC =
      parseInt(document.getElementById("difficulty-c-input").value, 10) || 0;

    const difficultySum = difficultyA + difficultyB + difficultyC;
    if (difficultySum !== 100) {
      alert("Difficulty percentages must sum to 100%!");
      return;
    }

    // Update percentages object
    let percentages = {
      totalQuestions,
      difficultyA,
      difficultyB,
      difficultyC,
      passPercentage: passPercent,
    };

    // Save to sessionStorage
    sessionStorage.setItem("examPercentages", JSON.stringify(percentages));
    modal.style.display = "none";
    await prepareQuestions(); // Regenerate test with new values
    location.reload(); // Force test UI to update
  });

  // Update HTML content
  document.getElementById("exam-name").textContent = examName;
  document.getElementById("exam-date").textContent = examDate;
  document.getElementById("exam-time").textContent = examTime;

  const totalQuestionsEl = document.getElementById("total-questions");
  const difficultyAEl = document.getElementById("difficulty-a");
  const difficultyBEl = document.getElementById("difficulty-b");
  const difficultyCEl = document.getElementById("difficulty-c");
  const passPercentEl = document.getElementById("pass-percent");

  if (totalQuestionsEl) totalQuestionsEl.textContent = totalQuestions;
  if (difficultyAEl) difficultyAEl.textContent = percentages.difficultyA;
  if (difficultyBEl) difficultyBEl.textContent = percentages.difficultyB;
  if (difficultyCEl) difficultyCEl.textContent = percentages.difficultyC;
  if (passPercentEl) passPercentEl.textContent = percentages.passPercentage;

  // Update instructions paragraph
  const passThreshold = Math.ceil(
    questions.length * (percentages.passPercentage / 100)
  );
  instructionsPassPercentage.textContent = `${percentages.passPercentage}%`;
  instructionsMustAnswered.textContent = `${passThreshold} / ${questions.length} `;

  const startExamBtn = document.querySelector(".start-btn");

  startExamBtn.addEventListener("click", () => {
    window.location.href = "../pages/test-page.html";
  });



  const printPdfBtn = document.querySelector(".printToPdfBtn");
  printPdfBtn.addEventListener("click", () => {
    const passThreshold = Math.ceil(
      questions.length * (percentages.passPercentage / 100)
    );
    // Create printable content
    let printableContent = `
                <html>
                <head>
                    <link rel="stylesheet" href="../css/print-style.css">
                </head>
                <body>
                
                    <div class="header"> 
                    <img src="../assets/images/vergi-logo.png" alt="Vergis Logo" class="logo"/>
                    <p id="school-name">Εκπαιδευτικό Συγκρότημα Βέργη, Ζαΐμη 21 Πάτρα, t: 2610270293, e: info@vergis.edu.gr</p>
                    </div>
                    <h2 class="exam-title">ΧΕΙΡΙΣΤΗΣ ΚΛΑΡΚ</h2>
                    <div class="exam-info">
                        <div><strong>Ημερομηνία Εξέτασης:</strong>_________________</div>
                        <div><strong>Ονοματεπώνυμο:</strong>_________________</div>
                    </div>
                    <div class="full-exam-name">
                        <p>Πρόγραμμα Επαγγελματικής Κατάρτισης Χειριστής Clark για την άσκηση της δραστηριότητας του χειρισμού ανυψωτικών περονοφόρων μηχανημάτων έργων που κατατάσσονται στην "ειδικότητα 2" (εργασίες ανύψωσης και μεταφοράς φορτίων ή προσώπων).</p>
                        <p>Απαντάτε σε όλες τις ερωτήσεις κυκλόνωντας την σωστή απάντηση. Το ποσοστό επιτυχίας είναι ${percentages.passPercentage}%, ${passThreshold} / ${questions.length} σωστές απαντήσεις.</p>
                    </div>
                    <div class="exam-questions">
            `;
    questions.forEach((question, index) => {
      printableContent += `
                    <div class="question">
                    <h2>Q${index + 1}: ${question.questionTitle}</h2>
                        <div class="question-meta">
                            <p class="module">Module: ${question.module}<p>
                            <p class="difficulty">Difficulty: ${
                              question.difficultyLevel
                            }</p>
                        </div>
                        <div class="answers">
                        ${question.possibleAnswers
                          .filter((answer) => answer.trim() !== "") // Remove empty answers
                          .map(
                            (answer) => `<label class="answer-option">
                                ☐ ${answer}
                            </label>`
                          )
                          .join("<br>")}
                        </div>
                    </div>
                `;
    });
    printableContent += `
            </div>         
              <div class="footer"></div>       
              </body></html>
            `;
    // Open in new tab and print
    const newWindow = window.open(" ", "_blank");
    newWindow.document.open();
    newWindow.document.write(printableContent);
    newWindow.document.close();
    // Wait for the new window to fully load before printing
    newWindow.onload = function () {
      newWindow.print();
    };
  });
});
