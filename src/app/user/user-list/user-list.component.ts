import { Component, QueryList, ViewChildren } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EMPTY, Observable, switchMap, takeUntil } from 'rxjs';
import { SortEvent, SortableDirective } from 'src/app/directives/sortable/sortable.directive';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user/user.service';
import { AlertModalService } from 'src/app/services/alert-modal/alert-modal.service';
import { AlertModalConfig } from 'src/app/shared/alert-modal/alert-modal.config';
import { LIMIT_OPTIONS } from 'src/app/shared/constants';
import { UserComponent } from '../user/user.component';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent {
  limitOptions: object[] = LIMIT_OPTIONS;
  users$: Observable<User[]>;
  total$: Observable<number>;

  alertModalConfig: AlertModalConfig = {
    modalTitle: 'အသုံးပြုသူပြင်ဆင်ခြင်း။',
    hideFooter: false,
    dismissButtonLabel: 'လုပ်မည်။',
    closeButtonLabel: 'မလုပ်ပါ။',
  };

  @ViewChildren(SortableDirective)
  headers!: QueryList<SortableDirective>;

  constructor(
    public userService: UserService,
    private modalService: NgbModal,
    private alertModalService: AlertModalService
  ) {
    this.users$ = userService.users$;
    this.total$ = userService.total$;

    this.userService.searchList = '';
    this.alertModalService.setAlertModalConfig(this.alertModalConfig);
  }

  onSort({ column, direction }: SortEvent) {
    // resetting other headers
    this.headers.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.userService.sortColumn = column;
    this.userService.sortDirection = direction;
  }

  onCheckboxChange(user: User) {
    this.userService
    .updateStatus(user.id, user)
    .subscribe({
      next: (res) => {
        this.alertModalService.open(
          'အသုံပြုခွင့်သတ်မှတ်ပြီးပါပြီ။',
          'success'
        );
      },
      error: (err) => {
        this.alertModalService.open(err, 'danger');
      },
    });
  }

  openCreateUser() {
    this.modalService.open(UserComponent, {
      backdrop: 'static',
      animation: true,
    });
  }

  openEditUser(user: User) {
    const modalRef = this.modalService.open(UserComponent, {
      backdrop: 'static',
      animation: true,
    });
    modalRef.componentInstance.editUser = user;
  }

  deleteUser(userId: number) {
    this.alertModalConfig.hideFooter = false;
    this.alertModalService.setAlertModalConfig(this.alertModalConfig);

    this.alertModalService.open('ဤငါးအမည်ကို ဖျက်မှာသေချာပါသလား?', 'warning');
    this.alertModalService.onDismiss
      .pipe(
        takeUntil(this.alertModalService.onClose),
        switchMap((action) => {
          if (action === 'dismiss') {
            this.alertModalConfig.hideFooter = true;
            this.alertModalService.setAlertModalConfig(this.alertModalConfig);

            return this.userService.deleteUser(userId);
          } else {
            return EMPTY;
          }
        })
      )
      .subscribe({
        next: (res) => {
          this.alertModalService.open('အသုံးပြုသူဖျက်သိမ်းပြီးပါပြီ။', 'success');
        },
        error: (err) => {
          this.alertModalService.open(err, 'danger');
        },
      });
  }
}
