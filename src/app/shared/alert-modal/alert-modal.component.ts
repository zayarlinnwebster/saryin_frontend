import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertModalConfig } from './alert-modal.config';

@Component({
  selector: 'app-alert-modal',
  templateUrl: './alert-modal.component.html',
  styleUrls: ['./alert-modal.component.css']
})
export class AlertModalComponent {
  @Input()
  public alertModalConfig!: AlertModalConfig;
  @Input()
  public messages: string[] = [];
  @Input()
  public alertType: string = '';

  constructor(public activeModal: NgbActiveModal) {}


}
