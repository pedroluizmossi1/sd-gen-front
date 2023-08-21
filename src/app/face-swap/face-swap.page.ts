import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ToggleComponent } from '../menu/toggle/toggle.component';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { SdGenApiService } from '../services/sd-gen-api.service';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertService } from '../services/alert.service';
@Component({
  selector: 'app-face-swap',
  templateUrl: './face-swap.page.html',
  styleUrls: ['./face-swap.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ToggleComponent, ReactiveFormsModule],
})
export class FaceSwapPage implements OnInit {

  constructor(private sd: SdGenApiService, private sanitizer: DomSanitizer, private alertService: AlertService) { }

  referenceSegmentTab = true;
  targetSegmentTab = false;
  referenceSegmentSelected = 'url';
  targetSegmentSelected = 'url';
  referenceImageURL: string | null = null;
  targetImageURL: string | null = null;
  faceSwapimages: any[] = [];

  uploadReferenceImageId: string | null = null;
  uploadTargetImageId: string | null = null;

  referenceSegmentTabChanged(event: any) {
    this.referenceSegmentTab = this.referenceSegmentTab ? false : true;
    this.targetSegmentTab = this.targetSegmentTab ? false : true;
  }

  referenceSegmentChanged(event: any) {
    this.referenceSegmentSelected = event.detail.value;
    this.cleanVariables('reference');
  }

  targetSegmentChanged(event: any) {
    this.targetSegmentSelected = event.detail.value;
    this.cleanVariables('target');
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
    if (variable === 'reference') {
      if (!this.validUrlString(this.urlReferenceForm.value.url || '')) {
        this.alertService.presentAlert('Error', 'Invalid URL', 'Please enter a valid URL.', ['OK'], 'error');
      }
      this.referenceImageURL = this.urlReferenceForm.value.url || '';
    } else if (variable === 'target') {
      if (!this.validUrlString(this.urlTargetForm.value.url || '')) {
        this.alertService.presentAlert('Error', 'Invalid URL', 'Please enter a valid URL.', ['OK'], 'error');
      }
      this.targetImageURL = this.urlTargetForm.value.url || '';
    } else {
      this.alertService.presentAlert('Error', 'loadUrlImage', 'Error loading image, please check the URL.', ['OK'], 'error');
    }
  }

  swapFaces() {
    const token = localStorage.getItem('token');
    var activeReferenceSegment = this.referenceSegmentSelected;
    var activeTargetSegment = this.targetSegmentSelected;
    const folder = 'root';

    var baseImage: Blob | null;

    const jsonData = {
      "target_id": "",
      "reference_id": "",
      "target_url": "",
      "reference_url": "",
      "upscale": 1
    }

    if (activeReferenceSegment === 'url' && this.urlReferenceForm !== null) {
      var referenceImage = this.urlReferenceForm.value.url;
      jsonData.reference_url = referenceImage || '';
    }

    if (activeTargetSegment === 'url' && this.urlTargetForm.value.url !== null) {
      var targetImage = this.urlTargetForm.value.url;
      jsonData.target_url = targetImage || '';
    }
    
    if (activeReferenceSegment === 'upload' && this.uploadReferenceImageId !== null) {
      jsonData.reference_id = this.uploadReferenceImageId || '';
    }

    if (activeTargetSegment === 'upload' && this.uploadTargetImageId !== null) {
      jsonData.target_id = this.uploadTargetImageId || '';
    }
    

    this.sd.postGenerateFaceSwap(token, jsonData, folder).subscribe(
      (res) => {
        var images_id = res.body.images;
        for (var i = 0; i < images_id.length; i++) {
          this.sd.getUserImage(token, images_id[i]).subscribe((response: HttpResponse<Blob>) => {
            baseImage = response.body;
            if (baseImage) {
              let objectURL = URL.createObjectURL(baseImage);
              this.faceSwapimages.push(this.sanitizer.bypassSecurityTrustUrl(objectURL));
            }
          });
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  uploadFile(variable: string) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    const token = localStorage.getItem('token');
    const fileLimitKB = 1024 * 1024 * 2; // 2 MB
    const imageBase64Data = {
      'image': ''
    };

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
        imageBase64Data.image = imageBase64;
        this.sd.postFaceSwapUpload(token, imageBase64Data, 'root').subscribe({
          next: (data: any) => {
            if (data.status === 200) {
              this.sd.getUserImage(token, data.body.image).subscribe((response: HttpResponse<Blob>) => {
                var baseImage = response.body;
                if (baseImage) {
                  let objectURL = URL.createObjectURL(baseImage);
                  if (variable === 'reference') {
                    this.referenceImageURL = objectURL;
                    this.uploadReferenceImageId = data.body.image;
                  }
                  else if (variable === 'target') {
                    this.targetImageURL = objectURL;
                    this.uploadTargetImageId = data.body.image;
                  }
                  else {
                    console.log('Error: uploadFile');
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
            this.alertService.presentAlert('Success', 'Image uploaded', 'Image uploaded successfully.', ['OK'], 'success');
          }
        });
      };
      reader.readAsDataURL(file);
    };
    fileInput.click();
  }


  cleanVariables(variable?: string) {
    if (variable === 'reference') {
      this.referenceImageURL = null;
      this.uploadReferenceImageId = null;
      this.urlReferenceForm.get('url')?.reset();
    }
    else if (variable === 'target') {
      this.targetImageURL = null;
      this.uploadTargetImageId = null;
      this.urlTargetForm.get('url')?.reset();
    } else {
      this.referenceImageURL = null;
      this.targetImageURL = null;
      this.uploadReferenceImageId = null;
      this.uploadTargetImageId = null;
      this.urlReferenceForm.get('url')?.reset();
      this.urlTargetForm.get('url')?.reset();
    }
  }

  ngOnInit() {
  }

}
