const display = document.getElementById("display");
const historyEl = document.getElementById("history");
const keys = document.querySelector(".keys");

let current = "0";
let previous = null;
let operator = null;
let overwrite = false;

function formatNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return "Error";
  }
  return new Intl.NumberFormat("es-ES", { maximumFractionDigits: 12 }).format(number);
}

function updateDisplay() {
  display.textContent = formatNumber(current);
  historyEl.textContent = previous !== null && operator ? `${formatNumber(previous)} ${operator}` : "";
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

  current = Number.isFinite(result) ? String(result) : "0";
  previous = null;
  operator = null;
  overwrite = true;

  if (!Number.isFinite(result)) {
    display.textContent = "Error";
    historyEl.textContent = "No se puede dividir entre 0";
  }
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

updateDisplay();
