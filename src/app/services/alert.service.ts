import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(private alertController: AlertController) { }

  async presentAlert(header: string, subHeader: string, message: string, buttons: string[], colorVariation: string = 'info') {
    const alert = await this.alertController.create({
      header: header,
      subHeader: subHeader,
      message: message,
      buttons: buttons,
      cssClass: `ion-alert-custom ${colorVariation}` // Aplica a classe de cor personalizada
    });

    await alert.present();
    return alert;
  }
}
