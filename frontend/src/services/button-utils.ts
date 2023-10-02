import {CustomHttp} from "./custom-http";
import config from "../../config/config";
import {ResponseDefaultType} from "../types/response-default.type";
import {ResponseOperationsAllType} from "../types/response-operations-all.type";

export class ButtonUtils {
    private readonly window: string[]
    private allUpdateButtons: HTMLButtonElement[]

    constructor() {
        this.window = window.location.href.split('/').slice(-1);
        this.allUpdateButtons = [];
    }


    public processCategoryDelete(): void {
        const that: ButtonUtils = this;
        const allDeleteButtons: HTMLButtonElement[] | null = Array.from(document.querySelectorAll('button[data-id]'));
        allDeleteButtons.forEach((button: HTMLButtonElement | null): void => {
            if (button) {
                button.addEventListener('click', (): void => {
                    const categoryId: string | null = button.getAttribute('data-id');
                    const categoryName: HTMLElement | null = document.querySelector(`[data-titleId="${categoryId}"]`);
                    const deleteConfirm: HTMLElement | null = document.getElementById('deleteConfirm');
                    if (deleteConfirm && categoryId && categoryName) {
                        deleteConfirm.addEventListener('click', (): void => {
                            that.in(categoryName.innerText, categoryId);
                        });
                    }
                });
            }
        });
    }

    private async deleteCategory(categoryId: string): Promise<void> {
        try {
            const result: ResponseDefaultType = await CustomHttp.request(config.host + '/categories/' + this.window + "/" + categoryId, 'DELETE');
            if (result) {
                window.location.reload();
            }
        } catch (error) {
            return console.log(error);
        }
    }

    private async allDelete(categoryId: string): Promise<void> {
        try {
            const result: ResponseDefaultType = await CustomHttp.request(config.host + '/operations/' + categoryId, 'DELETE');
            if (result) {
                window.location.reload();
            }
        } catch (error) {
            return console.log(error);
        }
    }

    public processCategoryUpdate(): void {
        this.allUpdateButtons = Array.from(document.querySelectorAll('button[data-action]'));
        this.allUpdateButtons.forEach((button: HTMLButtonElement): void => {
            button.addEventListener('click', (): void => {
                const categoryId: string | null = button.getAttribute('data-id');
                if (categoryId) {
                    const categoryName: HTMLElement | null = document.querySelector(`[data-titleId="${categoryId}"]`);
                    sessionStorage.setItem('updateId', categoryId);
                    if (categoryName) {
                        sessionStorage.setItem('updateName', categoryName.innerText);
                    }
                }
                location.href = "#/" + this.window + "-update";
            });
        });
    }

    private async in(categoryName: string, categoryId: string): Promise<void> {
        await this.allCategories(categoryName);
        await this.deleteCategory(categoryId);
    }

    private async allCategories(categoryName: string): Promise<void> {
        try {
            const result: Array<ResponseOperationsAllType> | ResponseDefaultType = await CustomHttp.request(config.host + '/operations?period=all');
            if (result) {
                this.trashCategories(categoryName, (result as Array<ResponseOperationsAllType>));
            }
        } catch (error) {
            return console.log(error);
        }
    }

    private trashCategories(name: string, all: Array<ResponseOperationsAllType>): void {
        all.forEach((cat: ResponseOperationsAllType): void => {
            if (cat.category === name) {
                this.allDelete(cat.id.toString());
            }
        });
    }
}