import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router} from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SdGenApiService } from 'src/app/services/sd-gen-api.service';
import { AlertService } from '../services/alert.service';
import { ToggleComponent } from '../menu/toggle/toggle.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, ToggleComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LoginPage implements OnInit {

  constructor(private Sd: SdGenApiService, private router: Router, private alert: AlertService, private auth: AuthService) { } 
  loader: boolean = false;

  loginForm = new FormGroup({
    login: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]),
    password: new FormControl('', [Validators.required, Validators.maxLength(50)]),
  })  

  loginValue: string = '';

  login() {
    this.loader = true;    
    const formData = this.loginForm.value;
    if (formData.login) {
      formData.login = formData.login.toLowerCase();
    }
    var request = this.Sd.postAuthLogin(formData).subscribe(
      (res) => {
        if (res.status === 200) {
          var currDate = new Date();
          localStorage.setItem('token', res.body.token);
          localStorage.setItem('token_ttl', new Date(currDate.getTime() + res.body.ttl - 1800 * 1000).toString());
          this.Sd.getUserProfile(res.body.token).subscribe((data: any) => {
            if (data.status === 200) {
              localStorage.setItem('user', JSON.stringify(data.body));
              window.location.href = '/txt2img';
            } 
          });
        }
      },
      (err) => {
        this.loader = false;
        if (err.status === 401) {
          this.alert.presentAlert('Error', 'Invalid credentials', 'The credentials you entered are invalid. Please try again.', ['OK'], 'error');
        } else {
          console.log(err);
          this.alert.presentAlert('Error', 'Unknown error', err.error.detail, ['OK'], 'error');
        }
      },
      () => { 
        this.loader = false;
        request.unsubscribe();
      }
    );
  }

  register() {
    this.router.navigate(['/register']);
  }

  resetPassword() {
    this.router.navigate(['/login/reset-password']);
  }


  ngOnInit() {
    this.auth.isAuthenticated().pipe().subscribe((isLoggedIn: boolean) => {
      if (isLoggedIn) {
        this.router.navigate(['/txt2img']);
      }
    });
  }

}
