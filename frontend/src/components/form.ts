import {CustomHttp} from "../services/custom-http";
import {Auth} from "../services/auth";
import config from "../../config/config";
import {SidebarUtils} from "../services/sidebar-utils";
import {FormFieldType} from "../types/form-field.type";
import {ResponseDefaultType} from "../types/response-default.type";
import {ResponseSignupType} from "../types/response-signup.type";
import {ResponseLoginType} from "../types/response-login.type";

export class Form {
    private readonly nav: HTMLElement | null
    private readonly page: 'signup' | 'login'
    private readonly agreeElement: HTMLElement | null
    private readonly processElement: HTMLElement | null
    private fields: FormFieldType[]

    constructor(page: 'signup' | 'login') {
        this.nav = document.getElementById('nav');
        if (this.nav) {
            window.location.reload()
        }
        new SidebarUtils();
        this.page = page;
        this.agreeElement = null;
        this.processElement = null;
        this.fields = []
        const accessToken: string | null = localStorage.getItem(Auth.accessTokenKey);
        if (accessToken) {
            location.href = '#/main';
            return;
        }
        this.fields = [
            {
                name: "email",
                id: "form_email",
                element: null,
                regex: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                valid: false,
            },
            {
                name: "password",
                id: "form_password",
                element: null,
                regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d{8})[a-zA-Z0-9]{0,30}$/,
                valid: false,
            },
        ];

        if (this.page === 'signup') {
            this.fields.unshift({
                name: "fullName",
                id: "form_fullName",
                element: null,
                regex: /^([А-ЯЁ][а-яё]+[\-\s]?){3,}$/,
                valid: false,
            });
            this.fields.push({
                name: "passwordTwo",
                id: "form_passwordTwo",
                element: null,
                regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d{8})[a-zA-Z0-9]{0,30}$/,
                valid: false,
            });
        }

        const that: Form = this;
        this.fields.forEach((item: FormFieldType): void => {
            item.element = document.getElementById(item.id) as HTMLInputElement;
            if (item.element) item.element.onchange = function (): void {
                that.validateField.call(that, item, <HTMLInputElement>this);
            };
        });
        this.processElement = document.getElementById("process");
        if (this.processElement) {
            this.processElement.onclick = function () {
                that.processForm();
            };
        }
        if (this.page === 'login') {
            this.agreeElement = document.getElementById("form_agree");
            // this.agreeElement.onchange = function () {
            //     that.validateForm();
            // };
            that.validateForm();

        }
    }

    private validateField(field: FormFieldType, element: HTMLInputElement): void {
        if (!element.value || !element.value.match(field.regex)) {
            element.classList.add('border-danger');
            field.valid = false;
        } else {
            element.classList.remove('border-danger');
            field.valid = true;
        }
        this.validateForm();
    }

    private validateForm(): boolean {
        const validForm: boolean = this.fields.every((item: FormFieldType) => item.valid);
        const isValid: boolean = validForm;
        if (this.processElement) {
            if (isValid) {
                this.processElement.removeAttribute("disabled");
            } else {
                this.processElement.setAttribute("disabled", "disabled");
            }
        }
        return isValid;
    }

    private async processForm(): Promise<void> {
        if (this.validateForm()) {
            const email: string | undefined = this.fields.find((item: FormFieldType): boolean => item.name === 'email')?.element?.value;
            const password: string | undefined = this.fields.find((item: FormFieldType): boolean => item.name === 'password')?.element?.value;

            if (this.page === 'signup') {
                const fullName: string | undefined = this.fields.find((item: FormFieldType): boolean => item.name === 'fullName')?.element?.value;
                let name: string
                let lastName: string
                if (fullName) {
                    name = fullName.split(" ").slice(0, 2).join(' ');
                    lastName = fullName.split(" ")[2];

                    const passwordRepeat: string | undefined = this.fields.find((item: FormFieldType): boolean => item.name === 'passwordTwo')?.element?.value;
                    try {
                        const result: ResponseDefaultType | ResponseSignupType = await CustomHttp.request(config.host + '/signup', 'POST', {
                            name: name,
                            lastName: lastName,
                            email: email,
                            password: password,
                            passwordRepeat: passwordRepeat
                        });
                        if (result) {
                            if ((result as ResponseDefaultType).error || !(result as ResponseSignupType).user) {
                                throw new Error((result as ResponseDefaultType).message);
                            }
                        }
                    } catch (error) {
                        return console.log(error);
                    }
                }
            }
            if (email && password) await this.login(email, password);
        }
    }

    private async login(email: string, password: string): Promise<void> {
        try {
            const result: ResponseLoginType | ResponseDefaultType = await CustomHttp.request(config.host + '/login', 'POST', {
                email: email,
                password: password
            });
            if (result) {
                if ((result as ResponseDefaultType).error) {
                    throw new Error((result as ResponseDefaultType).message);
                }
                // if (this.agreeElement.checked) {
                //     // create user session?
                // }
                Auth.setTokens((result as ResponseLoginType).tokens.accessToken, (result as ResponseLoginType).tokens.refreshToken);
                Auth.setUserInfo({
                    fullName: (result as ResponseLoginType).user.name.split(' ')[0] + ' ' + (result as ResponseLoginType).user.lastName,
                    userId: (result as ResponseLoginType).user.id,

                    userEmail: email
                });
                location.href = '#/main';
            }
        } catch (error) {
            console.log(error);
        }
    }
}