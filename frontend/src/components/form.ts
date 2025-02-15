import { CustomHttp } from "../services/custom-http";
import { Auth } from "../services/auth";
import config from "../../config/config";
import { FieldsForm } from "../types/form.type";
import {ResponseData} from "../types/responseData.type";

export class Form {
  private rememberMe: boolean;
  private processElement: HTMLElement | null;
  private pass: HTMLInputElement | null;
  private fields!: FieldsForm[];
  private agreeElement?: HTMLInputElement | null;

  constructor(private page: string) {
    this.rememberMe = false;
    this.processElement = null;
    this.pass = document.getElementById("password") as HTMLInputElement;
    const accessToken: string | null = localStorage.getItem(
      Auth.accessTokenKey
    );
    if (accessToken) {
      location.href = "#/";
      return;
    }

    this.fields = [
      {
        name: "email",
        id: "email",
        element: null,
        regex: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        valid: false,
      },
      {
        name: "password",
        id: "password",
        element: null,
        regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
        valid: false,
      },
    ];

    if (page === "signup") {
      this.fields.unshift(
        {
          name: "fullName",
          id: "fullName",
          element: null,
          regex: /^([А-Я][а-я]{3,11}) ([А-Я][а-я]{3,11})$/,
          valid: false,
        },
        {
          name: "repeatPassword",
          id: "repeatPassword",
          element: null,
          regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
          valid: false,
        }
      );
    }

    this.fields.forEach((item: FieldsForm): void => {
      item.element = document.getElementById(item.id) as HTMLInputElement;

      item.element.onchange = (): void => {
        this.validateField(item, item.element);
      };
    });

    this.processElement = document.getElementById("process");
    if (this.processElement) {
      this.processElement.onclick = (): void => {
        this.processForm();
      };
    }
    if (page === "login") {
      const agreeElement: HTMLElement|null = document.getElementById("agree");

      if (agreeElement instanceof HTMLInputElement) {
        this.agreeElement = agreeElement;

        this.agreeElement.onchange = (): void => {
          if (this.agreeElement) {
            this.rememberMe = this.agreeElement.checked;
          }
        };
      }
    }

    if (page === "login" && localStorage.getItem("email")) {
      const email: FieldsForm|undefined = this.fields.find((item: FieldsForm): boolean => item.name === "email");
      email!.element!.value = localStorage.getItem("email")!;
      if (email!.element!.value.match(email!.regex)) {
        email!.valid = true;
      }
    }
  }

  private validElement(element: HTMLInputElement): void {
    const parentNode: ParentNode|null = element.parentNode;
    if (parentNode instanceof HTMLElement) {
      parentNode.style.border = "2px solid red";
      parentNode.style.borderRadius = "7px";
      if (
        parentNode.firstElementChild instanceof HTMLElement &&
        parentNode.firstElementChild.firstElementChild instanceof HTMLElement &&
        parentNode.firstElementChild.firstElementChild
          .firstElementChild instanceof HTMLElement
      ) {
        parentNode.firstElementChild!.firstElementChild!.firstElementChild!.style.fill =
          "red";
      }
      if (parentNode.nextElementSibling instanceof HTMLElement) {
        parentNode.nextElementSibling!.style.display = "block";
      }
    }
  }

  private validateField(
    field: FieldsForm,
    element: HTMLInputElement | null
  ): void {
    if (element) {
      const parentNode: HTMLElement = element.parentNode as HTMLElement;

      if (!element.value || !element.value.match(field.regex)) {
        this.validElement(element);
        field.valid = false;
      } else if (
        element.id === "repeatPassword" &&
        element.value !== this.pass!.value
      ) {
        this.validElement(element);
        field.valid = false;
      } else {
        parentNode.removeAttribute("style");

        const firstChild: HTMLElement = parentNode.firstElementChild! as HTMLElement;
        const secondChild: HTMLElement = firstChild.firstElementChild! as HTMLElement;
        const thirdChild: HTMLElement = secondChild.firstElementChild! as HTMLElement;
        thirdChild.removeAttribute("style");

        if (parentNode.nextElementSibling) {
          (parentNode.nextElementSibling as HTMLElement).style.display = "none";
        }

        field.valid = true;
      }
    }

    this.validateForm();
  }

  private validateForm(): boolean {
    const validForm: boolean = this.fields.every((item: FieldsForm) => item.valid);
    if (validForm) {
      this.processElement!.removeAttribute("disabled");
    } else {
      this.processElement!.setAttribute("disabled", "disabled");
    }
    return validForm;
  }

  private async processForm(): Promise<void> {
    if (this.validateForm()) {
      const email: string = this.fields.find((item: FieldsForm): boolean => item.name === "email")!
        .element!.value;
      const password: string = this.fields.find(
        (item: FieldsForm): boolean => item.name === "password"
      )!.element!.value;
      const er: HTMLElement | null = document.getElementById("has-user-error");

      if (this.page === "signup") {
        try {
          const result: ResponseData|null = await CustomHttp.request(
            `${config.host}/signup`,
            "POST",
            {
              name: this.fields
                .find((item) => item.name === "fullName")!
                .element!.value.split(" ")[0],
              lastName: this.fields
                .find((item) => item.name === "fullName")!
                .element!.value.split(" ")[1],
              email: email,
              password: password,
              passwordRepeat: this.fields.find(
                (item: FieldsForm): boolean => item.name === "repeatPassword"
              )!.element!.value,
            }
          );

          if (result) {
            if (result.error || !result.user) {
                throw new Error(result.error ?? "Unknown error");
            }
        }
        } catch (error) {
          er!.style.display = "block";
          console.log(error);
        }
      }

      try {
        const result: ResponseData|null = await CustomHttp.request(
          `${config.host}/login`,
          "POST",
          {
            email: email,
            password: password,
            rememberMe: this.rememberMe,
          }
        );

        if (this.rememberMe) {
          localStorage.setItem("rememberMe", JSON.stringify(this.rememberMe));
          localStorage.setItem("email", email);
        }

        if (result) {
          er!.style.display = "block";
        }

        if (result) {
          if (
            result.error ||
            !result.tokens?.accessToken ||
            !result.tokens?.refreshToken ||
            !result.user?.name ||
            !result.user?.lastName ||
            !result.user?.id
          ) {
            throw new Error(result.message);
          }

          Auth.setTokens(
            result.tokens.accessToken!,
            result.tokens.refreshToken!
          );
          Auth.setUserInfo({
            userName: result.user.name!,
            userLastName: result.user.lastName!,
            userId: result.user.id!,
          });

          if (!result.error) {
            location.href = "#/";
            location.reload();
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
}
