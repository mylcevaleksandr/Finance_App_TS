import {SidebarUtils} from "../services/sidebar-utils";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {ParamsType} from "../types/params.type";
import {ResponseOperationsAllType} from "../types/response-operations-all.type";
import {ResponseDefaultType} from "../types/response-default.type";
import {ResponseCategoriesType} from "../types/response-categories.type";

export class IncomeOutcomeOperations {
    private readonly operationId: string | null
    private category: string | null
    private readonly saveIncome: HTMLElement | null
    private select: HTMLInputElement | null
    private readonly selectExpense: HTMLOptionElement | null
    private readonly description: HTMLSelectElement | null
    private readonly amount: HTMLInputElement | null
    private readonly date: HTMLInputElement | null
    private readonly comment: HTMLInputElement | null

    constructor(type: string) {
        this.operationId = sessionStorage.getItem('operationId');
        this.category = null;
        this.saveIncome = document.getElementById('saveIncome');
        this.select = document.getElementById('select') as HTMLInputElement;
        this.selectExpense = document.getElementById('selectExpense') as HTMLOptionElement;
        this.description = document.getElementById('description') as HTMLSelectElement;
        this.amount = document.getElementById('amount') as HTMLInputElement;
        this.date = document.getElementById('date') as HTMLInputElement;
        this.comment = document.getElementById('comment') as HTMLInputElement;
        new SidebarUtils();
        this.processSelect();
        this.showCalendar();
        this.dataInit(type);
    }

    private async dataInit(type: string): Promise<void> {
        await SidebarUtils.showBalance();
        if (type === ParamsType.create) {
            this.validateInputs();
        }
        if (type === ParamsType.update) {
            await this.getOperation();
            await this.saveChanges();
        }
    }

    private validateInputs(): void {
        const that = this;
        const inputs: (HTMLElement | null)[] = [that.select, that.amount, that.comment];
        inputs.forEach((input: HTMLElement | null): void => {
            if (input) {
                input.addEventListener('input', (): void => {
                    input.classList.remove('border-danger');
                });
            }
        });
        if (that.date) {
            that.date.addEventListener('click', (e: MouseEvent): void => {
                (e.target as HTMLElement).classList.remove('border-danger');
            });
        }
        if (this.saveIncome) this.saveIncome.addEventListener('click', (): void => {
            if (!that.select || !that.amount || !that.date || !that.comment) return
            let type: string | undefined = that.select?.value;
            let catId: string | undefined = that.description?.selectedOptions[0].id;
            let amount: string | undefined = that.amount?.value;
            let date: string | undefined = that.date?.value;
            let comment: string | undefined = that.comment?.value;

            if (!type) {
                that.select.classList.add('border-danger');
            }
            if (+amount < 1) {
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
            if (type && +amount > 0 && date && comment && catId) {
                this.postChanges(type, +amount, date, comment, +catId);
            }
        });
    }

    private async getOperation(): Promise<void> {
        if (this.operationId) {
            try {
                const result: ResponseDefaultType | ResponseOperationsAllType = await CustomHttp.request(config.host + "/operations/" + this.operationId);
                if (result as ResponseOperationsAllType) {
                    this.processOperation(result as ResponseOperationsAllType);
                }
            } catch (e) {
                console.log(e);
            }
        }
    }

    private processOperation(result: ResponseOperationsAllType): void {
        this.category = result.category;
        if (result.type === ParamsType.expense && this.selectExpense) {
            this.selectExpense.selected = true;
        }
        this.getCategories(result.type);
        if (this.amount && this.date && this.comment) {
            this.amount.placeholder = result.amount + "$";
            this.date.placeholder = this.getDate(result.date, 1) as string;
            this.comment.placeholder = result.comment;
        }
    }


    private getDate(date: string, id: number): string | undefined {
        if (!date && this.date) {
            date = this.date.placeholder;
        }
        const newDate: string[] = date.split('-');
        if (id === 1) {
            return newDate[2] + "-" + newDate[1] + "-" + newDate[0];
        }
        if (id === 2) {
            return newDate[2] + "-" + newDate[1] + "-" + newDate[0];
        }
    }

    private async getCategories(type: string): Promise<void> {
        if (type) {
            try {
                const result: ResponseCategoriesType[] = await CustomHttp.request(config.host + "/categories/" + type);
                if (result) {
                    this.layoutOptions(result);
                }
            } catch (e) {
                console.log(e);
            }
        }
    }

    private processSelect(): void {
        let that: IncomeOutcomeOperations = this;
        this.select?.addEventListener('change', function (): void {
            that.getCategories(this.value);
        });
    }

    private layoutOptions(categories: ResponseCategoriesType[]): void {
        if (this.description) {
            this.description.innerHTML = "";
            for (let i = 0; i < categories.length; i++) {
                let optionElement: HTMLOptionElement = document.createElement('option');
                optionElement.value = categories[i].title;
                optionElement.id = categories[i].id.toString();
                optionElement.innerHTML = categories[i].title;
                this.description.appendChild(optionElement);
                if (categories[i].title === this.category) {
                    const selected: HTMLElement | null = document.getElementById(String(categories[i].id));
                    if (selected) (selected as HTMLOptionElement).selected = true;
                }
            }
        }
    }

    private saveChanges(): void {
        const that: IncomeOutcomeOperations = this;
        this.saveIncome?.addEventListener('click', () => {
            if (!that.select || !that.amount || !that.date || !that.comment) return
            let type: string = that.select.value;
            let amount: string = that.amount.value;
            if (!amount) {
                amount = that.amount.placeholder.split("$")[0];
            } else if (+amount < 1) {
                alert("Сумма не может быть 0");
            }
            let date: string | undefined = that.getDate(that.date.value, 2);
            let comment: string = that.comment.value;
            if (!comment) {
                comment = that.comment.placeholder;
            }
            let catId: string | undefined = that.description?.selectedOptions[0]?.id;
            if (catId && date) this.putChanges(type, +amount, date, comment, +catId);
        });
    }

    private showCalendar(): void {
        $(document).ready(function () {
            $('#datepickerThree').datepicker({
              format: 'dd-mm-yyyy'
            });
        });
    }

    private async postChanges(type: string, amount: number, date: string, comment: string, catId: number): Promise<void> {
        try {
            const result: ResponseDefaultType | ResponseOperationsAllType = await CustomHttp.request(config.host + "/operations", "POST", {
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

    private async putChanges(type: string, amount: number, date: string, comment: string, catId: number): Promise<void> {

        try {
            const result: ResponseDefaultType | ResponseOperationsAllType = await CustomHttp.request(config.host + "/operations/" + this.operationId, "PUT", {
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