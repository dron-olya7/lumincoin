import {Auth} from "../services/auth";
import {Balance} from "../services/balance";
import Chart from "chart.js/auto";
import {Operations} from "../services/operations";
import {elements} from "chart.js";

export class Main {
    diagrams: HTMLDivElement;
    incomeData: Array<{ category: string; amount: number }> = [];
    expenseData: Array<{ category: string; amount: number }> = [];

    constructor() {
        this.diagrams = document.getElementById('diagrams') as HTMLDivElement;
        this.init();
        this.activeFilter();
        this.showDiagram('today');
    }

    async init(): Promise<void> {
        document.getElementById("main-link")?.classList.add('active');
        const userInfo = await Auth.getUserInfo();
        const getBalance = await Balance.getBalance();
        document.getElementById('balance')!.innerHTML = `Баланс: <span>${getBalance.balance} $</span>`;
        document.getElementById('fullName')!.innerText = `${userInfo.userName} ${userInfo.userLastName}`;
    }

    async showDiagram(value: string, dateFrom?: string, dateTo?: string): Promise<void> {
        await this.getData(value, dateFrom, dateTo);
        await this.incomeDiagrams();
    }

    async getData(value: string, dateFrom?: string, dateTo?: string): Promise<void> {
        const inc: Array<{ category: string; amount: number }> = [];
        const dec: Array<{ category: string; amount: number }> = [];
        const data = await Operations.getOperations(value, dateFrom, dateTo);

        // Доходы
        data.forEach((obj) :void => {
            if (obj.type === 'income') {
                const existingCategory = inc.find(i => i.category === obj.category);
                if (existingCategory) {
                    existingCategory.amount += obj.amount;
                } else {
                    inc.push({category: obj.category, amount: obj.amount});
                }
            }
        });

        // Расходы
        data.forEach((obj) :void => {
            if (obj.type === 'expense') {
                const existingCategory = dec.find(i => i.category === obj.category);
                if (existingCategory) {
                    existingCategory.amount += obj.amount;
                } else {
                    dec.push({category: obj.category, amount: obj.amount});
                }
            }
        });

        this.incomeData = inc;
        this.expenseData = dec;

        this.diagrams.innerHTML = `
            <canvas class="diagrams-item" id="income-diagram"></canvas>
            <div class="verticalLine"></div>
            <canvas class="diagrams-item" id="expense-diagram"></canvas>
        `;
    }

    async incomeDiagrams(): Promise<void> {
        const incomeChart :HTMLCanvasElement = document.getElementById('income-diagram') as HTMLCanvasElement;
        const expenseChart :HTMLCanvasElement = document.getElementById('expense-diagram') as HTMLCanvasElement;

        incomeChart.parentNode!.style.height = '430px';
        incomeChart.parentNode!.style.width = '430px';
        expenseChart.parentNode!.style.height = '430px';
        expenseChart.parentNode!.style.width = '430px';

        new Chart(incomeChart, {
            type: 'pie',
            data: {
                labels: this.incomeData.map(row => row.category),
                datasets: [{
                    label: 'Доход в $',
                    data: this.incomeData.map(row => row.amount)
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Доходы',
                        color: '#290661',
                        font: {weight: 'bold', size: '28px'}
                    }
                }
            }
        });

        new Chart(expenseChart, {
            type: 'pie',
            data: {
                labels: this.expenseData.map(row => row.category),
                datasets: [{
                    label: 'Расход в $',
                    data: this.expenseData.map(row => row.amount)
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Расходы',
                        color: '#290661',
                        font: {weight: 'bold', size: '28px'}
                    }
                }
            }
        });
    }

    activeFilter(): void {
        const today :HTMLButtonElement = document.getElementById('today') as HTMLButtonElement;
        const week :HTMLButtonElement = document.getElementById('week') as HTMLButtonElement;
        const month :HTMLButtonElement = document.getElementById('month') as HTMLButtonElement;
        const year :HTMLButtonElement = document.getElementById('year') as HTMLButtonElement;
        const all :HTMLButtonElement = document.getElementById('all') as HTMLButtonElement;
        const interval :HTMLButtonElement = document.getElementById('interval') as HTMLButtonElement;
        const dateFrom :HTMLInputElement = document.getElementById('dateFrom') as HTMLInputElement;
        const dateTo :HTMLInputElement = document.getElementById('dateTo') as HTMLInputElement;
        const itemTabs :HTMLCollectionOf<Element> = document.getElementsByClassName('item-tabs');

        function check() :void {
            for (let el of itemTabs) {
                el.classList.remove('active');
            }
            if (!interval.classList.contains('active')) {
                dateFrom.setAttribute('disabled', 'disabled');
                dateTo.setAttribute('disabled', 'disabled');
            }
        }

        today.onclick = async () :Promise<void> => {
            check();
            today.classList.add('active');
            await this.showDiagram('today');
        };

        week.onclick = async () :Promise<void> => {
            check();
            week.classList.add('active');
            await this.showDiagram('week');
        };

        month.onclick = async () :Promise<void> => {
            check();
            month.classList.add('active');
            await this.showDiagram('month');
        };

        year.onclick = async () :Promise<void> => {
            check();
            year.classList.add('active');
            await this.showDiagram('year');
        };

        all.onclick = async () :Promise<void> => {
            check();
            all.classList.add('active');
            await this.showDiagram('all');
        };

        interval.onclick = async () :Promise<void> => {
            check();
            interval.classList.add('active');

            if (dateFrom.value && dateTo.value) {
                await this.showDiagram('interval', dateFrom.value, dateTo.value);
            }

            if (interval.classList.contains('active')) {
                dateFrom.removeAttribute('disabled');
                dateTo.removeAttribute('disabled');
            }

            dateFrom.onchange = () :void => {
                if (dateFrom.value && dateTo.value) {
                    this.showDiagram('interval', dateFrom.value, dateTo.value);
                }
            };

            dateTo.onchange = () :void => {
                if (dateFrom.value && dateTo.value) {
                    this.showDiagram('interval', dateFrom.value, dateTo.value);
                }
            };
        };
    }
}