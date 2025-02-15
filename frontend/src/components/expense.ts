import { Exp } from "../services/expense";
import { Balance } from "../services/balance";
import { CategoryType } from "../types/category.type";
import { BalanceResponse } from "../types/balanceResponse.type";
import {ApiResponseType} from "../types/apiResponse.type";

export class Expense {
  title: HTMLElement;
  content: HTMLElement;
  wrapper: HTMLElement;
  categorysExpense: CategoryType[];

  constructor() {
    this.title = document.getElementById("content-title") as HTMLElement;
    this.content = document.getElementById("content-items") as HTMLElement;
    this.wrapper = document.getElementById("wrapper") as HTMLElement;
    this.categorysExpense = [];
    this.init();
    this.expenseCreateField(this.categorysExpense);
    this.createExpense();
  }

  private async init(): Promise<void> {
    document.getElementById("expense-link")!.classList.add("active");
    document
      .getElementById("category-link")!
      .setAttribute("aria-expanded", "true");
    document.getElementById("account-collapse")!.classList.add("show");
    this.title.innerText = "Расходы";

    const response: ApiResponseType|null = await Exp.getExpense();
    if (response && Array.isArray(response.data)) {
      this.categorysExpense = response.data as CategoryType[];
    } else {
      this.categorysExpense = [];
    }

    this.expenseCreateField(this.categorysExpense);
  }

  private expenseCreateField(el: CategoryType[]): void {
    if (this.categorysExpense.length === 0) {
      return;
    }

    el.forEach((item: CategoryType): void => {
      const contentItemElement: HTMLDivElement = document.createElement("div");
      contentItemElement.className = "content-item";

      const itemNameElement: HTMLDivElement = document.createElement("div");
      itemNameElement.className = "item-name";
      itemNameElement.innerText = item.title;

      const itemButtonsElement: HTMLDivElement = document.createElement("div");
      itemButtonsElement.className = "item-btns";
      itemButtonsElement.innerHTML = `
                                   <div class="item-btn">
                                    <button class="btn btn-edit bg-primary" id=btn-edit-${item.id}>
                                        Редактировать
                                    </button> </div>
                                    <div class="item-btn">
                                        <button class="btn bg-danger btn-delete" id="btn-delete-${item.id}">
                                            Удалить
                                        </button>
                                    </div>`;

      contentItemElement.appendChild(itemNameElement);
      contentItemElement.appendChild(itemButtonsElement);

      const contentItemsEl: HTMLElement = document.getElementById("content-items")!;
      const createItemEl: HTMLElement = document.getElementById("create-item")!;

      contentItemsEl.insertBefore(contentItemElement, createItemEl);

      const btnEdit: HTMLElement = document.getElementById(`btn-edit-${item.id}`)!;
      const btnDelete: HTMLElement = document.getElementById(`btn-delete-${item.id}`)!;

      btnEdit.onclick = () => this.editExpense(item.id);
      btnDelete.onclick = () => this.deleteExpense(item.id);
    });
  }

  private async editExpense(itemId: number): Promise<void> {
    const item: ApiResponseType|null = await Exp.getExpenseOne(itemId);
    if (!item) {
      console.error(`Категория с ID ${itemId} не найдена`);
      return;
    }

    this.title.innerText = "Редактирование категории расходов";

    this.content.innerHTML = `<div class="content-items create-edit">
                <div class="input-error" id="input-error">Введите название категории</div>
                <div class="input-error" id="input-server-error">Данная категория уже существует</div>
                <input class="content-input" maxlength="42" type="text" value="${item.title}" id="input-item-${item.id}">
        
                    <div class="item-btns">
                        <div class="item-btn">
                            <button class="btn btn-create bg-success" id="btn-create-${item.id}">
                                Сохранить
                            </button>
                        </div>
                        <div class="item-btn">
                            <button class="btn bg-danger btn-delete" id="btn-сancel-${item.id}">
                                Отмена
                            </button>
                        </div>
                    </div>
                </div>`;

    const valueInput: HTMLInputElement | null = document.getElementById(
      `input-item-${item.id}`
    ) as HTMLInputElement;

    const btnCreate: HTMLButtonElement | null = document.getElementById(
      `btn-create-${item.id}`
    ) as HTMLButtonElement;

    const btnCancel: HTMLButtonElement | null = document.getElementById(
      `btn-сancel-${item.id}`
    ) as HTMLButtonElement;

    const nonValidErrorMsg: HTMLElement | null =
      document.getElementById("input-error");

    const servErrMsg: HTMLElement | null =
      document.getElementById("input-server-error");

    if (!valueInput?.value) {
      console.log(valueInput?.value);
      btnCreate?.setAttribute("disabled", "disabled");
    }

    valueInput.oninput = (): void => {
      if (valueInput.value[0] === " ") {
        valueInput.value = "";
      }
    };

    valueInput.onchange = (): void => {
      if (this.categorysExpense.find((i: CategoryType): boolean => i.title === valueInput.value)) {
        btnCreate?.setAttribute("disabled", "disabled");
        valueInput.style.border = "2px solid red";
        servErrMsg!.style.display = "block";
      } else if (valueInput.value) {
        btnCreate?.removeAttribute("disabled");
        valueInput.style.border = "1px solid #CED4DA";
        nonValidErrorMsg!.style.display = "none";
      } else {
        btnCreate?.setAttribute("disabled", "disabled");
        valueInput.style.border = "2px solid red";
        nonValidErrorMsg!.style.display = "block";
        servErrMsg!.style.display = "none";
      }
    };

    btnCreate.onclick = () => this.editFunc((item.id ?? "").toString());
    btnCancel.onclick = () => this.cancelFunc();
  }

  private async editFunc(itemId: string): Promise<void> {
    const value: string = (
      document.getElementById(`input-item-${itemId}`)! as HTMLInputElement
    ).value
      .trim()
      .replace(/ +/g, " ");

    await Exp.editExpense(itemId, value);

    this.categorysExpense = (await Exp.getExpense()) as CategoryType[];

    this.cancelFunc();
  }

  private cancelFunc(): void {
    this.title.innerText = "Расходы";
    this.content.innerHTML = `<div class="content-item create-item" id="create-item">
            <div class="create"><span>+</span></div>
        </div>`;
    this.expenseCreateField(this.categorysExpense);
    this.createExpense();
  }

  private async deleteExpense(itemId: number): Promise<void> {
    const popupElement: HTMLDivElement = document.createElement("div");
    popupElement.className = "popup";
    popupElement.setAttribute("id", "popup");
    popupElement.innerHTML = `
    <div class="popup-block">
        <div class="popup-title">Вы действительно хотите удалить категорию? Связанные расходы будут удалены навсегда.</div>
        <div class="popup-btns">
            <div class="item-btn">
                <button class="btn btn-create bg-success" id=btn-item-delete-${itemId}>
                    Да, удалить
                </button>
            </div>
            <div class="item-btn">
                <button class="btn bg-danger btn-delete" id=btn-item-сancel-${itemId}>
                    Не удалять
                </button>
            </div>
        </div>
    </div>`;

    this.wrapper.appendChild(popupElement);

    const popup: HTMLElement | null = document.getElementById(`popup`);
    const btnItemDelete: HTMLElement | null = document.getElementById(
      `btn-item-delete-${itemId}`
    );
    const btnCancel: HTMLElement | null = document.getElementById(
      `btn-item-сancel-${itemId}`
    );

    if (btnItemDelete && btnCancel) {
      btnItemDelete.onclick = async (): Promise<void> => {
        this.content.innerHTML = "";
        await Exp.deleteExpense(String(itemId));
        const response: ApiResponseType|null = await Exp.getExpense();
        if (response) {
          this.categorysExpense = response as CategoryType[];
        } else {
          this.categorysExpense = [];
        }

        this.cancelFunc();
        popup?.remove();
        this.updateBalance();
      };

      btnCancel.onclick = (): void => {
        popup?.remove();
      };
    }
  }

  private async createExpense(): Promise<void> {
    const createElement: HTMLElement | null =
      document.getElementById("create-item");

    if (createElement) {
      createElement.onclick = (): void => {
        this.title.innerText = "Создание категории расходов";
        this.content.innerHTML = `
            <div class="content-items create-edit">
                <div class="input-error" id="input-error">Введите название категории</div>
                <div class="input-error" id="input-server-error">Данная категория уже существует</div>
                <input class="content-input" maxlength="42" type="text" id='create-item-value' placeholder="Название...">
                    <div class="item-btns">
                        <div class="item-btn">
                            <button class="btn btn-create bg-success" id="btn-item-create">
                                Создать
                            </button>
                        </div>
                        <div class="item-btn">
                            <button class="btn bg-danger btn-delete" id="btn-сancel-create">
                                Отмена
                            </button>
                        </div>
                    </div>
            </div>`;

        const valueCreate: HTMLInputElement | null = document.getElementById(
          `create-item-value`
        ) as HTMLInputElement;
        const btnCancelCreate: HTMLElement | null =
          document.getElementById(`btn-сancel-create`);
        const btnItemCreate: HTMLElement | null =
          document.getElementById(`btn-item-create`);
        const nonValid: HTMLElement | null =
          document.getElementById("input-error");
        const servErr: HTMLElement | null =
          document.getElementById("input-server-error");

        if (valueCreate && btnItemCreate) {
          if (!valueCreate.value) {
            btnItemCreate.setAttribute("disabled", "disabled");
          }

          valueCreate.oninput = (): void => {
            if (valueCreate.value[0] === " ") {
              valueCreate.value = "";
            }
          };

          valueCreate.onchange = (): void => {
            if (
              this.categorysExpense.find((i: CategoryType): boolean => i.title === valueCreate.value)
            ) {
              btnItemCreate.setAttribute("disabled", "disabled");
              if (valueCreate) valueCreate.style.border = "2px solid red";
              if (servErr) servErr.style.display = "block";
            } else if (valueCreate.value) {
              btnItemCreate.removeAttribute("disabled");
              if (valueCreate) valueCreate.style.border = "1px solid #CED4DA";
              if (nonValid) nonValid.style.display = "none";
            } else {
              btnItemCreate.setAttribute("disabled", "disabled");
              if (valueCreate) valueCreate.style.border = "2px solid red";
              if (nonValid) nonValid.style.display = "block";
              if (servErr) servErr.style.display = "none";
            }
          };

          if (btnCancelCreate && typeof this.cancelFunc === "function")
            btnCancelCreate.onclick = (): void => {
              this.cancelFunc();
            };

            if (btnItemCreate) {
                btnItemCreate.onclick = async (): Promise<void> => {
                  await Exp.createExpense(valueCreate.value.trim().replace(/ +/g, " "));
                  const response: ApiResponseType|null = await Exp.getExpense();
                  if (response) {
                    this.categorysExpense = response as CategoryType[];
                  } else {
                    this.categorysExpense = [];
                  }              
                  this.cancelFunc();
                };
              }
        }
      };
    }
  }

  private async updateBalance(): Promise<void> {
    const getBalance: BalanceResponse | null = await Balance.getBalance();
    if(getBalance){
      document.getElementById("balance")!.innerHTML = `Баланс:<span>${getBalance.balance} $</span>`;
    }
  }
}
