import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Txt2imgPage } from './txt2img.page';

describe('Txt2imgPage', () => {
  let component: Txt2imgPage;
  let fixture: ComponentFixture<Txt2imgPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(Txt2imgPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
