import {CustomHttp} from "../services/custom-http";
import {Auth} from "../services/auth";
import config from "../../config/config";
import {SidebarUtils} from "../services/sidebar-utils";

export class Form {

    constructor(page) {
        this.nav = document.getElementById('nav');
        if (this.nav) {
     window.location.reload()
        }
        new SidebarUtils();
        this.page = page;
        this.agreeElement = null;
        this.processElement = null;
        const accessToken = localStorage.getItem(Auth.accessTokenKey);
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

        const that = this;
        this.fields.forEach(item => {
            item.element = document.getElementById(item.id);
            item.element.onchange = function () {
                that.validateField.call(that, item, this);
            };
        });
        this.processElement = document.getElementById("process");
        this.processElement.onclick = function () {
            that.processForm();
        };
        if (this.page === 'login') {
            this.agreeElement = document.getElementById("form_agree");
            // this.agreeElement.onchange = function () {
            //     that.validateForm();
            // };
            that.validateForm();

        }
    }

    validateField(field, element) {
        if (!element.value || !element.value.match(field.regex)) {
            element.classList.add('border-danger');
            field.valid = false;
        } else {
            element.classList.remove('border-danger');
            field.valid = true;
        }
        this.validateForm();
    }

    validateForm() {

        const validForm = this.fields.every(item => item.valid);
        const isValid = validForm;
        if (isValid) {
            this.processElement.removeAttribute("disabled");
        } else {
            this.processElement.setAttribute("disabled", "disabled");
        }
        return isValid;
    }

    async processForm() {
        if (this.validateForm()) {
            const email = this.fields.find(item => item.name === 'email').element.value;
            const password = this.fields.find(item => item.name === 'password').element.value;

            if (this.page === 'signup') {
                const fullName = this.fields.find(item => item.name === 'fullName').element.value;
                const name = fullName.split(" ").slice(0, 2).join(' ');
                const lastName = fullName.split(" ")[2];
                const passwordRepeat = this.fields.find(item => item.name === 'passwordTwo').element.value;
                try {
                    const result = await CustomHttp.request(config.host + '/signup', 'POST', {
                        name: name,
                        lastName: lastName,
                        email: email,
                        password: password,
                        passwordRepeat: passwordRepeat
                    });
                    if (result) {
                        if (result.error || !result.user) {
                            throw new Error(result.message);
                        }
                       // await this.login(email, password);
                    }
                } catch (error) {
                    return console.log(error);
                }
            }
          await  this.login(email,password);
        }
    }

    async login(email, password) {
        try {
            const result = await CustomHttp.request(config.host + '/login', 'POST', {
                email: email,
                password: password
            });
            if (result) {
                if (result.error) {
                    throw new Error(result.message);
                }
                // if (this.agreeElement.checked) {
                //     // create user session?
                // }
                Auth.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
                Auth.setUserInfo({
                    fullName: result.user.name.split(' ')[0] + ' ' + result.user.lastName,
                    userId: result.user.id,
                    userEmail: email
                });
                location.href = '#/main';
            }
        } catch (error) {
            console.log(error);
        }
    }
}