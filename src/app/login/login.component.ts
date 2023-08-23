import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AuthService } from '../services/auth/auth.service';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  userForm: FormGroup;
  errorMessage$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  showPassword: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    public authService: AuthService,
    private router: Router,
  ) {
    this.userForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  get username(): AbstractControl {
    return this.userForm.get('username') as FormControl;
  }

  get password(): AbstractControl {
    return this.userForm.get('password') as FormControl;
  }

  ngOnInit() { }

  onSubmit() {
    if (this.userForm.invalid) {
      return;
    }

    this.authService.login(this.userForm.value).subscribe({
      next: (res) => {
        this.router.navigate(['/dashboards']);
      },
      error: (err) => {
        this.errorMessage$.next(err.message);
        setTimeout(() => this.errorMessage$.next(''), 3000)
      },
    });
  }
}
