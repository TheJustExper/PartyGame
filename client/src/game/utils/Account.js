export default class {
    static setToken(token) {
        localStorage.setItem("account-token", token);
    }

    static getToken() {
        return localStorage.getItem("account-token");
    }

    static setAccountInfo(info) {
        localStorage.setItem("account-info", JSON.stringify(info));
    }

    static getAccountInfo() {
        return JSON.parse(localStorage.getItem("account-info"));
    }

    static logout() {
        localStorage.removeItem("account-token");
        localStorage.removeItem("account-info");
    }
}