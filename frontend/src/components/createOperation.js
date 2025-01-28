import {Exp} from "../services/expense.js";
import {Inc} from "../services/income.js";
import {Operations} from "../services/operations.js";


export class CreateOperation {
    constructor() {
        this.type = document.getElementById(`type`);
        this.operationId = localStorage.getItem('operationId');
        this.categoryId = null;
        this.category = [];
        this.init();
    }

    async init() {
        document.getElementById("budget-link").classList.add('active');
        await this.addValueInput();
    }

    async getCategory() {
        if (this.type.value === 'expense') {
            const cat = await Exp.getExpense();
            this.category = cat;
        } else if (this.type.value === 'income') {
            const cat = await Inc.getIncome();
            this.category = cat;
        }
        const category = document.getElementById('category');
        category.innerHTML = `
                    <option value="" disabled selected hidden>Категория...</option>
        `;

        this.category.forEach(item => {
            const option = document.createElement('option');
            option.setAttribute('value', item.title);
            option.setAttribute('id', item.id);
            option.innerHTML = `${item.title}`
            category.appendChild(option)
        })

    }

    async addValueInput() {
        const category = document.getElementById('category');
        const amount = document.getElementById('amount');
        const date = document.getElementById('date');
        const comment = document.getElementById('comment');
        const btnCreate = document.getElementById('btn-create');
        const btnCancel = document.getElementById('btn-сancel');
        const er = document.getElementById('input-error');
        const servErr = document.getElementById('input-server-error');
        const operations = await Operations.getOperations('all');

        valid();

        this.type.onchange = (async () => {
            category.removeAttribute('disabled');
            await this.getCategory();
            valid();
            await checkTypeHaveCategory();
        })

        const that = this;

        function checkTypeHaveCategory() {
            if (that.type.value && that.category.length === 0) {
                er.innerHTML = `
                У данного типа нет категорий. <a href="#/category/${that.type.value}">Создать</a>
                `;
                er.style.display = 'block';
                category.setAttribute('disabled', 'disabled');
            } else {
                er.style.display = 'none';
            }
        }

        category.onchange = (() => {
            this.categoryId = category[category.selectedIndex].id;
            valid();
        })
        amount.onchange = (() => {
            valid();
        })
        amount.oninput = (() => {
            amount.value = amount.value.replace(/[^\d]/g, '');
            if (amount.value[0] === '0') {
                amount.value = amount.value.replace('0', '');
            }
        });
        date.onchange = (() => {
            valid();
        })


        if (!this.type.value) {
            category.setAttribute('disabled', 'disabled')
        }


        function valid() {
            if (category.value && date.value && amount.value) {
                btnCreate.removeAttribute('disabled');
                servErr.style.display = 'none';
            } else {
                btnCreate.setAttribute('disabled', 'disabled');
            }
        }

        btnCreate.onclick = (() => {
            if (!comment.value) {
                comment.value = ' ';
            }
            if (operations.find(element =>
                element.amount === +amount.value &&
                element.category === category.value &&
                element.comment === comment.value &&
                element.date === date.value &&
                element.type === this.type.value
            )) {
                servErr.style.display = 'block';
            } else {
                Operations.createOperations({
                    "type": this.type.value,
                    "amount": +amount.value,
                    "date": date.value,
                    "comment": comment.value,
                    "category_id": +this.categoryId,
                })
                location.href = '#/budget'
            }
            // location.reload();
        });
        btnCancel.onclick = (() => {
            location.href = '#/budget'
        });

    }

}