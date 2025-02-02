import config from '../../config/config';
import { Auth } from './auth';
import { Operations } from './operations';

export class Exp {
    static refreshTokenKey :string = 'refreshToken';
    static refreshToken :string|null = localStorage.getItem(this.refreshTokenKey);

    static async getExpense(): Promise<any> {
        if (this.refreshToken) {
            const response :Response = await fetch(`${config.host}/categories/expense`, {
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

            await Auth.refreshFunc(response, Exp.getExpense);
        }
        return null;
    }

    static async getExpenseOne(id: number): Promise<any> {
        if (this.refreshToken) {
            const response :Response = await fetch(`${config.host}/categories/expense/${id}`, {
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

            await Auth.refreshFunc(response, () => Exp.getExpenseOne(id));
        }
        return null;
    }

    static async editExpense(itemId: string, value: string): Promise<Response> {
        if (this.refreshToken) {
            const response :Response = await fetch(`${config.host}/categories/expense/${itemId}`, {
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

    static async deleteExpense(itemId: string): Promise<void> {
        if (this.refreshToken) {
            await fetch(`${config.host}/categories/expense/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                    'x-auth-token': this.refreshToken,
                },
            });

            const operations = await Operations.getOperations('all');
            const filteredOperations = operations.filter((operation: any) => operation.category === undefined);

            for (const operation of filteredOperations) {
                await Operations.deleteOperations(operation.id);
            }
        }
    }

    static async createExpense(value: string): Promise<Response> {
        if (this.refreshToken) {
            const response :Response = await fetch(`${config.host}/categories/expense`, {
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