import {Exp} from '../services/expense';
import {Inc} from '../services/income';
import {Operations} from '../services/operations';
import {ApiResponseType} from '../types/apiResponse.type';
import {CategoryType} from '../types/category.type';
import {OperationType} from "../types/operation.type";

export class CreateOperation {
    type: HTMLSelectElement;
    operationId: string | null;
    categoryId: number | null;
    category: CategoryType[];

    constructor() {
        this.type = document.getElementById('type') as HTMLSelectElement;
        this.operationId = localStorage.getItem('operationId');
        this.categoryId = null;
        this.category = [];
        this.init();
    }

    private async init(): Promise<void> {
        const budgetLink: HTMLElement | null = document.getElementById('budget-link');
        if (budgetLink) {
            budgetLink.classList.add('active');
        }
        await this.addValueInput();
    }

    private async getCategory(): Promise<void> {
        let cat: ApiResponseType | null = null;

        if (this.type.value === 'expense') {
            cat = await Exp.getExpense();
        } else if (this.type.value === 'income') {
            cat = await Inc.getIncome();
        }

        if (cat) {
            this.category = cat?.categories ?? [];
        } else {
            this.category = [];
        }

        const category: HTMLSelectElement = document.getElementById('category') as HTMLSelectElement;
        category.innerHTML = `<option value="" disabled selected hidden>Категория...</option>`;

        this.category.forEach(({id, title}): void => {
            const option: HTMLOptionElement = document.createElement('option');
            option.setAttribute('value', title);
            option.setAttribute('id', String(id));
            option.textContent = title;
            category.appendChild(option);
        });
    }

    private async addValueInput(): Promise<void> {
        const category: HTMLSelectElement = document.getElementById('category') as HTMLSelectElement;
        const amount: HTMLInputElement = document.getElementById('amount') as HTMLInputElement;
        const date: HTMLInputElement = document.getElementById('date') as HTMLInputElement;
        const comment: HTMLTextAreaElement = document.getElementById('comment') as HTMLTextAreaElement;
        const btnCreate: HTMLButtonElement = document.getElementById('btn-create') as HTMLButtonElement;
        const btnCancel: HTMLButtonElement = document.getElementById('btn-cancel') as HTMLButtonElement;
        const servErr: HTMLElement = document.getElementById('input-server-error') as HTMLElement;
        const operations = await Operations.getOperations('all');

        valid();

        this.type.onchange = async (): Promise<void> => {
            category.removeAttribute('disabled');
            await this.getCategory();
            valid();
            await checkTypeHaveCategory.bind(this)();
        };

        category.onchange = (): void => {
            this.categoryId = parseInt(category[category.selectedIndex].id, 10);
            valid();
        };

        amount.onchange = (): void => {
            valid();
        };

        amount.oninput = (): void => {
            amount.value = amount.value.replace(/[^\d]/g, '');
            if (amount.value[0] === '0') {
                amount.value = amount.value.replace('0', '');
            }
        };

        date.onchange = (): void => {
            valid();
        };

        if (!this.type.value) {
            category.setAttribute('disabled', 'disabled');
        }

        function valid(): void {
            if (category.value && date.value && amount.value) {
                btnCreate.removeAttribute('disabled');
                servErr.style.display = 'none';
            } else {
                btnCreate.setAttribute('disabled', 'disabled');
                servErr.style.display = 'block';
            }
        }

        async function checkTypeHaveCategory(this: CreateOperation): Promise<void> {
            if (this.type.value && this.category.length === 0) {
                const er: HTMLElement = document.getElementById('input-error') as HTMLElement;
                er.innerHTML = `У данного типа нет категорий. <a href="#/category/${this.type.value}>Создать</a>`;
                er.style.display = 'block';
                category.setAttribute('disabled', 'disabled');
            } else {
                const er: HTMLElement = document.getElementById('input-error') as HTMLElement;
                er.style.display = 'none';
                category.removeAttribute('disabled');
            }
        }

        btnCreate.onclick = (): void => {
            if (!comment.value) {
                comment.value = ' ';
            }
            if (operations.find((element: OperationType): void => {
                element.amount === +amount.value &&
element.category === category.value &&
                element.comment === comment.value &&
                element.date === date.value &&
                element.type === this.type.value
            })) {

                servErr.style.display = 'block';
            } else {
                const type: string = this.type.value === 'income' ? 'income' : 'expense';
                Operations.createOperations({
                    type: type,
                    amount: +amount.value,
                    date: date.value,
                    comment: comment.value,
                    category: this.categoryId ? this.categoryId.toString() : '',
                });
                location.href = '#/budget';
            }
        }

        btnCancel.onclick = (): void => {
            location.href = '#/budget';
        }
    }
}
