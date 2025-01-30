import config from "../../config/config.js";


export class Operations {
    static refreshTokenKey = 'refreshToken';
    static refreshToken = localStorage.getItem(this.refreshTokenKey);


    static async getOperations(period, dateFrom, dateTo) {
        if (this.refreshToken) {
            if (dateFrom && dateTo && period) {
                const response = await fetch(config.host + '/operations' + '?period=' + period + '&dateFrom=' + dateFrom + '&dateTo=' + dateTo, {
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
            }else if (period) {
                const response = await fetch(config.host + '/operations' + '?period=' + period, {
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
    static async editOperations(itemId, value) {
        if (this.refreshToken) {
            const response = await fetch(config.host + '/operations/' + itemId, {
                method: 'PUT',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                    'x-auth-token': this.refreshToken,
                },
                body: JSON.stringify(value)
            });
        }
    }
    static async getOperation(itemId) {
        if (this.refreshToken) {
            const response = await fetch(config.host + '/operations/' + itemId, {
                method: 'GET',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
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
    static async createOperations(value) {
        if (this.refreshToken) {
            await fetch(config.host + '/operations', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                    'x-auth-token': this.refreshToken,
                },
                body: JSON.stringify(value)
            });
        }
    }
    static async deleteOperations(id) {
        if (this.refreshToken) {
            await fetch(config.host + '/operations/' + id, {
                method: 'DELETE',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                    'x-auth-token': this.refreshToken,
                },
            });
          
        }
    }
}