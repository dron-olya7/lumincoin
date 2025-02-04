import config from "../../config/config";

export class Balance {
    static refreshTokenKey :string = 'refreshToken';
    static refreshToken :string|null = localStorage.getItem(this.refreshTokenKey);


    public static async getBalance() :Promise<any> {
        if (this.refreshToken) {
            const response :Response = await fetch(config.host + '/balance', {
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