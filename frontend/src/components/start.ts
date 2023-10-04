import {SidebarUtils} from "../services/sidebar-utils";
import {Chart} from "chart.js/auto";
import {Base} from "./base";
import {ResponseOperationsAllType} from "../types/response-operations-all.type";

export class Start extends Base {
    private readonly incomeChart: HTMLCanvasElement | null
    private readonly paymentsChart: HTMLCanvasElement | null

    constructor() {
        super()
        this.incomeChart = document.getElementById('incomeChart') as HTMLCanvasElement;
        this.paymentsChart = document.getElementById('paymentsChart') as HTMLCanvasElement;
        new SidebarUtils();
        this.dataInit()
    }

    private async dataInit(): Promise<void> {
        await this.processDateInterval(this, this.filterData.bind(this));
        await this.processDates(this.filterData.bind(this));
        await SidebarUtils.showBalance();
        if (!this.dates) {
            await this.getCategories("today");
        }
    }

    public aggregateData(data: ResponseOperationsAllType[]): { [p: string]: number } {
        const result: { [category: string]: number } = {};
        for (const element of data) {
            if (!(element.category in result)) {
                result[element.category] = element.amount;
            } else {
                result[element.category] += element.amount;
            }
        }
        return result;
    }

    public filterData(data: ResponseOperationsAllType[]): void {
        const income: ResponseOperationsAllType[] = data.filter((item: ResponseOperationsAllType) => item.type.includes('income'));
        const expense: ResponseOperationsAllType[] = data.filter((item: ResponseOperationsAllType) => item.type.includes('expense'));
        const incomeAggregate: { [category: string]: number } = this.aggregateData(income);
        const expenseAggregate: { [category: string]: number } = this.aggregateData(expense);
        this.createIncomeChart(Object.values(incomeAggregate), Object.keys(incomeAggregate));
        this.createExpenseChart(Object.values(expenseAggregate), Object.keys(expenseAggregate));
    }

    private createIncomeChart(incomeAmount: number[], incomeLabels: string[]): void {
        if (!this.incomeChart) return
        let chartStatus: Chart | undefined = Chart.getChart('incomeChart');
        if (chartStatus != undefined) {
            chartStatus.destroy();
        }
        new Chart(this.incomeChart, {
            type: 'pie',
            data: {
                labels: incomeLabels,
                datasets: [{
                    data: incomeAmount,
                }],
            },
        });
    }

    private createExpenseChart(expenseAmount: number[], expenseLabels: string[]): void {
        if (!this.paymentsChart) return

        let chartStatus: Chart | undefined = Chart.getChart('paymentsChart');
        if (chartStatus != undefined) {
            chartStatus.destroy();
        }
        new Chart(this.paymentsChart, {
            type: 'pie',
            data: {
                labels: expenseLabels,
                datasets: [{
                    data: expenseAmount,
                }],
            },
        });
    }
}