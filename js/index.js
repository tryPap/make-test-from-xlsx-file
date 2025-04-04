document.addEventListener("DOMContentLoaded", () => {
  const examDate = document.querySelector(".exam-date p");
  const examTime = document.querySelector(".exam-time p");

  // Date and Time of the exam
  let date = new Date();
  examDate.textContent = date.toLocaleDateString();
  examTime.textContent = date.toLocaleTimeString();

  const selectButton = document.querySelector(".select-btn");

  selectButton.addEventListener("click", () => {
    // Get the selected exam details
    const examName = document.querySelector(".exam-name").textContent;
    const examDate = document.querySelector(".exam-date p").textContent;
    const examTime = document.querySelector(".exam-time p").textContent;

    // Store data in URL parameters
    const queryParams = new URLSearchParams({
      name: examName,
      date: examDate,
      time: examTime,
    });

    // Redirect to the details page with parameters
    window.location.href = `pages/exam-details.html?${queryParams.toString()}`;
  });
});
