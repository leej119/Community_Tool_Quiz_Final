const questions = [
  "Do you try to keep conversations calm when tension arises?",
  "Do you adjust your words or tone to avoid conflict?",
  "Do you notice discomfort in interactions before others do?",
  "Do you take initiative to resolve misunderstandings?",
  "Do you hold back your opinion to prevent tension?",
  "Do you feel responsible for making interactions go smoothly?",
  "Do you continue conversations when others disengage?",
  "Do you feel drained after these interactions?"
];

const pages = [
  document.getElementById("page-intro"),
  document.getElementById("page-quiz"),
  document.getElementById("page-about"),
  document.getElementById("page-result")
];

const pageNames = ["Introduction", "Quiz", "Purpose & Research", "Result"];
const dots = document.querySelectorAll(".dot");
const pageLabel = document.getElementById("pageLabel");

const quizContainer = document.getElementById("quizContainer");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const contextSelect = document.getElementById("contextSelect");
const resultBox = document.getElementById("resultBox");
const resultScore = document.getElementById("resultScore");
const resultContext = document.getElementById("resultContext");
const resultMarker = document.getElementById("resultMarker");

const STORAGE_CONTEXT = "careLoadContext";
const STORAGE_ANSWERS = "careLoadAnswers";
const STORAGE_SCORE = "careLoadScore";

function setActiveStep(index) {
  dots.forEach(function (dot, i) {
    if (i === index) {
      dot.classList.add("active");
    } else {
      dot.classList.remove("active");
    }
  });

  pageLabel.textContent = pageNames[index];
}

function showPage(index) {
  pages.forEach(function (page, i) {
    if (i === index) {
      page.classList.add("active");
    } else {
      page.classList.remove("active");
    }
  });

  setActiveStep(index);
}

function getSavedAnswers() {
  const saved = localStorage.getItem(STORAGE_ANSWERS);
  if (saved) {
    return JSON.parse(saved);
  }
  return {};
}

function buildQuiz() {
  const savedAnswers = getSavedAnswers();
  quizContainer.innerHTML = "";

  questions.forEach(function (question, index) {
    const card = document.createElement("article");
    card.className = "question-card";

    const number = document.createElement("p");
    number.className = "question-number";
    number.textContent = "Question " + (index + 1);

    const text = document.createElement("p");
    text.className = "question-text";
    text.textContent = question;

    const optionCluster = document.createElement("div");
    optionCluster.className = "option-cluster";

    const options = [
      { label: "Often", value: 2 },
      { label: "Sometimes", value: 1 },
      { label: "Rarely", value: 0 }
    ];

    options.forEach(function (option) {
      const label = document.createElement("label");
      label.className = "option-label";

      const input = document.createElement("input");
      input.type = "radio";
      input.name = "q" + index;
      input.value = option.value;

      if (savedAnswers["q" + index] === String(option.value)) {
        input.checked = true;
        label.classList.add("selected");
      }

      input.addEventListener("change", function () {
        const radios = document.querySelectorAll('input[name="q' + index + '"]');

        radios.forEach(function (radio) {
          radio.parentElement.classList.remove("selected");
        });

        label.classList.add("selected");
        saveAnswers();
      });

      const span = document.createElement("span");
      span.textContent = option.label;

      label.appendChild(input);
      label.appendChild(span);
      optionCluster.appendChild(label);
    });

    card.appendChild(number);
    card.appendChild(text);
    card.appendChild(optionCluster);
    quizContainer.appendChild(card);
  });

  updateProgress();
}

function saveAnswers() {
  const answers = {};

  questions.forEach(function (_, index) {
    const checked = document.querySelector('input[name="q' + index + '"]:checked');
    if (checked) {
      answers["q" + index] = checked.value;
    }
  });

  localStorage.setItem(STORAGE_ANSWERS, JSON.stringify(answers));
  localStorage.setItem(STORAGE_CONTEXT, contextSelect.value);

  updateProgress();
}

function updateProgress() {
  const answers = getSavedAnswers();
  const totalAnswered = Object.keys(answers).length;
  const percent = (totalAnswered / questions.length) * 100;

  progressBar.style.width = percent + "%";
  progressText.textContent = totalAnswered + " / " + questions.length + " answered";
}

function allAnswered() {
  return Object.keys(getSavedAnswers()).length === questions.length;
}

function calculateScore() {
  const answers = getSavedAnswers();
  let score = 0;

  Object.values(answers).forEach(function (value) {
    score += Number(value);
  });

  localStorage.setItem(STORAGE_SCORE, String(score));
  return score;
}

function renderResult() {
  const score = Number(localStorage.getItem(STORAGE_SCORE)) || 0;
  const context = localStorage.getItem(STORAGE_CONTEXT) || contextSelect.value;

  resultScore.textContent = score;
  resultContext.textContent = context;
  resultMarker.style.left = "calc(" + (score / 16) * 100 + "% - 5px)";

  document.body.classList.remove("load-low", "load-mid", "load-high");

  if (score >= 11) {
    document.body.classList.add("load-high");
    resultBox.innerHTML = `
      <h3 class="section-title">High care load</h3>
      <p>You may be carrying a large share of the emotional work in <strong>${context}</strong>. Your answers suggest repeated adjustment, mediation, and self-silencing in order to keep interactions stable.</p>
      <ul class="result-list">
        <li>Name the work you are already doing instead of letting it stay invisible.</li>
        <li>Set one clear boundary in the next tense interaction.</li>
        <li>Ask whether calm is being maintained collectively or mostly by you.</li>
      </ul>
    `;
  } else if (score >= 6) {
    document.body.classList.add("load-mid");
    resultBox.innerHTML = `
      <h3 class="section-title">Moderate care load</h3>
      <p>You seem to share some emotional labor in <strong>${context}</strong>, but you may still be absorbing more than you realize.</p>
      <ul class="result-list">
        <li>Notice when you step in automatically without being asked.</li>
        <li>Pause before smoothing over discomfort right away.</li>
        <li>Check whether responsibility is actually shared.</li>
      </ul>
    `;
  } else {
    document.body.classList.add("load-low");
    resultBox.innerHTML = `
      <h3 class="section-title">Lower reported care load</h3>
      <p>Your answers suggest that you are not consistently carrying the emotional burden in <strong>${context}</strong>, or that you are protecting your energy more actively.</p>
      <ul class="result-list">
        <li>Reflect on whether this balance feels healthy and mutual.</li>
        <li>Check whether someone else nearby is carrying hidden labor.</li>
        <li>Keep roles and communication explicit.</li>
      </ul>
    `;
  }
}

function startOver() {
  localStorage.removeItem(STORAGE_CONTEXT);
  localStorage.removeItem(STORAGE_ANSWERS);
  localStorage.removeItem(STORAGE_SCORE);

  contextSelect.selectedIndex = 0;
  document.body.classList.remove("load-low", "load-mid", "load-high");

  buildQuiz();
  showPage(0);
}

document.getElementById("startBtn").addEventListener("click", function () {
  localStorage.setItem(STORAGE_CONTEXT, contextSelect.value);
  buildQuiz();
  showPage(1);
});

document.getElementById("backToIntroBtn").addEventListener("click", function () {
  showPage(0);
});

document.getElementById("toAboutBtn").addEventListener("click", function () {
  saveAnswers();

  if (!allAnswered()) {
    alert("Please answer all 8 questions before continuing.");
    return;
  }

  showPage(2);
});

document.getElementById("backToQuizBtn").addEventListener("click", function () {
  showPage(1);
});

document.getElementById("seeResultBtn").addEventListener("click", function () {
  calculateScore();
  renderResult();
  showPage(3);
});

document.getElementById("restartBtn").addEventListener("click", function () {
  startOver();
});

window.addEventListener("load", function () {
  const savedContext = localStorage.getItem(STORAGE_CONTEXT);

  if (savedContext) {
    contextSelect.value = savedContext;
  }

  buildQuiz();
  setActiveStep(0);
});