import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/@shared/services/app.service'; 
import { OrderHistoryService } from 'src/app/@shared/services/order-history.service'; 
import { Router } from '@angular/router';
//import moment from 'moment-business-days';
//import * as moment from 'moment-business-days';
import momentBusinessDays from 'moment-business-days';
//import momentBusinessDays from '../../../../../node_modules/moment-business-days';
//import { Order } from '../../../@shared/interfaces/order';
//import { orders } from '../../../../data/account-orders';
import { environment } from "../../../../environments/environment";

const GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0/me?$select=id,displayName,givenName,surname,jobTitle,userPrincipalName,mail,businessPhones,officeLocation,employeeId,department,companyName,streetAddress,city,state,postalCode,country,extension_9165016077844be19c8ee5563401ff8a_HomeTenantEmployeeID';

@Component({
    selector: 'app-page-order-list',
    templateUrl: './page-order-list.component.html',
    styleUrls: ['./page-order-list.component.scss']
})
export class PageOrderListComponent {
    // private readonly BASE_API_URL:string=`${environment.Global}/requests/product`;
    private readonly BASE_API_URL:string=`${environment.gdx.requestProduct}`;
    noDataFoundMessage: string = 'No Orders Found';
    searchingMessage: string = 'Loading Your Orders....'
    requestedFor:string;
    catalogItem:string;
    limit:string;
    profile;
    requestNumbers:any;
    masterOrderList: any = [];
    orderList: any = [];
    pageNo: number = 1;
    request: any;
    todaysDate: Date = new Date();
    filterDuration: string = '3_MONTHS';
    isShow = false;
    noOrder = false;
    loader = false;
    apiTimer: any;
    searchText : any;
    sortDurationDays: any = '';
    filterItem: any = "";
    businessDays: string = "";
    orderDatestamp: string = "";
    pendingDate: any;
    orderDate: any;
    //orders: Partial<Order>[] = orders;

    constructor(
        private appService : AppService,
        private orderHistoryService: OrderHistoryService,
        private _http : HttpClient,
        private router: Router
      ) { 
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        setTimeout(() => {
          this.isShow = true;
        }, 15000)
        setTimeout(() => {
          this.noOrder = true;
        }, 5000)
        setTimeout(() => {
          this.loader = true;
        }, 1000)
    }

    ngOnInit(): void {
        this.requestedFor = this.appService?.userData?.id;
        this.catalogItem = "9a51d2dd1b03c490d96b11b92a4bcb99";
        this.limit = "500";
        
        this.GetRequestNumbers();
    
        this.apiTimer = setInterval(() =>{
          // this.filterText = '';
          this.GetRequestNumbers();
        }, 1000);
    
        var moment = require('moment-business-days');
        moment.updateLocale({
          holidays: [
            '01-02-2023', // New Year's Day
            '01-16-2023', // Martin Luther King Jr. Day
            '05-29-2023', // Memorial Day
            '07-04-2023', // Independence Day
            '09-04-2023', // Labor Day
            '11-23-2023', // Thanksgiving Day
            '11-24-2023', // Black Friday
            '12-22-2023', // Christmas Eve
            '12-25-2023', // Christmas Day
            '12-26-2023', // Year-End Shutdown
            '12-27-2023', // Year-End Shutdown
            '12-28-2023', // Year-End Shutdown
            '12-29-2023', // Year-End Shutdown
          ],
          holidayFormat: 'MM-DD-YYYY',
        });
    
        let now = moment().format("YYYY-MM-DD HH:mm:ss");
        let now2 = moment().format("YYYY-MM-DD HH:mm:ss");
        this.businessDays = now;
        this.orderDatestamp = now2;
    
        this.orderDate = moment(this.orderDatestamp).toDate();
    
        this.pendingDate = momentBusinessDays(this.businessDays).businessAdd(3);
      } 
    
      putApiRequestEvent(requestId){
        this.orderHistoryService.PutApiRequestEvent(requestId).subscribe(
    
          (response)=> {
            console.log(response);
          },
          (err)=> {
            console.log(err);
          }
        )
      }
    
      update() {
        setTimeout(() => {
          this.isShow = true;
        }, 5000);
        // window.location.reload();
      }
    
      GetRequestNumbers(){
        this.orderHistoryService.GetRequestNumbers(this.requestedFor).subscribe(
          (data) =>{
            this.masterOrderList = data;
            this.orderList = this.masterOrderList;
    
            this.SortOrderList('DESC');
            this.ShowOrdersFor(this.filterDuration, false);
            this.FilterOrderList(this.searchText, false);
          }
        );
      }
      
      SortOrderList(order: string){
        if(order === 'ASC'){
          this.masterOrderList = this.masterOrderList.sort((a, b) =>{
            return <any>new Date(a.createdAt) - <any>new Date(b.createdAt);
          });
        }
        else if(order === 'DESC'){
          this.masterOrderList = this.masterOrderList.sort((a, b) =>{
            return <any>new Date(b.createdAt) - <any>new Date(a.createdAt);
          });
        }
      }
    
      onPageChange(event: number) {
        this.pageNo = event;
      }
    
    FilterOrderList(txtSearch: HTMLInputElement, actionChange:boolean){
        let filterText: string = typeof(txtSearch) == 'object' ? txtSearch.value.toLowerCase() : txtSearch;
        this.searchText = filterText;
        if(typeof filterText == 'undefined' || typeof filterText == null)
        {
          this.orderList = this.orderList;
          this.pageNo = this.pageNo;
          return;
        }
        this.orderList = this.orderList.filter(item=>{
          return ((item.id.toLowerCase().indexOf(filterText) !== -1) || (item.number.toLowerCase().indexOf(filterText) !== -1) || (item && item.product && item.product.name && item.product.name.toLowerCase().indexOf(filterText) !== -1));
        });
        this.pageNo = this.pageNo;
        if(this.orderList.length == 0)
          this.noDataFoundMessage = `No Record found on applying <b><i>${filterText}</i></b> filter`;
    }
    
     
    ShowOrdersFor(e: any, actionChange:boolean){
        let durationDays: number = 0;
        let duration: string = '';
        if(typeof(e) === 'string')
            duration = e;
        else
            duration = e.target.value;
        this.filterDuration = duration;
        if(duration === OrderListDuration.DAYS_7){
            durationDays = 7;
        }
        else if(duration === OrderListDuration.DAYS_14){
            durationDays = 14;
        }
        else if(duration === OrderListDuration.MONTH_1){
            durationDays = 30;
        }
        else if(duration === OrderListDuration.MONTHS_3){
            durationDays = 90;
        }
        else if(duration === OrderListDuration.MONTHS_6){
            durationDays = 180;
        }
        else if(duration === OrderListDuration.YEAR_1){
            durationDays = 365;
        }
        else if(duration === OrderListDuration.ALL){
            durationDays = 0;
        }
        else{
            durationDays = 0;
        }
    
        this.sortDurationDays = durationDays;
    
        if(durationDays == 0){
            this.orderList = this.masterOrderList;
        }

        else {
            let today = new Date();
            let pastDate=new Date(today);
            pastDate.setDate(pastDate.getDate() - durationDays);
            this.orderList = this.masterOrderList.filter(item => {
                return (new Date(item.openedAt) <= today && new Date(item.openedAt) >= pastDate)
            });
        }
        if(actionChange){
            this.filterItem = "days";
        }
    }
     
    ShowEmpty(){
        if(this.filterItem=="search" && this.searchText != ''){
            if(this.orderList.length == 0)
                this.noDataFoundMessage = `No records match search for <b><i>${this.searchText}</i></b>`;
            else
                this.noDataFoundMessage = null;
        }   else {
                if(this.orderList.length == 0)
                    this.noDataFoundMessage = `No orders have been placed in the last <b><i>${this.sortDurationDays}</i></b> days`;
                else
            this.noDataFoundMessage = null;
        }
    }
    
    ngOnDestroy(): void {
        clearInterval(this.apiTimer);
    }
    
}
    
    enum OrderListDuration {
      DAYS_7 = "7_DAYS",
      DAYS_14 = "14_DAYS",
      MONTH_1 = "1_MONTH",
      MONTHS_3 = "3_MONTHS",
      MONTHS_6 = "6_MONTHS",
      YEAR_1 = "1_YEAR",
      ALL = "ALL",
    };
        
