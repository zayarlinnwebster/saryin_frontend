import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FinancialStatementListComponent } from './financial-statement-list/financial-statement-list.component';
import { FinancialStatementDetailComponent } from './financial-statement-detail/financial-statement-detail.component';

const routes: Routes = [
    {
        path: '',
        component: FinancialStatementListComponent,
        data: {
            title: 'နှစ်ချုပ်စာရင်းများ'
        }
    },
    {
        path: ':id',
        component: FinancialStatementDetailComponent,
        data: {
            title: 'နှစ်ချုပ်စာရင်းအသေးစိတ် အချက်အလက်'
        }
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FinancialRoutingModule { }
