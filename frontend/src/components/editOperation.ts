import { Operations } from '../services/operations';
import { ExpenseService as Exp } from '../services/expense';
import { IncomeService as Inc } from '../services/income';

export class EditOperation {
    type: HTMLSelectElement;
    operationId: string | null;
    categoryId: number | null;
    operation: any;
    category: Array<any>;

    constructor() {
        this.type = document.getElementById('type') as HTMLSelectElement;
        this.operationId = localStorage.getItem('operationId');
        this.categoryId = null;
        this.operation = {};
        this.category = [];
        this.init();
    }

    private async init(): Promise<void> {
        let budgetLink : HTMLElement | null = document.getElementById('budget-link');
        if (budgetLink){
            budgetLink.classList.add('active');
        }
        this.operation = await Operations.getOperation(this.operationId);
        await this.addValueInput(this.operation);
    }

    private async getCategory(): Promise<void> {
        if (this.type.value === 'expense') {
            const cat = await Exp.getExpense();
            this.category = cat;
        } else if (this.type.value === 'income') {
            const cat = await Inc.getIncome();
            this.category = cat;
        }

        const category :HTMLSelectElement = document.getElementById('category') as HTMLSelectElement;
        category.innerHTML = '';
        this.category.forEach((item: any) :void => {
            const option :HTMLOptionElement = document.createElement('option');
            option.setAttribute('value', item.title);
            option.setAttribute('id', String(item.id));
            option.textContent = item.title;
            category.appendChild(option);
        });
    }

    private async addValueInput(item: any): Promise<void> {
        if (!item) {
            return;
        }

        const category :HTMLSelectElement = document.getElementById('category') as HTMLSelectElement;
        const amount :HTMLInputElement = document.getElementById('amount') as HTMLInputElement;
        const date :HTMLInputElement = document.getElementById('date') as HTMLInputElement;
        const comment :HTMLTextAreaElement = document.getElementById('comment') as HTMLTextAreaElement;
        const btnSave :HTMLButtonElement = document.getElementById('btn-save') as HTMLButtonElement;
        const btnCancel :HTMLButtonElement  = document.getElementById('btn-cancel') as HTMLButtonElement;
        const servErr :HTMLElement = document.getElementById('input-server-error') as HTMLElement;
        const operations = await Operations.getOperations('all');

        for (const el of this.type.options) {
            if (el.value === item.type) {
                el.setAttribute('selected', 'selected');
            }
        }

        await this.getCategory();

        for (const el of this.type.options) {
            if (el.value === item.type) {
                el.setAttribute('selected', 'selected');
            }
        }

        category.value = item.category;
        amount.value = item.amount.toString();
        date.value = item.date;
        comment.value = item.comment;

        if (comment.value === ' ') {
            comment.value = '';
        }

        this.categoryId = parseInt(category[category.selectedIndex].getAttribute('id'));

        amount.onchange = () :void => {
            valid();
        };

        amount.oninput = () :void => {
            amount.value = amount.value.replace(/[^\d]/g, '');
            if (amount.value.startsWith('0')) {
                amount.value = amount.value.slice(1);
            }
        };

        date.onchange = () :void => {
            valid();
        };

        if (!this.type.value) {
            category.disabled = true;
        }

         function valid() :void {
            if (category.value && date.value && amount.value) {
                btnSave.disabled = false;
                servErr.style.display = 'none';
            } else {
                btnSave.disabled = true;
            }
        }

        category.onchange = () :void => {
            this.categoryId = parseInt(category[category.selectedIndex].getAttribute('id'));
        };

        this.type.onchange = () :void => {
            this.getCategory();
        };

        btnSave.onclick = () :void => {
            if (comment.value === '') {
                comment.value = ' ';
            }
            if (
                operations.some(
                    (i: any) =>
                        i.amount === Number(amount.value) &&
                        i.category === category.value &&
                        i.comment === comment.value &&
                        i.date === date.value &&
                        i.type === this.type.value
                )
            ) {
                servErr.style.display = 'block';
            } else {
                Operations.editOperations(`${this.operationId}`, {
                    type: this.type.value,
                    amount: Number(amount.value),
                    date: date.value,
                    comment: comment.value,
                    category_id: this.categoryId,
                });
                location.hash = '/budget';
            }
            localStorage.removeItem('operationId');
        };

        btnCancel.onclick = () :void => {
            location.hash = '/budget';
            localStorage.removeItem('operationId');
        };
    }
}