import { Component, OnInit } from '@angular/core';
import { AppService } from '../../../@shared/services/app.service'; 
import { MsalService } from "@azure/msal-angular";

@Component({
    selector: 'app-page-profile',
    templateUrl: './page-profile.component.html',
    styleUrls: ['./page-profile.component.scss']
})

export class PageProfileComponent implements OnInit {
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
