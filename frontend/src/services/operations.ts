import config from '../../config/config';

export class Operations {
    static refreshTokenKey: string = 'refreshToken';
    static refreshToken: string | null = localStorage.getItem(this.refreshTokenKey);

    static async getOperations(period?: string, dateFrom?: string, dateTo?: string): Promise<any> {
        if (this.refreshToken) {
            let url :string = config.host + '/operations';
            if (dateFrom && dateTo && period) {
                url += `?period=${encodeURIComponent(period)}&dateFrom=${encodeURIComponent(dateFrom)}&dateTo=${encodeURIComponent(dateTo)}`;
            } else if (period) {
                url += `?period=${encodeURIComponent(period)}`;
            }

            const response :Response = await fetch(url, {
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
        }
        return null;
    }

    static async editOperations(itemId: string, value: any): Promise<Response> {
        if (this.refreshToken) {
            const response :Response = await fetch(`${config.host}/operations/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                    'x-auth-token': this.refreshToken,
                },
                body: JSON.stringify(value),
            });
            return response;
        }
        throw new Error('Refresh token is not available.');
    }

    static async getOperation(itemId: string | null): Promise<any> {
        if (this.refreshToken) {
            const response :Response = await fetch(`${config.host}/operations/${itemId}`, {
                method: 'GET',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                    'x-auth-token': this.refreshToken,
                },
            });

            if (response && response.status === 200) {
                const result = await response.json();
                if (result && !result.error) {
                    return result;
                }
            }
        }
        return null;
    }

    static async createOperations(value: any): Promise<Response> {
        if (this.refreshToken) {
            const response :Response = await fetch(`${config.host}/operations`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                    'x-auth-token': this.refreshToken,
                },
                body: JSON.stringify(value),
            });
            return response;
        }
        throw new Error('Refresh token is not available.');
    }

    static async deleteOperations(id: string): Promise<Response> {
        if (this.refreshToken) {
            const response: Response = await fetch(`${config.host}/operations/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                    'x-auth-token': this.refreshToken,
                },
            });
            return response;
        }
        throw new Error('Refresh token is not available.');
    }
}