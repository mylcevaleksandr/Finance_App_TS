import {SidebarUtils} from "../services/sidebar-utils";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {ButtonUtils} from "../services/button-utils";
import {ResponseCategoriesType} from "../types/response-categories.type";

export class Categories extends ButtonUtils {
    private type: HTMLElement | null
    private cards: HTMLElement | null
    private readonly cardCreate: HTMLElement | null
    private createCategory: HTMLElement | null

    constructor(type: string) {
        super();
        this.type = document.getElementById("type");
        this.cards = document.getElementById('cards');
        this.cardCreate = document.getElementById('cardCreate');
        this.createCategory = document.getElementById("createCategory");

        new SidebarUtils();
        this.dataInit(type);
    }

    private async dataInit(type: string): Promise<void> {
        await SidebarUtils.showBalance();
        await this.getCategories(type);
    }

    private getTemplateCard(title: string, id: number): HTMLDivElement {
        let div: HTMLDivElement = document.createElement('div',);
        div.className = 'col';
        div.id = `${id}`;
        div.innerHTML = `
                <div class="card border border-secondary-subtle rounded">
                    <div class="card-body">
                        <h3 data-titleId="${id}"  class="card-title">${title}</h3>
                        <div class="row gx-1 gy-2" >
                           <div class="col"> <button data-action="update" class="btn  btn-primary" data-id="${id}">Редактировать</a></div>
                           <div class="col"> <button class="btn btn-danger" data-bs-toggle="modal"
                                    data-bs-target="#modalCenter" data-id="${id}">Удалить
                            </button></div>
                        </div>
                    </div>
                </div>
        `;
        return div;
    }

    private async getCategories(type: string): Promise<void> {
        if (type === "income") {
            (this.createCategory as HTMLAnchorElement).href = "#/income-create";
            try {
                const result: ResponseCategoriesType[] | null = await CustomHttp.request(config.host + '/categories/income',);
                if (result) {
                    this.postLayout(result);
                }
            } catch (error) {
                return console.log(error);
            }
        }
        if (type === "expense") {
            if (this.type) this.type.innerText = "Расходы";
            (this.createCategory as HTMLAnchorElement).href = "#/expense-create";
            try {
                const result: ResponseCategoriesType[] | null = await CustomHttp.request(config.host + '/categories/expense',);
                if (result) {
                    this.postLayout(result);
                }
            } catch (error) {
                return console.log(error);
            }
        }

    }

    private postLayout(result: ResponseCategoriesType[] | null): void {
        if (result) {
            const layout: HTMLDivElement[] | null = result.map((item: ResponseCategoriesType) => this.getTemplateCard(item.title, item.id));
            layout.forEach((card: HTMLDivElement | null) => (this.cards as HTMLElement).insertBefore((card as Node), this.cardCreate));
        }
        this.processCategoryDelete();
        this.processCategoryUpdate();
    }


}