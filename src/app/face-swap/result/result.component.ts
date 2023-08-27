import { Component, OnInit, Input } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { FullscreenImageDirective } from 'src/app/image/fullscreen-image.directive';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss'],
  standalone: true,
  imports: [IonicModule, FullscreenImageDirective],
})
export class ResultComponent  implements OnInit {
  
  constructor() { }
  @Input() resultImage: SafeUrl | null = null;
  @Input() resultImageId: string | null = null;


  ngOnInit() {}

}
