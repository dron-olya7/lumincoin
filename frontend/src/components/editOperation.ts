import { Operations } from "../services/operations";
import { Exp } from "../services/expense";
import { Inc } from "../services/income";
import { CategoryType } from "../types/category.type";
import { BudgetItem } from "../types/budgetItem.type";
import {ApiResponseType} from "../types/apiResponse.type";
import {IncomeResponse} from "../types/incomeResponse.type";
import {OperationType} from "../types/operation.type";

export class EditOperation {
  type: HTMLSelectElement;
  operationId: string | null;
  categoryId: number | null;
  operation: Operations | null;
  category: CategoryType[] | null;

  constructor() {
    this.type = document.getElementById("type") as HTMLSelectElement;
    this.operationId = localStorage.getItem("operationId");
    this.categoryId = null;
    this.operation = {};
    this.category = [];
    this.init();
  }

  private async init(): Promise<void> {
    let budgetLink: HTMLElement | null = document.getElementById("budget-link");
    if (budgetLink) {
      budgetLink.classList.add("active");
    }
    this.operation = await Operations.getOperation(this.operationId);
    if (this.operation === null) {
      console.error("Операция не найдена.");
      return;
    }

    await this.addValueInput(this.operation);
    await this.addValueInput(this.operation);
  }

  private async getCategory(): Promise<void> {
    if (this.type.value === "expense") {
      const response: ApiResponseType|null = await Exp.getExpense();
      if (response !== null) {
        const cat: CategoryType[] = response as CategoryType[];
        this.category = cat;
      }
    } else if (this.type.value === "income") {
      const response: IncomeResponse = await Inc.getIncome();
      if (response !== null) {
        const cat: CategoryType[] = response as CategoryType[];
        this.category = cat;
      }
    }

    const category: HTMLSelectElement = document.getElementById("category") as HTMLSelectElement;
    category.innerHTML = "";
    this.category?.forEach((item: CategoryType): void => {
      const option: HTMLOptionElement = document.createElement("option");
      option.setAttribute("value", item.title);
      option.setAttribute("id", String(item.id));
      option.textContent = item.title;
      category.appendChild(option);
    });
  }

  private async addValueInput(item: BudgetItem): Promise<void> {
    if (!item) {
      return;
    }

    const amount: HTMLInputElement = document.getElementById(
      "amount"
    ) as HTMLInputElement;
    const date: HTMLInputElement = document.getElementById(
      "date"
    ) as HTMLInputElement;
    const comment: HTMLTextAreaElement = document.getElementById(
      "comment"
    ) as HTMLTextAreaElement;
    const btnSave: HTMLButtonElement = document.getElementById(
      "btn-save"
    ) as HTMLButtonElement;
    const btnCancel: HTMLButtonElement = document.getElementById(
      "btn-cancel"
    ) as HTMLButtonElement;
    const servErr: HTMLElement = document.getElementById(
      "input-server-error"
    ) as HTMLElement;
    const operations: OperationType[] = await Operations.getOperations("all");

    for (const el of this.type.options) {
      if (el.value === item.type) {
        el.setAttribute("selected", "selected");
      }
    }

    await this.getCategory();

    for (const el of this.type.options) {
      if (el.value === item.type) {
        el.setAttribute("selected", "selected");
      }
    }

    const category: HTMLSelectElement = document.getElementById(
      "category"
    ) as HTMLSelectElement;
    category.value = item.category ?? "";
    amount.value = (item.amount ?? 0).toString();
    date.value = item.date instanceof Date ? item.date.toISOString() : (item.date ?? "");
    comment.value = item.comment ?? "";

    if (comment.value === " ") {
      comment.value = "";
    }

    const selectedOption: HTMLOptionElement = category.options[category.selectedIndex];
    const idAttr: string|null = selectedOption.getAttribute("id");

    if (idAttr !== null) {
      this.categoryId = parseInt(idAttr);
    } else {
      console.warn("Атрибут 'id' не найден у опции выбора категории.");
    }

    amount.onchange = (): void => {
      valid();
    };

    amount.oninput = (): void => {
      amount.value = amount.value.replace(/[^\d]/g, "");
      if (amount.value.startsWith("0")) {
        amount.value = amount.value.slice(1);
      }
    };

    date.onchange = (): void => {
      valid();
    };

    if (!this.type.value) {
      category.disabled = true;
    }

    function valid(): void {
      if (category.value && date.value && amount.value) {
        btnSave.disabled = false;
        servErr.style.display = "none";
      } else {
        btnSave.disabled = true;
      }
    }

    category.onchange = (): void => {
      const selectedOption: HTMLOptionElement = category.options[category.selectedIndex];
      const idAttr: string|null = selectedOption.getAttribute("id");

      if (idAttr !== null) {
        this.categoryId = parseInt(idAttr);
      } else {
        console.warn("Атрибут 'id' не найден у опции выбора категории.");
      }
    };

    this.type.onchange = (): void => {
      this.getCategory();
    };

    btnSave.onclick = (): void => {
      if (comment.value === "") {
        comment.value = " ";
      }
      if (
        operations.some(
          (i: OperationType) =>
            i.amount === Number(amount.value) &&
            i.category === category.value &&
            i.comment === comment.value &&
            i.date === date.value &&
            i.type === (this.type.value as "income" | "expense")
        )
      ) {
        servErr.style.display = "block";
      } else {
        Operations.editOperations(`${this.operationId}`, {
          type: this.type.value as "income" | "expense",
          amount: Number(amount.value),
          date: date.value,
          comment: comment.value,
          category: this.categoryId ? this.categoryId.toString() : undefined,
        });
        location.hash = "/budget";
      }
      localStorage.removeItem("operationId");
    };
    btnCancel.onclick = (): void => {
      location.hash = "/budget";
      localStorage.removeItem("operationId");
    };
  }
}
