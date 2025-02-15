import config from "../../config/config";
import { FetchOptions } from "../types/fetchOptions.type";
import { IncomeResponse } from "../types/incomeResponse.type";
import { OperationType } from "../types/operation.type";
import { Auth } from "./auth";
import { Operations } from "./operations";

export class Inc {
  private static readonly refreshTokenKey: string = "refreshToken";
  private static refreshToken: string | null = localStorage.getItem(
    this.refreshTokenKey
  );

  private static async makeRequest(
    url: string,
    options: FetchOptions
  ): Promise<IncomeResponse> {
    const response: Response = await fetch(config.host + url, options);

    if (response.ok) {
      const result = await response.json();
      return result as IncomeResponse;
    } else if (response.status === 401) {
      await Auth.refreshFunc(response, () => this.makeRequest(url, options));
      return this.makeRequest(url, options);
    } else {
      throw new Error(`HTTP error ${response.status}`);
    }
  }

  public static async getIncome(): Promise<IncomeResponse> {
    if (!this.refreshToken) {
      throw new Error("No refresh token found");
    }

    try {
      const response: IncomeResponse = await this.makeRequest("/categories/income", {
        method: "GET",
        headers: {
          "x-auth-token": this.refreshToken,
        },
      });

      if (response && !response.error) {
        return response;
      } else {
        throw new Error("Server returned an error");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
        throw error;
      } else {
        console.error(`Unknown error: ${JSON.stringify(error)}`);
        throw new Error(`Unknown error: ${JSON.stringify(error)}`);
      }
    }
  }

  public static async getIncomeOne(id: number): Promise<IncomeResponse> {
    if (!this.refreshToken) {
      throw new Error("No refresh token found");
    }

    try {
      const response: IncomeResponse = await this.makeRequest(`/categories/income/${id}`, {
        method: "GET",
        headers: {
          "x-auth-token": this.refreshToken,
        },
      });

      if (response && !response.error) {
        return response;
      } else {
        throw new Error("Server returned an error");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
        throw error;
      } else {
        console.error(`Unknown error: ${JSON.stringify(error)}`);
        throw new Error(`Unknown error: ${JSON.stringify(error)}`);
      }
    }
  }

  public static async editIncome(itemId: number, value: string): Promise<void> {
    if (!this.refreshToken) {
      throw new Error("No refresh token found");
    }

    try {
      await this.makeRequest(`/categories/income/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
          Accept: "application/json",
          "x-auth-token": this.refreshToken,
        },
        body: JSON.stringify({ title: value }),
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
        throw error;
      } else {
        console.error(`Unknown error: ${JSON.stringify(error)}`);
        throw new Error(`Unknown error: ${JSON.stringify(error)}`);
      }
    }
  }

  public static async deleteIncome(itemId: number): Promise<void> {
    if (!this.refreshToken) {
      throw new Error("No refresh token found");
    }

    try {
      await this.makeRequest(`/categories/income/${itemId}`, {
        method: "DELETE",
        headers: {
          "Content-type": "application/json",
          Accept: "application/json",
          "x-auth-token": this.refreshToken,
        },
      });

      const operations: OperationType[] = await Operations.getOperations("all");

      const filteredOperations: OperationType[] = operations.filter(
        (operation:OperationType): boolean => operation.category === undefined
      ) as OperationType[];

      for (const operation of filteredOperations) {
        const operationId: string|undefined = operation.id?.toString();
        if (operationId) {
            await Operations.deleteOperations(operationId);
        }
    }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
        throw error;
      } else {
        console.error(`Unknown error: ${JSON.stringify(error)}`);
        throw new Error(`Unknown error: ${JSON.stringify(error)}`);
      }
    }
  }

  public static async createIncome(value: string): Promise<void> {
    if (!this.refreshToken) {
      throw new Error("No refresh token found");
    }

    try {
      await this.makeRequest("/categories/income", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          Accept: "application/json",
          "x-auth-token": this.refreshToken,
        },
        body: JSON.stringify({ title: value }),
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
        throw error;
      } else {
        console.error(`Unknown error: ${JSON.stringify(error)}`);
        throw new Error(`Unknown error: ${JSON.stringify(error)}`);
      }
    }
  }
}
