import { Component, Input } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { transformFormData } from 'src/app/core/utils/form-utils';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user/user.service';
import { AlertModalService } from 'src/app/services/alert-modal/alert-modal.service';
import { AlertModalConfig } from 'src/app/shared/alert-modal/alert-modal.config';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent {
  @Input()
  editUser!: User;

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  userForm: FormGroup;

  alertModalConfig: AlertModalConfig = {
    modalTitle: 'အသုံပြုသူအသစ် သိမ်းဆည်းခြင်း။',
    hideFooter: true,
  };

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    public userService: UserService,
    private alertModalService: AlertModalService
  ) {
    this.userForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.compose([
        // 1. password field is required
        Validators.required,
        // 2. has a minimum length of 8 characters
        Validators.minLength(8),
        // 3. check whether the entered password has a number
        this.userService.patternValidator(/\d/, { hasNumber: true }),
        // 4. check whether the entered password has upper case letter
        this.userService.patternValidator(/[A-Z]/, {
          hasCapitalCase: true,
        }),
        // 5. check whether the entered password has lower case letter
        this.userService.patternValidator(/[a-z]/, {
          hasSmallCase: true,
        }),
      ]),],
      confirmPassword: ['', Validators.required],
      isActive: [1, Validators.required],
    },
      {
        validators: this.userService.passwordMatchValidator,
      });

    this.alertModalService.setAlertModalConfig(this.alertModalConfig);
  }

  get username(): AbstractControl {
    return this.userForm.get('username') as FormControl;
  }

  get password(): AbstractControl {
    return this.userForm.get('password') as FormControl;
  }

  get confirmPassword(): AbstractControl {
    return this.userForm.get('confirmPassword') as FormControl;
  }

  get isActive(): AbstractControl {
    return this.userForm.get('isActive') as FormControl;
  }

  ngOnInit() {
    if (this.editUser) {
      this.userForm.patchValue(this.editUser);
    }
  }

  onSubmit() {
    if (this.userForm.invalid) {
      return;
    }

    const transformedData = transformFormData(this.userForm.value);

    if (this.editUser) {
      this.userService
        .updateUser(this.editUser.id, transformedData)
        .subscribe({
          next: (res) => {
            this.activeModal.close();
            this.alertModalService.open(
              'အသုံပြုသူအသစ်သိမ်းဆည်းပြီးပါပြီ။',
              'success'
            );
          },
          error: (err) => {
            this.alertModalService.open(err, 'danger');
          },
        });
    } else {
      this.userService.createUser(transformedData).subscribe({
        next: (res) => {
          this.activeModal.close();
          this.alertModalService.open(
            'အသုံပြုသူအသစ်သိမ်းဆည်းပြီးပါပြီ။',
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
