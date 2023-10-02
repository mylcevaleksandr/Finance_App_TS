import {SidebarUtils} from "../services/sidebar-utils";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {ButtonUtils} from "../services/button-utils";

export class Categories extends ButtonUtils {
    constructor(type) {
        super();
        this.type = document.getElementById("type");
        this.cards = document.getElementById('cards');
        this.cardCreate = document.getElementById('cardCreate');
        this.createCategory = document.getElementById("createCategory");

        new SidebarUtils();
        this.dataInit(type);
    }

    async dataInit(type) {
        await SidebarUtils.showBalance();
        await this.getCategories(type);
    }

    getTemplateCard(title, id) {
        let div = document.createElement('div',);
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

    async getCategories(type) {
        if (type === "income") {
            this.createCategory.href = "#/income-create";
            try {
                const result = await CustomHttp.request(config.host + '/categories/income',);
                if (result) {
                    this.postLayout(result, type);
                }
            } catch (error) {
                return console.log(error);
            }
        }
        if (type === "expense") {
            this.type.innerText = "Расходы";
            this.createCategory.href = "#/expense-create";
            try {
                const result = await CustomHttp.request(config.host + '/categories/expense',);
                if (result) {
                    this.postLayout(result);
                }
            } catch (error) {
                return console.log(error);
            }
        }

    }

    postLayout(result, type) {
        if (result) {
            const layout = result.map(item => this.getTemplateCard(item.title, item.id));
            layout.forEach(card => this.cards.insertBefore(card, this.cardCreate));
        }
        this.processCategoryDelete();
        this.processCategoryUpdate();
    }


}