import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import PinchZoom from 'pinch-zoom-js';
import { SdGenApiService } from '../services/sd-gen-api.service';
import { AlertService } from '../services/alert.service';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-fullscreen-image-modal',
  templateUrl: './fullscreen-image-modal.page.html',
  imports: [IonicModule, CommonModule],
  standalone: true
})
export class FullscreenImageModalPage {
    @Input() imageUrl!: string;
    @Input() imageId!: string;


  constructor(private sd: SdGenApiService, private alert: AlertService, private router: Router) { }
    showImage: boolean = false;
    enableFaceSwap: boolean = true;

    closeModal() {
      (document.querySelector('ion-modal') as HTMLIonModalElement).dismiss();
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escapeEvent);
    }

    saveImage() {
      const link = document.createElement('a');
      link.href = this.imageUrl;
      link.download = String(Math.random() * 100000000000000000 + 1) + '.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
