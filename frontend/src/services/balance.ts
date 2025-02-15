import config from "../../config/config";
import { BalanceResponse } from "../types/balanceResponse.type";

export class Balance {
    static refreshTokenKey: string = 'refreshToken';
    static refreshToken: string | null = localStorage.getItem(this.refreshTokenKey);

    public static async getBalance(): Promise<BalanceResponse | null> {
        if (this.refreshToken) {
            try {
                const response: Response = await fetch(config.host + '/balance', {
                    method: 'GET',
                    headers: {
                        'x-auth-token': this.refreshToken,
                    },
                });

                if (!response || response.status !== 200) {
                    throw new Error('Failed to fetch balance');
                }

                const result: BalanceResponse = await response.json();

                if (result && !result.error) {
                    return result;
                } else {
                    console.log(result?.error);
                    return null;
                }
            } catch (error) {
                console.error(error);
                return null;
            }
        }
        return null;
    }
}