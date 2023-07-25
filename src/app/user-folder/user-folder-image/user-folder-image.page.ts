import { Component, OnInit, Input } from '@angular/core';
import { HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ToggleComponent } from 'src/app/menu/toggle/toggle.component';
import { SdGenApiService } from 'src/app/sd-gen-api.service';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { InfiniteScrollCustomEvent } from '@ionic/angular';

@Component({
  selector: 'app-user-folder-image',
  templateUrl: './user-folder-image.page.html',
  styleUrls: ['./user-folder-image.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ToggleComponent]
})
export class UserFolderImagePage implements OnInit {
  @Input() images: any[] = [];

  constructor(private Sd: SdGenApiService, private route: ActivatedRoute, private sanitizer: DomSanitizer) { }
  images_id: any[] = [];
  index: number = 0;
  index_increment: number = 5;


  onIonInfinite(event: any) {
    setTimeout(() => {
      this.index += this.index_increment;
      this.getImages(this.index, this.index + this.index_increment);
      event.target.complete();
    }, 500);
  }
    

  getImages(index:any, size:any) {
    var token = localStorage.getItem('token');
    var images_id = [];
    this.route.queryParams.subscribe(params => {
      images_id = params['images'];
      for (let i = index; i < size; i++) {
        this.Sd.getUserImage(token, images_id[i]).subscribe((response: HttpResponse<Blob>) => {
          // Obtenha o corpo da resposta que é a imagem Blob
          var baseImage = response.body;
          if (baseImage) {
            let objectURL = URL.createObjectURL(baseImage);
            this.images.push(this.sanitizer.bypassSecurityTrustUrl(objectURL));
          }
        });
      }
    }
    );
  }
  
  ngOnInit() {
    this.getImages(this.index, 10);
  }

}
