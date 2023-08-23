import { Component, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { DateRangeService } from 'src/app/services/date-range/date-range.service';
import { MainDashboardService } from 'src/app/services/main-dashboard/main-dashboard.service';
import { amountChartOptions, customerPaymentChartOptions, itemChartOptions, totalChartOptions, vendorPaymentChartOptions } from './chart-options';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent {
  itemChartData$: Observable<any>;
  itemChartOptions: any = itemChartOptions;

  customerPaymentChartData$: Observable<any>;
  customerPaymentChartOptions: any = customerPaymentChartOptions;

  vendorPaymentChartData$: Observable<any>;
  vendorPaymentChartOptions: any = vendorPaymentChartOptions;

  totalChartData$: Observable<any>;
  totalChartOptions: any = totalChartOptions;

  amountChartData$: Observable<any>;
  amountChartOptions: any = amountChartOptions;

  constructor(
    public mainDashboardService: MainDashboardService,
    public dateRangeService: DateRangeService
  ) {
    this.itemChartData$ = mainDashboardService.itemChartData$;
    this.vendorPaymentChartData$ = mainDashboardService.vendorPaymentChartData$;
    this.customerPaymentChartData$ = mainDashboardService.customerPaymentChartData$;
    this.totalChartData$ = mainDashboardService.totalChartData$;
    this.amountChartData$ = mainDashboardService.amountChartData$;
    mainDashboardService.searchList = '';

    this.dateRangeService.fromDate = mainDashboardService.fromDate;
    this.dateRangeService.toDate = mainDashboardService.toDate;
  }
}
