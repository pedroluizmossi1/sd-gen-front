import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-face-swap',
  templateUrl: './face-swap.page.html',
  styleUrls: ['./face-swap.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class FaceSwapPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
