import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ToggleComponent } from '../menu/toggle/toggle.component';
import { SdGenApiService } from 'src/app/sd-gen-api.service';

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
    plan: ''
  }


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
