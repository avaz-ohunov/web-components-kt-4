// expense-calculator.js

'use strict';


class ExpenseCalculator extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        // Инициализация шаблона компонента
        this.shadowRoot.innerHTML = `
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
            <div class="bg-dark text-light container py-5">
                <h1 class="text-center mb-4">Калькулятор расходов</h1>
                <form id="expense-form" class="row g-3 mb-4">
                    <div class="col-md-6">
                        <input type="text" id="expense-name" class="form-control" placeholder="Название расхода" required>
                    </div>
                    <div class="col-md-4">
                        <input type="number" id="expense-amount" class="form-control" placeholder="Сумма расхода" required>
                    </div>
                    <div class="col-md-2">
                        <button type="submit" class="btn btn-primary w-100">Добавить</button>
                    </div>
                </form>
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Список расходов</h5>
                        <ul id="expense-list" class="list-group list-group-flush"></ul>
                        <div class="mt-3">
                            <h5 class="text-dark text-end">Общая сумма расходов: ₽<span id="total-amount">0</span></h5>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Ссылки на элементы
        this.expenses = [];
        this.expenseForm = this.shadowRoot.querySelector('#expense-form');
        this.expenseList = this.shadowRoot.querySelector('#expense-list');
        this.totalAmountElement = this.shadowRoot.querySelector('#total-amount');

        // Реактивные данные
        this.reactiveData = new Proxy({ total: 0 }, {
            set: (target, property, value) => {
                target[property] = value;
                if (property === 'total') {
                    this.totalAmountElement.textContent = this.formatNumber(value);
                }
                return true;
            }
        });
    }

    connectedCallback() {
        this.expenseForm.addEventListener('submit', this.addExpense.bind(this));
        this.expenseList.addEventListener('click', this.removeExpense.bind(this));
    }

    disconnectedCallback() {
        this.expenseForm.removeEventListener('submit', this.addExpense.bind(this));
        this.expenseList.removeEventListener('click', this.removeExpense.bind(this));
    }

    // Форматирование числа
    formatNumber(number) {
        return number.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }

    // Добавление расхода
    addExpense(event) {
        event.preventDefault();
        const name = this.shadowRoot.querySelector('#expense-name').value.trim();
        const amount = parseFloat(this.shadowRoot.querySelector('#expense-amount').value);

        if (name && amount && amount > 0) {
            const expense = { id: Date.now(), name, amount };
            this.expenses.push(expense);
            this.reactiveData.total += amount;
            this.renderExpenses();
        }

        this.expenseForm.reset();
    }

    // Удаление расхода
    removeExpense(event) {
        if (event.target.tagName === 'BUTTON') {
            const id = parseInt(event.target.dataset.id, 10);
            const index = this.expenses.findIndex(expense => expense.id === id);

            if (index > -1) {
                this.reactiveData.total -= this.expenses[index].amount;
                this.expenses.splice(index, 1);
                this.renderExpenses();
            }
        }
    }

    // Обновление интерфейса
    renderExpenses() {
        this.expenseList.innerHTML = '';
        this.expenses.forEach(expense => {
            const li = document.createElement('li');
            li.className = 'list-group-item bg-dark text-light d-flex justify-content-between align-items-center';
            li.innerHTML = `
                <span>${expense.name}: ₽${this.formatNumber(expense.amount)}</span>
                <button class="btn btn-danger btn-sm" data-id="${expense.id}">Удалить</button>
            `;
            this.expenseList.appendChild(li);
        });
    }
}


// Регистрация компонента
customElements.define('expense-calculator', ExpenseCalculator);
