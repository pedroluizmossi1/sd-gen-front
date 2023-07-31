import { Component, Input, OnInit, CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ToggleComponent } from '../menu/toggle/toggle.component';
import { SdGenApiService } from 'src/app/services/sd-gen-api.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FullscreenImageDirective } from 'src/app/image/fullscreen-image.directive';
import { SamplerSelectComponent } from './sampler-select/sampler-select.component';
import { GetFolderSelectComponent } from '../user-folder/get-folder-select/get-folder-select.component';

@Component({
  selector: 'app-txt2img',
  templateUrl: './txt2img.page.html',
  styleUrls: ['./txt2img.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, ToggleComponent, FullscreenImageDirective, SamplerSelectComponent, GetFolderSelectComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Txt2imgPage implements OnInit {

  constructor(private Sd: SdGenApiService, private sanitizer: DomSanitizer) { }

  images: any[] = [];
  imageLoader: boolean = false;
  imagePlaceholder: boolean = true;
  folder = '';
  sampler = '';

  generateImageForm = new FormGroup({
    prompt: new FormControl('Steampunk Portrait of Lara Croft, detailed, comic style, jim lee!'),
    width: new FormControl('512'),
    height: new FormControl('768'),
    sampler: new FormControl('Euler a'),
    steps: new FormControl('20'),
    seed: new FormControl('-1'),
    batch_size: new FormControl('1'),
    cfg_scale: new FormControl('7'),
    folder: new FormControl(''),
  })

  changeFolderCallback(folder: string) {
    this.generateImageForm.patchValue({folder: folder});
  }

  changeSamplerCallback(sampler: string) {
    this.generateImageForm.patchValue({sampler: sampler});
  }

  generateImage() {
      this.images = [];
      var formData = this.generateImageForm.value;
      var token = localStorage.getItem('token');
      console.log(formData);
      var baseImage: Blob | null;
      this.imageLoader = true; 
      
      this.Sd.postGenerateImage(token, formData, formData.folder).subscribe((data: any) => {
        if (data.status === 200) {
          var images_id = data.body.images;
          for (var i = 0; i < images_id.length; i++) {
            this.Sd.getUserImage(token, images_id[i]).subscribe((response: HttpResponse<Blob>) => {
              // Obtenha o corpo da resposta que é a imagem Blob
              baseImage = response.body;
              if (baseImage) {
                let objectURL = URL.createObjectURL(baseImage);
                this.images.push(this.sanitizer.bypassSecurityTrustUrl(objectURL));
                this.imagePlaceholder = false;
              }
            });
          }
        }
        this.imageLoader = false;
      });
    } 
  
  
  ngOnInit() {
    if (this.imagePlaceholder == false && this.images.length == 0) {
      this.imagePlaceholder = true;
    }
  }

}
