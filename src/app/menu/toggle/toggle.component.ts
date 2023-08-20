import { Component, OnInit, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ToggleComponent  implements OnInit {
  @Input() title: string = 'toggle';
  
  

  constructor() { }

  ngOnInit() {
  }

}
