import {SidebarUtils} from "../services/sidebar-utils";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";

export class IncomeOutcome {
    constructor() {
        new SidebarUtils();
        this.deleteConfirm = document.getElementById('deleteConfirm');
        this.today = document.getElementById('today');
        this.week = document.getElementById('week');
        this.month = document.getElementById('month');
        this.year = document.getElementById('year');
        this.all = document.getElementById('all');
        this.interval = document.getElementById('interval');
        this.tableBody = document.getElementById('tableBody');
        this.dates = sessionStorage.getItem('dates');
        this.startDate = null;
        this.endDate = null;

        this.dataInit();
    }

    async dataInit(type) {
        await this.processDateInterval(this);
        await this.processDates();
        await SidebarUtils.showBalance();
        if (!this.dates) {
            await this.getCategories("today");
        }
    }

    processDateInterval(that) {
        const buttonsArray = [that.today, that.week, that.month, that.year, that.all];

        $(document).ready(function () {
            $('#datepicker').datepicker({
                format: 'yyyy-mm-dd'
            });
            $('#datepickerTwo').datepicker({
                format: 'yyyy-mm-dd'
            });
            5;
            $("#dateBegin").on("change", function () {
                let dateBegin = $(this).val();
                that.startDate = dateBegin;
            });
            $("#dateEnd").on("change", function () {
                let dateEnd = $(this).val();
                that.endDate = dateEnd;
            });
        });
        that.interval.addEventListener('click', () => {
            buttonsArray.forEach((btnClassList) => {
                btnClassList.classList.remove('active_background');
            });
            that.interval.classList.add('active_background');
            if (!that.startDate || !that.endDate) {
                alert("Please choose a start date and an end date!");
            } else {
                this.getCategoriesFilter(that.startDate, that.endDate);
            }

        });
    }

    async getCategoriesFilter(dateBegin, dateEnd) {
        try {
            const result = await CustomHttp.request(config.host + '/operations?period=interval&dateFrom=' + dateBegin + '&dateTo=' + dateEnd,);
            if (result) {
                this.filterData(result);
            }
        } catch (error) {
            return console.log(error);
        }
    }

    processDates() {
        const buttonsArray = [this.today, this.week, this.month, this.year, this.all];

        if (this.dates) {
            let find = buttonsArray.find(e => e.id === this.dates);
            this.interval.classList.remove('active_background');
            buttonsArray.forEach((btnClassList) => {
                btnClassList.classList.remove('active_background');
            });
            find.classList.add('active_background');
            this.getCategories(this.dates);
        }
        buttonsArray.forEach((button) => {
            button.addEventListener('click', () => {
                sessionStorage.setItem('dates', button.id);
                this.interval.classList.remove('active_background');
                buttonsArray.forEach((btnClassList) => {
                    btnClassList.classList.remove('active_background');
                });
                button.classList.add('active_background');
                this.getCategories(button.id);
            });
        });
    }

    async getCategories(date) {
        try {
            const result = await CustomHttp.request(config.host + '/operations?period=' + date,);
            if (result) {
                this.filterData(result);
            }
        } catch (error) {
            return console.log(error);
        }
    }

    layoutTable(index, type, name, amount, date, comment, dataId) {
        let tableRow = document.createElement('tr');
        tableRow.innerHTML = `
            <th scope="row">${index}</th>
            <td data-info="${index}" id="income-outcome-txt">${type}</td>
            <td>${name}</td>
            <td>${amount}$</td>
            <td>${date}</td>
            <td>${comment}</td>
            <td><span className="me-2">
                        <svg data-bs-toggle="modal"
                             data-bs-target="#modalCenter" id="trash" data-id="${dataId}" width="14" height="15"
                             viewBox="0 0 14 15"
                             fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M4.5 5.5C4.77614 5.5 5 5.72386 5 6V12C5 12.2761 4.77614 12.5 4.5 12.5C4.22386 12.5 4 12.2761 4 12V6C4 5.72386 4.22386 5.5 4.5 5.5Z"
                            fill="black"/>
                        <path
                            d="M7 5.5C7.27614 5.5 7.5 5.72386 7.5 6V12C7.5 12.2761 7.27614 12.5 7 12.5C6.72386 12.5 6.5 12.2761 6.5 12V6C6.5 5.72386 6.72386 5.5 7 5.5Z"
                            fill="black"/>
                        <path
                            d="M10 6C10 5.72386 9.77614 5.5 9.5 5.5C9.22386 5.5 9 5.72386 9 6V12C9 12.2761 9.22386 12.5 9.5 12.5C9.77614 12.5 10 12.2761 10 12V6Z"
                            fill="black"/>
                        <path fill-rule="evenodd" clip-rule="evenodd"
                              d="M13.5 3C13.5 3.55228 13.0523 4 12.5 4H12V13C12 14.1046 11.1046 15 10 15H4C2.89543 15 2 14.1046 2 13V4H1.5C0.947715 4 0.5 3.55228 0.5 3V2C0.5 1.44772 0.947715 1 1.5 1H5C5 0.447715 5.44772 0 6 0H8C8.55229 0 9 0.447715 9 1H12.5C13.0523 1 13.5 1.44772 13.5 2V3ZM3.11803 4L3 4.05902V13C3 13.5523 3.44772 14 4 14H10C10.5523 14 11 13.5523 11 13V4.05902L10.882 4H3.11803ZM1.5 3V2H12.5V3H1.5Z"
                              fill="black"/>
                    </svg>
                 </span>
                 <span>
                    <svg id="update" data-id="${dataId}" width="16" height="16" viewBox="0 0 16 16" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M12.1465 0.146447C12.3417 -0.0488155 12.6583 -0.0488155 12.8536 0.146447L15.8536 3.14645C16.0488 3.34171 16.0488 3.65829 15.8536 3.85355L5.85357 13.8536C5.80569 13.9014 5.74858 13.9391 5.68571 13.9642L0.68571 15.9642C0.500001 16.0385 0.287892 15.995 0.146461 15.8536C0.00502989 15.7121 -0.0385071 15.5 0.0357762 15.3143L2.03578 10.3143C2.06092 10.2514 2.09858 10.1943 2.14646 10.1464L12.1465 0.146447ZM11.2071 2.5L13.5 4.79289L14.7929 3.5L12.5 1.20711L11.2071 2.5ZM12.7929 5.5L10.5 3.20711L4.00001 9.70711V10H4.50001C4.77616 10 5.00001 10.2239 5.00001 10.5V11H5.50001C5.77616 11 6.00001 11.2239 6.00001 11.5V12H6.29291L12.7929 5.5ZM3.03167 10.6755L2.92614 10.781L1.39754 14.6025L5.21903 13.0739L5.32456 12.9683C5.13496 12.8973 5.00001 12.7144 5.00001 12.5V12H4.50001C4.22387 12 4.00001 11.7761 4.00001 11.5V11H3.50001C3.28561 11 3.10272 10.865 3.03167 10.6755Z"
                                fill="black"/>
                        </svg> 
                 </span>
            </td>
            `;
        return tableRow;
    }

    filterData(data) {
        this.tableBody.innerHTML = "";
        let categoryType = null;
        for (let i = 0; i < data.length; i++) {
            let expense = false;
            if (data[i].type === "expense") {
                categoryType = 'Расход';
                expense = true;
            } else if (data[i].type === "income") {
                categoryType = 'Доход';
            }
            this.tableBody.appendChild(this.layoutTable([i + 1], categoryType, data[i].category, data[i].amount, data[i].date, data[i].comment, data[i].id));
            let dataInfo = document.querySelector(`[data-info="` + [i + 1] + `"]`);
            if (expense) {
                dataInfo.classList.add('text-danger');
            } else {
                dataInfo.classList.add('text-success');
            }
        }
        this.processCategoryUpdate();
    }


    processCategoryUpdate() {
        const btnTrashPensil = document.querySelectorAll('[data-id]');
        btnTrashPensil.forEach((button) => {
            button.addEventListener('click', () => {
                let operationId = button.dataset.id;
                if (button.id === "trash") {
                    this.deleteConfirm.addEventListener('click', () => {
                        this.deleteCategory(operationId);
                    });
                } else {
                    sessionStorage.setItem('operationId', operationId);
                    location.href = '#/income-outcome-update';
                }
            });
        });
    }

    async deleteCategory(categoryId) {
        try {
            const result = await CustomHttp.request(config.host + '/operations/' + categoryId, 'DELETE');
            if (result) {
                location.href = "#/income-outcome";
            }
        } catch (error) {
            return console.log(error);
        }
    }
}