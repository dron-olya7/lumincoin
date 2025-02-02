import { Exp } from '../services/expense';
import { Inc } from '../services/income';
import { Operations } from '../services/operations';

export class CreateOperation {
    type: HTMLSelectElement;
    operationId: string | null;
    categoryId: number | null;
    category: any[];

    constructor() {
        this.type = document.getElementById('type') as HTMLSelectElement;
        this.operationId = localStorage.getItem('operationId');
        this.categoryId = null;
        this.category = [];
        this.init();
    }

    async init(): Promise<void> {
        const budgetLink :HTMLElement|null = document.getElementById('budget-link');
        budgetLink.classList.add('active');
        await this.addValueInput();
    }

    async getCategory(): Promise<void> {
        if (this.type.value === 'expense') {
            const cat = await Exp.getExpense();
            this.category = cat;
        } else if (this.type.value === 'income') {
            const cat = await Inc.getIncome();
            this.category = cat;
        }
        const category :HTMLSelectElement = document.getElementById('category') as HTMLSelectElement;
        category.innerHTML = `
                    <option value="" disabled selected hidden>Категория...</option>
        `;

        this.category.forEach((item) :void => {
            const option :HTMLOptionElement = document.createElement('option');
            option.setAttribute('value', item.title);
            option.setAttribute('id', item.id.toString());
            option.innerHTML = `${item.title}`;
            category.appendChild(option);
        });
    }

    async addValueInput(): Promise<void> {
        const category :HTMLSelectElement = document.getElementById('category') as HTMLSelectElement;
        const amount :HTMLInputElement = document.getElementById('amount') as HTMLInputElement;
        const date :HTMLInputElement = document.getElementById('date') as HTMLInputElement;
        const comment :HTMLTextAreaElement = document.getElementById('comment') as HTMLTextAreaElement;
        const btnCreate :HTMLButtonElement = document.getElementById('btn-create') as HTMLButtonElement;
        const btnCancel :HTMLButtonElement = document.getElementById('btn-cancel') as HTMLButtonElement;
        const er :HTMLElement = document.getElementById('input-error') as HTMLElement;
        const servErr :HTMLElement = document.getElementById('input-server-error') as HTMLElement;
        const operations = await Operations.getOperations('all');

        valid();

        this.type.onchange = async () :Promise<void> => {
            category.removeAttribute('disabled');
            await this.getCategory();
            valid();
            await checkTypeHaveCategory();
        };

        category.onchange = () :void => {
            this.categoryId = parseInt(category[category.selectedIndex].id, 10);
            valid();
        };

        amount.onchange = () :void => {
            valid();
        };

        amount.oninput = () :void => {
            amount.value = amount.value.replace(/[^\d]/g, '');
            if (amount.value[0] === '0') {
                amount.value = amount.value.replace('0', '');
            }
        };

        date.onchange = () :void => {
            valid();
        };

        if (!this.type.value) {
            category.setAttribute('disabled', 'disabled');
        }

        function valid() :void {
            if (category.value && date.value && amount.value) {
                btnCreate.removeAttribute('disabled');
                servErr.style.display = 'none';
            } else {
                btnCreate.setAttribute('disabled', 'disabled');
            }
        }

        function checkTypeHaveCategory() :void {
            if (this.type.value && this.category.length === 0) {
                er.innerHTML = `
                У данного типа нет категорий. <a href="#/category/${this.type.value}">Создать</a>
                `;
                er.style.display = 'block';
                category.setAttribute('disabled', 'disabled');
            } else {
                er.style.display = 'none';
            }
        }

        btnCreate.onclick = () :void => {
            if (!comment.value) {
                comment.value = ' ';
            }
            if (
                operations.find(
                    (element) =>
                        element.amount === +amount.value &&
                        element.category === category.value &&
                        element.comment === comment.value &&
                        element.date === date.value &&
                        element.type === this.type.value
                )
            ) {
                servErr.style.display = 'block';
            } else {
                Operations.createOperations({
                    type: this.type.value,
                    amount: +amount.value,
                    date: date.value,
                    comment: comment.value,
                    category_id: this.categoryId || 0,
                });
                location.href = '#/budget';
            }
        };

        btnCancel.onclick = () :void => {
            location.href = '#/budget';
        };
    }
}