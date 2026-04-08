import { Component } from '@angular/core';
// import { order } from '../../../../../data/account-order-details';
// import { Order } from '../../../../@shared/interfaces/order';
import { AppService } from '../../../../@shared/services/app.service'; 
import { MsalService } from "@azure/msal-angular";
import { RootService } from '../../../../../app/@shared/services/root.service';
import { toyota } from '../../../../../data/toyota';
import { CartService } from '../../../../@shared/services/cart.service';
import { ActivatedRoute } from '@angular/router'; // Added
import { order as mockOrder } from '../../../../../data/account-order-details';

@Component({
    selector: 'app-page-order-success',
    templateUrl: './page-order-success.component.html',
    styleUrls: ['./page-order-success.component.scss']
})

export class PageOrderSuccessComponent {
    order = mockOrder;
    loggedInUser = false;
    photo:any;
    sanitizer: any; 
    toyota = toyota;
    receipt: any;
    orderId: string = '';
    activeTab: 'products' | 'dars' = 'products'; // Default tab

    constructor(
        private route: ActivatedRoute,
        public root: RootService,
        private msalService: MsalService,
        public appSvc: AppService,
        private cart: CartService
    ) {

    }

    ngOnInit() {
        // this.route.queryParams.subscribe(params => {
        //     if (params['id']) {
        //         this.order.id = params['id'];
        //     }
        // });
        
        // this.receipt = this.cart.getReceipt();
         this.route.queryParams.subscribe(params => {
            this.orderId = params['id'] || 'REQ-SUCCESS';
        });
        this.receipt = this.cart.getReceipt();

        // Auto-select tab logic
        if (this.receipt?.productOrders?.length > 0) {
            this.activeTab = 'products';
        } else if (this.receipt?.darOrders?.length > 0) {
            this.activeTab = 'dars';
        }
    }

    checkAccount() {
        const accounts = this.msalService.instance.getAllAccounts();
        this.loggedInUser = accounts.length > 0;
    }
}
