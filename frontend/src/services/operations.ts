import config from '../../config/config';
import { OperationType } from '../types/operation.type';

export class Operations {
    static refreshTokenKey: string = 'refreshToken';
    static refreshToken: string | null = localStorage.getItem(this.refreshTokenKey);

    static async getOperations(period?: string, dateFrom?: string, dateTo?: string): Promise<OperationType[]> {
        if (!this.refreshToken) {
            console.warn('Отсутствует токен для запроса');
            return [];
        }

        let url: string = `${config.host}/operations`;
        if (dateFrom && dateTo && period) {
            url += `?period=${encodeURIComponent(period)}&dateFrom=${encodeURIComponent(dateFrom)}&dateTo=${encodeURIComponent(dateTo)}`;
        } else if (period) {
            url += `?period=${encodeURIComponent(period)}`;
        }

        try {
            const response: Response = await fetch(url, {
                method: 'GET',
                headers: {
                    'x-auth-token': this.refreshToken,
                },
            });

            if (response.ok) {
                const result: OperationType[] = await response.json();
                return result;
            }

            console.error(`Error fetching operations: ${response.statusText}`);
        } catch (err) {
            console.error(err);
        }

        return [];
    }

    static async editOperations(itemId: string, value: Partial<OperationType>): Promise<Response> {
        if (!this.refreshToken) {
            throw new Error('Токен недоступен.');
        }

        try {
            const response: Response = await fetch(`${config.host}/operations/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'x-auth-token': this.refreshToken,
                },
                body: JSON.stringify(value),
            });

            return response;
        } catch (err) {
            console.error(err);
        }

        throw new Error('Не удалось отправить запрос на обновление операции.');
    }

    static async getOperation(itemId: string | null): Promise<OperationType | null> {
        if (!this.refreshToken || !itemId) {
            console.warn('Отсутствует токен или ID операции для запроса');
            return null;
        }

        try {
            const response: Response = await fetch(`${config.host}/operations/${itemId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'x-auth-token': this.refreshToken,
                },
            });

            if (response.ok) {
                const result: OperationType = await response.json();
                return result;
            }

            console.error(`Error getting operation: ${response.statusText}`);
        } catch (err) {
            console.error(err);
        }

        return null;
    }

    static async createOperations(value: {
        date: string;
        amount: number;
        comment: string;
        type: string;
        category: string
    }): Promise<Response> {
        if (!this.refreshToken) {
            throw new Error('Токен недоступен.');
        }

        try {
            const response: Response = await fetch(`${config.host}/operations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'x-auth-token': this.refreshToken,
                },
                body: JSON.stringify(value),
            });

            return response;
        } catch (err) {
            console.error(err);
        }

        throw new Error('Не удалось создать операцию.');
    }

    static async deleteOperations(id: string): Promise<Response> {
        if (!this.refreshToken) {
            throw new Error('Токен недоступен.');
        }

        try {
            const response:Response = await fetch(`${config.host}/operations/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'x-auth-token': this.refreshToken,
                },
            });

            return response;
        } catch (err) {
            console.error(err);
        }

        throw new Error('Не удалось удалить операцию.');
    }
}