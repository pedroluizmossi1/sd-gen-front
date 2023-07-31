import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ToggleComponent } from '../menu/toggle/toggle.component';
import { SdGenApiService } from 'src/app/services/sd-gen-api.service';
import { CreateFolderModalComponent } from './create-folder-modal/create-folder-modal.component';
import { AlertService } from 'src/app/services/alert.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-folder',
  templateUrl: './user-folder.page.html',
  styleUrls: ['./user-folder.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ToggleComponent]
})
export class UserFolderPage implements OnInit {

  constructor(private Sd: SdGenApiService, private modalCtrl: ModalController, private alertService: AlertService, private router: Router) { }

  folderList = [
    {
      name: '',
      _id: '',
      selected: false  // Add isSelected property for each folder
    }
  ];

  deleteMode = false;

  folders() {
    var token = localStorage.getItem('token');
    this.Sd.getUserFolders(token).subscribe((data: any) => {
      if (data.status === 200) {
        this.folderList = data.body;
        // Chamando o método para extrair os nomes das pastas após receber a lista de pastas
        this.extractFolderName_id();

      } else {
        console.log(data.body);
      }
    });
  }

  openFolder(folder_id: any) {
    var token = localStorage.getItem('token');
    this.Sd.getUserFolder(token, folder_id).subscribe((data: any) => {
      if (data.status === 200) {
        this.router.navigate(['/user-folder-image'], { queryParams: { images: data.body.images } });
      } else {
        console.log(data.body);
      }
    });
  }

  extractFolderName_id() {
    var folderName_id = [];
    for (let i = 0; i < this.folderList.length; i++) {
      folderName_id.push({
        name: this.folderList[i].name,
        _id: this.folderList[i]._id
      });
    }
    return folderName_id;
  }

  newFolderParam = {
    "name": "collection",
    "description": "description",
    "is_public": false,
    "tags": [
      "tag1",
      "tag2"
    ]
  };

  newFolder() {
    var token = localStorage.getItem('token');
    this.Sd.postUserFolder(token, this.newFolderParam).subscribe((data: any) => {
      if (data.status === 200) {
        console.log(data.body);
      } else {
        console.log(data.body);
      }
    });
  }

  markFoldersToDelete() {
    var token = localStorage.getItem('token');
    this.deleteMode = !this.deleteMode;
    for (let i = 0; i < this.folderList.length; i++) {
      console.log(this.folderList[i].selected);
    }
  }

  deleteFolders() {
    var token = localStorage.getItem('token');
    for (let i = 0; i < this.folderList.length; i++) {
      if (this.folderList[i].selected) {
        this.Sd.deleteUserFolder(token, this.folderList[i]._id).subscribe(
          (data: any) => {
          if (data.status === 200) {
            window.location.reload();
          } else {
            console.log(data.body);
          }
        },
          (error) => {
            this.alertService.presentAlert("Error", error.status, error.error.detail, ["OK"]);
          }
        );
      }
    }
    this.folders();
  }

  cancelDelete() {
    this.deleteMode = false;
    for (let i = 0; i < this.folderList.length; i++) {
      this.folderList[i].selected = false;
    }
  }
    
  toggleFolderSelection(folder: any) {
    console.log(folder);
  }
  
  message = 'This modal example uses the modalController to present and dismiss modals.';

  async openModal() {
    const modal = await this.modalCtrl.create({
      component: CreateFolderModalComponent,
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      this.message = `Hello, ${data}!`;
    }
  }


  ngOnInit() {
    this.folders();
  }

}
