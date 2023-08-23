import { Component, Input } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { transformFormData } from 'src/app/core/utils/form-utils';
import { Customer } from 'src/app/models/customer/customer';
import { AlertModalService } from 'src/app/services/alert-modal/alert-modal.service';
import { CustomerService } from 'src/app/services/customer/customer.service';
import { AlertModalConfig } from 'src/app/shared/alert-modal/alert-modal.config';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css'],
})
export class CustomerComponent {
  @Input()
  editCustomer!: Customer;

  customerForm: FormGroup;

  alertModalConfig: AlertModalConfig = {
    modalTitle: 'ကုန်သည်နာမည်အသစ် သိမ်းဆည်းခြင်း။',
    hideFooter: true,
  };

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    public customerService: CustomerService,
    private alertModalService: AlertModalService
  ) {
    this.customerForm = this.formBuilder.group({
      fullName: ['', Validators.required],
      phoneNo: [''],
      address: [''],
      commission: [
        '',
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
    });

    this.alertModalService.setAlertModalConfig(this.alertModalConfig);
  }

  get fullName(): AbstractControl {
    return this.customerForm.get('fullName') as FormControl;
  }

  get phoneNo(): AbstractControl {
    return this.customerForm.get('phoneNo') as FormControl;
  }

  get address(): AbstractControl {
    return this.customerForm.get('address') as FormControl;
  }

  get commission(): AbstractControl {
    return this.customerForm.get('commission') as FormControl;
  }

  ngOnInit() {
    if (this.editCustomer) {
      this.customerForm.patchValue(this.editCustomer);
    }
  }

  onSubmit() {
    if (this.customerForm.invalid) {
      return;
    }

    this.customerForm.patchValue({ ...transformFormData(this.customerForm.value) })

    if (this.editCustomer) {
      this.customerService
        .updateCustomer(this.editCustomer.id, this.customerForm.value)
        .subscribe({
          next: (res) => {
            this.activeModal.close();
            this.alertModalService.open(
              'ကုန်သည်နာမည်အသစ်သိမ်းဆည်းပြီးပါပြီ။',
              'success'
            );
          },
          error: (err) => {
            this.alertModalService.open(err, 'danger');
          },
        });
    } else {
      this.customerService.createCustomer(this.customerForm.value).subscribe({
        next: (res) => {
          this.activeModal.close();
          this.alertModalService.open(
            'ကုန်သည်နာမည်အသစ်သိမ်းဆည်းပြီးပါပြီ။',
            'success'
          );
        },
        error: (err) => {
          this.alertModalService.open(err, 'danger');
        },
      });
    }
  }
}
