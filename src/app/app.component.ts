import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd, NavigationStart  } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SdGenApiService } from './services/sd-gen-api.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterLink, RouterLinkActive, CommonModule]
})

export class AppComponent {
  public appPages = [
    { title: 'Txt2Img', url: '/txt2img', icon: 'image', color: 'tertiary' },
    { title: 'Face Swap', url: '/face-swap', icon: 'happy', color: 'warning' },
    { title: 'Gallery', url: '/user-folder', icon: 'aperture', color: 'success' },
    { title: 'Profile', url: '/user-profile', icon: 'person', color: 'primary' },
  ];
  public menuDisabled = false;
  
  public standAloneMenuUrl = [
    { title: 'image-folder', url: '/user-folder-image', icon: 'image' },
  ];

  userProfile = {
    email : '',
    first_name : '',
    last_name : '',
    plan: '',
    profile_picture: ''
  };
  

  constructor(private router: Router, private sdGenApiService: SdGenApiService) {}

  logout() {
    var token = localStorage.getItem('token');
    this.sdGenApiService.postAuthLogout(token).subscribe((data) => {
      if (data.status === 200) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.router.navigate(['/login']);
      }
    });
  }
  

  ngOnInit() {
    this.userProfile = JSON.parse(localStorage.getItem('user') || '{}');
    this.userProfile.profile_picture = 'data:image/jpeg;base64,' + this.userProfile.profile_picture
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/login' || event.url === '/register' || event.url === '/reset-password') {
          this.menuDisabled = true;
        } else if (this.appPages.map((x) => x.url).includes(window.location.pathname) || this.standAloneMenuUrl.map((x) => x.url).includes(window.location.pathname)) {
          this.menuDisabled = false;
        } else {
          this.menuDisabled = true;
        }
      }
    });
  }
}
