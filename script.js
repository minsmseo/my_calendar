let entries = [];
let currentDate = new Date();

const form = document.getElementById('entry-form');
const calendar = document.getElementById('calendar');
const monthTitle = document.getElementById('month-title');
const selectedDateEl = document.getElementById('selected-date');
const entryList = document.getElementById('entry-list');

const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');
const balanceEl = document.getElementById('balance');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const type = document.getElementById('type').value;
  const title = document.getElementById('title').value;
  const amount = Number(document.getElementById('amount').value);
  const date = document.getElementById('date').value;
  const category = document.getElementById('category').value || '기타';

  if (!title || !amount || !date) return;

  entries.push({ type, title, amount, date, category });
  saveEntries(); // localstorage 에 추가
  form.reset();
  renderCalendar(currentDate);
  updateSummary();
});

document.getElementById('prev-month').addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar(currentDate);
  updateSummary();
});

document.getElementById('next-month').addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar(currentDate);
  updateSummary();
});

function renderCalendar(date) {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  monthTitle.textContent = `${year}년 ${month + 1}월`;
  calendar.innerHTML = `
    <tr>
      <th>일</th><th>월</th><th>화</th><th>수</th><th>목</th><th>금</th><th>토</th>
    </tr>
  `;

  let row = document.createElement('tr');
  for (let i = 0; i < firstDay; i++) row.appendChild(document.createElement('td'));

  for (let day = 1; day <= lastDate; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEntries = entries.filter(e => e.date === dateStr);

    const td = document.createElement('td');
    td.textContent = day;
    if (dayEntries.length > 0) td.classList.add('has-entry');

    td.addEventListener('click', () => {
      selectedDateEl.textContent = dateStr;
      document.getElementById('date').value=dateStr;
      renderEntriesByDate(dateStr);
    });

    row.appendChild(td);

    if ((firstDay + day) % 7 === 0 || day === lastDate) {
      calendar.appendChild(row);
      row = document.createElement('tr');
    }
  }
}

function renderEntriesByDate(dateStr) {
  entryList.innerHTML = '';
  const filtered = entries.filter(e => e.date === dateStr);
  filtered.forEach((e,index) => {
    const li = document.createElement('li');
    li.textContent = `${e.title} - ${e.amount}원 (${e.category}, ${e.type === 'income' ? '수입' : '지출'})`;

    li.addEventListener('click', () => {
      if (confirm('이 항목을 삭제할까요?')) {
        // 해당 날짜에서 index 번째 항목 삭제
        const entryIndex = entries.findIndex(en => en.date === dateStr && en.title === e.title && en.amount === e.amount && en.category === e.category && en.type === e.type);
        if (entryIndex !== -1) {
          entries.splice(entryIndex, 1);
          saveEntries(); // 삭제 후 저장
          renderEntriesByDate(dateStr);
          renderCalendar(currentDate);
          updateSummary();
        }
      }
    });

    entryList.appendChild(li);
  });
}

function updateSummary() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const thisMonth = entries.filter(e => {
    const [y, m] = e.date.split('-');
    return Number(y) === year && Number(m) === month;
  });

  const income = thisMonth.filter(e => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);
  const expense = thisMonth.filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);

  totalIncomeEl.textContent = income.toLocaleString();
  totalExpenseEl.textContent = expense.toLocaleString();
  balanceEl.textContent = (income - expense).toLocaleString();
}
//entries 저장 & 불러오기 함수
// localStorage에서 불러오기
function loadEntries() {
  const saved = localStorage.getItem('entries');
  entries = saved ? JSON.parse(saved) : [];
}

// localStorage에 저장
function saveEntries() {
  localStorage.setItem('entries', JSON.stringify(entries));
}


// 초기 렌더링
loadEntries();  //저장된 데이터 불러옴
renderCalendar(currentDate);
updateSummary();
