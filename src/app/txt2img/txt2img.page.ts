import { Component, Input, OnInit, CUSTOM_ELEMENTS_SCHEMA , ElementRef, AfterViewInit, ViewChild } from '@angular/core';
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
import { ModelSelectComponent } from './model-select/model-select.component';
import { IonRange, RangeCustomEvent  } from '@ionic/angular';
import { RangeValue } from '@ionic/core';

@Component({
  selector: 'app-txt2img',
  templateUrl: './txt2img.page.html',
  styleUrls: ['./txt2img.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, ToggleComponent, FullscreenImageDirective, SamplerSelectComponent, GetFolderSelectComponent, ModelSelectComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Txt2imgPage implements OnInit, AfterViewInit {
  constructor(private Sd: SdGenApiService, private sanitizer: DomSanitizer) { }
  @ViewChild('refinerRange') refinerRange!: IonRange;
  
  sdxlToggle: boolean = false;
  sd15Toggle: boolean = false;
  advancedToggle: boolean = true;
  refinerRangelastEmittedValue: RangeValue = {lower: 0, upper: 1};

  images: any[] = [];
  imageLoader: boolean = false;
  imagePlaceholder: boolean = true;
  folder = '';
  sampler = '';
  model_path = 'SDXL\dreamshaperXL10_alpha2Xl10.safetensors';
  modelVersion = 'SDXL';

  SdxlDefaultParams = {
    prompt: 'dog surfing, beach island, anime style, close view, water splash drops',
    negative_prompt: 'low quality:1.3) (((3D render)))',
    model_path: '',
    width: '1024',
    height: '1024',
    sampler: 'dpmpp_2m',
    steps: '15',
    seed: '-1',
    batch_size: '1',
    cfg_scale: '7',
    folder: '',
  }

  Sd15DefaultParams = {
    prompt: 'Steampunk Portrait of Lara Croft, detailed, comic style, jim lee!',
    negative_prompt: 'low quality',
    model_path: '',
    width: '512',
    height: '768',
    sampler: 'UniPC',
    steps: '20',
    seed: '-1',
    batch_size: '1',
    cfg_scale: '7',
    folder: '',
  }
  
  generateImageForm = new FormGroup({
    prompt: new FormControl('Steampunk Portrait of Lara Croft, detailed, comic style, jim lee!'),
    negative_prompt: new FormControl('low quality'),
    model_path: new FormControl(''),
    width: new FormControl('512'),
    height: new FormControl('768'),
    sampler: new FormControl('Euler a'),
    steps: new FormControl('20'),
    seed: new FormControl('-1'),
    batch_size: new FormControl('1'),
    cfg_scale: new FormControl('7'),
    folder: new FormControl(''),
  })

  changeAdvancedToggle() {
    this.advancedToggle = !this.advancedToggle;
  }

  changeFolderCallback(folder: string) {
    this.generateImageForm.patchValue({folder: folder});
  }

  changeSamplerCallback(sampler: string) {
    this.generateImageForm.patchValue({sampler: sampler});
  }

  changeModelCallback(model: string) {
      this.generateImageForm.patchValue({model_path: model});
      console.log(this.generateImageForm.value);
  }

  changeModelVersionCallback(modelVersion: string) {
    this.modelVersion = modelVersion;
  }

  pinFormatter(value: number) {
    //format 0.0
    return value.toFixed(1);
  }

  generateImage() {
      this.images = [];
      var formData = this.generateImageForm.value;
      var token = localStorage.getItem('token');
      console.log(formData);
      var baseImage: Blob | null;
      this.imageLoader = true; 

      if (this.modelVersion == 'SDXL') {
        this.Sd.postImageTxt2imgV2Sdxl(token, formData, formData.folder).subscribe((data: any) => {
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
      } else if (this.modelVersion == 'SD15') {
        this.Sd.postImageTxt2imgV2Sd15(token, formData, formData.folder).subscribe((data: any) => {
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
    } 
  
  
  ngOnInit() {
    if (this.imagePlaceholder == false && this.images.length == 0) {
      this.imagePlaceholder = true;
    }
    if (this.modelVersion == 'SDXL') {
      this.generateImageForm.patchValue(this.SdxlDefaultParams);
    } else if (this.modelVersion == 'SD15') {
      this.generateImageForm.patchValue(this.Sd15DefaultParams);
    }
  }

  ngAfterViewInit() {
    if (this.modelVersion == 'SDXL') {
      this.refinerRange.color = "success";
    } else if (this.modelVersion == 'SD15') {
      this.refinerRange.color = "success";
    }
  }

  applySliderColor(ev: Event) {
    if (this.modelVersion == 'SDXL') {
        this.refinerRangelastEmittedValue = (ev as RangeCustomEvent).detail.value as number
        if (this.refinerRangelastEmittedValue == 0) {
          this.refinerRange.color = "dark";
        }    
        else if(this.refinerRangelastEmittedValue <= 0.3) {
          this.refinerRange.color = "success";
        }
        else if (this.refinerRangelastEmittedValue <= 0.5) {
          this.refinerRange.color = "warning";
        }
        else {
          this.refinerRange.color = "danger";
        }
      } else if (this.modelVersion == 'SD15') {
        this.refinerRangelastEmittedValue = (ev as RangeCustomEvent).detail.value as number
        if (this.refinerRangelastEmittedValue == 1) {
          this.refinerRange.color = "dark";
        }    
        else if(this.refinerRangelastEmittedValue >= 1.8) {
          this.refinerRange.color = "success";
        }
        else if (this.refinerRangelastEmittedValue >= 1.5) {
          this.refinerRange.color = "warning";
        }
        else {
          this.refinerRange.color = "danger";
        }
      }
    }

}
