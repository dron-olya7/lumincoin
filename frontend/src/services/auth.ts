import config from "../../config/config";

export class Auth {
    static accessTokenKey: string = 'accessToken';
    static refreshTokenKey: string = 'refreshToken';
    static userInfoKey: string = 'userInfo';
    static refreshToken: string | null = localStorage.getItem(this.refreshTokenKey);

    private static async processUnauthorizedResponse(): Promise<boolean> {
        const loginPage: HTMLElement | null = document.getElementById('has-user-error');
        if (this.refreshToken) {
            const response: Response = await fetch(config.host + '/refresh', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ refreshToken: this.refreshToken })
            });
            if (response && response.status === 200) {
                const result: any = await response.json();
                if (result && !result.error) {
                    this.setTokens(result.accessToken, result.refreshToken);
                    return true;
                }
            }
        }
        if (location.hash === '#/login') {
            if (loginPage) loginPage.style.display = 'block';
        } else {
            this.removeTokens();
            location.href = '#/login';
        }
        return false;
    }

    public static async logout(): Promise<boolean | undefined> {
        if (this.refreshToken) {
            const response: Response = await fetch(config.host + '/logout', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ refreshToken: this.refreshToken })
            });
            if (response && response.status === 200) {
                const result: any = await response.json();
                if (result && !result.error) {
                    Auth.removeTokens();
                    localStorage.removeItem(Auth.userInfoKey);
                    return true;
                }
            }
        }
    }

    public static async refreshFunc(response: Response, func: () => Promise<any>): Promise<any> {
        if (response.status < 200 || response.status >= 300) {
            if (response.status === 401) {
                const result: boolean = await Auth.processUnauthorizedResponse();
                if (result) {
                    return await func();
                } else {
                    return null;
                }
            }
            throw new Error(response.statusText);
        }
    }

    public static setTokens(accessToken: string, refreshToken: string): void {
        localStorage.setItem(this.accessTokenKey, accessToken);
        localStorage.setItem(this.refreshTokenKey, refreshToken);
    }

    private static removeTokens(): void {
        localStorage.removeItem(this.accessTokenKey);
        localStorage.removeItem(this.refreshTokenKey);
    }

    public static setUserInfo(info: any): void {
        localStorage.setItem(this.userInfoKey, JSON.stringify(info));
    }

    public static getUserInfo(): any | null {
        const userInfo: string | null = localStorage.getItem(this.userInfoKey);
        if (userInfo) {
            return JSON.parse(userInfo);
        }
        return null;
    }
}

