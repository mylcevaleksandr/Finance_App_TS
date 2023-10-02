import {Form} from "./components/form";
import {Auth} from "./services/auth";
import {Start} from "./components/start";
import {Categories} from "./components/categories";
import {IncomeOutcome} from "./components/incomeOutcome";
import {Update} from "./components/update";
import {Create} from "./components/create";
import {IncomeOutcomeOperations} from "./components/incomeOutcomeOperations";
import {RouteType} from "./types/route.type";

export class Router {
    private contentElement: HTMLElement | null
    private stylesElement: HTMLElement | null
    private titleElement: HTMLElement | null
    private routes: RouteType[]

    constructor() {
        this.contentElement = document.getElementById("content");
        this.stylesElement = document.getElementById("styles");
        this.titleElement = document.getElementById("title");
        this.routes = [
            {
                route: "#/signup",
                title: "Регистрация",
                template: "templates/signup.html",
                styles: "",
                load: () => {
                    new Form('signup');
                }
            },
            {
                route: "#/login",
                title: "Вход в систему",
                template: "templates/login.html",
                styles: "",
                load: () => {
                    new Form('login');
                }
            },
            {
                route: "#/main",
                title: "Главная",
                template: "templates/main.html",
                styles: "",
                load: () => {
                    new Start();
                }
            },
            {
                route: "#/income",
                title: "Доходы",
                template: "templates/categories.html",
                styles: "",
                load: () => {
                    new Categories("income");
                }
            },
            {
                route: "#/expense",
                title: "Расходы",
                template: "templates/categories.html",
                styles: "",
                load: () => {
                    new Categories("expense");
                }
            },
            {
                route: "#/income-outcome",
                title: "Доходы и Расходы",
                template: "templates/income_outcome.html",
                styles: "",
                load: () => {
                    new IncomeOutcome();
                }
            },
            {
                route: "#/income-create",
                title: "Создание Категории Доходов",
                template: "templates/exin_create.html",
                styles: "",
                load: () => {
                    new Create("income");
                }
            },
            {
                route: "#/expense-create",
                title: "Создание Категории Расходов",
                template: "templates/exin_create.html",
                styles: "",
                load: () => {
                    new Create("expense");
                }
            },
            {
                route: "#/income-update",
                title: "Редактирование Категории Доходов",
                template: "templates/exin_update.html",
                styles: "",
                load: () => {
                    new Update("income");
                }
            },
            {
                route: "#/expense-update",
                title: "Редактирование Категории Расходов",
                template: "templates/exin_update.html",
                styles: "",
                load: () => {
                    new Update("expense");
                }
            },
            {
                route: "#/income-outcome-update",
                title: "Редактирование Категории Расходов и Доходов",
                template: "templates/income_outcome_update.html",
                styles: "",
                load: () => {
                    new IncomeOutcomeOperations('update');
                }
            },
            {
                route: "#/income-outcome-create",
                title: "Создание Категории Расходов и Доходов",
                template: "templates/income_outcome_create.html",
                styles: "",
                load: () => {
                    new IncomeOutcomeOperations('create');
                }
            },
        ];
    }

    public async openRoute(): Promise<void> {
        const urlRoute: string = window.location.hash.split('?')[0];
        if (urlRoute === '#/logout') {
            await Auth.logout();
            window.location.href = "#/login";
            return;
        }
        const newRoute: RouteType | undefined = this.routes.find((item: RouteType): boolean => {
            return item.route === urlRoute;
        });

        if (!newRoute) {
            window.location.href = "#/login";
            return;
        }
        if (!this.contentElement || !this.stylesElement || !this.titleElement) {
            if (urlRoute === '#/login') {
                return
            } else {
                window.location.href = "#/login";
                return;
            }
        }
        this.contentElement.innerHTML = await fetch(newRoute.template).then((response: Response) => response.text());
        this.stylesElement.setAttribute("href", newRoute.styles);
        this.titleElement.innerText = newRoute.title;
        newRoute.load();
    }
}