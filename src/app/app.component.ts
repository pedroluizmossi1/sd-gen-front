import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd  } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SdGenApiService } from './sd-gen-api.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterLink, RouterLinkActive, CommonModule]
})

export class AppComponent {
  public appPages = [
    { title: 'Txt2Img', url: '/txt2img', icon: 'image' },
    { title: 'Folders', url: '/user-folder', icon: 'folder' },
    { title: 'images', url: '/user-folder-image', icon: 'images' },
    { title: 'Profile', url: '/user-profile', icon: 'person' },
    
  ];
  public menuDisabled = false;

  constructor(private router: Router, private sdGenApiService: SdGenApiService) {}

  logout() {
    var token = localStorage.getItem('token');
    this.sdGenApiService.postAuthLogout(token).subscribe((data) => {
      if (data.status === 200) {
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      }
    });
  }

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/login') {
          this.menuDisabled = true;
        } else if (this.appPages.map((x) => x.url).includes(window.location.pathname)) {
          this.menuDisabled = false;
        } else {
          this.menuDisabled = true;
        }
      }
    });
  }
}
