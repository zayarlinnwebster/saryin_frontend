import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { AlertModalComponent } from 'src/app/shared/alert-modal/alert-modal.component';
import { AlertModalConfig } from 'src/app/shared/alert-modal/alert-modal.config';

@Injectable({
  providedIn: 'root',
})
export class AlertModalService {
  alertModalConfig!: AlertModalConfig;
  onDismiss: Subject<string> = new Subject<string>();
  onClose: Subject<string> = new Subject<string>();

  constructor(private modalService: NgbModal) {}

  open(
    messages: any | string[],
    alertType: string,
    timeOutValue: number = 3000
  ) {
    const modalRef = this.modalService.open(AlertModalComponent, {
      backdrop: 'static',
      centered: true,
      animation: true,
    });
    modalRef.componentInstance.alertModalConfig = this.alertModalConfig;
    modalRef.componentInstance.messages =
      typeof messages === 'string' ? [messages] : messages.message;
    modalRef.componentInstance.alertType = alertType;

    setTimeout(() => modalRef.close(), timeOutValue);

    modalRef.result.then(
      (result) => {
        this.onClose.next(result);
      },
      (reason) => {
        this.onDismiss.next(reason);
      }
    );
  }

  setAlertModalConfig(alertModalConfig: AlertModalConfig) {
    this.alertModalConfig = alertModalConfig;
  }
}
