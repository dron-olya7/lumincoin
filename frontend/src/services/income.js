import config from "../../config/config.js";
import {Auth} from "./auth";
import {Operations} from "./operations"; 

export class Inc {
    static refreshTokenKey = 'refreshToken';
    static refreshToken = localStorage.getItem(this.refreshTokenKey);


    static async getIncome() {
        if (this.refreshToken) {
            const response = await fetch(config.host + '/categories/income', {
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
            await Auth.refreshFunc(response, Inc.getIncome())
        }
    }

    static async getIncomeOne(id) {
        if (this.refreshToken) {
            const response = await fetch(config.host + '/categories/income/' + id, {
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
            await Auth.refreshFunc(response, Inc.getIncomeOne(id))
        }
    }


    static async editIncome(itemId, value) {
        if (this.refreshToken) {
            const response = await fetch(config.host + '/categories/income/' + itemId, {
                method: 'PUT',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                    'x-auth-token': this.refreshToken,
                },
                body: JSON.stringify({title: value})
            });
        }
    }

    static async deleteIncome(itemId) {
        if (this.refreshToken) {
            await fetch(config.host + '/categories/income/' + itemId, {
                method: 'DELETE',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                    'x-auth-token': this.refreshToken,
                },
            });
            const operations = await Operations.getOperations('all');   

            const filteredOperations = operations.filter(operation => operation.category === undefined);
            
            for(const operation of filteredOperations) {
                await Operations.deleteOperations(operation.id);
            }
        }
    }

    static async createIncome(value) {
        if (this.refreshToken) {
            await fetch(config.host + '/categories/income', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                    'x-auth-token': this.refreshToken,
                },
                body: JSON.stringify({title: value})
            });
        }
    }

}