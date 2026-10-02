const expressionDisplay = document.querySelector('#expression');
const resultDisplay = document.querySelector('#result');
const keypad = document.querySelector('.keypad');

let currentInput = '0';
let storedValue = null;
let pendingOperator = null;
let waitingForOperand = false;
let shouldResetExpression = false;

function formatNumber(value) {
  if (!Number.isFinite(value)) return 'Error';
  const rounded = Number.parseFloat(value.toPrecision(12));
  const text = String(rounded);
  return text.length > 13 ? rounded.toExponential(6) : text;
}

function updateDisplay() {
  resultDisplay.textContent = currentInput;
  document.querySelectorAll('[data-operator]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.operator === pendingOperator && waitingForOperand);
  });
}

function inputDigit(digit) {
  if (currentInput === 'Error' || waitingForOperand || shouldResetExpression) {
    currentInput = digit;
    waitingForOperand = false;
    if (shouldResetExpression) {
      storedValue = null;
      pendingOperator = null;
      expressionDisplay.textContent = '';
      shouldResetExpression = false;
    }
  } else if (currentInput.replace('-', '').replace('.', '').length < 12) {
    currentInput = currentInput === '0' ? digit : currentInput + digit;
  }
  updateDisplay();
}

function inputDecimal() {
  if (currentInput === 'Error' || waitingForOperand || shouldResetExpression) {
    currentInput = '0.';
    waitingForOperand = false;
    if (shouldResetExpression) {
      storedValue = null;
      pendingOperator = null;
      expressionDisplay.textContent = '';
      shouldResetExpression = false;
    }
  } else if (!currentInput.includes('.')) {
    currentInput += '.';
  }
  updateDisplay();
}

function calculate(left, right, operator) {
  switch (operator) {
    case '+': return left + right;
    case '−': return left - right;
    case '×': return left * right;
    case '÷': return right === 0 ? NaN : left / right;
    default: return right;
  }
}

function chooseOperator(operator) {
  if (currentInput === 'Error') return;
  const inputValue = Number(currentInput);

  if (pendingOperator && !waitingForOperand) {
    const result = calculate(storedValue, inputValue, pendingOperator);
    currentInput = formatNumber(result);
    storedValue = result;
  } else {
    storedValue = inputValue;
  }

  pendingOperator = operator;
  waitingForOperand = true;
  shouldResetExpression = false;
  expressionDisplay.textContent = `${formatNumber(storedValue)} ${operator}`;
  updateDisplay();
}

function solve() {
  if (!pendingOperator || waitingForOperand || currentInput === 'Error') return;
  const left = storedValue;
  const right = Number(currentInput);
  const operator = pendingOperator;
  const result = calculate(left, right, operator);
  expressionDisplay.textContent = `${formatNumber(left)} ${operator} ${formatNumber(right)} =`;
  currentInput = formatNumber(result);
  storedValue = null;
  pendingOperator = null;
  waitingForOperand = true;
  shouldResetExpression = true;
  updateDisplay();
}

function clear() {
  currentInput = '0';
  storedValue = null;
  pendingOperator = null;
  waitingForOperand = false;
  shouldResetExpression = false;
  expressionDisplay.textContent = '';
  updateDisplay();
}

function toggleSign() {
  if (currentInput === 'Error' || Number(currentInput) === 0) return;
  currentInput = currentInput.startsWith('-') ? currentInput.slice(1) : `-${currentInput}`;
  updateDisplay();
}

function percent() {
  if (currentInput === 'Error') return;
  currentInput = formatNumber(Number(currentInput) / 100);
  waitingForOperand = false;
  updateDisplay();
}

function deleteDigit() {
  if (currentInput === 'Error' || waitingForOperand || shouldResetExpression) {
    clear();
    return;
  }
  currentInput = currentInput.length > 1 ? currentInput.slice(0, -1) : '0';
  if (currentInput === '-') currentInput = '0';
  updateDisplay();
}

keypad.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  if (button.dataset.number !== undefined) inputDigit(button.dataset.number);
  else if (button.dataset.operator) chooseOperator(button.dataset.operator);
  else {
    switch (button.dataset.action) {
      case 'clear': clear(); break;
      case 'sign': toggleSign(); break;
      case 'percent': percent(); break;
      case 'decimal': inputDecimal(); break;
      case 'delete': deleteDigit(); break;
      case 'equals': solve(); break;
      default: break;
    }
  }
});

document.addEventListener('keydown', (event) => {
  if (/^[0-9]$/.test(event.key)) inputDigit(event.key);
  else if (event.key === '.') inputDecimal();
  else if (event.key === '+') chooseOperator('+');
  else if (event.key === '-') chooseOperator('−');
  else if (event.key === '*') chooseOperator('×');
  else if (event.key === '/') {
    event.preventDefault();
    chooseOperator('÷');
  } else if (event.key === 'Enter' || event.key === '=') {
    event.preventDefault();
    solve();
  } else if (event.key === 'Backspace') deleteDigit();
  else if (event.key === 'Escape') clear();
  else if (event.key === '%') percent();
});

updateDisplay();
