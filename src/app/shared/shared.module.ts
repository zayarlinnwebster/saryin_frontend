import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { RouterModule } from '@angular/router';
import { AlertModalComponent } from './alert-modal/alert-modal.component';
import { NgbAlert, NgbDatepickerModule, NgbPaginationModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { LoadingRowComponent } from './loading-row/loading-row.component';
import { EmptyRowComponent } from './empty-row/empty-row.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { SortableDirective } from '../directives/sortable/sortable.directive';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from '../pipes/pipes.module';
import { LoadingCenterComponent } from './loading-center/loading-center.component';
import { BillClearComponent } from './bill-clear/bill-clear.component';
import { CustomerUsageDetailComponent } from './customer-usage-detail/customer-usage-detail.component';

@NgModule({
  declarations: [
    BreadcrumbComponent,
    AlertModalComponent,
    LoadingRowComponent,
    EmptyRowComponent,
    LoadingCenterComponent,
    BillClearComponent,
    CustomerUsageDetailComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    NgbAlert,
    SortableDirective,
    NgSelectModule,
    NgbPaginationModule,
    NgbDatepickerModule,
    ReactiveFormsModule,
    FormsModule,
    PipesModule,
    NgbPopoverModule
  ],
  exports: [
    BreadcrumbComponent,
    LoadingRowComponent,
    LoadingCenterComponent,
    EmptyRowComponent,
    BillClearComponent,
    NgSelectModule,
    NgbPaginationModule,
    SortableDirective,
    NgbDatepickerModule,
    ReactiveFormsModule,
    FormsModule,
    PipesModule,
    CustomerUsageDetailComponent
  ]
})
export class SharedModule { }
