const animals = [
  { name: "León", emoji: "🦁" },
  { name: "Elefante", emoji: "🐘" },
  { name: "Jirafa", emoji: "🦒" },
  { name: "Tigre", emoji: "🐯" },
  { name: "Mono", emoji: "🐵" },
  { name: "Panda", emoji: "🐼" },
  { name: "Zorro", emoji: "🦊" },
  { name: "Koala", emoji: "🐨" },
  { name: "Conejo", emoji: "🐰" },
  { name: "Oso", emoji: "🐻" },
  { name: "Rana", emoji: "🐸" },
  { name: "Pulpo", emoji: "🐙" },
  { name: "Ballena", emoji: "🐳" },
  { name: "Delfín", emoji: "🐬" },
  { name: "Pingüino", emoji: "🐧" },
  { name: "Tortuga", emoji: "🐢" },
  { name: "Mariposa", emoji: "🦋" },
  { name: "Búho", emoji: "🦉" },
  { name: "Caballo", emoji: "🐴" },
  { name: "Vaca", emoji: "🐮" },
  { name: "Cerdo", emoji: "🐷" },
  { name: "Oveja", emoji: "🐑" },
  { name: "Gallina", emoji: "🐔" },
  { name: "Pato", emoji: "🦆" },
  { name: "Águila", emoji: "🦅" },
  { name: "Loro", emoji: "🦜" },
  { name: "Serpiente", emoji: "🐍" },
  { name: "Cocodrilo", emoji: "🐊" },
  { name: "Tiburón", emoji: "🦈" },
  { name: "Cangrejo", emoji: "🦀" },
  { name: "Caracol", emoji: "🐌" },
  { name: "Abeja", emoji: "🐝" },
];

const board = document.querySelector("#game-board");
const movesDisplay = document.querySelector("#moves");
const pairsDisplay = document.querySelector("#pairs");
const pairTotalDisplay = document.querySelector("#pair-total");
const failuresDisplay = document.querySelector("#failures");
const levelDisplay = document.querySelector("#level");
const boardSizeDisplay = document.querySelector("#board-size");
const boardDescription = document.querySelector("#board-description");
const restartButton = document.querySelector("#restart");
const feedback = document.querySelector("#game-feedback");

const LEVELS = [
  { size: 2, maxFailures: 3 },
  { size: 4, maxFailures: 16 },
  { size: 6, maxFailures: 36 },
  { size: 8, maxFailures: 64 },
];

let firstCard = null;
let secondCard = null;
let locked = false;
let moves = 0;
let matchedPairs = 0;
let failures = 0;
let currentLevelIndex = 0;
let pairTarget = 0;
let gameOver = false;
let mismatchTimer = null;
let feedbackTimer = null;
let transitionTimer = null;

function shuffle(items) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}

function showFeedback(message, type) {
  window.clearTimeout(feedbackTimer);
  feedback.textContent = message;
  feedback.className = `game-feedback is-visible is-${type}`;
  feedbackTimer = window.setTimeout(() => {
    feedback.classList.remove("is-visible");
  }, 1350);
}

function createCard(animal, index) {
  const card = document.createElement("button");
  card.className = "memory-card";
  card.type = "button";
  card.dataset.animal = animal.name;
  card.setAttribute("aria-label", `Carta ${index + 1}, oculta`);
  card.setAttribute("aria-pressed", "false");
  card.innerHTML = `
    <span class="card-back" aria-hidden="true">✦</span>
    <span class="card-front" aria-hidden="true">
      <span class="animal-emoji">${animal.emoji}</span>
      <span class="animal-name">${animal.name}</span>
    </span>
  `;
  card.addEventListener("click", () => revealCard(card, animal));
  return card;
}

function setCardRevealed(card, animal) {
  card.classList.add("is-revealed");
  card.setAttribute("aria-pressed", "true");
  card.setAttribute("aria-label", animal.name);
}

function hideCard(card) {
  card.classList.remove("is-revealed", "is-mismatched");
  card.setAttribute("aria-pressed", "false");
  card.setAttribute("aria-label", "Carta oculta");
}

function revealCard(card, animal) {
  if (locked || gameOver || card.classList.contains("is-revealed") || card.classList.contains("is-matched")) {
    return;
  }

  setCardRevealed(card, animal);

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  locked = true;
  moves += 1;
  movesDisplay.textContent = moves;
  const maxFailures = LEVELS[currentLevelIndex].maxFailures;

  if (firstCard.dataset.animal === secondCard.dataset.animal) {
    firstCard.classList.replace("is-revealed", "is-matched");
    secondCard.classList.replace("is-revealed", "is-matched");
    firstCard.disabled = true;
    secondCard.disabled = true;
    matchedPairs += 1;
    if (LEVELS[currentLevelIndex].size >= 4) {
      failures = Math.max(0, failures - 2);
      failuresDisplay.textContent = `${failures} / ${maxFailures}`;
    }
    pairsDisplay.textContent = matchedPairs;
    firstCard = null;
    secondCard = null;
    locked = false;
    showFeedback(
      LEVELS[currentLevelIndex].size >= 4
        ? "¡Acierto! Recuperaste hasta 2 fallos 🎉"
        : "¡Acierto! Encontraste la pareja 🎉",
      "success",
    );

    if (matchedPairs === pairTarget) {
      if (currentLevelIndex === LEVELS.length - 1) {
        gameOver = true;
        restartButton.innerHTML = '<span aria-hidden="true">⟳</span> Jugar otra vez';
        showFeedback(`¡Ganaste! Completaste los ${LEVELS.length} niveles 🏆`, "complete");
      } else {
        const nextLevel = LEVELS[currentLevelIndex + 1];
        locked = true;
        showFeedback(`¡Nivel superado! Prepárate para el nivel ${nextLevel.size} 🎉`, "success");
        transitionTimer = window.setTimeout(() => {
          startLevel(currentLevelIndex + 1);
          showFeedback(`¡Nivel ${nextLevel.size}! Cuadrícula de ${nextLevel.size} × ${nextLevel.size}`, "success");
        }, 1500);
      }
    }

    return;
  }
  failures += 1;
  failures += 1;
  failuresDisplay.textContent = `${failures} / ${maxFailures}`;
  firstCard.classList.add("is-mismatched");
  secondCard.classList.add("is-mismatched");
  const reachedFailureLimit = failures >= maxFailures;
  if (reachedFailureLimit) {
    gameOver = true;
  }
  showFeedback(
    reachedFailureLimit
      ? `¡Alcanzaste ${maxFailures} fallos! Regresarás al nivel anterior.`
      : `¡Fallaste! Te quedan ${maxFailures - failures} ${maxFailures - failures === 1 ? "fallo" : "fallos"}.`,
    "error",
  );
  const unmatchedFirst = firstCard;
  const unmatchedSecond = secondCard;
  mismatchTimer = window.setTimeout(() => {
    hideCard(unmatchedFirst);
    hideCard(unmatchedSecond);
    firstCard = null;
    secondCard = null;
    mismatchTimer = null;
    if (reachedFailureLimit) {
      transitionTimer = window.setTimeout(() => {
        const lostLevelIndex = currentLevelIndex;
        const previousLevelIndex = Math.max(0, currentLevelIndex - 1);
        startLevel(previousLevelIndex);
        showFeedback(
          previousLevelIndex === lostLevelIndex
            ? "Perdiste el nivel. Inténtalo otra vez."
            : `Volviste al nivel ${LEVELS[previousLevelIndex].size}. ¡Sigue intentando!`,
          "error",
        );
      }, 1200);
      return;
    }

    locked = false;
  }, 900);
}

function startLevel(levelIndex) {
  window.clearTimeout(mismatchTimer);
  window.clearTimeout(feedbackTimer);
  window.clearTimeout(transitionTimer);
  firstCard = null;
  secondCard = null;
  locked = false;
  gameOver = false;
  currentLevelIndex = levelIndex;
  const level = LEVELS[levelIndex];
  moves = 0;
  matchedPairs = 0;
  failures = 0;
  pairTarget = (level.size * level.size) / 2;
  movesDisplay.textContent = moves;
  pairsDisplay.textContent = matchedPairs;
  pairTotalDisplay.textContent = pairTarget;
  failuresDisplay.textContent = `${failures} / ${level.maxFailures}`;
  levelDisplay.textContent = `Nivel ${level.size}`;
  boardSizeDisplay.textContent = `${level.size} × ${level.size}`;
  boardDescription.textContent = `Encuentra las ${pairTarget} parejas de animales`;
  board.style.setProperty("--columns", level.size);
  board.setAttribute("aria-label", `Tablero de memoria de ${level.size} por ${level.size} con ${level.size * level.size} cartas`);
  feedback.className = "game-feedback";
  feedback.textContent = "";
  restartButton.innerHTML = '<span aria-hidden="true">⟳</span> Empezar de nuevo';
  board.replaceChildren();

  const levelAnimals = animals.slice(0, pairTarget);
  const deck = shuffle([...levelAnimals, ...levelAnimals]);
  deck.forEach((animal, index) => {
    board.append(createCard(animal, index));
  });
}

function startGame() {
  startLevel(0);
}

restartButton.addEventListener("click", () => {
  startGame();
});
startGame();
