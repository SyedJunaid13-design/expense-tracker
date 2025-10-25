// --- Select DOM elements ---
const balance = document.getElementById('balance');
const money_plus = document.getElementById('money-plus');
const money_minus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');

// --- Load saved transactions ---
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// --- Function to add transaction item to DOM ---
function addTransactionDOM(transaction) {
  const sign = transaction.amount < 0 ? '-' : '+';
  const item = document.createElement('li');

  item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');
  item.innerHTML = `
    ${transaction.text}
    <span>${sign}$${Math.abs(transaction.amount).toFixed(2)}</span>
    <button class="delete-btn" onclick="removeTransaction(${transaction.id})">×</button>
  `;

  list.appendChild(item);
}

// --- Animate numbers smoothly ---
function animateValue(element, start, end, duration, prefix = '$') {
  const range = end - start;
  let startTime = null;

  function animate(currentTime) {
    if (!startTime) startTime = currentTime;
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const value = (start + range * progress).toFixed(2);
    element.innerText = `${prefix}${value}`;
    if (progress < 1) requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

// --- Update totals and balance ---
function updateValues() {
  const amounts = transactions.map(t => t.amount);
  const total = amounts.reduce((acc, item) => acc + item, 0);
  const income = amounts.filter(i => i > 0).reduce((a, b) => a + b, 0);
  const expense = amounts.filter(i => i < 0).reduce((a, b) => a + b, 0) * -1;

  // Animate the display updates
  const prevTotal = parseFloat(balance.innerText.replace(/[^0-9.-]+/g,"")) || 0;
  const prevIncome = parseFloat(money_plus.innerText.replace(/[^0-9.-]+/g,"")) || 0;
  const prevExpense = parseFloat(money_minus.innerText.replace(/[^0-9.-]+/g,"")) || 0;

  animateValue(balance, prevTotal, total, 600, '$');
  animateValue(money_plus, prevIncome, income, 600, '+$');
  animateValue(money_minus, prevExpense, expense, 600, '-$');

  // ✅ Check if expenses exceed income
  if (expense > income) {
    balance.style.color = '#e74c3c'; // red balance
    setTimeout(() => {
      alert('⚠️ Warning: Your expenses exceed your total income!');
    }, 700);
  } else {
    balance.style.color = '#0984e3'; // blue balance when fine
  }
}

// --- Add new transaction ---
function addTransaction(e) {
  e.preventDefault();

  if (text.value.trim() === '' || amount.value.trim() === '') {
    alert('Please add text and amount');
    return;
  }

  const transaction = {
    id: Date.now(),
    text: text.value,
    amount: +amount.value
  };

  transactions.push(transaction);
  addTransactionDOM(transaction);
  updateValues();
  updateLocalStorage();

  text.value = '';
  amount.value = '';
}

// --- Remove transaction (with animation) ---
function removeTransaction(id) {
  const el = list.querySelector(`button[onclick="removeTransaction(${id})"]`).parentElement;
  el.style.transition = "all 0.3s ease";
  el.style.opacity = "0";
  el.style.transform = "translateX(50px)";
  
  setTimeout(() => {
    transactions = transactions.filter(t => t.id !== id);
    updateLocalStorage();
    init();
  }, 300);
}

// --- Update local storage ---
function updateLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// --- Initialize app ---
function init() {
  list.innerHTML = '';
  transactions.forEach(addTransactionDOM);
  updateValues();
}

init();
form.addEventListener('submit', addTransaction);
