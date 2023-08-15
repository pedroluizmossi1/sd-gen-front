import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import PinchZoom from 'pinch-zoom-js';

@Component({
  selector: 'app-fullscreen-image-modal',
  templateUrl: './fullscreen-image-modal.page.html',
  imports: [IonicModule, CommonModule],
  standalone: true
})
export class FullscreenImageModalPage {
    @Input() imageUrl!: string;

  constructor() { }

    showImage: boolean = false;

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


    ngOnInit() {
      setTimeout(() => {
        this.showImage = true;
      }, 25);
      setTimeout(() => {
        new PinchZoom(document.querySelector('#generatedImage') as HTMLElement);
      }, 25);
    }

}
function querySelector(arg0: string) {
  throw new Error('Function not implemented.');
}

