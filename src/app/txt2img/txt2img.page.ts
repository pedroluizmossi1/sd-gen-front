import { Component, Input, OnInit, OnChanges, CUSTOM_ELEMENTS_SCHEMA , ElementRef, AfterViewInit, ViewChild, SimpleChanges } from '@angular/core';
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
import { Queue } from '../models/txt2img.models';
import Swiper from 'swiper';
import { AlertService } from '../services/alert.service';
@Component({
  templateUrl: './txt2img.page.html',
  styleUrls: ['./txt2img.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, ToggleComponent, FullscreenImageDirective, SamplerSelectComponent, GetFolderSelectComponent, ModelSelectComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Txt2imgPage implements OnInit, AfterViewInit, OnChanges {
  constructor(private Sd: SdGenApiService, private sanitizer: DomSanitizer, private alert: AlertService) { }
  @ViewChild('refinerRange') refinerRange!: IonRange;
  @Input() modelVersion: string = 'SDXL';
  
  sdxlToggle: boolean = false;
  sd15Toggle: boolean = false;
  advancedToggle: boolean = true;
  refinerRangelastEmittedValue: RangeValue = {lower: 0, upper: 1}
  generateButton: boolean = false;

  images: any[] = [];
  imageLoader: boolean = false;
  imagePlaceholder: boolean = true;
  folder = '';
  sampler = 'UniPC';
  model_path = 'SDXL\dreamshaperXL10_alpha2Xl10.safetensors';
  
  queue: Queue = {
    running: false,
    queue_pending: 0,
    queue_position: 0,
  }

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
    sampler: new FormControl('UniPC'),
    steps: new FormControl('20'),
    seed: new FormControl('-1'),
    batch_size: new FormControl('1'),
    cfg_scale: new FormControl('7'),
    folder: new FormControl(''),
    refiner_denoise: new FormControl(0.0),
    latent_denoise: new FormControl(0.0),
  })
  
  changeAdvancedToggle() {
    this.advancedToggle = !this.advancedToggle;
  }

  changeFolderCallback(folder: string) {
    this.generateImageForm.patchValue({folder: folder});
    this.folder = folder;
  }

  changeSamplerCallback(sampler: string) {
    this.generateImageForm.patchValue({sampler: sampler});
    this.sampler = sampler;
  }

  changeModelCallback(model: string) {
      this.generateImageForm.patchValue({model_path: model});
  }

  changeModelVersionCallback(modelVersion: string) {
    this.modelVersion = modelVersion;
  }

  changeModelInfoCallback(modelInfo: any) {
    this.generateImageForm.patchValue({width: modelInfo.width});
    this.generateImageForm.patchValue({height: modelInfo.height});
    this.generateImageForm.patchValue({sampler: modelInfo.sampler_name});
    this.generateImageForm.patchValue({steps: modelInfo.steps});
    this.generateImageForm.patchValue({cfg_scale: modelInfo.cfg_scale});
    this.sampler = modelInfo.sampler_name;
    this.refinerLatentDefaultValue();
    console.log(modelInfo);

  }
  
  resetPage(queue:any, placeHolder=true) {
    if (placeHolder && this.images.length == 0) {
      this.imagePlaceholder = true;
    } else {
      this.imagePlaceholder = false;
    }
    this.queue.running = false;
    this.generateButton = false;
    this.imageLoader = false;
    clearInterval(queue);
  }




  pinFormatter(value: number) {
    return value.toFixed(2);
  }

  generateImage() {
      this.generateButton = true;
      var formData = this.generateImageForm.value;
      formData.sampler = this.sampler;
      var token = localStorage.getItem('token');
      var refinerLatentValue = this.refinerRangelastEmittedValue as number;
      var refinerLatent = false;
      console.log(formData);
      var baseImage: Blob | null;
      this.imageLoader = true;
      var queue = this.queueRunning(this.modelVersion);
      if (this.modelVersion == 'SDXL') {
        if (refinerLatentValue > 0 && refinerLatentValue <= 1) {
          refinerLatent = true;
          formData.refiner_denoise = refinerLatentValue;
        }
        this.Sd.postImageTxt2imgV2Sdxl(token, formData, formData.folder, refinerLatent).subscribe(
          (res) => {
            this.images = [];
            var images_id = res.body.images;
            for (var i = 0; i < images_id.length; i++) {
              this.Sd.getUserImage(token, images_id[i]).subscribe((response: HttpResponse<Blob>) => {
                // Obtenha o corpo da resposta que é a imagem Blob
                baseImage = response.body;
                if (baseImage) {
                  let objectURL = URL.createObjectURL(baseImage);
                  this.images.push(this.sanitizer.bypassSecurityTrustUrl(objectURL));
                }
              });
            }
            this.resetPage(queue, false);
          },
          (err) => {
            this.resetPage(queue);
            this.alert.presentAlert("Error generating image", err.status, err.error.detail, ["OK"], "error");
          }
        );
      } else if (this.modelVersion == 'SD15') {
        if (refinerLatentValue > 0 && refinerLatentValue <= 1) {
          refinerLatent = true;
          formData.latent_denoise = refinerLatentValue;
        }
        this.Sd.postImageTxt2imgV2Sd15(token, formData, formData.folder, refinerLatent).subscribe(
          (res) => {
            this.images = [];
            var images_id = res.body.images;
            for (var i = 0; i < images_id.length; i++) {
              this.Sd.getUserImage(token, images_id[i]).subscribe((response: HttpResponse<Blob>) => {
                baseImage = response.body;
                if (baseImage) {
                  let objectURL = URL.createObjectURL(baseImage);
                  this.images.push(this.sanitizer.bypassSecurityTrustUrl(objectURL));
                }
              });
            }
            this.resetPage(queue, false);
          },
          (err) => {
            this.resetPage(queue);
            this.alert.presentAlert("Error generating image", err.status, err.error.detail, ["OK"], "error");
          }
        );
      }
    } 
  
  
  ngOnInit() {
    if (this.imagePlaceholder == false && this.images.length == 0) {
      this.imagePlaceholder = true;
    }
    if (this.modelVersion == 'SDXL') {
      this.refinerRangelastEmittedValue = 0.0;
      this.generateImageForm.patchValue(this.SdxlDefaultParams);
      this.sampler = 'dpmpp_2m';
    } else if (this.modelVersion == 'SD15') {
      this.generateImageForm.patchValue(this.Sd15DefaultParams);
      this.refinerRangelastEmittedValue = 0.0;
      this.sampler = 'UniPC';
    }
  }

  ngAfterViewInit() {
    if (this.modelVersion == 'SDXL') {
      this.refinerRange.color = "dark";
    } else if (this.modelVersion == 'SD15') {
      this.refinerRange.color = "dark";
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
        if (this.refinerRangelastEmittedValue == 0) {
          this.refinerRange.color = "dark";
        }    
        else if(this.refinerRangelastEmittedValue >= 0.5 && this.refinerRangelastEmittedValue <= 0.75) {
          this.refinerRange.color = "success";
        }
        else if (this.refinerRangelastEmittedValue > 0.75 && this.refinerRangelastEmittedValue <= 0.9) {
          this.refinerRange.color = "warning";
        }
        else {
          this.refinerRange.color = "danger";
        }
      }
    } 

    refinerLatentDefaultValue() {
      if (this.modelVersion == 'SDXL') {
        this.refinerRangelastEmittedValue = 0.0;
        } else if (this.modelVersion == 'SD15') {
        this.refinerRangelastEmittedValue = 0.0;
      }
    }

    queueRunning(modelType: string) {
      var token = localStorage.getItem('token');
      var queue: any = []
      queue = setInterval(() => {
        if (modelType == 'SDXL') {
          this.Sd.getUserTxt2imgV2SdxlQueue(token).subscribe(
            (res) => {
              if (res.body.queue_running >= 1) {
                this.queue.running = true;
              } else {
                this.queue.running = false;
              }
              this.queue.queue_position = res.body.queue_position;
              this.queue.queue_pending = res.body.queue_pending;
            },
            (err) => {
              this.resetPage(queue);
            }
          );
        } else if (modelType == 'SD15') {
          this.Sd.getUserTxt2imgV2Sd15Queue(token).subscribe(
            (res) => {
              if (res.body.queue_running >= 1) {
                this.queue.running = true;
              } else {
                this.queue.running = false;
              }
              this.queue.queue_position = res.body.queue_position;
              this.queue.queue_pending = res.body.queue_pending;
            },
            (err) => {
              this.resetPage(queue);
            }
          );
        }
      }, 2000);
      return queue;
    }

    ngOnChanges() {
    }

}
