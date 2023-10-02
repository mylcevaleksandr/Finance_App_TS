import {SidebarUtils} from "../services/sidebar-utils";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";

export class IncomeOutcomeOperations {
    constructor(type) {
        this.operationId = sessionStorage.getItem('operationId');
        this.category = null;
        this.saveIncome = document.getElementById('saveIncome');
        this.select = document.getElementById('select');
        this.selectExpense = document.getElementById('selectExpense');
        this.description = document.getElementById('description');
        this.amount = document.getElementById('amount');
        this.date = document.getElementById('date');
        this.comment = document.getElementById('comment');
        new SidebarUtils();
        this.processSelect();
        this.showCalendar();
        this.dataInit(type);
    }

    async dataInit(type) {
        await SidebarUtils.showBalance();
        if (type === 'create') {
            this.validateInputs();
        }
        if (type === 'update') {
            await this.getOperation();
            await this.saveChanges();
        }
    }

    validateInputs() {
        const that = this;
        const inputs = [that.select, that.amount, that.comment];
        inputs.forEach((input) => {
            input.addEventListener('input', () => {
                input.classList.remove('border-danger');
            });
        });
        that.date.addEventListener('click', (e) => {
            e.target.classList.remove('border-danger');
        });
        this.saveIncome.addEventListener('click', () => {
            let type = that.select.value;
            let catId = that.description.selectedOptions[0].id;
            let amount = that.amount.value;
            let date = that.date.value;
            let comment = that.comment.value;

            if (!type) {
                that.select.classList.add('border-danger');
            }
            if (amount < 1) {
                that.amount.classList.add('border-danger');
            }
            if (!date) {
                that.date.classList.add('border-danger');
            } else {
                date = that.getDate(that.date.value, 2);
            }
            if (!comment) {
                that.comment.classList.add('border-danger');
            }
            if (type && amount > 0 && date && comment) {
                this.postChanges(type, +amount, date, comment, +catId);
            }
        });
    }

    async getOperation() {
        if (this.operationId) {
            try {
                const result = await CustomHttp.request(config.host + "/operations/" + this.operationId);
                if (result) {
                    this.processOperation(result);
                }
            } catch (e) {
                console.log(e);
            }
        }
    }

    processOperation(result) {
        this.category = result.category;
        if (result.type === "expense") {
            this.selectExpense.selected = true;
        }
        this.getCategories(result.type);
        this.amount.placeholder = result.amount + "$";
        this.date.placeholder = this.getDate(result.date, 1);
        this.comment.placeholder = result.comment;
    }


    getDate(date, id) {
        if (!date) {
            date = this.date.placeholder;
        }
        const newDate = date.split('-');
        if (id === 1) {
            return newDate[2] + "-" + newDate[1] + "-" + newDate[0];
        }
        if (id === 2) {
            return newDate[2] + "-" + newDate[1] + "-" + newDate[0];
        }
    }

    async getCategories(type) {
        if (type) {
            try {
                const result = await CustomHttp.request(config.host + "/categories/" + type);
                if (result) {
                    this.layoutOptions(result);
                }
            } catch (e) {
                console.log(e);
            }
        }
    }

    processSelect() {
        let that = this;
        this.select.addEventListener('change', function () {
            that.getCategories(this.value);
        });
    }

    layoutOptions(categories) {
        this.description.innerHTML = "";
        for (let i = 0; i < categories.length; i++) {
            let optionElement = document.createElement('option');
            optionElement.value = categories[i].title;
            optionElement.id = categories[i].id;
            optionElement.innerHTML = categories[i].title;
            this.description.appendChild(optionElement);
            if (categories[i].title === this.category) {
                const selected = document.getElementById(categories[i].id);
                selected.selected = true;
            }
        }
    }

    saveChanges() {
        const that = this;
        this.saveIncome.addEventListener('click', () => {
            let type = that.select.value;
            let amount = that.amount.value;
            if (!amount) {
                amount = that.amount.placeholder.split("$")[0];
            } else if (amount < 1) {
                alert("Сумма не может быть 0");
            }
            let date = that.getDate(that.date.value, 2);
            let comment = that.comment.value;
            if (!comment) {
                comment = that.comment.placeholder;
            }
            let catId = that.description.selectedOptions[0].id;
            this.putChanges(type, +amount, date, comment, +catId);
        });
    }

    showCalendar() {
        $(document).ready(function () {
            $('#datepickerThree').datepicker({
                format: 'dd-mm-yyyy'
            });
        });
    }

    async postChanges(type, amount, date, comment, catId) {

        try {
            const result = await CustomHttp.request(config.host + "/operations", "POST", {
                "type": type,
                "amount": amount,
                "date": date,
                "comment": comment,
                "category_id": catId
            });
            if (result) {
                window.location.href = "#/income-outcome";
            }
        } catch (e) {
            console.log(e);
        }
    }

    async putChanges(type, amount, date, comment, catId) {

        try {
            const result = await CustomHttp.request(config.host + "/operations/" + this.operationId, "PUT", {
                "type": type,
                "amount": amount,
                "date": date,
                "comment": comment,
                "category_id": catId
            });
            if (result) {
                sessionStorage.removeItem('operationId');
                window.location.href = "#/income-outcome";
            }
        } catch (e) {
            console.log(e);
        }
    }
}