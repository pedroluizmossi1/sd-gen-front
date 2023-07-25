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

    dismissModal() {
        (document.querySelector('ion-modal') as HTMLIonModalElement).dismiss();
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
