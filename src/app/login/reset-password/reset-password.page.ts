import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule, Validators  } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Routes, RouterModule, Router } from '@angular/router';
import { SdGenApiService } from 'src/app/services/sd-gen-api.service';
import { AlertService } from 'src/app/services/alert.service';
import { ToggleComponent } from 'src/app/menu/toggle/toggle.component';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, ToggleComponent, ReactiveFormsModule]
})
export class ResetPasswordPage implements OnInit {

  constructor(private router: Router, private Sd: SdGenApiService, private alert: AlertService) { }

  loader: boolean = false;
  
  resetPasswordStatus01: boolean = true;
  resetPasswordStatus02: boolean = false;

  resetPasswordForm = new FormGroup ({
    username : new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]),
  })

  resetPasswordForm2 = new FormGroup ({
    token : new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]),
    password : new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(50)]),
    confirmPassword : new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(50)]),
  })

  resetPassword() {
    this.loader = true;
    const formData = this.resetPasswordForm.value;
    var request = this.Sd.postAuthResetPasswordToken(formData).subscribe(
      (res) => {
        if (res.status === 200) {
          this.alert.presentAlert('Success', 'Reset token sent', 'A reset token has been sent to your email address.', ['OK'], 'success');
          this.resetPasswordStatus01 = false;
          this.resetPasswordStatus02 = true;
        }
      },
      (err) => {
        this.loader = false;
        if (err.status === 401) {
          this.alert.presentAlert('Error', 'Invalid credentials', 'The credentials you entered are invalid. Please try again.', ['OK'], 'error');
        } else {
          this.alert.presentAlert('Error', 'Unknown error', err.error.detail, ['OK'], 'error');
        }
      },
      () => {
        this.loader = false;
        request.unsubscribe();
      }
    );
  }

  resetPassword2() {
    this.loader = true;
    const formData = this.resetPasswordForm2.value;
    const formData2 = this.resetPasswordForm.value;
    var data = {
      reset_token: formData.token,
      password: formData.password,
      new_password: formData.confirmPassword,
      username: formData2.username
    }
    if (formData.password == formData.confirmPassword) {
      var request = this.Sd.postAuthResetPassword(data).subscribe(
        (res) => {
          if (res.status === 200) {
            this.alert.presentAlert('Success', 'Password reset', 'Your password has been reset.', ['OK'], 'success');
            this.resetPasswordForm2.reset();
            this.resetPasswordForm.reset();
            this.resetPasswordStatus01 = true;
            this.resetPasswordStatus02 = false;
            this.router.navigate(['/login']);
          }
        },
        (err) => {
          this.loader = false;
          if (err.status === 401) {
            this.alert.presentAlert('Error', 'Invalid credentials', 'The credentials you entered are invalid. Please try again.', ['OK'], 'error');
          } else {
            this.alert.presentAlert('Error', 'Unknown error', err.error.detail, ['OK'], 'error');
          }
        },
        () => {
          this.loader = false;
          request.unsubscribe();
        }
    );
    } else {
      this.alert.presentAlert('Error', 'Passwords do not match', 'The passwords you entered do not match. Please try again.', ['OK'], 'error');
      this.loader = false;
    }
  }

  ngOnInit() {

  }


}
