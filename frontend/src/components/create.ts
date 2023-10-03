import {SidebarUtils} from "../services/sidebar-utils";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {ResponseDefaultType} from "../types/response-default.type";
import {ResponseCategoriesType} from "../types/response-categories.type";

export class Create {
    private readonly type: string
    private readonly categoryName: HTMLElement | null
    private readonly btnCreateCategory: HTMLElement | null
    private readonly span: HTMLElement | null
    private readonly link: HTMLElement | null

    constructor(type: string) {
        this.type = type;
        this.categoryName = document.getElementById('createCategoryName');
        this.btnCreateCategory = document.getElementById('createCategory');
        this.span = document.getElementById("type");
        this.link = document.getElementById("link");
        if (type === "income") {
            if (this.span && this.link) {
                this.span.innerText = "Создание категории доходов";
                (this.link as HTMLAnchorElement).href = "#/income";
            }
        }
        new SidebarUtils();
        this.processCategoryCreate();
        this.dataInit();
    }

    private async dataInit(): Promise<void> {
        await SidebarUtils.showBalance();
    }

    private processCategoryCreate(): void {
        if (this.btnCreateCategory) this.btnCreateCategory.addEventListener('click', () => {
            if (this.categoryName) this.createCategoryName((this.categoryName as HTMLInputElement).value, this.type);
        });
    }

    private async createCategoryName(catName: string, type: string): Promise<void> {
        if (type === "expense") {
            try {
                const result: ResponseDefaultType | ResponseCategoriesType = await CustomHttp.request(config.host + '/categories/expense', 'POST', {
                    "title": catName
                });
                if (result && !(result as ResponseDefaultType).error) {
                    location.href = '#/expense';
                } else {
                    throw new Error((result as ResponseDefaultType).message)
                }
            } catch (error) {
                return console.log(error);
            }
        }
        if (type === "income") {
            try {
                const result: ResponseDefaultType | ResponseCategoriesType = await CustomHttp.request(config.host + '/categories/income', 'POST', {
                    "title": catName
                });
                if (result && !(result as ResponseDefaultType).error) {
                    location.href = '#/income';
                } else {
                    throw new Error((result as ResponseDefaultType).message)
                    // Эта ошибка правильно обрабатывается?
                }
            } catch (error) {
                return console.log(error);
            }
        }
    }
}