import config from '../../config/config';
import { Auth } from './auth';
import { Operations } from './operations';
import {RequestOptions} from "../types/request.type";

export class Inc {
    static refreshTokenKey: string = 'refreshToken';
    static refreshToken: string | null = localStorage.getItem(this.refreshTokenKey);
        public static async getIncome(): Promise<any> {

        if (this.refreshToken) {
            const response: Response = await fetch(`${config.host}/categories/income`,  RequestOptions);

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

    public static async getIncomeOne(id: string): Promise<any> {
        if (this.refreshToken) {
            const response :Response = await fetch(`${config.host}/categories/income/${id}`, RequestOptions[]);

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

    public static async editIncome(itemId: string, value: string): Promise<Response> {
        if (this.refreshToken) {
            const response :Response = await fetch(`${config.host}/categories/income/${itemId}`, RequestOptions[]);
            return response;
        }
        throw new Error('Refresh token is not available.');
    }

    public static async deleteIncome(itemId: string): Promise<void> {
        if (this.refreshToken) {
            await fetch(`${config.host}/categories/income/${itemId}`, RequestOptions[]);

            const operations = await Operations.getOperations('all');
            const filteredOperations = operations.filter((operation: any) :boolean => operation.category === undefined);

            for (const operation of filteredOperations) {
                await Operations.deleteOperations(operation.id);
            }
        }
    }

    public static async createIncome(value: string): Promise<Response> {
        if (this.refreshToken) {
            const response :Response = await fetch(`${config.host}/categories/income`, {RequestOptions[]);
            return response;
        }
        throw new Error('Refresh token is not available.');
    }
}