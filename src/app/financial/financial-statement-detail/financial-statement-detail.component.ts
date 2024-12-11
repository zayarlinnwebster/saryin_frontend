import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { EMPTY, map, Observable, Subject, switchMap, tap } from 'rxjs';
import { FinancialStatement } from 'src/app/models/financial/financial-statement';
import { FinancialStatementService } from 'src/app/services/financial/financial-statement.service';
import { FinancialCustomerPaymentService } from 'src/app/services/financial/payment/financial-customer-payment.service';
import { FinancialInvoiceDetailService } from 'src/app/services/financial/invoice/financial-invoice-detail.service';
import { CustomerDetailService } from 'src/app/services/customer-detail/customer-detail.service';

@Component({
  selector: 'app-financial-statement-detail',
  templateUrl: './financial-statement-detail.component.html',
  styleUrls: ['./financial-statement-detail.component.css']
})
export class FinancialStatementDetailComponent implements OnInit, OnDestroy {
  financialStatement$: Observable<FinancialStatement>;

  destroy$: Subject<boolean> = new Subject<boolean>();

  activeFragment$: Observable<string>;

  constructor(
    public route: ActivatedRoute,
    public financialInvoiceDetailService: FinancialInvoiceDetailService,
    public financialCustomerPaymentService: FinancialCustomerPaymentService,
    public customerDetailService: CustomerDetailService,
    private _financialStatementService: FinancialStatementService,
  ) {

    this.activeFragment$ = this.route.fragment.pipe(
      map(fragment => fragment ? decodeURIComponent(fragment) : '')
    );

    this.financialStatement$ = this.route.paramMap.pipe(
      switchMap((param: ParamMap) => {
        const financialStatementId = Number(param.get('id'));
        if (!financialStatementId) return EMPTY;
    
        this.financialInvoiceDetailService.financialStatementId = financialStatementId;
        this.financialCustomerPaymentService.financialStatementId = financialStatementId;
    
        return this._financialStatementService.getFinancialStatement(financialStatementId).pipe(
          tap(financialStatement => {
            if (financialStatement?.customerId) {
              this.customerDetailService.customerId = financialStatement.customerId;
            }
          })
        );
      })
    );
    
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }


}
