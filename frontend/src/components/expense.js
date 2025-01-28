import {Exp} from "../services/expense.js";
import {Balance} from "../services/balance.js";
import {Inc} from "../services/income";
import {log10} from "chart.js/helpers";


export class Expense {
    constructor() {
        this.title = document.getElementById('content-title');
        this.content = document.getElementById('content-items');
        this.wrapper = document.getElementById('wrapper');
        this.categorysExpense = [];
        this.init();
        this.expenseCreateField(this.categorysExpense);
        this.createExpense();
    }


    async init() {
        document.getElementById("expense-link").classList.add('active');
        document.getElementById("category-link").setAttribute('aria-expanded', 'true');
        document.getElementById("account-collapse").classList.add('show');
        this.title.innerText = 'Расходы'
        this.categorysExpense = await Exp.getExpense();
        this.expenseCreateField(this.categorysExpense);
    }

    expenseCreateField(el) {
        if (this.categorysExpense.length === 0) {
            return
        }
        el.forEach(item => {
            const contentItemElement = document.createElement('div');
            contentItemElement.className = 'content-item';

            const itemNameElement = document.createElement('div');
            itemNameElement.className = 'item-name';
            itemNameElement.innerText = item.title;

            const itemButtonsElement = document.createElement('div');
            itemButtonsElement.className = 'item-btns';
            itemButtonsElement.innerHTML = `
                                   <div class="item-btn">
                                    <button class="btn btn-edit bg-primary" id=btn-edit-${item.id}
                                    >
                                        Редактировать
                                    </button> </div>
                                    <div class="item-btn">
                                        <button class="btn bg-danger btn-delete" id="btn-delete-${item.id}"
                                      >
                                            Удалить
                                        </button>
                                    </div>`;

            contentItemElement.appendChild(itemNameElement);
            contentItemElement.appendChild(itemButtonsElement);

            const contentItemsEl = document.getElementById('content-items');
            const createItemEl = document.getElementById('create-item');

            contentItemsEl.insertBefore(contentItemElement, createItemEl);

            const btnEdit = document.getElementById(`btn-edit-${item.id}`);
            const btnDelete = document.getElementById(`btn-delete-${item.id}`);
            btnEdit.onclick = (() => this.editExpense(item.id));
            btnDelete.onclick = (() => this.deleteExpense(item.id));
        })
    }

    async editExpense(itemId) {
        const item = await Exp.getExpenseOne(itemId)
        this.title.innerText = 'Редактирование категории расходов';
        this.content.innerHTML = `<div class="content-items create-edit">
            <div class="input-error" id="input-error">Введите название категории</div>
            <div class="input-error" id="input-server-error">Данная категория уже существует</div>
            <input class="content-input" maxlength="42" type="text" value="${item.title}" id=input-item-${item.id}>

                <div class="item-btns">
                    <div class="item-btn">
                        <button class="btn btn-create bg-success" id="btn-create-${item.id}">
                            Сохранить
                        </button>
                    </div>
                    <div class="item-btn">
                        <button class="btn bg-danger btn-delete" id="btn-сancel-${item.id}">
                            Отмена
                        </button>
                    </div>
                </div>
        </div>`;


        const value = document.getElementById(`input-item-${item.id}`);
        const btnCreate = document.getElementById(`btn-create-${item.id}`);
        const btnCancel = document.getElementById(`btn-сancel-${item.id}`);
        const nonValid = document.getElementById('input-error');
        const servErr = document.getElementById('input-server-error');

        if (!value.value) {
            console.log(value.value)
            btnCreate.setAttribute('disabled', 'disabled');
        }
        value.oninput = () => {
            if (value.value[0] === ' ') {
                value.value = '';
            }
        }
        value.onchange = (() => {
            if (this.categorysExpense.find(i => i.title === value.value)) {
                btnCreate.setAttribute('disabled', 'disabled');
                value.style.border = '2px solid red';
                servErr.style.display = 'block';
            } else if (value.value) {
                btnCreate.removeAttribute('disabled');
                value.style.border = '1px solid #CED4DA';
                nonValid.style.display = 'none';
            } else {
                btnCreate.setAttribute('disabled', 'disabled');
                value.style.border = '2px solid red';
                nonValid.style.display = 'block';
                servErr.style.display = 'none';
            }
        })


        btnCreate.onclick = (() => this.editFunc(item.id));
        btnCancel.onclick = (() => this.cancelFunc());
    }

    async editFunc(itemId) {
        const value = document.getElementById(`input-item-${itemId}`).value.trim().replace(/ +/g, ' ');
        await Exp.editExpense(itemId, value)
        this.categorysExpense = await Exp.getExpense()
        this.cancelFunc()
    }

    cancelFunc() {
        this.title.innerText = 'Расходы';
        this.content.innerHTML = `<div class="content-item create-item" id="create-item">
                <div class="create"><span>+</span></div>
            </div>`;
        this.expenseCreateField(this.categorysExpense);
        this.createExpense();
    }

    async deleteExpense(itemId) {

        const popupElement = document.createElement('div');
        popupElement.className = 'popup';
        popupElement.setAttribute('id', 'popup');
        popupElement.innerHTML = `
        <div class="popup-block">
            <div class="popup-title">Вы действительно хотите удалить категорию? Связанные расходы будут удалены навсегда.</div>
            <div class="popup-btns">
                <div class="item-btn">
                    <button class="btn btn-create bg-success" id=btn-item-delete-${itemId}>
                        Да, удалить
                    </button>
                </div>
                <div class="item-btn">
                    <button class="btn bg-danger btn-delete" id=btn-item-сancel-${itemId}>
                        Не удалять
                    </button>
                </div>
            </div>
        </div>`;
        this.wrapper.appendChild(popupElement);


        const popup = document.getElementById(`popup`);
        const btnItemDelete = document.getElementById(`btn-item-delete-${itemId}`);
        const btnCancel = document.getElementById(`btn-item-сancel-${itemId}`);
        btnItemDelete.onclick = (async () => {
            // this.deleteF(itemId)
            this.content.innerHTML = '';
            await Exp.deleteExpense(itemId);
            this.categorysExpense = await Exp.getExpense();
            this.cancelFunc();
            popup.remove();
            this.updateBalance();
        });

        btnCancel.onclick = (() => {
            popup.remove();
        })
    }


    async createExpense() {
        const createElement = document.getElementById('create-item');
        createElement.onclick = (() => {
            this.title.innerText = 'Создание категории расходов';
            this.content.innerHTML = `
            <div class="content-items create-edit">
            <div class="input-error" id="input-error">Введите название категории</div>
            <div class="input-error" id="input-server-error">Данная категория уже существует</div>
            <input class="content-input" maxlength="42" type="text" id='create-item-value' placeholder="Название...">
                <div class="item-btns">
                    <div class="item-btn">
                        <button class="btn btn-create bg-success" id="btn-item-create">
                            Создать
                        </button>
                    </div>
                    <div class="item-btn">
                        <button class="btn bg-danger btn-delete" id="btn-сancel-create">
                            Отмена
                        </button>
                    </div>
                </div>
        </div>`;

            const valueCreate = document.getElementById(`create-item-value`);
            const btnCancelCreate = document.getElementById(`btn-сancel-create`);
            const btnItemCreate = document.getElementById(`btn-item-create`);
            const nonValid = document.getElementById('input-error');
            const servErr = document.getElementById('input-server-error');

            if (!valueCreate.value) {
                btnItemCreate.setAttribute('disabled', 'disabled');
            }
            valueCreate.oninput = () => {
                if (valueCreate.value[0] === ' ') {
                    valueCreate.value = '';
                }
            }
            valueCreate.onchange = (() => {
                if (this.categorysExpense.find(i => i.title === valueCreate.value)) {
                    btnItemCreate.setAttribute('disabled', 'disabled');
                    valueCreate.style.border = '2px solid red';
                    servErr.style.display = 'block';
                } else if (valueCreate.value) {
                    btnItemCreate.removeAttribute('disabled');
                    valueCreate.style.border = '1px solid #CED4DA';
                    nonValid.style.display = 'none';
                } else {
                    btnItemCreate.setAttribute('disabled', 'disabled');
                    valueCreate.style.border = '2px solid red';
                    nonValid.style.display = 'block';
                    servErr.style.display = 'none';
                }
            })
            btnCancelCreate.onclick = (() => this.cancelFunc());
            btnItemCreate.onclick = (async () => {
                await Exp.createExpense(valueCreate.value.trim().replace(/ +/g, ' '));
                this.categorysExpense = await Exp.getExpense();
                this.cancelFunc();
            });

        });
    }

    async updateBalance() {
        const getBalance = await Balance.getBalance();
        document.getElementById('balance').innerHTML = `Баланс: <span>${getBalance.balance} $</span>`;
    }

}