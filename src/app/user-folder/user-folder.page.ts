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
import { GalleryModule, GalleryItem, ImageItem } from 'ng-gallery';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Gallery } from 'ng-gallery';
import { Inject } from '@angular/core';
@Component({
  selector: 'app-user-folder',
  templateUrl: './user-folder.page.html',
  styleUrls: ['./user-folder.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ToggleComponent, GalleryModule],
})
export class UserFolderPage implements OnInit {

  constructor(private Sd: SdGenApiService, private modalCtrl: ModalController, private alertService: AlertService, private router: Router, private sanitizer: DomSanitizer, @Inject(Gallery) private gallery: Gallery ) { }
  images: GalleryItem[] = [];
  nextBacthImages: any[] = [];
  folderList = [
    {
      name: '',
      _id: '',
      images: [] as GalleryItem[],
      selected: false  // Add isSelected property for each folder
    }
  ];
  mobile = false;
  desktop = false;
  deleteMode = false;

  folders() {
    var token = localStorage.getItem('token');
    this.Sd.getUserFolders(token).subscribe((data: any) => {
      if (data.status === 200) {
        this.folderList = data.body;
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


  async extractFolderName_id() {
    const token = localStorage.getItem('token') as string;
    const folderName_id = [];
  
    const imagesPerLoad = 5; // Number of images to load in one batch
  
    for (let i = 0; i < this.folderList.length; i++) {
      const folderData = {
        name: this.folderList[i].name,
        _id: this.folderList[i]._id,
        images: [],
        selected: false,
        selectedIndexe: [] as number[]
      };
  
      const galleryRef = this.gallery.ref(folderData.name);
      galleryRef.indexChanged.subscribe(async (index) => {
        const currentImageIndex = index.currIndex as number;
        const totalImages = this.folderList[i].images.length;
        const remainingImages = this.folderList[i].images.slice(currentImageIndex + 1);
        const nextBatch = remainingImages.slice(0, imagesPerLoad);
        this.nextBacthImages = remainingImages.slice(0, imagesPerLoad);
        const galleryImages = index.items as number[];
        const totalImagesGallery = galleryImages.length;
        if ( currentImageIndex === totalImagesGallery - 1) {
          await this.loadImageBatch(localStorage.getItem('token') as string, this.nextBacthImages as string[], folderData.name);
        }
        
      });
  
      const initialImages = this.folderList[i].images.slice(0, imagesPerLoad);
      await this.loadImageBatch(token, initialImages as string[], folderData.name);
      
      folderName_id.push(folderData);
    }
  
    return folderName_id;
  }
  
  async loadImageBatch(token: string, imageIds: string[], galleryName: string) {
    for (const imageId of imageIds) {
      const response = await this.Sd.getUserImage(token, imageId).toPromise() as HttpResponse<Blob>;
      const baseImage = response.body;
  
      if (baseImage) {
        const galleryRef = this.gallery.ref(galleryName);
        const objectURL = URL.createObjectURL(baseImage);
        galleryRef.addImage({ src: objectURL, thumb: objectURL });
      }
    }
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
    this.deleteMode = !this.deleteMode;
    for (let i = 0; i < this.folderList.length; i++) {
    }
  }

  markFolderToDelete(folder_id: any) {
    for (let i = 0; i < this.folderList.length; i++) {
      if (this.folderList[i]._id === folder_id) {
        this.folderList[i].selected = !this.folderList[i].selected;
      }
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
    if (window.screen.width >= 1024) { // 768px portrait
      this.desktop = true;
    }
    this.folders();
    for (let i = 0; i < this.folderList.length; i++) {
    const galleryRef = this.gallery.ref(this.folderList[i].name);
    galleryRef.indexChanged.subscribe(async (index) => {
      const currentImageIndex = index.currIndex as number;
      const galleryImages = index.items as number[];
      const totalImages = galleryImages.length;
      if ( currentImageIndex === totalImages - 1) {
        await this.loadImageBatch(localStorage.getItem('token') as string, this.nextBacthImages as string[], 'root');
      }
    }
    );
  }
}
}
