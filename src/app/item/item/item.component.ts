import { ItemService } from 'src/app/services/item/item.service';
import { Component, Input, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertModalConfig } from 'src/app/shared/alert-modal/alert-modal.config';
import { AlertModalComponent } from 'src/app/shared/alert-modal/alert-modal.component';
import { AlertModalService } from 'src/app/services/alert-modal/alert-modal.service';
import { Item } from 'src/app/models/item';
import { transformFormData } from 'src/app/core/utils/form-utils';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.css'],
})
export class ItemComponent implements OnInit {
  @Input()
  editItem!: Item;

  itemForm: FormGroup;

  alertModalConfig: AlertModalConfig = {
    modalTitle: 'ငါးနာမည်အသစ် သိမ်းဆည်းခြင်း။',
    hideFooter: true,
  };

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    public itemService: ItemService,
    private alertModalService: AlertModalService
  ) {
    this.itemForm = this.formBuilder.group({
      itemName: ['', Validators.required],
    });

    this.alertModalService.setAlertModalConfig(this.alertModalConfig);
  }

  get itemName(): AbstractControl {
    return this.itemForm.get('itemName') as FormControl;
  }

  ngOnInit() {
    if (this.editItem) {
      this.itemForm.patchValue(this.editItem);
    }
  }

  onSubmit() {
    if (this.itemForm.invalid) {
      return;
    }

    const transformedData = transformFormData(this.itemForm.value);

    if (this.editItem) {
      this.itemService
        .updateItem(this.editItem.id, transformedData)
        .subscribe({
          next: (res) => {
            this.activeModal.close();
            this.alertModalService.open(
              'ငါးနာမည်အသစ်သိမ်းဆည်းပြီးပါပြီ။',
              'success'
            );
          },
          error: (err) => {
            this.alertModalService.open(err, 'danger');
          },
        });
    } else {
      this.itemService.createItem(transformedData).subscribe({
        next: (res) => {
          this.activeModal.close();
          this.alertModalService.open(
            'ငါးနာမည်အသစ်သိမ်းဆည်းပြီးပါပြီ။',
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
