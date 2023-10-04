import {SidebarUtils} from "../services/sidebar-utils";
import {ResponseDefaultType} from "../types/response-default.type";
import {ResponseOperationsAllType} from "../types/response-operations-all.type";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";

export class Base {
    private readonly today: HTMLElement | null
    private readonly week: HTMLElement | null
    private readonly month: HTMLElement | null
    private readonly year: HTMLElement | null
    private readonly all: HTMLElement | null
    private readonly interval: HTMLElement | null
    public init: ResponseOperationsAllType[] | null
    public readonly dates: string | null

    constructor() {
        new SidebarUtils();
        this.today = document.getElementById('today');
        this.week = document.getElementById('week');
        this.month = document.getElementById('month');
        this.year = document.getElementById('year');
        this.all = document.getElementById('all');
        this.interval = document.getElementById('interval');
        this.dates = sessionStorage.getItem('dates')
        this.init = null
    }


    public processDateInterval(that: Base, fn: Function): void {
        const buttonsArray: (HTMLElement | null)[] = [that.today, that.week, that.month, that.year, that.all];
        let startDate: string = ""
        let endDate: string = ""
        $(function () {
            $('#datepicker').datepicker({
                format: 'yyyy-mm-dd'
            });
            $('#datepickerTwo').datepicker({
                format: 'yyyy-mm-dd'
            });
            $("#dateBegin").on("change", function () {
                startDate = $(this).val() as string;
            });
            $("#dateEnd").on("change", function () {
                endDate = $(this).val() as string;
            });
        });
        if (that.interval) {
            that.interval.addEventListener('click', () => {
                buttonsArray.forEach((btnClassList: HTMLElement | null) => {
                    btnClassList?.classList.remove('active_background');
                });
                (that.interval as HTMLElement).classList.add('active_background');
                if (!startDate || !endDate) {
                    alert("Please choose a start date and an end date!");
                } else {
                    this.getCategoriesFilter(startDate, endDate).then(() => {
                        fn(this.init)
                    });
                }
            });
        }
    }

    public processDates(fn: Function): void {
        const buttonsArray: (HTMLElement | null)[] = [this.today, this.week, this.month, this.year, this.all];

        if (this.dates) {
            let find: HTMLElement | null | undefined = buttonsArray.find((element: HTMLElement | null): boolean => element?.id === this.dates);
            if (this.interval) this.interval.classList.remove('active_background');
            buttonsArray.forEach((btnClassList: HTMLElement | null): void => {
                btnClassList?.classList.remove('active_background');
            });
            find?.classList.add('active_background');
            this.getCategories(this.dates).then((): void => {
                fn(this.init)
            });
        }
        buttonsArray.forEach((button: HTMLElement | null): void => {
            button?.addEventListener('click', (): void => {
                sessionStorage.setItem('dates', button.id);
                this.interval?.classList.remove('active_background');
                buttonsArray.forEach((btnClassList: HTMLElement | null): void => {
                    btnClassList?.classList.remove('active_background');
                });
                button.classList.add('active_background');
                this.getCategories(button.id).then((): void => {
                    fn(this.init)
                });
            });
        });
    }

    public async getCategoriesFilter(dateBegin: string, dateEnd: string): Promise<void> {
        try {
            const result: ResponseDefaultType | ResponseOperationsAllType[] = await CustomHttp.request(config.host + '/operations?period=interval&dateFrom=' + dateBegin + '&dateTo=' + dateEnd,);
            if (result) {
                this.init = (result as ResponseOperationsAllType[]);
            }
        } catch (error) {
            return console.log(error);
        }
    }

    public async getCategories(date: string): Promise<void> {
        try {
            const result: ResponseDefaultType | Array<ResponseOperationsAllType> = await CustomHttp.request(config.host + '/operations?period=' + date,);
            if (result as Array<ResponseOperationsAllType>) {
                this.init = (result as ResponseOperationsAllType[]);
            }
        } catch (error) {
            console.log(error);
        }
    }
}