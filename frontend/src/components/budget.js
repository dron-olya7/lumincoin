import {Operations} from "../services/operations.js";
import {Balance} from "../services/balance.js";


export class Budget {
    constructor() {
        this.title = document.getElementById('content-title');
        this.content = document.getElementById('budget-content');
        this.wrapper = document.getElementById('wrapper');
        this.budgetOperations = [];
        this.init('today');
        this.activeFilter();
        this.createOperation();
        this.updateBalance();
    }


    async init(value, dateFrom, dateTo) {
        document.getElementById("budget-link").classList.add('active');
        this.budgetOperations = await Operations.getOperations(value, dateFrom, dateTo);
        this.budgetOperationsField(this.budgetOperations);
    }

    activeFilter() {
        const today = document.getElementById('today');
        const week = document.getElementById('week');
        const month = document.getElementById('month');
        const year = document.getElementById('year');
        const all = document.getElementById('all');
        const interval = document.getElementById('interval');
        const dateFrom = document.getElementById('dateFrom');
        const dateTo = document.getElementById('dateTo');
        const itemTabs = document.getElementsByClassName('item-tabs');

        function check() {
            [].forEach.call(itemTabs, function (el) {
                el.classList.remove('active')
            });
            if (!interval.classList.contains('active')) {
                dateFrom.setAttribute('disabled', 'disabled');
                dateTo.setAttribute('disabled', 'disabled');
            }
        }

        today.onclick = (async () => {
            check();
            today.classList.add('active');
            await this.init('today');
        });
        week.onclick = (async () => {
            check();
            week.classList.add('active')
            await this.init('week');
        });
        month.onclick = (async () => {
            check();
            month.classList.add('active')
            await this.init('month');
        });
        year.onclick = (async () => {
            check();
            year.classList.add('active')
            await this.init('year');
        });
        all.onclick = (async () => {
            check();
            all.classList.add('active')
            await this.init('all');
        });
        interval.onclick = (async () => {
            check();
            interval.classList.add('active')

            if (dateFrom.value && dateTo.value) {
                await this.init('interval', dateFrom.value, dateTo.value);
            }
            if (interval.classList.contains('active')) {
                dateFrom.removeAttribute('disabled');
                dateTo.removeAttribute('disabled');
            }


            dateFrom.onchange = (() => {
                if (dateFrom.value && dateTo.value) {
                    this.init('interval', dateFrom.value, dateTo.value);
                }
            })
            dateTo.onchange = (() => {
                if (dateFrom.value && dateTo.value) {
                    this.init('interval', dateFrom.value, dateTo.value);
                }
            })
        });
    }

    budgetOperationsField(el) {
        const d = document.getElementById('budget-not-items');
        if (el.length === 0) {
            d.style.overflow = 'visible';
            d.innerHTML = `
            <div class="not-operation">Операций не найдено</div>`
            return
        }

        d.style.overflow = 'scroll';
        d.innerHTML = `
                 <table id="budget-table">
                    <thead>
                    <tr class="budget-table-tr" id="td-titles">
                        <th class="budget-table-td  td-titles">№ операции</th>
                        <th class="budget-table-td  td-titles">Тип</th>
                        <th class="budget-table-td  td-titles">Категория</th>
                        <th class="budget-table-td  td-titles">Сумма</th>
                        <th class="budget-table-td  td-titles">Дата</th>
                        <th class="budget-table-td budget-table-td-comment  td-titles">Комментарий</th>
                        <th class="budget-table-td budget-table-td-action  td-titles"></th>
                    </tr>
                    <thead>
                 </table>
        `;

        el.forEach(item => {
            let itemType = item.type;
            if (itemType === 'income') {
                itemType = 'Доход'
            }
            if (itemType === 'expense') {
                itemType = 'Расход'
            }
            const count = el.indexOf(item) + 1;
            const budgetTableTrElement = document.createElement('tr');
            budgetTableTrElement.className = 'budget-table-tr';
            budgetTableTrElement.innerHTML = `
                        <td class="budget-table-td td-titles">${count}</td>
                        <td class="budget-table-td ${item.type}" >${itemType}</td>
                        <td class="budget-table-td">${item.category}</td>
                        <td class="budget-table-td">${item.amount}$</td>
                        <td class="budget-table-td">${item.date}</td>
                        <td class="budget-table-td budget-table-td-comment td-titles">${item.comment}</td>
                        <td class="budget-table-td budget-table-td-actions actions">
                            <span id=operation-delete-${item.id} class="budget-table-delete-item">
                                <svg width="14" height="15" viewBox="0 0 14 15" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
<path d="M4.5 5.5C4.77614 5.5 5 5.72386 5 6V12C5 12.2761 4.77614 12.5 4.5 12.5C4.22386 12.5 4 12.2761 4 12V6C4 5.72386 4.22386 5.5 4.5 5.5Z"
      fill="black"/>
<path d="M7 5.5C7.27614 5.5 7.5 5.72386 7.5 6V12C7.5 12.2761 7.27614 12.5 7 12.5C6.72386 12.5 6.5 12.2761 6.5 12V6C6.5 5.72386 6.72386 5.5 7 5.5Z"
      fill="black"/>
<path d="M10 6C10 5.72386 9.77614 5.5 9.5 5.5C9.22386 5.5 9 5.72386 9 6V12C9 12.2761 9.22386 12.5 9.5 12.5C9.77614 12.5 10 12.2761 10 12V6Z"
      fill="black"/>
<path fill-rule="evenodd" clip-rule="evenodd"
      d="M13.5 3C13.5 3.55228 13.0523 4 12.5 4H12V13C12 14.1046 11.1046 15 10 15H4C2.89543 15 2 14.1046 2 13V4H1.5C0.947715 4 0.5 3.55228 0.5 3V2C0.5 1.44772 0.947715 1 1.5 1H5C5 0.447715 5.44772 0 6 0H8C8.55229 0 9 0.447715 9 1H12.5C13.0523 1 13.5 1.44772 13.5 2V3ZM3.11803 4L3 4.05902V13C3 13.5523 3.44772 14 4 14H10C10.5523 14 11 13.5523 11 13V4.05902L10.882 4H3.11803ZM1.5 3V2H12.5V3H1.5Z"
      fill="black"/>
</svg>
                            </span>
                            <span id=operation-edit-${item.id} class="budget-table-edit-item">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.1465 0.146447C12.3417 -0.0488155 12.6583 -0.0488155 12.8536 0.146447L15.8536 3.14645C16.0488 3.34171 16.0488 3.65829 15.8536 3.85355L5.85357 13.8536C5.80569 13.9014 5.74858 13.9391 5.68571 13.9642L0.68571 15.9642C0.500001 16.0385 0.287892 15.995 0.146461 15.8536C0.00502989 15.7121 -0.0385071 15.5 0.0357762 15.3143L2.03578 10.3143C2.06092 10.2514 2.09858 10.1943 2.14646 10.1464L12.1465 0.146447ZM11.2071 2.5L13.5 4.79289L14.7929 3.5L12.5 1.20711L11.2071 2.5ZM12.7929 5.5L10.5 3.20711L4.00001 9.70711V10H4.50001C4.77616 10 5.00001 10.2239 5.00001 10.5V11H5.50001C5.77616 11 6.00001 11.2239 6.00001 11.5V12H6.29291L12.7929 5.5ZM3.03167 10.6755L2.92614 10.781L1.39754 14.6025L5.21903 13.0739L5.32456 12.9683C5.13496 12.8973 5.00001 12.7144 5.00001 12.5V12H4.50001C4.22387 12 4.00001 11.7761 4.00001 11.5V11H3.50001C3.28561 11 3.10272 10.865 3.03167 10.6755Z" fill="black"/>
</svg>
                            </span>
                        </td>
            `;

            const tableNameEl = document.getElementById('budget-table');
            tableNameEl.appendChild(budgetTableTrElement);

            if (!item.category && item.id) {
                this.justDelete(item.id);
                location.href = '#/budget';
            }

            const btnEdit = document.getElementById(`operation-edit-${item.id}`);
            const btnDelete = document.getElementById(`operation-delete-${item.id}`);

            btnEdit.onclick = (() => {
                localStorage.setItem('operationId', item.id);
                location.href = '#/budget/edit-operation';
            });

            btnDelete.onclick = (async () => {
                const array = [...document.getElementsByClassName("item-tabs")];
                const a = array.find(el => el.classList.contains('active'));
                await this.deleteBudget(item.id, a.id)
            });
        })
    }

    async deleteBudget(itemId, path) {
        const popupElement = document.createElement('div');
        popupElement.className = 'popup';
        popupElement.setAttribute('id', 'popup');
        popupElement.innerHTML = `
        <div class="popup-block">
            <div class="popup-title">Вы действительно хотите удалить операцию?</div>
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
            await Operations.deleteOperations(itemId);
            this.budgetOperations = await Operations.getOperations(path);
            document.getElementById('budget-table').innerHTML = '';
            this.budgetOperationsField(this.budgetOperations);
            popup.remove();
            await this.updateBalance();
        });

        btnCancel.onclick = (() => {
            popup.remove();
        })
    }

    async justDelete(itemId) {
        await Operations.deleteOperations(itemId);
        await this.updateBalance();
    }

    createOperation() {
        const btnCreateIncome = document.getElementById(`create-income`);
        const btnCreateExpense = document.getElementById(`create-expense`);

        btnCreateIncome.onclick = (() => location.href = '#/budget/create-operation');
        btnCreateExpense.onclick = (() => location.href = '#/budget/create-operation');
    }

    async updateBalance() {
        const getBalance = await Balance.getBalance();
        document.getElementById('balance').innerHTML = `Баланс: <span>${getBalance.balance} $</span>`;
    }

}