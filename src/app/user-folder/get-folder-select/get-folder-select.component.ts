import { Component, OnInit, NgModule, Output, EventEmitter, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { SdGenApiService } from 'src/app/services/sd-gen-api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-get-folder-select',
  templateUrl: './get-folder-select.component.html',
  styleUrls: ['./get-folder-select.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class GetFolderSelectComponent implements OnInit {
  @Output() folder = new EventEmitter<string>();
  constructor(private Sd: SdGenApiService) { }

  folders: any[] = [];
  selectedFolder: any; // Add this property

  handleChange(event: any) {
    this.folder.emit(event.target.value);
  }

  ngOnInit() {
    var token = localStorage.getItem('token');
    var user = localStorage.getItem('user') || '{}';
    var folders = JSON.parse(user).folders;
      
    this.Sd.getUserFolders(token).subscribe((data: any) => {
      if (data.status === 200) {
        this.folders = data.body.map((item: any) => item.name);
        this.selectedFolder = this.folders[0]; // Set the initial value
        this.folder.emit(this.selectedFolder); // Emit the initial value
      }
    });
  }
}