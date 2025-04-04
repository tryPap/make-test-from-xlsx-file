async function loadQuestions() {
  const response = await fetch("../assets/XEIRISTIS-KLARK-GIA-APPLICATIN.xlsx"); // Load Excel file
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });

  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert Excel sheet to JSON
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  return processQuestions(data);
}

// Process questions from Excel
function processQuestions(data) {
  const processedQuestions = [];
  let currentQuestion = null;

  data.forEach((row, index) => {
    const questionNumber = row[0];
    if (questionNumber === "Α/Α") {
      return; // Skip this row
    }

    const text = row.slice(1, 6).join(" ");
    const isCorrect = row[6] !== undefined && row[6] !== "";
    const module = row[7];
    const difficultyLevel = (row[8] || "").toUpperCase().trim(); // Normalize difficulty level

    if (Number.isInteger(questionNumber)) {
      if (currentQuestion) {
        processedQuestions.push(currentQuestion);
      }
      currentQuestion = {
        questionNumber,
        questionTitle: text,
        possibleAnswers: [],
        correctAnswer: null,
        module,
        difficultyLevel, // Ensure this is set correctly
      };
    } else if (currentQuestion) {
      currentQuestion.possibleAnswers.push(text);
      if (isCorrect) currentQuestion.correctAnswer = text;
    }
  });

  if (currentQuestion) processedQuestions.push(currentQuestion);
  console.log("Processed questions:", processedQuestions); // Debugging: Check the final processed questions
  return processedQuestions;
}

//
async function prepareQuestions() {
  let allQuestions = await loadQuestions();
  let questions = [];

  if (allQuestions.length === 0) {
    alert("No questions loaded! Please upload an Excel file first.");
    return;
  }

  let percentages = JSON.parse(sessionStorage.getItem("examPercentages")) || {};
  let {
    questionPercentage,
    passPercentage,
    difficultyA,
    difficultyB,
    difficultyC,
  } = percentages;

  let totalQuestions =
    percentages.totalQuestions ||
    Math.round((allQuestions.length * questionPercentage) / 100);
  passThreshold = Math.round((totalQuestions * passPercentage) / 100);

  // Shuffle array function
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Extract numeric part from module name (e.g., "ΘΕ1" -> 1)
  function extractModuleNumber(module) {
    const match = module.match(/\d+/); // Extract the numeric part
    return match ? parseInt(match[0], 10) : 0; // Return the number or 0 if no number is found
  }

  // Shuffle and filter questions based on difficulty
  const questionsA = allQuestions.filter(
    (q) => q.difficultyLevel === "Α".trim()
  );
  const questionsB = allQuestions.filter(
    (q) => q.difficultyLevel === "Β".trim()
  );
  const questionsC = allQuestions.filter(
    (q) => q.difficultyLevel === "Γ".trim()
  );

  const countA = Math.min(
    Math.round((totalQuestions * difficultyA) / 100),
    questionsA.length
  );
  const countB = Math.min(
    Math.round((totalQuestions * difficultyB) / 100),
    questionsB.length
  );
  const countC = Math.min(
    Math.round((totalQuestions * difficultyC) / 100),
    questionsC.length
  );

  shuffleArray(questionsA);
  shuffleArray(questionsB);
  shuffleArray(questionsC);

  questions = [
    ...questionsA.slice(0, countA),
    ...questionsB.slice(0, countB),
    ...questionsC.slice(0, countC),
  ];

  questions.sort(
    (a, b) => extractModuleNumber(a.module) - extractModuleNumber(b.module)
  );

  // Store questions in sessionStorage
  sessionStorage.setItem("examQuestions", JSON.stringify(questions));
  console.log("Stored Questions in sessionStorage:", questions);

  return { totalQuestions, questions, percentages };
}
