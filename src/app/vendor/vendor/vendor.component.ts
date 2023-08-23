import { Component, Input } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { transformFormData } from 'src/app/core/utils/form-utils';
import { Vendor } from 'src/app/models/vendor/vendor';
import { AlertModalService } from 'src/app/services/alert-modal/alert-modal.service';
import { VendorService } from 'src/app/services/vendor/vendor.service';
import { AlertModalConfig } from 'src/app/shared/alert-modal/alert-modal.config';

@Component({
  selector: 'app-vendor',
  templateUrl: './vendor.component.html',
  styleUrls: ['./vendor.component.css']
})
export class VendorComponent {
  @Input()
  editVendor!: Vendor;

  customerForm: FormGroup;

  alertModalConfig: AlertModalConfig = {
    modalTitle: 'ပွဲရုံနာမည်အသစ် သိမ်းဆည်းခြင်း။',
    hideFooter: true,
  };

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    public customerService: VendorService,
    private alertModalService: AlertModalService
  ) {
    this.customerForm = this.formBuilder.group({
      vendorName: ['', Validators.required],
      phoneNo: [''],
      address: [''],
    });

    this.alertModalService.setAlertModalConfig(this.alertModalConfig);
  }

  get vendorName(): AbstractControl {
    return this.customerForm.get('vendorName') as FormControl;
  }

  get phoneNo(): AbstractControl {
    return this.customerForm.get('phoneNo') as FormControl;
  }

  get address(): AbstractControl {
    return this.customerForm.get('address') as FormControl;
  }

  ngOnInit() {
    if (this.editVendor) {
      this.customerForm.patchValue(this.editVendor);
    }
  }

  onSubmit() {
    if (this.customerForm.invalid) {
      return;
    }

    this.customerForm.patchValue({...transformFormData(this.customerForm.value)}) 

    if (this.editVendor) {
      this.customerService
        .updateVendor(this.editVendor.id, this.customerForm.value)
        .subscribe({
          next: (res) => {
            this.activeModal.close();
            this.alertModalService.open(
              'ပွဲရုံနာမည်အသစ်သိမ်းဆည်းပြီးပါပြီ။',
              'success'
            );
          },
          error: (err) => {
            this.alertModalService.open(err, 'danger');
          },
        });
    } else {
      this.customerService.createVendor(this.customerForm.value).subscribe({
        next: (res) => {
          this.activeModal.close();
          this.alertModalService.open(
            'ပွဲရုံနာမည်အသစ်သိမ်းဆည်းပြီးပါပြီ။',
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
