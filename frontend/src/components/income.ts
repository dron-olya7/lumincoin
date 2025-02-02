import {Inc} from "../services/income";
import {Balance} from "../services/balance";

export class Income {
    title: HTMLElement | null;
    content: HTMLElement | null;
    wrapper: HTMLElement | null;
    categorysIncome: Array<any> = [];

    constructor() {
        this.title = document.getElementById('content-title');
        this.content = document.getElementById('content-items');
        this.wrapper = document.getElementById('wrapper');
        this.init();
        this.incomeCreateField(this.categorysIncome);
        this.createIncome();
    }

    async init(): Promise<void> {
        document.getElementById("income-link")?.classList.add('active');
        document.getElementById("category-link")?.setAttribute('aria-expanded', 'true');
        document.getElementById("account-collapse")?.classList.add('show');
        this.title!.innerText = 'Доходы';
        this.categorysIncome = await Inc.getIncome();
        this.incomeCreateField(this.categorysIncome);
    }

    incomeCreateField(el: any[]): void {
        if (this.categorysIncome.length === 0) {
            return;
        }
        el.forEach((item) :void => {
            const contentItemElement :HTMLDivElement = document.createElement('div');
            contentItemElement.className = 'content-item';

            const itemNameElement :HTMLDivElement = document.createElement('div');
            itemNameElement.className = 'item-name';
            itemNameElement.innerText = item.title;

            const itemButtonsElement :HTMLDivElement = document.createElement('div');
            itemButtonsElement.className = 'item-btns';
            itemButtonsElement.innerHTML = `
            <div class="item-btn">
                <button class="btn btn-edit bg-primary" id="btn-edit-${item.id}">
                    Редактировать
                </button>
            </div>
            <div class="item-btn">
                <button class="btn bg-danger btn-delete" id="btn-delete-${item.id}">
                    Удалить
                </button>
            </div>`;

            contentItemElement.appendChild(itemNameElement);
            contentItemElement.appendChild(itemButtonsElement);

            const contentItemsEl :HTMLElement|null = document.getElementById('content-items');
            const createItemEl :HTMLElement|null = document.getElementById('create-item');

            contentItemsEl!.insertBefore(contentItemElement, createItemEl);

            const btnEdit :HTMLElement|null = document.getElementById(`btn-edit-${item.id}`);
            const btnDelete :HTMLElement|null = document.getElementById(`btn-delete-${item.id}`);
            btnEdit!.onclick = () => this.editIncome(item.id);
            btnDelete!.onclick = () => this.deleteIncome(item.id);
        });
    }

    async editIncome(itemId: string): Promise<void> {
        const item = await Inc.getIncomeOne(itemId);
        this.title!.innerText = 'Редактирование категории доходов';
        this.content!.innerHTML = `<div class="content-items create-edit">
            <div class="input-error" id="input-error">Введите название категории</div>
            <div class="input-error" id="input-server-error">Данная операция уже существует</div>
            <input class="content-input" maxlength="42" type="text" value="${item.title}" id="input-item-${item.id}">
            <div class="item-btns">
                <div class="item-btn">
                    <button class="btn btn-create bg-success" id="btn-create-${item.id}">
                        Сохранить
                    </button>
                </div>
                <div class="item-btn">
                    <button class="btn bg-danger btn-delete" id="btn-cancel-${item.id}">
                        Отмена
                    </button>
                </div>
            </div>
        </div>`;

        const value :HTMLInputElement = document.getElementById(`input-item-${item.id}`) as HTMLInputElement;
        const btnCreate :HTMLButtonElement = document.getElementById(`btn-create-${item.id}`) as HTMLButtonElement;
        const btnCancel :HTMLButtonElement = document.getElementById(`btn-cancel-${item.id}`) as HTMLButtonElement;
        const nonValid :HTMLElement|null = document.getElementById('input-error');
        const servErr :HTMLElement|null = document.getElementById('input-server-error');

        if (!value.value) {
            btnCreate.setAttribute('disabled', 'disabled');
        }
        value.oninput = () :void => {
            if (value.value[0] === ' ') {
                value.value = '';
            }
        };
        value.onchange = () :void => {
            if (this.categorysIncome.find(i => i.title === value.value)) {
                btnCreate.setAttribute('disabled', 'disabled');
                value.style.border = '2px solid red';
                servErr!.style.display = 'block';
            } else if (value.value) {
                btnCreate.removeAttribute('disabled');
                value.style.border = '1px solid #CED4DA';
                nonValid!.style.display = 'none';
            } else {
                btnCreate.setAttribute('disabled', 'disabled');
                value.style.border = '2px solid red';
                nonValid!.style.display = 'block';
                servErr!.style.display = 'none';
            }
        };

        btnCreate.onclick = () => this.editFunc(itemId, value.value.trim().replace(/ +/g, ' '));
        btnCancel.onclick = () => this.cancelFunc();
    }

    async editFunc(itemId: string, value: string): Promise<void> {
        await Inc.editIncome(itemId, value);
        this.categorysIncome = await Inc.getIncome();
        this.cancelFunc();
    }

    cancelFunc(): void {
        this.title!.innerText = 'Доходы';
        this.content!.innerHTML = `<div class="content-item create-item" id="create-item">
            <div class="create"><span>+</span></div>
        </div>`;
        this.incomeCreateField(this.categorysIncome);
        this.createIncome();
    }

    async deleteIncome(itemId: string): Promise<void> {
        const popupElement :HTMLDivElement = document.createElement('div');
        popupElement.className = 'popup';
        popupElement.setAttribute('id', 'popup');
        popupElement.innerHTML = `
        <div class="popup-block">
            <div class="popup-title">Вы действительно хотите удалить категорию? Связанные доходы будут удалены навсегда.</div>
            <div class="popup-btns">
                <div class="item-btn">
                    <button class="btn btn-create bg-success" id="btn-item-delete-${itemId}">
                        Да, удалить
                    </button>
                </div>
                <div class="item-btn">
                    <button class="btn bg-danger btn-delete" id="btn-item-cancel-${itemId}">
                        Не удалять
                    </button>
                </div>
            </div>
        </div>`;
        this.wrapper!.appendChild(popupElement);

        const popup: HTMLElement | null = document.getElementById('popup');
        const btnItemDelete: HTMLElement | null = document.getElementById(`btn-item-delete-${itemId}`);
        const btnCancel: HTMLElement | null = document.getElementById(`btn-item-cancel-${itemId}`);
        btnItemDelete!.onclick = async (): Promise<void> => {
            this.content!.innerHTML = '';
            await Inc.deleteIncome(itemId);
            this.categorysIncome = await Inc.getIncome();
            this.cancelFunc();
            popup!.remove();
            this.updateBalance();
        };

        btnCancel!.onclick = () :void => {
            popup!.remove();
        };
    }

    async createIncome(): Promise<void> {
        const createElement :HTMLElement|null = document.getElementById('create-item');
        createElement!.onclick = () :void => {
            this.title!.innerText = 'Создание категории доходов';
            this.content!.innerHTML = `
        <div class="content-items create-edit">
            <div class="input-error" id="input-error">Введите название категории</div>
            <div class="input-error" id="input-server-error">Данная категория уже существует</div>
            <input class="content-input" maxlength="42" type="text" id="create-item-value" placeholder="Название...">
            <div class="item-btns">
                <div class="item-btn">
                    <button class="btn btn-create bg-success" id="btn-item-create">
                        Создать
                    </button>
                </div>
                <div class="item-btn">
                    <button class="btn bg-danger btn-delete" id="btn-cancel-create">
                        Отмена
                    </button>
                </div>
            </div>
        </div>`;

            const btnCancelCreate :HTMLButtonElement = document.getElementById('btn-cancel-create') as HTMLButtonElement;
            const btnItemCreate :HTMLButtonElement  = document.getElementById('btn-item-create') as HTMLButtonElement;
            const valueCreate :HTMLInputElement = document.getElementById('create-item-value') as HTMLInputElement;
            const nonValid :HTMLElement|null = document.getElementById('input-error');
            const servErr :HTMLElement|null = document.getElementById('input-server-error');

            if (!valueCreate.value) {
                btnItemCreate.setAttribute('disabled', 'disabled');
            }

            valueCreate.oninput = () :void => {
                if (valueCreate.value[0] === ' ') {
                    valueCreate.value = '';
                }
            };

            valueCreate.onchange = () :void => {
                if (this.categorysIncome.find(i => i.title === valueCreate.value)) {
                    btnItemCreate.setAttribute('disabled', 'disabled');
                    valueCreate.style.border = '2px solid red';
                    servErr!.style.display = 'block';
                } else if (valueCreate.value) {
                    btnItemCreate.removeAttribute('disabled');
                    valueCreate.style.border = '1px solid #CED4DA';
                    nonValid!.style.display = 'none';
                } else {
                    btnItemCreate.setAttribute('disabled', 'disabled');
                    valueCreate.style.border = '2px solid red';
                    nonValid!.style.display = 'block';
                    servErr!.style.display = 'none';
                }
            };

            btnCancelCreate.onclick = () => this.cancelFunc();

            btnItemCreate.onclick = async () : Promise<void>  => {
                await Inc.createIncome(valueCreate.value.trim().replace(/ +/g, ' '));
                this.categorysIncome = await Inc.getIncome();
                this.cancelFunc();
            };
        };
    }

    async updateBalance(): Promise<void> {
        const getBalance = await Balance.getBalance();
        document.getElementById('balance')!.innerHTML = `Баланс: <span>${getBalance.balance} $</span>`;
    }
}