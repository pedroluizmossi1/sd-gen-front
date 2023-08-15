import { Component, OnInit, NgModule, Output, EventEmitter, ViewChild } from '@angular/core';
import { IonicModule, IonModal } from '@ionic/angular';
import { SdGenApiService } from 'src/app/services/sd-gen-api.service';
import { CommonModule } from '@angular/common';
import { TypeaheadComponent } from './typeahead/typeahead.component';
import { Item } from './typeahead/types';

@Component({
  selector: 'app-model-select',
  templateUrl: './model-select.component.html',
  styleUrls: ['./model-select.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, TypeaheadComponent]
})
export class ModelSelectComponent implements OnInit{
  @Output() model = new EventEmitter<string>();
  @Output() modelVersion = new EventEmitter<string>();
  @Output() modelInfo = new EventEmitter<string>();
  constructor(private Sd: SdGenApiService) { }
  @ViewChild('modal', { static: true }) modal!: IonModal;
  
  modelsCategory: Item[] = [];
  modelsItems: string[] = [];
  selectedModel: string[] = [];

  handleChange(event: any) {
    this.modelsItems = event.target.value;
  }

  modelSelectionChanged(selectedItems: string[]) {
    this.selectedModel = selectedItems;
    this.model.emit(this.selectedModel[0]);
    this.modal.dismiss();
  }

  modelVersionSelectionChanged(selectedItems: string[]) {
    this.selectedModel = selectedItems;
    this.modelVersion.emit(this.selectedModel[0]);
    this.modal.dismiss();
  }

  modelInfoSelectionChanged(selectedItems: string[]) {
    this.selectedModel = selectedItems;
    this.modelInfo.emit(this.selectedModel[0]);
    this.modal.dismiss();
  }

  ngOnInit() {
    var token = localStorage.getItem('token');
    var request = this.Sd.getUserModels(token).subscribe(
      (res) => {
        if (res.status == 200) {
          var response = res.body;
          var keys = Object.keys(response);
          var values = Object.values(response);
          for (var i = 0; i < keys.length; i++) {
            var index = i as number;
            var key = keys[i];
            var value = values[i] as any;
            var item: Item = { index: index, name: key, models: value };
            this.modelsCategory.push(item);
        }
        } else {
          console.log(res.status);
        }
      },
      (err) => {
        console.log(err);
      }
    );
    
}
}
