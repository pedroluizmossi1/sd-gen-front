import { Component, OnInit, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss'],
  standalone: true,
  imports: [IonicModule]
})
export class ToggleComponent  implements OnInit {
  @Input() title: string = 'toggle';
  constructor() { }

  ngOnInit() {

  }

}
