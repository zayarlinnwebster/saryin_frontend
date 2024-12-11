import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { CustomerUsage } from 'src/app/models/customer/customer-usage';
import { CustomerDetailService } from 'src/app/services/customer-detail/customer-detail.service';

@Component({
  selector: 'app-customer-usage-detail',
  templateUrl: './customer-usage-detail.component.html',
  styleUrls: ['./customer-usage-detail.component.css']
})
export class CustomerUsageDetailComponent {
  @Input()
  customerUsage!: CustomerUsage;
}
