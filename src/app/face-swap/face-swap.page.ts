import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpHeaders, HttpParams, HttpResponse, } from '@angular/common/http';
import { NavigationEnd, NavigationExtras, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonicModule, ActionSheetController } from '@ionic/angular';
import { ToggleComponent } from '../menu/toggle/toggle.component';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { SdGenApiService } from '../services/sd-gen-api.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AlertService } from '../services/alert.service';
import { Camera, CameraResultType } from '@capacitor/camera';
import { ImageCompressionService } from '../services/image-compression.service';
import Compressor from 'compressorjs';
import { decode } from "base64-arraybuffer";
import { Platform } from '@ionic/angular';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { ResultComponent } from './result/result.component';
import { GalleryModule, GalleryItem, ImageItem, Gallery } from 'ng-gallery';
import { Observable, Subject, filter, map, takeUntil } from 'rxjs';
import { FullscreenImageDirective } from 'src/app/image/fullscreen-image.directive';
import { GetFolderSelectComponent } from '../user-folder/get-folder-select/get-folder-select.component';
@Component({
  selector: 'app-face-swap',
  templateUrl: './face-swap.page.html',
  styleUrls: ['./face-swap.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ToggleComponent, ReactiveFormsModule, ResultComponent, GalleryModule, FullscreenImageDirective, GetFolderSelectComponent],
})
export class FaceSwapPage implements OnInit {

  constructor(private sd: SdGenApiService, private sanitizer: DomSanitizer, private alertService: AlertService, private imageCompressionService: ImageCompressionService,
    private platform: Platform, private actionSheetController: ActionSheetController, private router: Router) { 
    }

  @Input() referenceImageId: string | null = null;
  @Input() targetImageId: string | null = null;

  folder: string | null = null;
  referenceSegmentTab = true;
  targetSegmentTab = false;
  resultSegmentTab = false;
  referenceSegmentSelected = 'url';
  targetSegmentSelected = 'url';
  referenceImageURL: string | null = null;
  targetImageURL: string | null = null;
  resultImageURL: SafeUrl | null = null;
  resultImageId: string | null = null;
  swapButtonDisabled = true;
  imageLoader = false;
  plataformType = this.platform.platforms();
  webMobilePlataform = false;
  tabsSegments = [
    'referenceSegment', 'targetSegment', 'resultSegment'
  ]

  advancedToggle: boolean = true;

  selectedSegment = this.tabsSegments[0];

  referenceSegmentTabSelected = true;
  targetSegmentTabSelected = false;
  resultSegmentTabSelected = false;

  cameraReferenceImageId: string | null = null;
  cameraTargetImageId: string | null = null;

  galleryReferenceImageId: string | null = null;
  galleryTargetImageId: string | null = null;

  referenceSegmentTabChanged(event: any) {
    if (event.detail.value === 'referenceSegment') {
      this.referenceSegmentTabSelected = true;
      this.targetSegmentTabSelected = false;
      this.resultSegmentTabSelected = false;
    } else if (event.detail.value === 'targetSegment') {
      this.referenceSegmentTabSelected = false;
      this.targetSegmentTabSelected = true;
      this.resultSegmentTabSelected = false;
    }
    else if (event.detail.value === 'resultSegment') {
      this.referenceSegmentTabSelected = false;
      this.targetSegmentTabSelected = false;
      this.resultSegmentTabSelected = true;
    }

  }

  changeAdvancedToggle() {
    this.advancedToggle = !this.advancedToggle;
  }

  referenceSegmentChanged(event: any) {
    this.referenceSegmentSelected = event.detail.value;
  }

  targetSegmentChanged(event: any) {
    this.targetSegmentSelected = event.detail.value;
  }

  urlTargetForm = new FormGroup({
    url: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(1000)]),
  })

  urlReferenceForm = new FormGroup({
    url: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(1000)]),
  })

  validUrlString(url: string) {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  }

  loadUrlImage(variable: string) {
    this.clearSegmentImage(variable, 'url');
    if (variable === 'reference') {
      if (!this.validUrlString(this.urlReferenceForm.value.url || '')) {
        this.alertService.presentAlert('Error', 'Invalid URL', 'Please enter a valid URL.', ['OK'], 'error');
      }
      this.imageLoader = true;
      this.referenceImageURL = this.urlReferenceForm.value.url || '';
      this.targetSegmentTab = true;
      setTimeout(() => {
        this.selectedSegment = this.tabsSegments[1];
        this.referenceSegmentTabChanged({ detail: { value: 'targetSegment' } });
        this.imageLoader = false;
      }, 1000);
    } else if (variable === 'target') {
      if (!this.validUrlString(this.urlTargetForm.value.url || '')) {
        this.alertService.presentAlert('Error', 'Invalid URL', 'Please enter a valid URL.', ['OK'], 'error');
      }
      setTimeout(() => {
        this.imageLoader = false;
      }, 1000);
      this.targetImageURL = this.urlTargetForm.value.url || '';
      this.swapButtonDisabled = false;
    } else {
      this.alertService.presentAlert('Error', 'loadUrlImage', 'Error loading image, please check the URL.', ['OK'], 'error');
    }

  }

  changeFolderCallback(folder: string) {
    this.folder = folder;
  }

  getTabSegmentValue = (tab: string | null, segment: string | null) => {
    if (tab === null) {
      tab = this.referenceSegmentTab ? 'referenceSegment' : 'targetSegment';
      if (tab === this.tabsSegments[0]) {
        segment = this.referenceSegmentSelected;
      } else if (tab === this.tabsSegments[1]) {
        segment = this.targetSegmentSelected;
      }
    }

    if (tab === 'referenceSegment') {
      if (segment === 'url') {
        return this.urlReferenceForm.value.url || '';
      } else if (segment === 'camera') {
        return this.cameraReferenceImageId || '';
      } else if (segment === 'gallery') {
        return this.galleryReferenceImageId || '';
      } else if (segment === null) {
        return this.cameraReferenceImageId || this.galleryReferenceImageId;
      }
    } else if (tab === 'targetSegment') {
      if (segment === 'url') {
        return this.urlTargetForm.value.url || '';
      } else if (segment === 'camera') {
        return this.cameraTargetImageId || '';
      } else if (segment === 'gallery') {
        return this.galleryTargetImageId || '';
      } else if (segment === null) {
        return this.cameraTargetImageId || this.galleryTargetImageId;
      }
    } 
      
    return '';
    }

    clearSegmentImage = (tab: string, ignore?: string ) => {
      if (tab === 'reference') {
        ignore !== 'url' ? this.urlReferenceForm.value.url : '';
        ignore !== 'camera' ? this.cameraReferenceImageId = null : '';
        ignore !== 'gallery' ? this.galleryReferenceImageId = null : '';
      } else if (tab === 'target') {
        ignore !== 'url' ? this.urlTargetForm.value.url : '';
        ignore !== 'camera' ? this.cameraTargetImageId = null : '';
        ignore !== 'gallery' ? this.galleryTargetImageId = null : '';
      }
    }

  swapFaces() {
    this.imageLoader = true;
    const token = localStorage.getItem('token');
    const folder = this.folder;

    if (folder === null || folder === '') {
      this.alertService.presentAlert('Error', 'Folder not selected', 'Please select a folder to save the result.', ['OK'], 'error');
      this.imageLoader = false;
      return;
    }

    var baseImage: Blob | null;
    
    

    const jsonData = {
      "target_id": this.getTabSegmentValue('targetSegment', null),
      "reference_id": this.getTabSegmentValue('referenceSegment', null),
      "target_url": this.getTabSegmentValue('targetSegment', 'url'),
      "reference_url": this.getTabSegmentValue('referenceSegment', 'url'),
      "upscale": 1
    }

    this.sd.postGenerateFaceSwap(token, jsonData, folder).subscribe(
      (res) => {
        let images_id = res.body.images;
        for (let i = 0; i < images_id.length; i++) {
          this.sd.getUserImage(token, images_id[i]).subscribe((response: HttpResponse<Blob>) => {
            baseImage = response.body;
            if (baseImage) {
              let objectURL = URL.createObjectURL(baseImage);
              this.resultImageURL = (this.sanitizer.bypassSecurityTrustUrl(objectURL));
              this.resultImageId = images_id[i]
              this.resultSegmentTab = true;
              this.imageLoader = false;
              this.selectedSegment = this.tabsSegments[2];
              this.referenceSegmentTabChanged({ detail: { value: 'resultSegment' } });
            }
          });
        }
      },
      (err) => {
        console.log(err);
        this.alertService.presentAlert('Error', 'Face swap failed', err.error.detail, ['OK'], 'error');
        this.imageLoader = false;
      }
    );
  }

  takePicture = async (variable: string, pickGalleryImage: boolean = false) => {
    this.clearSegmentImage(variable, 'camera');
    const token = localStorage.getItem('token');
    const fileLimitKB = 1024 * 1024 * 2; // 2 MB
    const imageBase64Data = {
      'image': ''
    };
    var image: any | null = null;
    if (pickGalleryImage) {
      image = await this.getPicture();
    } else {
      image = await Camera.getPhoto({
        quality: 95,
        allowEditing: false,
        resultType: CameraResultType.Base64
      });
      image = image.base64String
    }
    this.imageLoader = true;
    const blob = new Blob([new Uint8Array(decode(image))], {
      type: 'image/webp'
    });
    const file = new File([blob] as any, 'image.webp', {
      type: 'image/webp'
    });
    const compressedFile = await this.imageCompressionService.compressImageBase64(file, 95, 2048, 2048);
    imageBase64Data.image = compressedFile.toString();
    this.sd.postFaceSwapUpload(token, imageBase64Data, 'root').subscribe({
      next: (data: any) => {
        if (data.status === 200) {
          this.sd.getUserImage(token, data.body.image).subscribe((response: HttpResponse<Blob>) => {
            var baseImage = response.body;
            if (baseImage) {
              let objectURL = URL.createObjectURL(baseImage);
              if (variable === 'reference') {
                this.referenceImageURL = objectURL;
                this.cameraReferenceImageId = data.body.image;
                this.targetSegmentTab = true;
                this.changeTab('target');
                this.imageLoader = false;
              }
              else if (variable === 'target') {
                this.targetImageURL = objectURL;
                this.cameraTargetImageId = data.body.image;
                this.swapButtonDisabled = false;
                this.imageLoader = false;
              }
              else {
                this.imageLoader = false;
                this.alertService.presentAlert('Error', 'takePicture', 'Error loading image, please try again.', ['OK'], 'error');
              }
            }
          }
          );
        }
      },
      error: (error) => {
        console.log(error);
        this.alertService.presentAlert('Error', 'Image upload failed', 'Image upload failed, please try again.', ['OK'], 'error');
      },
      complete: () => {
        this.imageLoader = false;
      }
    });
  };

  async base64FromPath(path: string): Promise<string> {
    const response = await fetch(path);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64 = reader.result.replace('data:image/jpeg;base64,', '');
          resolve(base64);
        } else {
          reject('method did not return a string');
        }
      };
      reader.readAsDataURL(blob);
    });
  }

  getPicture = async () => {
    this.clearSegmentImage('reference', 'camera');
    const token = localStorage.getItem('token');
    const fileLimitKB = 1024 * 1024 * 2; // 2 MB
    const imageBase64Data = {
      'image': ''
    };
    const image = await Camera.pickImages({
      quality: 95,
      limit: 1,
    });
    this.imageLoader = true;
    const image2 = await this.base64FromPath(image.photos[0].webPath || '');
    return image2;
  }

  getImageFromId = (imageId: string): Observable<SafeUrl | null> => {
    const token = localStorage.getItem('token');
    return this.sd.getUserImage(token, imageId).pipe(
      map((response: HttpResponse<Blob>) => {
        var baseImage = response.body;
        if (baseImage) {
          let objectURL = URL.createObjectURL(baseImage);
          return this.sanitizer.bypassSecurityTrustUrl(objectURL);
        }
        return null;
      })
    );
  }



  mobileWebActionSheet = async (variable: string) => {
    var actionSheetButtons = [
      {
        text: 'Delete',
        role: 'destructive',
        data: {
          action: 'delete',
        },
      },
      {
        text: 'Share',
        data: {
          action: 'share',
        },
      },
      {
        text: 'Cancel',
        role: 'cancel',
        data: {
          action: 'cancel',
        },
      },
    ];
    if (variable === 'reference') {
      actionSheetButtons = [
        {
          text: 'Take Picture',
          data: {
            action: 'takePicture',
          },
        },
        {
          text: 'Pick from Gallery',
          data: {
            action: 'pickGalleryImage',
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
          data: {
            action: 'cancel',
          },
        },
      ];
    } else if (variable === 'target') {
      actionSheetButtons = [
        {
          text: 'Take Picture',
          data: {
            action: 'takePicture',
          },
        },
        {
          text: 'Pick from Gallery',
          data: {
            action: 'pickGalleryImage',
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
          data: {
            action: 'cancel',
          },
        },
      ];
    }

    const actionSheet = await this.actionSheetController.create({
      header: 'Select Image',
      buttons: actionSheetButtons,
    });

    await actionSheet.present();

    const { data } = await actionSheet.onDidDismiss();

    if (data && data.action === 'takePicture') {
      this.takePicture(variable);
    } else if (data && data.action === 'pickGalleryImage') {
      this.takePicture(variable, true);

    }
  };

  changeTab = (tab: string) => {
    const time = 1000;
    if (tab === 'reference') {
      setTimeout(() => {
        this.selectedSegment = this.tabsSegments[0];
        this.referenceSegmentTabChanged({ detail: { value: 'referenceSegment' } });
      }, time);
    } else if (tab === 'target') {
      this.targetSegmentTab = true;
      this.swapButtonDisabled = false;
      setTimeout(() => {
        this.selectedSegment = this.tabsSegments[1];
        this.referenceSegmentTabChanged({ detail: { value: 'targetSegment' } });
      }, time);
    } else if (tab === 'result') {
      this.resultSegmentTab = true;
      setTimeout(() => {
        this.selectedSegment = this.tabsSegments[2];
        this.referenceSegmentTabChanged({ detail: { value: 'resultSegment' } });
      }, time);
    }
  }
      


  ngOnInit() {
    var token = localStorage.getItem('token');
    this.sd.getUserFolders(token).subscribe((data: any) => {
      if (data.status === 200) {
        this.folder = data.body[0].name;
      }
    });
    this.clearSegmentImage('reference');
    this.clearSegmentImage('target');
    const navigation = this.router.getCurrentNavigation();
    const queryParams = navigation?.extras.queryParams as {
      referenceImageId: string | null;
      targetImageId: string | null;
    };
    if (queryParams) {
    if (queryParams.referenceImageId !== '' && queryParams.referenceImageId !== null) {
      this.referenceSegmentSelected = 'gallery';
      this.getImageFromId(queryParams.referenceImageId).subscribe((response: SafeUrl | null) => {
        this.referenceImageURL = response as string;
      });
      this.galleryReferenceImageId = queryParams.referenceImageId;
      this.changeTab('target');
    } 
    if (queryParams.targetImageId !== '' && queryParams.targetImageId !== null) {
      this.targetSegmentSelected = 'gallery';
      this.getImageFromId(queryParams.targetImageId).subscribe((response: SafeUrl | null) => {
        this.targetImageURL = response as string;
      });
      this.galleryTargetImageId = queryParams.targetImageId;
      this.changeTab('target');
    }
  }

    if (this.plataformType.includes('mobileweb')) {
      this.webMobilePlataform = true;
    }


    if (this.platform.is('capacitor')) {
    Camera.checkPermissions().then((result) => {
      if (result.camera === 'denied') {
        Camera.requestPermissions().then((result) => {
          if (result.camera === 'denied') {
            this.alertService.presentAlert('Error', 'Camera access denied', 'Please allow camera access to use this feature.', ['OK'], 'error');
          }
        });
      }
    }
    );
  }
  }

}
