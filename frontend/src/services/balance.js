import config from "../../config/config.js";

export class Balance {
    static refreshTokenKey = 'refreshToken';
    static refreshToken = localStorage.getItem(this.refreshTokenKey);


    static async getBalance() {
        if (this.refreshToken) {
            const response = await fetch(config.host + '/balance', {
                method: 'GET',
                headers: {
                    'x-auth-token': this.refreshToken,
                },
            });
            if (response && response.status === 200) {
                const result = await response.json()
                if (result && !result.error) {
                    return result;
                }
            }
        }
    }
}