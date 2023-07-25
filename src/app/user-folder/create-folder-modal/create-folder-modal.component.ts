import { Component, OnInit, Input } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { SdGenApiService } from 'src/app/sd-gen-api.service';
import { AlertService } from 'src/app/alert.service';

@Component({
  selector: 'app-create-folder-modal',
  templateUrl: './create-folder-modal.component.html',
  styleUrls: ['./create-folder-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule]
})
export class CreateFolderModalComponent implements OnInit {
  @Input() name: string = '';

  constructor(
    private modalCtrl: ModalController,
    private Sd: SdGenApiService,
    private alertService: AlertService,
    private router: Router
  ) {}

  createFolderForm = new FormGroup({
    name: new FormControl(''),
    description: new FormControl(''),
    is_public: new FormControl(false),
    tags: new FormControl(['']),
  });

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  async confirm() {
    const formData = this.createFolderForm.value;
    var token = localStorage.getItem('token');
    this.Sd.postUserFolder(token, formData).subscribe(
      (data: any) => {
        if (data.status === 200) {
          this.modalCtrl.dismiss(data.body, 'confirm');
          window.location.reload();
        } else {
          this.alertService.presentAlert("Error", "Error", data.body, ["OK"]);
        }
      },
      (error) => {
        this.alertService.presentAlert("Error", error.status, error.error.detail, ["OK"]);
      }
    );
  }


  ngOnInit() {}
}
