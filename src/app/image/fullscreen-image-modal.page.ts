import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import PinchZoom from 'pinch-zoom-js';
import { SdGenApiService } from '../services/sd-gen-api.service';
import { AlertService } from '../services/alert.service';
import { NavigationExtras, Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Platform } from '@ionic/angular';
import { ImageFunctionsModule } from './image-functions/image-functions.module';
import write_blob from "capacitor-blob-writer";

@Component({
  selector: 'app-fullscreen-image-modal',
  templateUrl: './fullscreen-image-modal.page.html',
  imports: [IonicModule, CommonModule, ImageFunctionsModule],
  standalone: true
})
export class FullscreenImageModalPage {
    @Input() imageUrl!: string;
    @Input() imageId!: string;


  constructor(private sd: SdGenApiService, private alert: AlertService, private router: Router, private actionSheetController: ActionSheetController, 
              private platform: Platform, private imageFunctions: ImageFunctionsModule) { }
    showImage: boolean = false;
    enableFaceSwap: boolean = true;

    closeModal() {
      (document.querySelector('ion-modal') as HTMLIonModalElement).dismiss();
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escapeEvent);
    }

    async saveImage(imageId: string | undefined = undefined) {
      const link = document.createElement('a');
      link.href = this.imageUrl;
      link.download = imageId !== undefined ? imageId : String(Math.random() * 100000000000000000 + 1);
      link.download = link.download + '.png';
      document.body.appendChild(link);
      if (this.platform.is('capacitor') || this.platform.is('android') || this.platform.is('ios')) {
        if (this.platform.is('mobileweb')) {
          link.click();
          return;
        }
        const blob = await fetch(this.imageUrl).then(r => r.blob());
        write_blob({
          path: link.download,
          directory: Directory.Documents,
          blob: blob as any,
        }).then((res: any) => {
          this.alert.presentAlert('Success', 'Image saved to device', link.download, ['OK'], 'success');
          console.log(res);
        }).catch((err: any) => {
          console.log(err);
        });
      } else {
        link.click();
      }
      document.body.removeChild(link);
    }

    async deleteImage(imageId: string) {
      const token = localStorage.getItem('token');
      const actionSheet = await this.actionSheetController.create({
          header: 'Delete Image',
          buttons: [{
            text: 'Delete Image',
            role: 'delete',
            icon: 'trash',
            handler: () => {
              this.sd.deleteUserImage(token, imageId).subscribe((data: any) => {
                if (data.status === 200) {
                  this.closeModal();
                  window.location.reload();
                } else {
                  this.alert.presentAlert('Error', 'Image could not be deleted', '', ['OK'], 'danger');
                }
              }
              );
            }
          }, {
            text: 'Cancel',
            icon: 'close',
            role: 'cancel',
            handler: () => {
              
            }
          }]
        });
        await actionSheet.present();
        return actionSheet;
    }
  
    async presentActionSheetFaceSwap() {
      const actionSheet = await this.actionSheetController.create({
        header: 'Face Swap',
        buttons: [{
          text: 'Send to Face Swap as Reference',
          icon: 'swap-horizontal',
          handler: () => {
            this.sendToFaceSwap('reference');
          }
        }, {
          text: 'Send to Face Swap as Target',
          icon: 'swap-horizontal',
          handler: () => {
            this.sendToFaceSwap('target');
          }
        }, {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }]
      });
      await actionSheet.present();
    }

    sendToFaceSwap(RefOrTar: string) {

      const navigationExtras: NavigationExtras = {
        queryParams: {
          referenceImageId: RefOrTar === 'reference' ? this.imageId : '',
          targetImageId: RefOrTar === 'target' ? this.imageId : ''
        }
      };
      this.router.navigate(['/face-swap'], navigationExtras);
      this.closeModal();
    }    

    ngOnInit() {
      setTimeout(() => {
        this.showImage = true;
      }, 25);
      setTimeout(() => {
        new PinchZoom(document.querySelector('img[alt="pinch-zoom"]' as any));
      }, 25);
      if (this.imageId === '') {
        this.enableFaceSwap = false;
      }
    }

}
