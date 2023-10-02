import config from "../../config/config";
import {ResponseDefaultType} from "../types/response-default.type";
import {ResponseRefreshType} from "../types/response-refresh.type";
import {UserInfoType} from "../types/user-info.type";

export class Auth {
    public static accessTokenKey: string = 'accessToken';
    private static refreshTokenKey: string = 'refreshToken';
    private static userInfoKey: string = 'userInfo';

    public static async processUnauthorizedResponse(): Promise<boolean> {
        const refreshToken: string | null = localStorage.getItem(this.refreshTokenKey);
        if (refreshToken) {
            const response: Response = await fetch(config.host + '/refresh', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({refreshToken: refreshToken})
            });
            if (response && response.status === 200) {
                const result: ResponseDefaultType | ResponseRefreshType = await response.json();
                if (result && !(result as ResponseDefaultType).error) {
                    this.setTokens((result as ResponseRefreshType).tokens.accessToken, (result as ResponseRefreshType).tokens.refreshToken);
                    return true;
                }
            }
        }
        this.removeTokens();
        location.href = '#/login';
        return false;
    }

    public static async logout(): Promise<boolean | undefined> {
        const refreshToken: string | null = localStorage.getItem(this.refreshTokenKey);
        if (refreshToken) {
            const response: Response = await fetch(config.host + '/logout', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({refreshToken: refreshToken})
            });
            if (response && response.status === 200) {
                const result: ResponseDefaultType = await response.json();
                if (result && !result.error) {
                    this.removeTokens();
                    location.href = '#/login';
                    return true;
                }
            }
        }
    }

    public static setTokens(accessToken: string | null, refreshToken: string | null): void {
        if (!accessToken || !refreshToken) {
            return
        }
        localStorage.setItem(this.accessTokenKey, accessToken);
        localStorage.setItem(this.refreshTokenKey, refreshToken);
    }

    private static removeTokens(): void {
        localStorage.removeItem(this.accessTokenKey);
        localStorage.removeItem(this.refreshTokenKey);
    }

    public static setUserInfo(info: UserInfoType): void {
        localStorage.setItem(this.userInfoKey, JSON.stringify(info));
    }

    public static getUserInfo(): null {
        const userInfo: string | null = localStorage.getItem(this.userInfoKey);
        const userToken: string | null = localStorage.getItem(this.accessTokenKey);
        if (userInfo && userToken) {
            return JSON.parse(userInfo);
        }
        return null;
    }
}