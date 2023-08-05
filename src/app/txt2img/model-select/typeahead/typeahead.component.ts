import { Component, Input, Output, EventEmitter } from '@angular/core';
import type { OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Item, Model } from './types';

@Component({
  selector: 'app-typeahead',
  templateUrl: './typeahead.component.html',
  styleUrls: ['./typeahead.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, TypeaheadComponent]
})
export class TypeaheadComponent  implements OnInit {
  @Input() items: Item[] = [];
  @Input() selectedItems: string[] = [];
  @Input() title = 'Select Items';

  @Output() selectionCancel = new EventEmitter<void>();
  @Output() selectionChange = new EventEmitter<string[]>();
  @Output() selectionChangeVersion = new EventEmitter<string[]>();

  modelsCategory: Item[] = [];
  models: Model[] = [];
  selectedModel: string[] = [];
  selectedModelVersion: string[] = [];

  ngOnInit() {
    this.modelsCategory = [...this.items];
  }

  trackItems(index: number, item: Item) {
    return item.name;
  }

  trackModels(index: number, model: Model) {
    return model.name;
  }

  cancelChanges() {
    this.selectionCancel.emit();
  }

  searchbarInput(ev : any) {
    this.filterList(ev.target.value);
  }

  filterList(searchQuery: string | undefined) {
    if (searchQuery === undefined) {
      this.modelsCategory = [...this.items];
    } else {
      const normalizedQuery = searchQuery.toLowerCase();
      this.modelsCategory = this.items.map((category) => {
        const filteredModels = category.models.filter((model) => {
          return model.name.toLowerCase().includes(normalizedQuery);
        });
        return { ...category, models: filteredModels };
      });
    }
  }

  modelSelectionChanged(selectedItemPath: string) {
    this.selectedModel = [selectedItemPath];
    this.selectionChange.emit(this.selectedModel);
  }

  modelVersionSelectionChanged(selectedModelVersion: string) {
    this.selectedModelVersion = [selectedModelVersion];
    this.selectionChangeVersion.emit(this.selectedModelVersion);
  }
}