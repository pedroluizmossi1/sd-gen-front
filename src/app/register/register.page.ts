import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule, Validators  } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Routes, RouterModule, Router } from '@angular/router';
import { SdGenApiService } from 'src/app/sd-gen-api.service';
import { AlertService } from '../alert.service';
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

  loginLoader: boolean = false;

  registerForm = new FormGroup({
    login: new FormControl('pedro' , [Validators.required, Validators.minLength(3), Validators.maxLength(20)]),
    password: new FormControl('91396851' , [Validators.required, Validators.minLength(8), Validators.maxLength(50)]),
    confirmPassword: new FormControl('91396851' , [Validators.required, Validators.minLength(8), Validators.maxLength(50)]),
    email: new FormControl('pedroluizmossi@gmail.com' , [Validators.required, Validators.email]),
    first_name: new FormControl('pedro' , [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
    last_name: new FormControl('pedro' , [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
  })


  register() {
    this.loginLoader = true;
    setTimeout(() => {
    
    const formData = this.registerForm.value;
    if (this.registerForm.value.password !== this.registerForm.value.confirmPassword) {
      this.alert.presentAlert('Erro', 'Passwords don\'t match', 'The passwords you entered don\'t match. Please try again.', ['OK'], 'error');
    } else if (this.registerForm.value.password === this.registerForm.value.confirmPassword) {
      this.Sd.postAuthRegister(formData).subscribe(
        (res) => {
          if (res.status === 200) {
            this.alert.presentAlert('Success', 'Account created', 'Your account was successfully created. You can now login.', ['OK'], 'success');
            this.router.navigate(['/login']);
          }
        },
        (err) => {
          if (err.status === 422) {
            this.alert.presentAlert('Error', 'Invalid data', 'The data you entered is invalid. Please try again.', ['OK'], 'error');
          } else if (err.status === 400) {
            this.alert.presentAlert('Error', 'User already exists', 'The user you tried to create already exists.', ['OK'], 'error');
          } else {
            this.alert.presentAlert('Error', 'Unknown error', err.error.detail, ['OK'], 'error');
          }
        }
      )
      
    }
    this.loginLoader = false;
  }, 1000);
    
    
  }


  ngOnInit() {
    
  }

}
