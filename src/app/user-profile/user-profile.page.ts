import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ToggleComponent } from '../menu/toggle/toggle.component';
import { SdGenApiService } from 'src/app/services/sd-gen-api.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AlertService } from '../services/alert.service';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.page.html',
  styleUrls: ['./user-profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ToggleComponent, NgxJsonViewerModule]
})
export class UserProfilePage implements OnInit {

  constructor(private Sd: SdGenApiService, private sanitizer: DomSanitizer, private alertService: AlertService) { }

  profileLoader = false;
  jsonPlan = {
    name: '',
    description: '',
    price: '',
  };
  jsonPlan2 = {
    resources: {
    }
  };
  userProfile = {
    email : '',
    first_name : '',
    last_name : '',
    plan: '',
    profile_picture: ''
  };

 

  profile() {
    var token = localStorage.getItem('token');
    this.Sd.getUserProfile(token).subscribe((data: any) => {
      if (data.status === 200) {
        this.userProfile = data.body;
        this.userProfile.profile_picture = 'data:image/jpeg;base64,' + this.userProfile.profile_picture
        this.Sd.getUserPlan(token, this.userProfile.plan).subscribe({
          next: (data: any) => {
            if (data.status === 200) {
              this.jsonPlan = data.body;
              this.jsonPlan2 = data.body.resources;
            }
          },
        error: (error) => {
          console.log(error);
        },
        complete: () => {
          
        }
        });
      } else {
        console.log(data.body);
      }
    });
  }

  uploadFile() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    const token = localStorage.getItem('token');
    const fileLimitKB = 1024 * 1024 * 0.5; // 512 KB
    
    fileInput.onchange = (event) => {
      const file = (event.target as HTMLInputElement)?.files?.[0];
      if (!file || !file.size || file.size > fileLimitKB) {
        this.alertService.presentAlert('Error', 'File too big', 'File size must be less than 512 KB, please upload a smaller file.', ['OK'], 'error');
        return;
      }
      else if (!file.type.includes('image')) {
        this.alertService.presentAlert('Error', 'Invalid file type', 'Please upload an image file.', ['OK'], 'error');
        return;
      }
      const reader = new FileReader();
        
      reader.onload = (e) => {
        const imageBase64 = e?.target?.result?.toString() || '';
        const base64Data = imageBase64.split(',')[1];
        const imageJson = {
          'profile_picture': base64Data
        };
        this.profileLoader = true;
        this.Sd.putUserProfileImage(token, imageJson).subscribe({
          next: () => {
            this.profile();
            this.profileLoader = false;
          },
          error: (error) => {
            console.error(error);
            this.profileLoader = false;
          },
          complete: () => {
            this.profileLoader = false;
            this.Sd.getUserProfile(token).subscribe({
              next: (data: any) => {
                if (data.status === 200) {
                  localStorage.setItem('user', JSON.stringify(data.body));
                } 
              }
            }
            );
            this.alertService.presentAlert('Success', 'Profile picture updated', 'Your profile picture has been updated. Please log out or refresh to change profile picture in the menu.', ['OK'], 'success');
          }
        });
      };

      reader.readAsDataURL(file);
    };
    
    fileInput.click();
  }

  ngOnInit() {
    this.profile();
  }

}
