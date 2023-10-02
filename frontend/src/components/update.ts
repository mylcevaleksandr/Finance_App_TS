import {SidebarUtils} from "../services/sidebar-utils";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";

export class Update {
    constructor(type) {
        this.type = type;
        this.categoryId = sessionStorage.getItem('updateId');
        this.currentCategoryName = sessionStorage.getItem('updateName');
        this.newCategoryName = document.getElementById('categoryName');
        this.span = document.getElementById("span");
        this.link = document.getElementById("link");
        if (type === "income") {
            this.span.innerText = "Создание категории доходов";
            this.link.href = "#/income";
        }
        this.btnUpdateCategory = document.getElementById('updateCategory');
        new SidebarUtils();
        this.processCategoryUpdate();
    }

    processCategoryUpdate() {
        this.newCategoryName.placeholder = this.currentCategoryName;
        this.btnUpdateCategory.addEventListener('click', () => {
            this.updateCategoryName(this.newCategoryName.value, this.categoryId);
        });
    }

    async updateCategoryName(catName, catId) {
        if (this.type === "expense") {
            try {
                const result = await CustomHttp.request(config.host + '/categories/expense/' + catId, 'PUT', {
                    "title": catName
                });
                if (result) {
                    location.href = '#/expense';
                }
            } catch (error) {
                return console.log(error);
            }
        }
        if (this.type === "income") {
            try {
                const result = await CustomHttp.request(config.host + '/categories/income/' + catId, 'PUT', {
                    "title": catName
                });
                if (result) {
                    location.href = '#/income';
                }
            } catch (error) {
                return console.log(error);
            }
        }
        sessionStorage.clear();
    }
}