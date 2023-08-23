import { Component, Input } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from 'src/app/models/store';
import { AlertModalService } from 'src/app/services/alert-modal/alert-modal.service';
import { StoreService } from 'src/app/services/store/store.service';
import { AlertModalConfig } from 'src/app/shared/alert-modal/alert-modal.config';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.css']
})
export class StoreComponent {
  @Input()
  editStore!: Store;

  storeForm: FormGroup;

  alertModalConfig: AlertModalConfig = {
    modalTitle: 'သိုလှောင်ရုံနာမည်အသစ် သိမ်းဆည်းခြင်း။',
    hideFooter: true,
  };

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    public storeService: StoreService,
    private alertModalService: AlertModalService
  ) {
    this.storeForm = this.formBuilder.group({
      storeName: ['', Validators.required],
      phoneNo: [''],
      address: [''],
    });

    this.alertModalService.setAlertModalConfig(this.alertModalConfig)
  }

  get storeName(): AbstractControl {
    return this.storeForm.get('storeName') as FormControl;
  }

  get phoneNo(): AbstractControl {
    return this.storeForm.get('phoneNo') as FormControl;
  }

  get address(): AbstractControl {
    return this.storeForm.get('address') as FormControl;
  }

  ngOnInit() {
    if (this.editStore) {
      this.storeForm.patchValue(this.editStore);
    }
  }

  onSubmit() {
    if (this.storeForm.valid) {
      if (this.editStore) {
        this.storeService.updateStore(this.editStore.id, this.storeForm.value).subscribe({
          next: (res) => {
            this.activeModal.close();
            this.alertModalService.open('သိုလှောင်ရုံနာမည်အသစ်သိမ်းဆည်းပြီးပါပြီ။', 'success');
          },
          error: (err) => {
            this.alertModalService.open(err, 'danger');
          },
        });
      } else {
        this.storeService.createStore(this.storeForm.value).subscribe({
          next: (res) => {
            this.activeModal.close();
            this.alertModalService.open('သိုလှောင်ရုံနာမည်အသစ်သိမ်းဆည်းပြီးပါပြီ။', 'success');
          },
          error: (err) => {
            this.alertModalService.open(err, 'danger');
          },
        });
      }
    }
  }
}
