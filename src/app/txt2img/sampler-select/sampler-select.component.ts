import { Component, OnInit, NgModule, Output, EventEmitter } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { SdGenApiService } from 'src/app/sd-gen-api.service';
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
  constructor(private Sd: SdGenApiService) { }

  samplers: any[] = [];
  initialSampler = 'UniPC';

  handleChange(event: any) {
    this.samplers = event.target.value;
  }

  ngOnInit() {
    var token = localStorage.getItem('token');
    var user = localStorage.getItem('user') || '{}';
    var plan = JSON.parse(user).plan;
    console.log(plan);
    this.Sd.getUserPlan(token, plan).subscribe((data: any) => {
      if (data.status === 200) {
        this.samplers = data.body.resources.map((item: any) => item.SAMPLER);
        this.samplers = this.samplers[0]
        this.sampler.emit(this.initialSampler);
      }
    });
  }

}
