import { Component, Input, QueryList, ViewChildren } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EMPTY, Observable, switchMap, takeUntil } from 'rxjs';
import { SortableDirective, SortEvent } from 'src/app/directives/sortable/sortable.directive';
import { FinancialStatement } from 'src/app/models/financial/financial-statement';
import { AlertModalService } from 'src/app/services/alert-modal/alert-modal.service';
import { FinancialStatementService } from 'src/app/services/financial/financial-statement.service';
import { AlertModalConfig } from 'src/app/shared/alert-modal/alert-modal.config';
import { LIMIT_OPTIONS } from 'src/app/shared/constants';
import { FinancialStatementComponent } from '../financial-statement/financial-statement.component';

@Component({
  selector: 'app-financial-statement-list',
  templateUrl: './financial-statement-list.component.html',
  styleUrls: ['./financial-statement-list.component.css']
})
export class FinancialStatementListComponent {
  limitOptions: object[] = LIMIT_OPTIONS;
  financialStatements$: Observable<FinancialStatement[]>;
  total$: Observable<number>;

  alertModalConfig: AlertModalConfig = {
    modalTitle: 'နှစ်ချုပ်စာရင်းပြင်ဆင်ခြင်း။',
    hideFooter: false,
    dismissButtonLabel: 'လုပ်မည်။',
    closeButtonLabel: 'မလုပ်ပါ။',
  };

  @ViewChildren(SortableDirective)
  headers!: QueryList<SortableDirective>;

  constructor(
    public financialStatementService: FinancialStatementService,
    private modalService: NgbModal,
    private alertModalService: AlertModalService
  ) {
    this.financialStatements$ = financialStatementService.financialStatements$;
    this.total$ = financialStatementService.total$;

    this.financialStatementService.searchList = '';
    this.alertModalService.setAlertModalConfig(this.alertModalConfig);
  }

  onSort({ column, direction }: SortEvent) {
    // resetting other headers
    this.headers.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.financialStatementService.sortColumn = column;
    this.financialStatementService.sortDirection = direction;
  }

  openCreateItem() {
    this.modalService.open(FinancialStatementComponent, {
      backdrop: 'static',
      fullscreen: true,
      animation: true,
    });
  }

  openEditItem(financialStatement: FinancialStatement) {
    const modalRef = this.modalService.open(FinancialStatementComponent, {
      backdrop: 'static',
      fullscreen: true,
      animation: true,
    });
    modalRef.componentInstance.editFinancialStatement = financialStatement;
  }

  deleteItem(itemId: number) {
    this.alertModalConfig.hideFooter = false;
    this.alertModalService.setAlertModalConfig(this.alertModalConfig);

    this.alertModalService.open('ဤနှစ်ချုပ်စာရင်းကို ဖျက်မှာသေချာပါသလား?', 'warning');
    this.alertModalService.onDismiss
      .pipe(
        takeUntil(this.alertModalService.onClose),
        switchMap((action) => {
          if (action === 'dismiss') {
            this.alertModalConfig.hideFooter = true;
            this.alertModalService.setAlertModalConfig(this.alertModalConfig);

            return this.financialStatementService.deleteFinancialStatement(itemId);
          } else {
            return EMPTY;
          }
        })
      )
      .subscribe({
        next: (res) => {
          this.alertModalService.open('နှစ်ချုပ်စာရင်းဖျက်သိမ်းပြီးပါပြီ။', 'success');
        },
        error: (err) => {
          this.alertModalService.open(err, 'danger');
        },
      });
  }
}
