import {SidebarUtils} from "../services/sidebar-utils";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";

export class Create {
    constructor(type) {
        this.type = type;
        this.categoryName = document.getElementById('createCategoryName');
        this.btnCreateCategory = document.getElementById('createCategory');
        this.span = document.getElementById("type");
        this.link = document.getElementById("link");
        if (type === "income") {
            this.span.innerText = "Создание категории доходов";
            this.link.href = "#/income";
        }
        new SidebarUtils();
        this.processCategoryCreate();
        this.dataInit();
    }

    async dataInit(type) {

        await SidebarUtils.showBalance();

    }

    processCategoryCreate() {
        this.btnCreateCategory.addEventListener('click', () => {
            this.createCategoryName(this.categoryName.value, this.type);
        });
    }

    async createCategoryName(catName, type) {
        if (type === "expense") {
            try {
                const result = await CustomHttp.request(config.host + '/categories/expense', 'POST', {
                    "title": catName
                });
                if (result) {
                    location.href = '#/expense';
                }
            } catch (error) {
                return console.log(error);
            }
        }
        if (type === "income") {
            try {
                const result = await CustomHttp.request(config.host + '/categories/income', 'POST', {
                    "title": catName
                });
                if (result) {
                    location.href = '#/income';
                }
            } catch (error) {
                return console.log(error);
            }
        }

    }
}