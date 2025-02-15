import config from '../../config/config';
import { Auth } from './auth';
import { Operations } from './operations';
import {OperationType} from "../types/operation.type";
import { ApiResponseType } from '../types/apiResponse.type';

export class Exp {
    static refreshTokenKey: string = 'refreshToken';
    static refreshToken: string|null = localStorage.getItem(this.refreshTokenKey);

    public static async getExpense(): Promise<ApiResponseType| null> {
        if (!this.refreshToken) {
            console.warn('Отсутствует токен для запроса');
            return null;
        }

        try {
            const response: Response = await fetch(`${config.host}/categories/expense`, {
                method: 'GET',
                headers: {
                    'x-auth-token': this.refreshToken,
                },
            });

            if (response.ok) {
                const result: ApiResponseType = await response.json();
                if (!result.error) {
                    return result;
                }
            }
            await Auth.refreshFunc(response, Exp.getExpense);
        } catch (err) {
            console.error(err);
        }

        return null;
    }

    public static async getExpenseOne(id: number): Promise<ApiResponseType | null> {
        if (!this.refreshToken) {
            console.warn('Отсутствует токен для запроса');
            return null;
        }

        try {
            const response: Response = await fetch(`${config.host}/categories/expense/${id}`, {
                method: 'GET',
                headers: {
                    'x-auth-token': this.refreshToken,
                },
            });

            if (response.ok) {
                const result: ApiResponseType = await response.json();
                if (!result.error) {
                    return result;
                }
            }
            await Auth.refreshFunc(response, () => Exp.getExpenseOne(id));
        } catch (err) {
            console.error(err);
        }

        return null;
    }

    public static async editExpense(itemId: string, value: string): Promise<void> {
        if (!this.refreshToken) {
            throw new Error('Токен недоступен.');
        }

        try {
            await fetch(`${config.host}/categories/expense/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'x-auth-token': this.refreshToken,
                },
                body: JSON.stringify({ title: value }),
            });
        } catch (err) {
            console.error(err);
        }
    }

    public static async deleteExpense(itemId: string): Promise<void> {
        if (!this.refreshToken) {
            throw new Error('Токен недоступен.');
        }

        try {
            await fetch(`${config.host}/categories/expense/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'x-auth-token': this.refreshToken,
                },
            });

            const operations: OperationType[] = await Operations.getOperations('all');

            const filteredOperations: OperationType[] = operations.filter((operation: OperationType): boolean =>
                operation.category === undefined
            ) as OperationType[];

            for (const operation of filteredOperations) {
                const operationId: string|undefined = operation.id?.toString();
                if (operationId) {
                    await Operations.deleteOperations(operationId);
                }
            }
        } catch (err) {
            console.error(err);
        }
    }

    public static async createExpense(value: string): Promise<void> {
        if (!this.refreshToken) {
            throw new Error('Токен недоступен.');
        }

        try {
            await fetch(`${config.host}/categories/expense`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'x-auth-token': this.refreshToken,
                },
                body: JSON.stringify({ title: value }),
            });
        } catch (err) {
            console.error(err);
        }
    }
}