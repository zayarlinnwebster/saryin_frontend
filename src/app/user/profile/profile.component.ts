import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UserService } from 'src/app/services/user/user.service';
import { AlertModalService } from 'src/app/services/alert-modal/alert-modal.service';
import { AlertModalConfig } from 'src/app/shared/alert-modal/alert-modal.config';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent {
  user: User | null;

  showOldPassword: boolean = false;
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
    private alertModalService: AlertModalService,
    private authService: AuthService,
  ) {
    this.user = this.authService.currentUserValue;

    this.userForm = this.formBuilder.group({
      oldPassword: ['', Validators.required],
      password: [
        '',
        Validators.compose([
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
        ]),
      ],
      confirmPassword: ['', Validators.required],
    }, {
      validators: this.userService.passwordMatchValidator,
    });

    this.alertModalService.setAlertModalConfig(this.alertModalConfig);
  }

  get oldPassword(): AbstractControl {
    return this.userForm.get('oldPassword') as FormControl;
  }

  get password(): AbstractControl {
    return this.userForm.get('password') as FormControl;
  }

  get confirmPassword(): AbstractControl {
    return this.userForm.get('confirmPassword') as FormControl;
  }

  onSubmit() {
    if (this.userForm.invalid) {
      return;
    }

    if (this.user) {
      this.userService.updatePassword(this.user.id, this.userForm.value).subscribe({
        next: (res) => {
          this.activeModal.close();
          this.alertModalService.open(
            'အသုံပြုသူ လျှို့ဝှက်နံပါတ်အသစ်ပြင်ဆင်ပြီးပါပြီ။',
            'success'
          );
        },
        error: (err) => {
          this.alertModalService.open(err.message, 'danger');
        },
      });
    }
  }
}
