async function retrieveData() {
  let questions = JSON.parse(sessionStorage.getItem("examQuestions")) || [];
  let percentages =
    JSON.parse(sessionStorage.getItem("examPercentages")) || null;

  if (!questions.length) {
    console.log("❗ No questions found in sessionStorage. Loading now...");
    questions = await prepareQuestions(); // Fetch questions from Excel
    if (questions.length) {
      sessionStorage.setItem("examQuestions", JSON.stringify(questions));
      console.log("✅ Questions stored in sessionStorage.");
    } else {
      console.error("⚠️ Failed to load questions.");
    }
  } else {
    console.log("✅ Questions already in sessionStorage.");
  }

  if (!percentages) {
    console.log(
      "❗ No percentages found in sessionStorage. Setting defaults..."
    );
    percentages = {
      questionPercentage: 45,
      passPercentage: 80,
      difficultyA: 25,
      difficultyB: 50,
      difficultyC: 25,
    };
    sessionStorage.setItem("examPercentages", JSON.stringify(percentages));
    console.log("✅ Percentages stored in sessionStorage.");
  } else {
    console.log("✅ Percentages already in sessionStorage.");
  }

  percentages =
    JSON.parse(sessionStorage.getItem("examPercentages")) || percentages;
  console.log("🔄 Updated Percentages at Test Start:", percentages);

  return { questions, percentages };
}
