import { Injectable } from '@angular/core';
import { Filesystem, Directory, Encoding, PermissionStatus } from '@capacitor/filesystem';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  constructor() { }

  async requestDirectoryDocumentPermission() {
    const permission = await Filesystem.requestPermissions();
  }

  async checkDirectoryDocumentPermission() {
    const permission = await Filesystem.checkPermissions();
  }

}
