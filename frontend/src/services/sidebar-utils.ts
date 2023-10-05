import {Auth} from "./auth";
import {CustomHttp} from "./custom-http";
import config from "../../config/config";
import {UserInfoType} from "../types/user-info.type";
import {ResponseBalanceType} from "../types/response-balance.type";

export class SidebarUtils {
    private readonly user: UserInfoType | null
    private readonly root: HTMLElement | null
    private readonly btnIncome: HTMLElement | null
    private readonly btnPayments: HTMLElement | null
    private readonly userFullName: HTMLElement | null
    private readonly userLogout: HTMLElement | null
    private readonly btnMain: HTMLElement | null
    private readonly svgMain: HTMLElement | null
    private readonly btnIncomeOutcome: HTMLElement | null
    private readonly svgIncomeOutcome: HTMLElement | null
    private readonly btnToggle: HTMLElement | null
    private readonly svgToggle: HTMLElement | null
    private readonly ul: HTMLElement | null
    private readonly beforeChild: HTMLElement | null
    private nav: boolean

    constructor() {
        this.user = Auth.getUserInfo();
        this.root = document.getElementById('root');
        this.beforeChild = document.getElementById('content');
        this.nav = false;
        this.btnIncome = null
        this.btnPayments = null
        this.userFullName = null
        this.userLogout = null
        this.btnMain = null
        this.svgMain = null
        this.btnIncomeOutcome = null
        this.svgIncomeOutcome = null
        this.btnToggle = null
        this.svgToggle = null
        this.ul = null

        this.show();
        if (this.nav) {
            this.btnIncome = document.getElementById('btnIncome');
            this.btnPayments = document.getElementById('btnPayments');
            this.userFullName = document.getElementById('sidebarUser');
            this.userLogout = document.getElementById('sidebarLogout');
            this.btnMain = document.getElementById('btnMain');
            this.svgMain = document.getElementById('svgMain');
            this.btnIncomeOutcome = document.getElementById('btnIncomeOutcome');
            this.svgIncomeOutcome = document.getElementById('svgIncomeOutcome');
            this.btnToggle = document.getElementById('btnToggle');
            this.svgToggle = document.getElementById('svgToggle');
            this.ul = document.getElementById("ul-collapse");
            this.processSidebar();
            this.processBtn();
            this.buttonToggle();
        }

    }

    public static async showBalance(): Promise<void> {

        try {
            const result: ResponseBalanceType = await CustomHttp.request(config.host + '/balance',);
            if (result.balance || result.balance == 0) {
                const sideBarSum: HTMLElement | null = document.getElementById("sidebarSum")
                if (sideBarSum) {
                    sideBarSum.innerText = result.balance.toString();
                }
            }
        } catch (error) {
            return console.log(error);
        }
    }

    private buttonToggle(): void {
        if (!this.ul || !this.btnToggle || !this.svgToggle) return
        if (window.location.hash === "#/income" || window.location.hash === "#/income-create" || window.location.hash === "#/income-update" || window.location.hash === "#/expense" || window.location.hash === "#/expense-create" || window.location.hash === "#/expense-update") {
            this.ul.classList.add('show');
            this.btnToggle.classList.remove('collapsed');
            this.svgToggle.classList.add('svg_toggle');
        } else {
            this.ul.classList.remove('show');
            this.btnToggle.classList.add('collapsed');
        }

        function onClassChange(node: HTMLElement, callback: (mutationObserver: MutationObserver) => void): MutationObserver {
            let lastClassString: string = node.classList.toString();
            const mutationObserver: MutationObserver = new MutationObserver((mutationList: MutationRecord[]): void => {
                for (const item of mutationList) {
                    if (item.attributeName === "class") {
                        const classString: string = node.classList.toString();
                        if (classString !== lastClassString) {
                            callback(mutationObserver);
                            lastClassString = classString;
                            break;
                        }
                    }
                }
            });
            mutationObserver.observe(node, {attributes: true});
            return mutationObserver;
        }

        onClassChange(this.btnToggle, () => {
            if (!this.btnToggle || !this.svgToggle) return
            if (this.btnToggle.classList.contains("collapsed")) {
                this.svgToggle.classList.remove('svg_toggle');
            } else {
                this.svgToggle.classList.add('svg_toggle');
            }
        });
    }

    private show(): void {
        if (window.location.hash !== "#/login" && window.location.hash !== "#/signup") {
            if (!document.getElementById('nav')) {
                const myNav: HTMLElement = document.createElement('nav');
                myNav.className = 'sidebar  min-vh-100 fw-medium text-align-center d-flex flex-column align-items-center  border-end col col-2 py-5 px-0 ';
                myNav.id = 'nav';
                myNav.innerHTML = this.getLayout();
                if (this.root) this.root.insertBefore(myNav, this.beforeChild);
            }
            this.nav = true;
        }
    }

    private processBtn(): void {
        if (this.btnIncomeOutcome) {
            this.btnIncomeOutcome.addEventListener('click', (): void => {
                sessionStorage.removeItem('dates');
            });
        }
        [this.btnMain, this.btnIncomeOutcome].forEach((btn: HTMLElement | null): void => {
            if (btn) {
                btn.classList.remove('btn-primary', 'text-light');
                btn.classList.add('btn-light');
            }
            if (this.svgIncomeOutcome && this.svgMain) {
                this.svgIncomeOutcome.style.fill = '#052C65';
                this.svgMain.style.fill = '#052C65';
            }
        });
        [this.btnIncome, this.btnPayments,].forEach((btn: HTMLElement | null): void => {
            if (btn) btn.classList.remove('bg-primary', 'text-light');
        });
        if (window.location.hash === "#/main") {
            if (this.btnMain && this.svgMain) {
                this.btnMain.classList.remove('btn-light');
                this.btnMain.classList.add('btn-primary', 'text-light');
                this.svgMain.style.fill = 'white';
            }
        }
        if (window.location.hash === "#/income-outcome" || window.location.hash === "#/income-outcome-update") {
            if (this.btnIncomeOutcome && this.svgIncomeOutcome) {
                this.btnIncomeOutcome.classList.remove('btn-light');
                this.btnIncomeOutcome.classList.add('btn-primary', 'text-light');
                this.svgIncomeOutcome.style.fill = 'white';
            }
        }

        if (window.location.hash === "#/income" || window.location.hash === "#/income-update" || window.location.hash === "#/income-create") {
            if (this.btnIncome) {
                this.btnIncome.classList.remove('btn-light')
                this.btnIncome.classList.add('bg-primary', 'text-light');
            }
        }
        if (window.location.hash === "#/expense" || window.location.hash === "#/expense-update" || window.location.hash === "#/expense-create") {
            if (this.btnPayments) {
                this.btnPayments.classList.remove('btn-light');
                this.btnPayments.classList.add('bg-primary', 'text-light');
            }
        }
    }

    private processSidebar(): void {
        if (this.user) {
            if (this.userFullName) this.userFullName.innerText = this.user.fullName;
        }
        if (this.userLogout) {
            const that: SidebarUtils = this
            this.userLogout.onclick = function () {
                Auth.logout();
                const nav: HTMLElement | null = document.getElementById('nav');
                if (!that.user && nav) {
                    if (nav.parentNode) nav.parentNode.removeChild(nav);
                }
            };
        }

    }

    private getLayout(): string {
        return `
           <div class="w-100 sidebar_logo pb-3 border-bottom d-flex justify-content-center ">
            <a class="d-flex justify-content-center" href="#/main">
                <img class="w-75 " src="images/logo.png" alt="logo">
            </a>
        </div>
        <div class=" custom-color h-100  d-flex flex-column justify-content-between ">
            <div class=" h-100 d-flex flex-column justify-content-between pt-5 pb-3">
                <div class=" flex-grow-1 align-self-start d-flex flex-column align-items-center justify-content-start px-4 ">
                    <a id="btnMain" type="button"
                       class="custom-color btn btn-light gap-2 w-100 py-2 px-3 d-flex align-items-center "
                       href="#/main">
                        <svg id="svgMain" width="15" height="14" viewBox="0 0 15 14" fill="#052C65"
                             xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd"
                                  d="M1.5 12.3964V5.89644H2.5V12.3964C2.5 12.6726 2.72386 12.8964 3 12.8964H12C12.2761 12.8964 12.5 12.6726 12.5 12.3964V5.89644H13.5V12.3964C13.5 13.2249 12.8284 13.8964 12 13.8964H3C2.17157 13.8964 1.5 13.2249 1.5 12.3964Z"
                            />
                            <path fill-rule="evenodd" clip-rule="evenodd"
                                  d="M12.5 1.39644V4.89644L10.5 2.89644V1.39644C10.5 1.1203 10.7239 0.89644 11 0.89644H12C12.2761 0.89644 12.5 1.1203 12.5 1.39644Z"
                            />
                            <path fill-rule="evenodd" clip-rule="evenodd"
                                  d="M6.79289 0.39644C7.18342 0.00591397 7.81658 0.00591606 8.20711 0.39644L14.8536 7.04289C15.0488 7.23815 15.0488 7.55473 14.8536 7.74999C14.6583 7.94526 14.3417 7.94526 14.1464 7.74999L7.5 1.10355L0.853553 7.74999C0.658291 7.94526 0.341709 7.94526 0.146447 7.74999C-0.0488155 7.55473 -0.0488155 7.23815 0.146447 7.04289L6.79289 0.39644Z"
                            />
                        </svg>
                        Главная</a>
                    <a id="btnIncomeOutcome" href="#/income-outcome"
                       class="custom-color w-100 sidebar_btn btn btn-light  d-flex gap-2  align-items-center"
                       type="button">
                        <svg id="svgIncomeOutcome" class="" width="16" height="16" viewBox="0 0 16 16" fill="#052C65"
                             xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd"
                                  d="M11 15C13.2091 15 15 13.2091 15 11C15 8.79086 13.2091 7 11 7C8.79086 7 7 8.79086 7 11C7 13.2091 8.79086 15 11 15ZM16 11C16 13.7614 13.7614 16 11 16C8.23858 16 6 13.7614 6 11C6 8.23858 8.23858 6 11 6C13.7614 6 16 8.23858 16 11Z"
                            />
                            <path d="M9.4375 11.9444C9.48519 12.5403 9.95568 13.0049 10.8013 13.0599V13.5H11.1764V13.0568C12.0507 12.9957 12.5625 12.5281 12.5625 11.8496C12.5625 11.2323 12.1715 10.9144 11.4721 10.7494L11.1764 10.6791V9.48105C11.5516 9.52384 11.79 9.72861 11.8472 10.0128H12.5053C12.4576 9.43826 11.9648 8.989 11.1764 8.9401V8.5H10.8013V8.94927C10.0542 9.02262 9.54559 9.47188 9.54559 10.1076C9.54559 10.6699 9.92389 11.0275 10.5533 11.1742L10.8013 11.2353V12.5067C10.4166 12.4487 10.1623 12.2378 10.1051 11.9444H9.4375ZM10.7981 10.5905C10.4294 10.5049 10.2291 10.3307 10.2291 10.0678C10.2291 9.77445 10.4453 9.5544 10.8013 9.49022V10.5905H10.7981ZM11.2305 11.3362C11.6787 11.4401 11.8854 11.6082 11.8854 11.9046C11.8854 12.2439 11.6279 12.4762 11.1764 12.5189V11.324L11.2305 11.3362Z"
                            />
                            <path d="M1 0C0.447715 0 0 0.447716 0 1V9C0 9.55229 0.447715 10 1 10H5.08296C5.1407 9.65585 5.22773 9.32163 5.34141 9H3C3 7.89543 2.10457 7 1 7V3C2.10457 3 3 2.10457 3 1H13C13 2.10457 13.8954 3 15 3V6.52779C15.3801 6.86799 15.7166 7.25594 16 7.68221V1C16 0.447715 15.5523 0 15 0H1Z"
                            />
                            <path d="M9.9983 5.08325C9.99943 5.05564 10 5.02789 10 5C10 3.89543 9.10457 3 8 3C6.89543 3 6 3.89543 6 5C6 5.6845 6.34387 6.28869 6.86829 6.64924C7.71486 5.84504 8.79591 5.28533 9.9983 5.08325Z"
                            />
                        </svg>
                        Доходы & Расходы
                    </a>

                    <div class="w-100">
                        <button id="btnToggle"
                                class="w-100 collapsed custom-color sidebar_btn btn rounded-bottom-0  rounded-top d-flex justify-content-between align-items-center"
                                type="button" data-bs-toggle="collapse" data-bs-target="#ul-collapse"
                                aria-expanded="false">
                            Категории
                            <svg id="svgToggle" class="" width="8" height="14" viewBox="0 0 8 14" fill="#052C65"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd"
                                      d="M1.14506 13.3539C1.05102 13.2601 0.998169 13.1327 0.998169 12.9999C0.998169 12.867 1.05102 12.7397 1.14506 12.6459L6.79206 6.99987L1.14506 1.35387C1.01859 1.2274 0.969198 1.04306 1.01549 0.8703C1.06178 0.697536 1.19673 0.562593 1.36949 0.5163C1.54225 0.470008 1.72659 0.519401 1.85306 0.645873L7.85306 6.64587C7.9471 6.73968 7.99996 6.86705 7.99996 6.99987C7.99996 7.1327 7.9471 7.26007 7.85306 7.35387L1.85306 13.3539C1.75926 13.4479 1.63189 13.5008 1.49906 13.5008C1.36624 13.5008 1.23887 13.4479 1.14506 13.3539Z"
                                />
                            </svg>
                        </button>
                        <ul id="ul-collapse" class="collapse ps-0  ">
                            <a id="btnIncome" class="toggleBtn  border border-primary  dropdown-item ps-2 pt-2 pb-1"
                               type="button"
                               href="#/income">Доходы</a>
                            <a id="btnPayments"
                               class="toggleBtn border border-primary border-top-0 rounded-bottom dropdown-item ps-2 pt-2 pb-1"
                               type="button"
                               href="#/expense">Расходы</a>
                        </ul>
                    </div>

                </div>
                <span class="mb-auto sidebar_total ps-4">Баланс: <span class="text-primary" id="sidebarSum">500 </span>$</span>
            </div>
        </div>
        <div class="d-flex w-100 justify-content-start align-items-center border-top ps-3 pt-3">
            <div class="dropdown">
                <svg data-bs-toggle="dropdown"
                     aria-expanded="false" class="sidebar_user-btn me-3 " width="36" height="36" viewBox="0 0 36 36"
                     fill="none"
                     xmlns="http://www.w3.org/2000/svg">
                    <circle cx="18" cy="18" r="18" fill="#D9D9D9"/>
                    <path d="M18 18C19.0609 18 20.0783 17.5786 20.8284 16.8284C21.5786 16.0783 22 15.0609 22 14C22 12.9391 21.5786 11.9217 20.8284 11.1716C20.0783 10.4214 19.0609 10 18 10C16.9391 10 15.9217 10.4214 15.1716 11.1716C14.4214 11.9217 14 12.9391 14 14C14 15.0609 14.4214 16.0783 15.1716 16.8284C15.9217 17.5786 16.9391 18 18 18ZM20.6667 14C20.6667 14.7072 20.3857 15.3855 19.8856 15.8856C19.3855 16.3857 18.7072 16.6667 18 16.6667C17.2928 16.6667 16.6145 16.3857 16.1144 15.8856C15.6143 15.3855 15.3333 14.7072 15.3333 14C15.3333 13.2928 15.6143 12.6145 16.1144 12.1144C16.6145 11.6143 17.2928 11.3333 18 11.3333C18.7072 11.3333 19.3855 11.6143 19.8856 12.1144C20.3857 12.6145 20.6667 13.2928 20.6667 14ZM26 24.6667C26 26 24.6667 26 24.6667 26H11.3333C11.3333 26 10 26 10 24.6667C10 23.3333 11.3333 19.3333 18 19.3333C24.6667 19.3333 26 23.3333 26 24.6667ZM24.6667 24.6613C24.6653 24.3333 24.4613 23.3467 23.5573 22.4427C22.688 21.5733 21.052 20.6667 18 20.6667C14.9467 20.6667 13.312 21.5733 12.4427 22.4427C11.5387 23.3467 11.336 24.3333 11.3333 24.6613H24.6667Z"
                          fill="#6C757D"/>
                </svg>
                <ul class="dropdown-menu">
                    <li>
                        <button id="sidebarLogout" class="dropdown-item" type="button">Logout</button>
                    </li>
                </ul>
            </div>
            <span id="sidebarUser" class="w-100 fw-normal">User User</span>
        </div>
        `;
    }
}