import {Auth} from "./services/auth.js";
import {Form} from "./components/form.js";
import {Income} from "./components/income.js";
import {Expense} from "./components/expense.js";
import {Budget} from "./components/budget.js";
import {EditOperation} from "./components/editOperation.js";
import {CreateOperation} from "./components/createOperation.js";
import {Balance} from "./services/balance.js";
import {Main} from "./components/main.js";

export class Router {
    constructor() {
        this.contentElement = document.getElementById('app');
        this.titleElement = document.getElementById('title');
        this.balance = document.getElementById('balance');
        // sidebar

        this.routes = [
            {
                route: '#/login',
                title: 'Вход в систему',
                template: 'templates/login.html',
                navBar: false,
                load: () => {
                    new Form('login')
                }
            },
            {
                route: '#/signup',
                title: 'Регистрация',
                template: 'templates/signup.html',
                navBar: false,
                load: () => {
                    new Form('signup')
                }
            },
            {
                route: '#/',
                title: 'Главная',
                template: 'templates/index.html',
                navTemplate:'templates/sidebar.html',
                navBar: true,
                load: () => {
                    new Main();
                }
            },
            {
                route: '#/budget',
                title: 'Доходы & Расходы',
                template: 'templates/budget.html',
                navTemplate:'templates/sidebar.html',
                navBar: true,
                load: () => {
                    new Budget();
                }
            },
            {
                route: '#/category/income',
                title: 'Категория: Доходы',
                template: 'templates/category.html',
                navTemplate:'templates/sidebar.html',
                navBar: true,
                load: () => {
                    new Income()
                }
            },
            {
                route: '#/category/expense',
                title: 'Категория: Расходы',
                template: 'templates/category.html',
                navTemplate:'templates/sidebar.html',
                navBar: true,
                load: () => {
                    new Expense();
                }
            },
            {
                route: '#/budget/edit-operation',
                title: 'Редактирование операции',
                template: 'templates/editOperation.html',
                navTemplate:'templates/sidebar.html',
                navBar: true,
                load: () => {
                    new EditOperation();
                }
            },
            {
                route: '#/budget/create-operation',
                title: 'Редактирование операции',
                template: 'templates/createOperation.html',
                navTemplate:'templates/sidebar.html',
                navBar: true,
                load: () => {
                    new CreateOperation();
                }
            },
        ]
    }

    async openRoute() {
        const urlRoute = window.location.hash.split('?')[0];
        if (urlRoute === '#/logout') {
            await Auth.logout();
            window.location.href = '#/login';
            return;
        }

        const newRoute = this.routes.find(item => {
            return item.route === urlRoute;
        });

        if (!newRoute) {
            window.location.href = '#/login';
            return;
        }

        if(newRoute.navBar && !Auth.getUserInfo()){
            window.location.href = "#/login";
            return;
        }

        this.contentElement.innerHTML = await fetch(newRoute.template).then(response => response.text());
        this.titleElement.innerText = newRoute.title;

        if (newRoute.navBar) {
            const wrapper = document.getElementById('wrapper');
            const sideDiv = document.createElement('div');
            sideDiv.className = 'sidebar   bg-light';
            sideDiv.innerHTML = await fetch(newRoute.navTemplate).then(response => response.text());
            wrapper.insertBefore(sideDiv, wrapper.firstChild);
        }

        const userInfo = Auth.getUserInfo();


        const getBalance = await Balance.getBalance();
        const accessToken = localStorage.getItem(Auth.accessTokenKey);
        if (userInfo && accessToken && urlRoute !== '#/login' && urlRoute !== '#/signup') {
            document.getElementById('balance').innerHTML = `Баланс: <span>${getBalance.balance} $</span>`;
            document.getElementById('fullName').innerText = `${userInfo.userName} ${userInfo.userLastName}`;
        }

        if (urlRoute !== '#/login') {
            if (urlRoute !== '#/signup') {
                if (urlRoute === '#/signup') {
                    return
                }
                if (!accessToken) {
                    window.location.href = '#/login';
                    return;
                }
            }
        }

        if (urlRoute === '#/category/expense') {

            if (urlRoute !== '#/signup') {
                if (urlRoute === '#/signup') {
                    return
                }
                if (!accessToken) {
                    window.location.href = '#/login';
                    return;
                }
            }
        }

        newRoute.load();
    }
}