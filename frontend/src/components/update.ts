import {SidebarUtils} from "../services/sidebar-utils";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {ParamsType} from "../types/params.type";
import {ResponseDefaultType} from "../types/response-default.type";
import {ResponseCategoriesType} from "../types/response-categories.type";

export class Update {
    private readonly type: string
    private readonly categoryId: string | null
    private readonly currentCategoryName: string | null
    private newCategoryName: HTMLInputElement | null
    private span: HTMLElement | null
    private link: HTMLAnchorElement | null
    private btnUpdateCategory: HTMLElement | null

    constructor(type: string) {
        this.type = type;
        this.categoryId = sessionStorage.getItem('updateId');
        this.currentCategoryName = sessionStorage.getItem('updateName');
        this.newCategoryName = document.getElementById('categoryName') as HTMLInputElement;
        this.span = document.getElementById("span");
        this.link = document.getElementById("link") as HTMLAnchorElement;
        if (type === ParamsType.income) {
            if (this.span && this.link) {
                this.span.innerText = "Создание категории доходов";
                this.link.href = "#/income";
            }
        }
        this.btnUpdateCategory = document.getElementById('updateCategory');
        new SidebarUtils();
        this.processCategoryUpdate();
    }

    private processCategoryUpdate(): void {
        if (this.newCategoryName && this.btnUpdateCategory && this.currentCategoryName) {
            this.newCategoryName.placeholder = this.currentCategoryName;
            this.btnUpdateCategory.addEventListener('click', () => {
                if (this.newCategoryName && this.categoryId) this.updateCategoryName(this.newCategoryName.value, +this.categoryId);
            });
        }
    }

    async updateCategoryName(catName: string, catId: number) {
        if (this.type === ParamsType.expense) {
            try {
                const result: ResponseDefaultType | ResponseCategoriesType = await CustomHttp.request(config.host + '/categories/expense/' + catId, 'PUT', {
                    "title": catName
                });
                if (result as ResponseCategoriesType) {
                    location.href = '#/expense';
                }
            } catch (error) {
                return console.log(error);
            }
        }
        if (this.type === ParamsType.income) {
            try {
                const result: ResponseDefaultType | ResponseCategoriesType = await CustomHttp.request(config.host + '/categories/income/' + catId, 'PUT', {
                    "title": catName
                });
                if (result as ResponseCategoriesType) {
                    location.href = '#/income';
                }
            } catch (error) {
                return console.log(error);
            }
        }
        sessionStorage.clear();
    }
}