const display = document.getElementById("display");
const historyEl = document.getElementById("history");
const keys = document.querySelector(".keys");
const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

let current = "0";
let previous = null;
let operator = null;
let overwrite = false;
let calcHistory = [];

const OPERATOR_SYMBOLS = {
  "/": "÷",
  "*": "×",
  "-": "−",
  "+": "+"
};

function formatNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return "Error";
  }
  return new Intl.NumberFormat("es-ES", { maximumFractionDigits: 12 }).format(number);
}

function updateDisplay() {
  display.textContent = formatNumber(current);
  historyEl.textContent = previous !== null && operator ? `${formatNumber(previous)} ${OPERATOR_SYMBOLS[operator]}` : "";
}

function animateResult() {
  display.classList.remove("display-pop");
  void display.offsetWidth;
  display.classList.add("display-pop");
}

function animateButton(button) {
  button.classList.remove("key-press");
  void button.offsetWidth;
  button.classList.add("key-press");
}

function inputNumber(num) {
  if (overwrite) {
    current = num;
    overwrite = false;
    return;
  }
  if (current === "0") {
    current = num;
  } else {
    current += num;
  }
}

function inputDecimal() {
  if (overwrite) {
    current = "0.";
    overwrite = false;
    return;
  }
  if (!current.includes(".")) {
    current += ".";
  }
}

function clearAll() {
  current = "0";
  previous = null;
  operator = null;
  overwrite = false;
}

function deleteLast() {
  if (overwrite) return;
  current = current.length > 1 ? current.slice(0, -1) : "0";
}

function toggleSign() {
  if (current === "0") return;
  current = String(Number(current) * -1);
}

function toPercent() {
  current = String(Number(current) / 100);
}

function renderCalcHistory() {
  if (!historyList) return;

  historyList.innerHTML = "";
  if (calcHistory.length === 0) {
    const empty = document.createElement("li");
    empty.className = "history-empty";
    empty.textContent = "Aun no hay operaciones";
    historyList.appendChild(empty);
    return;
  }

  calcHistory.forEach((entry) => {
    const li = document.createElement("li");
    li.className = "history-item";
    li.textContent = entry;
    historyList.appendChild(li);
  });
}

function addHistoryEntry(left, op, right, result) {
  const symbol = OPERATOR_SYMBOLS[op] || op;
  const entry = `${formatNumber(left)} ${symbol} ${formatNumber(right)} = ${formatNumber(result)}`;
  calcHistory.unshift(entry);
  if (calcHistory.length > 10) {
    calcHistory = calcHistory.slice(0, 10);
  }
  renderCalcHistory();
}

function compute() {
  if (previous === null || operator === null) return;

  const a = Number(previous);
  const b = Number(current);
  let result;

  switch (operator) {
    case "+":
      result = a + b;
      break;
    case "-":
      result = a - b;
      break;
    case "*":
      result = a * b;
      break;
    case "/":
      result = b === 0 ? NaN : a / b;
      break;
    default:
      return;
  }

  const usedOperator = operator;
  const leftValue = previous;
  const rightValue = current;

  current = Number.isFinite(result) ? String(result) : "0";
  previous = null;
  operator = null;
  overwrite = true;

  if (!Number.isFinite(result)) {
    display.textContent = "Error";
    historyEl.textContent = "No se puede dividir entre 0";
    return;
  }

  addHistoryEntry(leftValue, usedOperator, rightValue, result);
  animateResult();
}

function setOperator(nextOperator) {
  if (operator && previous !== null && !overwrite) {
    compute();
  }
  previous = current;
  operator = nextOperator;
  overwrite = true;
}

keys.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  animateButton(button);

  const { action, value } = button.dataset;

  switch (action) {
    case "number":
      inputNumber(value);
      break;
    case "decimal":
      inputDecimal();
      break;
    case "operator":
      setOperator(value);
      break;
    case "equals":
      compute();
      break;
    case "clear":
      clearAll();
      break;
    case "delete":
      deleteLast();
      break;
    case "toggle-sign":
      toggleSign();
      break;
    case "percent":
      toPercent();
      break;
    default:
      return;
  }

  updateDisplay();
});

window.addEventListener("keydown", (event) => {
  const key = event.key;

  if (/^[0-9]$/.test(key)) inputNumber(key);
  else if (key === "." || key === ",") inputDecimal();
  else if (["+", "-", "*", "/"].includes(key)) setOperator(key);
  else if (key === "Enter" || key === "=") compute();
  else if (key === "Backspace") deleteLast();
  else if (key.toLowerCase() === "c") clearAll();
  else return;

  updateDisplay();
});

if (clearHistoryBtn) {
  clearHistoryBtn.addEventListener("click", () => {
    calcHistory = [];
    renderCalcHistory();
  });
}

renderCalcHistory();
updateDisplay();
