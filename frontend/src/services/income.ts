import config from '../../config/config';
import { Auth } from './auth';
import { Operations } from './operations';

export class Inc {
    static refreshTokenKey :string = 'refreshToken';
    static refreshToken :string = localStorage.getItem(this.refreshTokenKey);

    static async getIncome(): Promise<any> {
        if (this.refreshToken) {
            const response :Response = await fetch(`${config.host}/categories/income`, {
                method: 'GET',
                headers: {
                    'x-auth-token': this.refreshToken,
                },
            });

            if (response && response.status === 200) {
                const result = await response.json();
                if (result && !result.error) {
                    return result;
                }
            }

            await Auth.refreshFunc(response, Inc.getIncome);
        }
        return null;
    }

    static async getIncomeOne(id: string): Promise<any> {
        if (this.refreshToken) {
            const response :Response = await fetch(`${config.host}/categories/income/${id}`, {
                method: 'GET',
                headers: {
                    'x-auth-token': this.refreshToken,
                },
            });

            if (response && response.status === 200) {
                const result = await response.json();
                if (result && !result.error) {
                    return result;
                }
            }

            await Auth.refreshFunc(response, () => Inc.getIncomeOne(id));
        }
        return null;
    }

    static async editIncome(itemId: string, value: string): Promise<Response> {
        if (this.refreshToken) {
            const response :Response = await fetch(`${config.host}/categories/income/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                    'x-auth-token': this.refreshToken,
                },
                body: JSON.stringify({ title: value }),
            });
            return response;
        }
        throw new Error('Refresh token is not available.');
    }

    static async deleteIncome(itemId: string): Promise<void> {
        if (this.refreshToken) {
            await fetch(`${config.host}/categories/income/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                    'x-auth-token': this.refreshToken,
                },
            });

            const operations = await Operations.getOperations('all');
            const filteredOperations = operations.filter((operation: any) :boolean => operation.category === undefined);

            for (const operation of filteredOperations) {
                await Operations.deleteOperations(operation.id);
            }
        }
    }

    static async createIncome(value: string): Promise<Response> {
        if (this.refreshToken) {
            const response :Response = await fetch(`${config.host}/categories/income`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                    'x-auth-token': this.refreshToken,
                },
                body: JSON.stringify({ title: value }),
            });
            return response;
        }
        throw new Error('Refresh token is not available.');
    }
}