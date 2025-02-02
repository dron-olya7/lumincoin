import { CustomHttp } from "../services/custom-http";
import { Auth } from "../services/auth";
import config from "../../config/config";

export class Form {
    private readonly rememberMe: boolean;
    private processElement: HTMLElement | null;
    private pass: HTMLInputElement | null;
    // @ts-ignore
    private fields: Array<{
        name: string;
        id: string;
        element: HTMLInputElement | null;
        regex: RegExp;
        valid: boolean;
    }>;

    constructor(private page: string) {
        this.rememberMe = false;
        this.processElement = null;
        this.pass = document.getElementById('password') as HTMLInputElement;
        const accessToken :string|null = localStorage.getItem(Auth.accessTokenKey);
        if (accessToken) {
            location.href = '#/';
            return;
        }

        this.fields = [
            {
                name: 'email',
                id: 'email',
                element: null,
                regex: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                valid: false,
            },
            {
                name: 'password',
                id: 'password',
                element: null,
                regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
                valid: false,
            },
        ];

        if (page === 'signup') {
            this.fields.unshift({
                    name: 'fullName',
                    id: 'fullName',
                    element: null,
                    regex: /^([А-Я][а-я]{3,11}) ([А-Я][а-я]{3,11})$/,
                    valid: false,
                },
                {
                    name: 'repeatPassword',
                    id: 'repeatPassword',
                    element: null,
                    regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
                    valid: false,
                });
        }

        this.fields.forEach(item => {
            item.element = document.getElementById(item.id) as HTMLInputElement;

            item.element.onchange = () :void => {
                this.validateField(item, item.element);
            };
        });

        this.processElement = document.getElementById('process');
        this.processElement!.onclick = () :void => {
            this.processForm();
        };

        if (page === 'login') {
            this.agreeElement = document.getElementById('agree') as HTMLInputElement;
            this.agreeElement.onchange = () :void => {
                this.rememberMe = this.agreeElement.checked;
            };
        }

        if (page === 'login' && localStorage.getItem('email')) {
            const email = this.fields.find(item => item.name === 'email');
            email!.element!.value = localStorage.getItem('email')!;
            if (email!.element!.value.match(email!.regex)) {
                email!.valid = true;
            }
        }
    }

    validElement(element: HTMLInputElement) :void {
        element.parentNode!.style.border = '2px solid red';
        element.parentNode!.style.borderRadius = '7px';
        element.parentNode!.firstElementChild!.firstElementChild!.firstElementChild!.style.fill = 'red';
        if (element.parentNode!.nextElementSibling) {
            element.parentNode!.nextElementSibling!.style.display = 'block';
        }
    }

    validateField(field: {
        name: string;
        id: string;
        element: HTMLInputElement | null;
        regex: RegExp;
        valid: boolean
    }, element: HTMLInputElement | null) :void {
        if (!element.value || !element.value.match(field.regex)) {
            this.validElement(element);
            field.valid = false;
        } else if (element.id === 'repeatPassword' && element.value !== this.pass!.value) {
            this.validElement(element);
            field.valid = false;
        } else {
            element.parentNode!.removeAttribute('style');
            element.parentNode!.firstElementChild!.firstElementChild!.firstElementChild!.removeAttribute('style');
            if (element.parentNode!.nextElementSibling) {
                element.parentNode!.nextElementSibling!.style.display = 'none';
            }
            field.valid = true;
        }
        this.validateForm();
    }

    validateForm(): boolean {
        const validForm :boolean = this.fields.every(item => item.valid);
        if (validForm) {
            this.processElement!.removeAttribute('disabled');
        } else {
            this.processElement!.setAttribute('disabled', 'disabled');
        }
        return validForm;
    }

    async processForm() :Promise<void> {
        if (this.validateForm()) {
            const email :string = this.fields.find(item => item.name === 'email')!.element!.value;
            const password :string = this.fields.find(item => item.name === 'password')!.element!.value;
            const er :HTMLElement|null = document.getElementById('has-user-error');

            if (this.page === 'signup') {
                try {
                    const result = await CustomHttp.request(`${config.host}/signup`, 'POST', {
                        name: this.fields.find(item => item.name === 'fullName')!.element!.value.split(' ')[0],
                        lastName: this.fields.find(item => item.name === 'fullName')!.element!.value.split(' ')[1],
                        email: email,
                        password: password,
                        passwordRepeat: this.fields.find(item => item.name === 'repeatPassword')!.element!.value
                    });

                    if (result) {
                        if (result.error || !result.user) {
                            throw new Error(result.message);
                        }
                    }
                } catch (error) {
                    er!.style.display = 'block';
                    console.log(error);
                }
            }

            try {
                const result = await CustomHttp.request(`${config.host}/login`, 'POST', {
                    email: email,
                    password: password,
                    rememberMe: this.rememberMe
                });

                if (this.rememberMe) {
                    localStorage.setItem('rememberMe', JSON.stringify(this.rememberMe));
                    localStorage.setItem('email', email);
                }

                if (result) {
                    er!.style.display = 'block';
                }

                if (result) {
                    if (result.error || !result.tokens?.accessToken || !result.tokens?.refreshToken || !result.user?.name || !result.user?.lastName || !result.user?.id) {
                        throw new Error(result.message);
                    }

                    Auth.setTokens(result.tokens.accessToken!, result.tokens.refreshToken!);
                    Auth.setUserInfo({
                        userName: result.user.name!,
                        userLastName: result.user.lastName!,
                        userId: result.user.id!
                    });

                    if (!result.error) {
                        location.href = '#/';
                        location.reload();
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }
    }
}