import {Auth} from "../services/auth.js";
import {Balance} from "../services/balance.js";
import Chart from 'chart.js/auto';
import {Operations} from "../services/operations.js";


export class Main {
    constructor() {
        this.diagrams = document.getElementById('diagrams')
        this.incomeData = [];
        this.expenseData = [];
        this.init();
        this.activeFilter();
        this.showDiagram('today')
    }


    async init() {
        document.getElementById("main-link").classList.add('active');
        const userInfo = await Auth.getUserInfo();
        const getBalance = await Balance.getBalance();
        document.getElementById('balance').innerHTML = `Баланс: <span>${getBalance.balance} $</span>`;
        document.getElementById('fullName').innerText = `${userInfo.userName} ${userInfo.userLastName}`;

    }

    async showDiagram(value, dateFrom, dateTo) {
        await this.getData(value, dateFrom, dateTo);
        await this.incomeDiagrams();
    }

    async getData(value, dateFrom, dateTo) {
        const inc = [];
        const dec = [];
        const data = await Operations.getOperations(value, dateFrom, dateTo);
        const incomeData = data.filter(i => i.type === 'income').forEach(obj => {
            const a =  inc.find(i => i.category === obj.category);
            if (a) {
                a.amount = a.amount + obj.amount
            } else {
                inc.push({
                    category: obj.category,
                    amount: obj.amount
                })
            }
        });
        const expenseData = data.filter(i => i.type === 'expense').forEach(obj => {
         const a =  dec.find(i => i.category === obj.category);
         if (a) {
             a.amount = a.amount + obj.amount
         } else {
                    dec.push({
                        category: obj.category,
                        amount: obj.amount
                    })
                }
            });
        this.incomeData = inc;
        this.expenseData = dec;

        this.diagrams.innerHTML = '';
        this.diagrams.innerHTML = `
        <canvas class="diagrams-item" id="income-diagram"></canvas>
            <div class="verticalLine"></div>
            <canvas class="diagrams-item" id="expense-diagram"></canvas>
        `
    }

    async incomeDiagrams() {
        const incomeChart = document.getElementById('income-diagram')
        const expenseChart = document.getElementById('expense-diagram')
        incomeChart.parentNode.style.height = '430px';
        incomeChart.parentNode.style.width = '430px';
        expenseChart.parentNode.style.height = '430px';
        expenseChart.parentNode.style.width = '430px';
        new Chart(
            incomeChart,
            {
                type: 'pie',
                data: {
                    labels: this.incomeData.map(row => row.category),
                    datasets: [
                        {
                            label: 'Доход в $',
                            data: this.incomeData.map(row => row.amount)
                        }
                    ]
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
            }
        );
        new Chart(
            expenseChart,
            {
                type: 'pie',
                data: {
                    labels: this.expenseData.map(row => row.category),
                    datasets: [
                        {
                            label: 'Расход в $',
                            data: this.expenseData.map(row => row.amount)
                        }
                    ]
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
            }
        );


    };


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
            await this.showDiagram('today');
        });
        week.onclick = (async () => {
            check();
            week.classList.add('active')
            await this.showDiagram('week');
        });
        month.onclick = (async () => {
            check();
            month.classList.add('active')
            await this.showDiagram('month');
        });
        year.onclick = (async () => {
            check();
            year.classList.add('active')
            await this.showDiagram('year');
        });
        all.onclick = (async () => {
            check();
            all.classList.add('active')
            await this.showDiagram('all');
        });
        interval.onclick = (async () => {
            check();
            interval.classList.add('active')

            if (dateFrom.value && dateTo.value) {
                await this.showDiagram('interval', dateFrom.value, dateTo.value);
            }
            if (interval.classList.contains('active')) {
                dateFrom.removeAttribute('disabled');
                dateTo.removeAttribute('disabled');
            }


            dateFrom.onchange = (() => {
                if (dateFrom.value && dateTo.value) {
                    this.showDiagram('interval', dateFrom.value, dateTo.value);
                }
            })
            dateTo.onchange = (() => {
                if (dateFrom.value && dateTo.value) {
                    this.showDiagram('interval', dateFrom.value, dateTo.value);
                }
            })
        });
    }

}