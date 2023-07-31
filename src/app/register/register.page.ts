import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule, Validators  } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Routes, RouterModule, Router } from '@angular/router';
import { SdGenApiService } from 'src/app/services/sd-gen-api.service';
import { AlertService } from '../services/alert.service';
import { ToggleComponent } from '../menu/toggle/toggle.component';


@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, RouterModule, ToggleComponent],
})
export class RegisterPage implements OnInit {

  constructor(private Sd: SdGenApiService, private router: Router, private alert: AlertService) { }

  loader: boolean = false;

  name_regex = /^[a-zA-ZÀ-ÿ0-9_\s.]+$/;
  login_regex = /^[a-zA-Z0-9_-]+$/;

  registerForm = new FormGroup({
    login: new FormControl('' , [Validators.required, Validators.minLength(3), Validators.maxLength(20), Validators.pattern(this.login_regex)]),
    password: new FormControl('' , [Validators.required, Validators.minLength(8), Validators.maxLength(50)]),
    confirmPassword: new FormControl('' , [Validators.required, Validators.minLength(8), Validators.maxLength(50)]),
    email: new FormControl('' , [Validators.required, Validators.email, Validators.minLength(3), Validators.maxLength(50)]),
    first_name: new FormControl('' , [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(this.name_regex)]),
    last_name: new FormControl('' , [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(this.name_regex)]),
  })


  register() {
    this.loader = true;    
    const formData = this.registerForm.value;
    if (this.registerForm.value.password !== this.registerForm.value.confirmPassword) {
      this.alert.presentAlert('Erro', 'Passwords don\'t match', 'The passwords you entered don\'t match. Please try again.', ['OK'], 'error');
    } else if (this.registerForm.value.password === this.registerForm.value.confirmPassword) {
      var request = this.Sd.postAuthRegister(formData).subscribe(
        (res) => {
          if (res.status === 200) {
            this.alert.presentAlert('Success', 'Account created', 'Your account was successfully created. You can now login.', ['OK'], 'success');
            this.router.navigate(['/login']);
          }
        },
        (err) => {
          this.loader = false;
          if (err.status === 422) {
            this.alert.presentAlert('Error', 'Invalid data', 'The data you entered is invalid. Please try again.', ['OK'], 'error');
          } else if (err.status === 400) {
            this.alert.presentAlert('Error', 'User already exists', 'The user you tried to create already exists.', ['OK'], 'error');
          } else {
            this.alert.presentAlert('Error', 'Unknown error', err.error.detail, ['OK'], 'error');
          }
        },
        () =>
        {
          this.loader = false;
          request.unsubscribe();
        }
      )
    }   
  }


  ngOnInit() {
    
  }

}
