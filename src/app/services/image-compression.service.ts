import { Injectable } from '@angular/core';
import Compressor from 'compressorjs';

@Injectable({
  providedIn: 'root'
})
export class ImageCompressionService {

  constructor() { }

  compressImage(file: File, quality: number): Promise<File> {
    return new Promise((resolve, reject) => {
      new Compressor(file, {
        quality: quality,
        success(result) {
          resolve(result as File);
        },
        error(err) {
          reject(err);
        },
      });
    });
  }

  compressImageBase64(file: File, quality: number, maxHeight=2048, maxWidth=2048): Promise<string> {
    return new Promise((resolve, reject) => {
      new Compressor(file, {
        quality: quality,
        maxHeight: maxHeight,
        maxWidth: maxWidth,
        success(result) {
          const reader = new FileReader();
          reader.readAsDataURL(result as File);
          reader.onload = () => {
            resolve(reader.result as string);
          };
        },
        error(err) {
          reject(err);
        },
      });
    });
  }
}
