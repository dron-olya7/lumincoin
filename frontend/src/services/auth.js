import config from "../../config/config.js";

export class Auth {
    static accessTokenKey = 'accessToken';
    static refreshTokenKey = 'refreshToken';
    static userInfoKey = 'userInfo';
    static refreshToken = localStorage.getItem(this.refreshTokenKey);

    static async processUnauthorizedResponse() {
        const loginPage =  document.getElementById('has-user-error');
        // const refreshToken = localStorage.getItem(this.refreshTokenKey);
        if (this.refreshToken) {
            const response = await fetch(config.host + '/refresh', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({refreshToken: this.refreshToken})
            });
            if (response && response.status === 200) {
                const result = await response.json()
                if (result && !result.error) {
                    this.setTokens(result.accessToken, result.refreshToken);
                    return true
                }
            }
        }
        if (location.hash === '#/login') {
            document.getElementById('has-user-error').style.display = 'block';
            loginPage.style.display = 'block';
        } else  {
            this.removeTokens();
            location.href = '#/login';
        }
        return false;
    }

    static async logout() {
        if (this.refreshToken) {
            const response = await fetch(config.host + '/logout', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({refreshToken: this.refreshToken})
            });
            if (response && response.status === 200) {
                const result = await response.json()
                if (result && !result.error) {
                    Auth.removeTokens();
                    localStorage.removeItem(Auth.userInfoKey);
                    return true;
                }
            }
        }
    }

    static async refreshFunc (response, func) {
        if (response.status < 200 || response.status >= 300) {
            if (response.status === 401) {
                const result = await Auth.processUnauthorizedResponse();
                if (result) {
                    return await func;
                } else {
                    return null;
                }
            }
            throw new Error(response.message);
        }
    }

    static setTokens(accessToken, refreshToken) {
        localStorage.setItem(this.accessTokenKey, accessToken);
        localStorage.setItem(this.refreshTokenKey, refreshToken);
    }

    static removeTokens() {
        localStorage.removeItem(this.accessTokenKey);
        localStorage.removeItem(this.refreshTokenKey);
    }

    static setUserInfo(info) {
        localStorage.setItem(this.userInfoKey, JSON.stringify(info));
    }

    static getUserInfo() {
        const userInfo = localStorage.getItem(this.userInfoKey);
        if (userInfo) {
            return JSON.parse(userInfo);
        }
        return null
    }

}