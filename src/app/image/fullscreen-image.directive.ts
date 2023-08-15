import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FullscreenImageModalPage } from './fullscreen-image-modal.page';


@Directive({
  selector: '[appFullscreenImage]',
  standalone: true
})
export class FullscreenImageDirective {

  constructor(private el: ElementRef, private renderer: Renderer2, private modalController: ModalController) { }
  isFullscreen: boolean = false;

  @HostListener('click')
  async onClick() {
    // Open the modal when the image is clicked
      const modal = await this.modalController.create({
        component: FullscreenImageModalPage,
         
        componentProps: {
          imageUrl: this.el.nativeElement.src
        }
      });
      await modal.present();
      this.isFullscreen = false;
    }
  }

