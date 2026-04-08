import { Component } from '@angular/core';
import { Order } from '../../../@shared/interfaces/order';
import { orders } from '../../../../data/account-orders';
import { Address } from '../../../@shared/interfaces/address';
import { addresses } from '../../../../data/account-addresses';
import { AppService } from 'src/app/@shared/services/app.service'; 
import { MsalService } from "@azure/msal-angular";

@Component({
    selector: 'app-page-dashboard',
    templateUrl: './page-dashboard.component.html',
    styleUrls: ['./page-dashboard.component.scss']
})
export class PageDashboardComponent {
    address: Address = addresses[0];
    orders: Partial<Order>[] = orders.slice(0, 3);
    loggedInUser = false;

    constructor (
        private msalService: MsalService,
        public appSvc: AppService
    ) {

    }

    ngOnInit(): void {

    }

    checkAccount() {
        const accounts = this.msalService.instance.getAllAccounts();
        this.loggedInUser = accounts.length > 0;
    }
}
