import config from '../../config/config';
import { Auth } from './auth';
import { Operations } from './operations';
import {RequestOptions} from "../types/request.type";


export class Exp {
    static refreshTokenKey :string = 'refreshToken';
    static refreshToken :string|null = localStorage.getItem(this.refreshTokenKey);

    public static async getExpense(): Promise<any> {
        if (this.refreshToken) {
            const response :Response = await fetch(`${config.host}/categories/expense`, RequestOptions[]);

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

    public static async getExpenseOne(id: number): Promise<any> {
        if (this.refreshToken) {
            const response :Response = await fetch(`${config.host}/categories/expense/${id}`, RequestOptions[]);

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

    public static async editExpense(itemId: string, value: string): Promise<Response> {
        if (this.refreshToken) {
            const response :Response = await fetch(`${config.host}/categories/expense/${itemId}`,  RequestOptions[]);
            return response;
        }
        throw new Error('Refresh token is not available.');
    }

    public static async deleteExpense(itemId: string): Promise<void> {
        if (this.refreshToken) {
            await fetch(`${config.host}/categories/expense/${itemId}`,  RequestOptions[]);

            const operations = await Operations.getOperations('all');
            const filteredOperations = operations.filter((operation: any) => operation.category === undefined);

            for (const operation of filteredOperations) {
                await Operations.deleteOperations(operation.id);
            }
        }
    }

    public static async createExpense(value: string): Promise<Response> {
        if (this.refreshToken) {
            const response :Response = await fetch(`${config.host}/categories/expense`,  RequestOptions[]);
            return response;
        }
        throw new Error('Refresh token is not available.');
    }
}