import {SidebarUtils} from "../services/sidebar-utils";
import {Chart} from "chart.js/auto";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";

export class Start {
    constructor() {

        this.incomeChart = document.getElementById('incomeChart');
        this.paymentsChart = document.getElementById('paymentsChart');
        this.today = document.getElementById('today');
        this.week = document.getElementById('week');
        this.month = document.getElementById('month');
        this.year = document.getElementById('year');
        this.all = document.getElementById('all');
        this.interval = document.getElementById('interval');
        this.startDate = null;
        this.endDate = null;
        new SidebarUtils();
        this.dataInit();
        this.processDateInterval(this);
        this.processDates();
    }

    async dataInit() {
        await SidebarUtils.showBalance();
        await this.getCategories("today");
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
        buttonsArray.forEach((button) => {
            button.addEventListener('click', () => {
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
            const result = await CustomHttp.request(config.host + '/operations?period=' + date.toString(),);
            if (result) {
                this.filterData(result);
            }
        } catch (error) {
            return console.log(error);
        }
    }

    aggregateData(data) {
        const result = {};
        for (const element of data) {
            if (!(element.category in result)) {
                result[element.category] = element.amount;
            } else {
                result[element.category] += element.amount;
            }
        }
        return result;
    }

    filterData(data) {
        const income = data.filter(item => item.type.includes('income'));
        const expense = data.filter(item => item.type.includes('expense'));
        const incomeAggregate = this.aggregateData(income);
        const expenseAggregate = this.aggregateData(expense);
        this.createIncomeChart(Object.values(incomeAggregate), Object.keys(incomeAggregate));
        this.createExpenseChart(Object.values(expenseAggregate), Object.keys(expenseAggregate));

    }

    createIncomeChart(incomeAmount, incomeLabels) {
        let chartStatus = Chart.getChart('incomeChart');
        if (chartStatus != undefined) {
            chartStatus.destroy();
        }
        const pieChart = new Chart(this.incomeChart, {
            type: 'pie', // Тип диаграммы
            data: {
                labels: incomeLabels,
                datasets: [{
                    data: incomeAmount,
                }],
            },
        });
    }

    createExpenseChart(expenseAmount, expenseLabels) {
        let chartStatus = Chart.getChart('paymentsChart');
        if (chartStatus != undefined) {
            chartStatus.destroy();
        }
        const pieChart = new Chart(this.paymentsChart, {
            type: 'pie', // Тип диаграммы
            data: {
                labels: expenseLabels,
                datasets: [{
                    data: expenseAmount,
                }],
            },
        });
    }
}