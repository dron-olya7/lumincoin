import {Auth} from "./services/auth";
import {Form} from "./components/form";
import {Income} from "./components/income";
import {Expense} from "./components/expense";
import {Budget} from "./components/budget";
import {EditOperation} from "./components/editOperation";
import {CreateOperation} from "./components/createOperation";
import {Balance} from "./services/balance";
import {Main} from "./components/main";
import {RouteType} from "./types/route.type";
import {UserInfo} from "./types/userInfo.type";

export class Router {
    contentElement: HTMLElement | null;
    titleElement: HTMLElement | null;
    balanceElement: HTMLElement | null;
    routes: RouteType[];

    constructor() {
        this.contentElement = document.getElementById('app');
        this.titleElement = document.getElementById('title');
        this.balanceElement = document.getElementById('balance');

        this.routes = [
            {
                route: '#/login',
                title: 'Вход в систему',
                template: 'templates/login.html',
                navBar: false,
                load: (): void => {
                    new Form('login');
                }
            },
            {
                route: '#/signup',
                title: 'Регистрация',
                template: 'templates/signup.html',
                navBar: false,
                load: (): void  => {
                    new Form('signup');
                }
            },
            {
                route: '#/',
                title: 'Главная',
                template: 'templates/index.html',
                navTemplate: 'templates/sidebar.html',
                navBar: true,
                load: () :void  => {
                    new Main();
                }
            },
            {
                route: '#/budget',
                title: 'Доходы & Расходы',
                template: 'templates/budget.html',
                navTemplate: 'templates/sidebar.html',
                navBar: true,
                load: (): void  => {
                    new Budget();
                }
            },
            {
                route: '#/category/income',
                title: 'Категория: Доходы',
                template: 'templates/category.html',
                navTemplate: 'templates/sidebar.html',
                navBar: true,
                load: (): void  => {
                    new Income();
                }
            },
            {
                route: '#/category/expense',
                title: 'Категория: Расходы',
                template: 'templates/category.html',
                navTemplate: 'templates/sidebar.html',
                navBar: true,
                load: (): void  => {
                    new Expense();
                }
            },
            {
                route: '#/budget/edit-operation',
                title: 'Редактирование операции',
                template: 'templates/editOperation.html',
                navTemplate: 'templates/sidebar.html',
                navBar: true,
                load: (): void  => {
                    new EditOperation();
                }
            },
            {
                route: '#/budget/create-operation',
                title: 'Создание операции',
                template: 'templates/createOperation.html',
                navTemplate: 'templates/sidebar.html',
                navBar: true,
                load: (): void  => {
                    new CreateOperation();
                }
            },
        ];
    }

    async openRoute(): Promise<void> {
        const urlRoute: string = window.location.hash.split('?')[0];
        if (urlRoute === '#/logout') {
            await Auth.logout();
            window.location.href = '#/login';
            return;
        }

        const newRoute: RouteType | undefined = this.routes.find((item: RouteType): boolean => item.route === urlRoute);

        if (!newRoute) {
            window.location.href = '#/login';
            return;
        }

        if (newRoute.navBar && !Auth.getUserInfo()) {
            window.location.href = '#/login';
            return;
        }

        this.contentElement!.innerHTML = await fetch(newRoute.template).then(
            (response: Response) => response.text()
        );
        this.titleElement!.innerText = newRoute.title;

        if (newRoute.navBar) {
            const wrapper: HTMLDivElement = document.getElementById('wrapper') as HTMLDivElement;
            const sideDiv: HTMLDivElement = document.createElement('div');
            sideDiv.className = 'sidebar bg-light';
            sideDiv.innerHTML = await fetch(newRoute.navTemplate!).then(
                (response: Response) => response.text()
            );
            wrapper.insertBefore(sideDiv, wrapper.firstChild);
        }

        const userInfo: UserInfo|null = Auth.getUserInfo();
        const getBalance = await Balance.getBalance();
        const accessToken: string | null = localStorage.getItem(Auth.accessTokenKey);

        if (
            userInfo &&
            accessToken &&
            urlRoute !== '#/login' &&
            urlRoute !== '#/signup'
        ) {
            if(getBalance){
                this.balanceElement!.innerHTML = `Баланс: <span>${getBalance.balance} $</span>`;
            } 
            document.getElementById('fullName')!.innerText = `${userInfo.userName} ${userInfo.userLastName}`;
        }

        if (urlRoute !== '#/login') {
            if (urlRoute !== '#/signup') {
                if (urlRoute === '#/signup') {
                    return;
                }
                if (!accessToken) {
                    window.location.href = '#/login';
                    return;
                }
            }
        }

        const urlRouteExp: "#/category/expense" = '#/category/expense';
        const urlRoutSign: "#/signup" = '#/signup';
        if (urlRouteExp && urlRoutSign && !accessToken) {
            window.location.href = '#/login';
            return;
        }

        newRoute.load();
    }
}