import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { DateRangeService } from 'src/app/services/date-range/date-range.service';
import { MainDashboardService } from 'src/app/services/main-dashboard/main-dashboard.service';
import {
  amountChartOptions,
  customerPaymentChartOptions,
  itemChartOptions,
  totalChartOptions,
  vendorPaymentChartOptions,
} from './chart-options';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent implements OnInit {
  itemChartData$: Observable<any> = this.mainDashboardService.itemChartData$;
  itemChartOptions: any = itemChartOptions;

  customerPaymentChartData$: Observable<any> =
    this.mainDashboardService.customerPaymentChartData$;
  customerPaymentChartOptions: any = customerPaymentChartOptions;

  vendorPaymentChartData$: Observable<any> =
    this.mainDashboardService.vendorPaymentChartData$;
  vendorPaymentChartOptions: any = vendorPaymentChartOptions;

  totalChartData$: Observable<any> = this.mainDashboardService.totalChartData$;
  totalChartOptions: any = totalChartOptions;

  amountChartData$: Observable<any> =
    this.mainDashboardService.amountChartData$;
  amountChartOptions: any = amountChartOptions;

  constructor(
    public mainDashboardService: MainDashboardService,
    public dateRangeService: DateRangeService
  ) {}

  ngOnInit(): void {
    this.mainDashboardService.searchList = '';

    this.dateRangeService.fromDate = this.mainDashboardService.fromDate;
    this.dateRangeService.toDate = this.mainDashboardService.toDate;
  }
}
