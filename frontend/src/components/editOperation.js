import {Operations} from "../services/operations.js";
import {Exp} from "../services/expense.js";
import {Inc} from "../services/income.js";


export class EditOperation {
    constructor() {
        this.type = document.getElementById(`type`);
        this.operationId = localStorage.getItem('operationId');
        this.categoryId = null;
        this.operation = {};
        this.category = [];
        this.init();
    }

    async init() {
        document.getElementById("budget-link").classList.add('active');
        this.operation = await Operations.getOperation(this.operationId);
       await this.addValueInput(this.operation);
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
        category.innerHTML = '';
        this.category.forEach(item => {
            const option = document.createElement('option');
            option.setAttribute('value', item.title);
            option.setAttribute('id', item.id);
            option.innerHTML = `${item.title}`
            category.appendChild(option)
        })

    }

    async addValueInput(item) {
        if (!item) {
            return
        }
        const category = document.getElementById('category');
        const amount = document.getElementById('amount');
        const date = document.getElementById('date');
        const comment = document.getElementById('comment');
        const btnSave = document.getElementById('btn-save');
        const btnCancel = document.getElementById('btn-сancel');
        const servErr = document.getElementById('input-server-error');
        const operations = await Operations.getOperations('all');

        for (let el of this.type) {
            if (el.value === item.type) {
                document.getElementById(`${el.id}`).setAttribute('selected', 'selected');
            }
        }

        await this.getCategory();

        for (let el of this.type) {
            if (el.value === item.type) {
                document.getElementById(`${el.id}`).setAttribute('selected', 'selected');
            }
        }

        category.value = item.category;
        amount.value = item.amount;
        date.value = item.date;
        comment.value = item.comment;

        if (comment.value === ' ') {
            comment.value = ''
        }

        this.categoryId = category[category.selectedIndex].id;

        amount.onchange = (() => {
            valid();
        })
        amount.oninput = (() =>{
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
                btnSave.removeAttribute('disabled');
                servErr.style.display = 'none';
            } else {
                btnSave.setAttribute('disabled', 'disabled');
            }
        }

        category.onchange = (() => {
            this.categoryId = category[category.selectedIndex].id;
        })

        this.type.onchange = (() => {
            this.getCategory();
        })

        btnSave.onclick = (() => {
            if (comment.value === '') {
                comment.value = ' '
            }
            if (operations.find(i =>
                i.amount === +amount.value &&
                i.category === category.value &&
                i.comment === comment.value &&
                i.date === date.value &&
                i.type === this.type.value
            )) {
                servErr.style.display = 'block';
            } else {
                Operations.editOperations( `${this.operationId}`, {
                    "type": this.type.value,
                    "amount": +amount.value,
                    "date": date.value,
                    "comment": comment.value,
                    category_id: +this.categoryId,
                })
                location.href = '#/budget'
            }
            localStorage.removeItem('operationId');
        });
        btnCancel.onclick = (() => {
            location.href = '#/budget';
            localStorage.removeItem('operationId');
        });

    }

}