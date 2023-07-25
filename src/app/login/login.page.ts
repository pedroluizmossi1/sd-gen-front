import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router} from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SdGenApiService } from 'src/app/sd-gen-api.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class LoginPage implements OnInit {

  constructor(private Sd: SdGenApiService, private router: Router) { }

  loginForm = new FormGroup({
    login: new FormControl('admin'),
    password: new FormControl('admin'),
  })

  login() {
    const formData = this.loginForm.value;
    this.Sd.postAuthLogin(formData).subscribe((data: any) => {
      if (data.status === 200) {
        localStorage.setItem('token', data.body.token);
        this.router.navigate(['/txt2img']);

        this.Sd.getUserProfile(data.body.token).subscribe((data: any) => {
          if (data.status === 200) {
            localStorage.setItem('user', JSON.stringify(data.body));
          }
        }
        );
      }
    });
  }

  ngOnInit() {
  }

}
