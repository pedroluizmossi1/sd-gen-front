import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ToggleComponent } from '../menu/toggle/toggle.component';
import { SdGenApiService } from 'src/app/services/sd-gen-api.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.page.html',
  styleUrls: ['./user-profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ToggleComponent]
})
export class UserProfilePage implements OnInit {

  constructor(private Sd: SdGenApiService) { }

  userProfile = {
    email : '',
    first_name : '',
    last_name : '',
    plan: '',
    image: ''
  };

  profile() {
    var token = localStorage.getItem('token');
    this.Sd.getUserProfile(token).subscribe((data: any) => {
      if (data.status === 200) {
        this.userProfile = data.body;
      } else {
        console.log(data.body);
      }
    });
  }

  ngOnInit() {
    this.profile();
  }

}
