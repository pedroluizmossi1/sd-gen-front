import { Component, OnInit, NgModule, Output, EventEmitter, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { SdGenApiService } from 'src/app/services/sd-gen-api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sampler-select',
  templateUrl: './sampler-select.component.html',
  styleUrls: ['./sampler-select.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})

export class SamplerSelectComponent  implements OnInit {
  @Output() sampler = new EventEmitter<string>();
  @Input() samplerInput: string = 'UniPC';

  @Input() txt2imgType: string = 'SD15';
  constructor(private Sd: SdGenApiService) { }

  samplers: any[] = [];
  
  initialSampler = this.samplerInput 

  handleChange(event: any) {
    this.initialSampler = event.target.value;
    this.sampler.emit(this.initialSampler);
  }

  ngOnInit() {
    var token = localStorage.getItem('token');
    var user = localStorage.getItem('user') || '{}';
    var plan = JSON.parse(user).plan;
    this.Sd.getUserPlan(token, plan).subscribe((data: any) => {
      if (data.status === 200) {
        var response = data.body;
        response = response['resources'][0];
        if (this.txt2imgType === 'SDXL') {
          this.samplers = response['SDXL_SAMPLER'];
          this.sampler.emit(this.samplers[0]);
        } else if (this.txt2imgType === 'SD15') {
          this.samplers = response['SD15_SAMPLER'];
          this.sampler.emit(this.samplers[0]);
        }
      } else {
        console.log(data.status);
      }
    });
  }
      
}
