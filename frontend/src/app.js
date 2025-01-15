import {Router} from "./router.js";
// Import our custom CSS
import './scss/styles.scss';
// Import all of Bootstrap's JS
import * as bootstrap from 'bootstrap';
class App {
    constructor() {
        this.router = new Router();
        window.addEventListener('DOMContentLoaded',  this.handleRouteChanging.bind(this));
        window.addEventListener('popstate', this.handleRouteChanging.bind(this));
    }

    handleRouteChanging() {
        this.router.openRoute();
    }
}

(new App());