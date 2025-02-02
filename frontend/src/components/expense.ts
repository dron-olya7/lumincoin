import {Exp} from "../services/expense.js";
import {Balance} from "../services/balance.js";
import {Inc} from "../services/income";
import {log10} from "chart.js/helpers";

export class Expense {
    title: HTMLElement;
    content: HTMLElement;
    wrapper: HTMLElement;
    categorysExpense: Array<{ id: number; title: string }>;

    constructor() {
        this.title = document.getElementById('content-title') as HTMLElement;
        this.content = document.getElementById('content-items') as HTMLElement;
        this.wrapper = document.getElementById('wrapper') as HTMLElement;
        this.categorysExpense = [];
        this.init();
        this.expenseCreateField(this.categorysExpense);
        this.createExpense();
    }

    async init(): Promise<void> {
        document.getElementById("expense-link")!.classList.add('active');
        document.getElementById("category-link")!.setAttribute('aria-expanded', 'true');
        document.getElementById("account-collapse")!.classList.add('show');
        this.title.innerText = 'Расходы';
        this.categorysExpense = await Exp.getExpense();
        this.expenseCreateField(this.categorysExpense);
    }

    expenseCreateField(el: Array<{ id: number; title: string }>): void {
        if (this.categorysExpense.length === 0) {
            return;
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
                                    <button class="btn btn-edit bg-primary" id=btn-edit-${item.id}>
                                        Редактировать
                                    </button> </div>
                                    <div class="item-btn">
                                        <button class="btn bg-danger btn-delete" id="btn-delete-${item.id}">
                                            Удалить
                                        </button>
                                    </div>`;

            contentItemElement.appendChild(itemNameElement);
            contentItemElement.appendChild(itemButtonsElement);

            const contentItemsEl = document.getElementById('content-items')!;
            const createItemEl = document.getElementById('create-item')!;

            contentItemsEl.insertBefore(contentItemElement, createItemEl);

            const btnEdit = document.getElementById(`btn-edit-${item.id}`)!;
            const btnDelete = document.getElementById(`btn-delete-${item.id}`)!;

            btnEdit.onclick = () => this.editExpense(item.id);
            btnDelete.onclick = () => this.deleteExpense(item.id);
        });
    }

    async editExpense(itemId: number): Promise<void> {
        const item = await Exp.getExpenseOne(itemId);

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

        const valueInput: HTMLInputElement | null = document.getElementById(`input-item-${item.id}`) as HTMLInputElement;

        const btnCreate: HTMLButtonElement | null = document.getElementById(`btn-create-${item.id}`) as HTMLButtonElement;

        const btnCancel: HTMLButtonElement | null = document.getElementById(`btn-сancel-${item.id}`) as HTMLButtonElement;

        const nonValidErrorMsg: HTMLElement | null = document.getElementById('input-error');

        const servErrMsg: HTMLElement | null = document.getElementById('input-server-error');

        if (!valueInput?.value) {
            console.log(valueInput.value)
            btnCreate?.setAttribute('disabled', 'disabled');
        }

        valueInput.oninput = () => {
            if (valueInput.value[0] === ' ') {
                valueInput.value = '';
            }
        };

        valueInput.onchange = (() => {
            if (this.categorysExpense.find(i => i.title === valueInput.value)) {
                btnCreate?.setAttribute('disabled', 'disabled');
                valueInput.style.border = '2px solid red';
                servErrMsg!.style.display = 'block';
            } else if (valueInput.value) {
                btnCreate?.removeAttribute('disabled');
                valueInput.style.border = '1px solid #CED4DA';
                nonValidErrorMsg!.style.display = 'none';
            } else {
                btnCreate?.setAttribute('disabled', 'disabled');
                valueInput.style.border = '2px solid red';
                nonValidErrorMsg!.style.display = 'block';
                servErrMsg!.style.display = 'none';
            }
        });

        btnCreate.onclick = (() => this.editFunc(item.id));
        btnCancel.onclick = (() => this.cancelFunc());
    }

    async editFunc(itemId: string): Promise<void> {
        const value: string = document.getElementById(`input-item-${itemId}`)!.value.trim().replace(/ +/g, ' ');
        await Exp.editExpense(itemId, value);
        this.categorysExpense = await Exp.getExpense();
        this.cancelFunc();
    }

    cancelFunc(): void {
        this.title.innerText = 'Расходы';
        this.content.innerHTML = `<div class="content-item create-item" id="create-item">
            <div class="create"><span>+</span></div>
        </div>`;
        this.expenseCreateField(this.categorysExpense);
        this.createExpense();
    }

    async deleteExpense(itemId: number): Promise<void> {
        const popupElement: HTMLDivElement = document.createElement('div');
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

        const popup: HTMLElement | null = document.getElementById(`popup`);
        const btnItemDelete: HTMLElement | null = document.getElementById(`btn-item-delete-${itemId}`);
        const btnCancel: HTMLElement | null = document.getElementById(`btn-item-сancel-${itemId}`);

        if (btnItemDelete && btnCancel) {
            btnItemDelete.onclick = async (): Promise<void> => {
                this.content.innerHTML = '';
                await Exp.deleteExpense(itemId);
                this.categorysExpense = await Exp.getExpense();
                this.cancelFunc();
                popup?.remove();
                this.updateBalance();
            };

            btnCancel.onclick = (): void => {
                popup?.remove();
            };
        }
    }

    async createExpense(): Promise<void> {
        const createElement: HTMLElement | null = document.getElementById('create-item');

        if (createElement) {
            createElement.onclick = (): void => {
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

                const valueCreate: HTMLInputElement | null = document.getElementById(`create-item-value`) as HTMLInputElement;
                const btnCancelCreate: HTMLElement | null = document.getElementById(`btn-сancel-create`);
                const btnItemCreate: HTMLElement | null = document.getElementById(`btn-item-create`);
                const nonValid: HTMLElement | null = document.getElementById('input-error');
                const servErr: HTMLElement | null = document.getElementById('input-server-error');

                if (valueCreate && btnItemCreate) {
                    if (!valueCreate.value) {
                        btnItemCreate.setAttribute('disabled', 'disabled');
                    }

                    valueCreate.oninput = (): void => {
                        if (valueCreate.value[0] === ' ') {
                            valueCreate.value = '';
                        }
                    };

                    valueCreate.onchange = (): void => {
                        if (this.categorysExpense.find(i => i.title === valueCreate.value)) {
                            btnItemCreate.setAttribute('disabled', 'disabled');
                            if (valueCreate) valueCreate.style.border = '2px solid red';
                            if (servErr) servErr.style.display = 'block';
                        } else if (valueCreate.value) {
                            btnItemCreate.removeAttribute('disabled');
                            if (valueCreate) valueCreate.style.border = '1px solid #CED4DA';
                            if (nonValid) nonValid.style.display = 'none';
                        } else {
                            btnItemCreate.setAttribute('disabled', 'disabled');
                            if (valueCreate) valueCreate.style.border = '2px solid red';
                            if (nonValid) nonValid.style.display = 'block';
                            if (servErr) servErr.style.display = 'none';
                        }
                    };

                    if (btnCancelCreate && typeof (this.cancelFunc) === "function")
                        btnCancelCreate.onclick = (): void => {
                            this.cancelFunc()
                        };

                    if (btnItemCreate)
                        btnItemCreate.onclick = async (): Promise<void> => {
                            await Exp.createExpense(valueCreate.value.trim().replace(/ +/g, ' '))
                            this.categorysExpense = await Exp.getExpense()
                            this.cancelFunc()
                        };
                }
            };
        }
    }

    async updateBalance(): Promise<void> {
        const getBalance: any = await Balance.getBalance();
        document.getElementById('balance')!.innerHTML = `Баланс:<span>${getBalance.balance} $</span>`;
    }
}