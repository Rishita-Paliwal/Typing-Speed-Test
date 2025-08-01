// ---- Elements ----
const quoteDisplay = document.getElementById("quote");
const inputBox = document.getElementById("input");
const timeDisplay = document.getElementById("time");
const wpmDisplay = document.getElementById("wpm");
const accuracyDisplay = document.getElementById("accuracy");
const statusDisplay = document.getElementById("status");
const newTestBtn = document.getElementById("new-test");
const scoresList = document.getElementById("scores-list");
const clearScoresBtn = document.getElementById("clear-scores");
const progressBar = document.getElementById("progress");

let quotes = [
  "Typing is a skill you can improve with practice.",
  "The quick brown fox jumps over the lazy dog.",
  "JavaScript makes websites interactive and dynamic.",
  "Always code as if the person who ends up maintaining your code will be a violent psychopath who knows where you live.",
  "Consistency is what transforms average into excellence.",
  "Discipline is the bridge between goals and accomplishment. Stay consistent, even when it's boring. You don't need motivation every day, you need commitment and a strong reason why.",
  "Success doesn’t come from what you do occasionally. It comes from what you do consistently. Even on your worst days, show up. Small steps forward still move you ahead.",
  "Don’t wait for opportunity — create it. Every expert was once a beginner. Learn, fall, rise, and repeat. The journey is what builds the strength.",
  "You don’t have to be perfect, just persistent. Mistakes are proof that you’re trying. Keep typing, keep learning, keep growing. Every effort plants a seed of progress.",
  "The only limit to your impact is your imagination and effort. Believe in your ability to improve. Practice sharpens the dullest skill. Let each word be a step toward mastery."
];


let startTime = null;
let timer = null;
let currentQuote = "";
let finished = false;

// ---- Initialization ----
function loadHighScores() {
  const stored = JSON.parse(localStorage.getItem("typing_high_scores") || "[]");
  return stored;
}

function saveHighScores(list) {
  localStorage.setItem("typing_high_scores", JSON.stringify(list));
}

function renderHighScores() {
  const scores = loadHighScores();
  if (scores.length === 0) {
    scoresList.innerHTML = `<li style="opacity:.7">No high scores yet.</li>`;
    return;
  }
  scoresList.innerHTML = "";
  scores.slice(0, 5).forEach(s => {
    const li = document.createElement("li");
    const dateObj = new Date(s.timestamp);
    const dateStr = dateObj.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    li.textContent = `${s.wpm} WPM, ${s.accuracy}% accuracy — ${dateStr}`;
    scoresList.appendChild(li);
  });
}

// ---- Core Logic ----
function startTest() {
  inputBox.value = "";
  inputBox.disabled = false;
  finished = false;

  currentQuote = quotes[Math.floor(Math.random() * quotes.length)];
  quoteDisplay.innerHTML = currentQuote.split("").map(char => `<span>${char}</span>`).join("");
  timeDisplay.textContent = "0";
  wpmDisplay.textContent = "0";
  accuracyDisplay.textContent = "0";
  statusDisplay.textContent = "Start typing to begin!";
  progressBar.style.width = "0%";

  clearInterval(timer);
  startTime = null;
  inputBox.focus();
}

function calculateWPM(elapsedSeconds, quote) {
  const wordCount = quote.trim().split(/\s+/).length;
  return Math.round((wordCount / elapsedSeconds) * 60);
}

function calculateAccuracy(typed, target) {
  let correctChars = 0;
  for (let i = 0; i < target.length; i++) {
    if (typed[i] === target[i]) correctChars++;
  }
  const total = target.length;
  return Math.max(0, Math.round((correctChars / total) * 100));
}

function updateProgress(typed, target) {
  const percent = Math.min(100, Math.floor((typed.length / target.length) * 100));
  progressBar.style.width = percent + "%";
}

function endTest() {
  clearInterval(timer);
  inputBox.disabled = true;
  finished = true;

  const totalTime = (new Date() - startTime) / 1000;
  const wpm = calculateWPM(totalTime, currentQuote);
  const accuracy = calculateAccuracy(inputBox.value, currentQuote);

  wpmDisplay.textContent = wpm;
  accuracyDisplay.textContent = accuracy;

  statusDisplay.innerHTML = "<strong style='color: green;'>✅ Completed! 🎉</strong>";
  statusDisplay.style.transition = "all 0.3s ease";

  // Save to high scores
  const existing = loadHighScores();
  existing.push({
    wpm,
    accuracy,
    timestamp: new Date().toISOString()
  });

  existing.sort((a, b) => {
    if (b.wpm !== a.wpm) return b.wpm - a.wpm;
    return b.accuracy - a.accuracy;
  });

  saveHighScores(existing.slice(0, 10));
  renderHighScores();
}

function updateTimer() {
  const elapsed = ((new Date() - startTime) / 1000).toFixed(1);
  timeDisplay.textContent = elapsed;
  const wpmLive = calculateWPM(elapsed, currentQuote);
  const accLive = calculateAccuracy(inputBox.value, currentQuote);
  wpmDisplay.textContent = wpmLive;
  accuracyDisplay.textContent = accLive;
}

// ---- Event Listeners ----
inputBox.addEventListener("input", () => {
  if (finished) return;

  if (!startTime) {
    startTime = new Date();
    timer = setInterval(updateTimer, 100);
  }

  const typed = inputBox.value;
  updateProgress(typed, currentQuote);

  // Live highlight the quote
  let formatted = "";
  for (let i = 0; i < currentQuote.length; i++) {
    const expected = currentQuote[i];
    const typedChar = typed[i];

    if (typedChar == null) {
      formatted += `<span>${expected}</span>`;
    } else if (typedChar === expected) {
      formatted += `<span style="color: green;">${expected}</span>`;
    } else {
      formatted += `<span style="color: red;">${expected}</span>`;
    }
  }
  quoteDisplay.innerHTML = formatted;

  if (typed === currentQuote) {
    endTest();
  } else {
    statusDisplay.textContent = "Typing...";
  }

  // Shake effect on mistake
  if (typed.length > 0 && typed[typed.length - 1] !== currentQuote[typed.length - 1]) {
    inputBox.classList.add("shake");
    setTimeout(() => inputBox.classList.remove("shake"), 200);
  }
});

newTestBtn.addEventListener("click", startTest);

clearScoresBtn.addEventListener("click", () => {
  localStorage.removeItem("typing_high_scores");
  renderHighScores();
});

// Allow "Enter" key to restart after completion
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && finished) {
    startTest();
  }
});

// ---- On load ----
window.addEventListener("load", () => {
  renderHighScores();
  startTest();
});
