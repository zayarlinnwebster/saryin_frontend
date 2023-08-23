import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InvoiceListComponent } from './invoices/invoice-list/invoice-list.component';
import { InvoicesComponent } from './invoices/invoices.component';

const routes: Routes = [
  {
    path: '',
    component: InvoicesComponent,
    data: {
      title: 'နယ်ပို့စာရင်းများ'
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InvoiceRoutingModule { }
