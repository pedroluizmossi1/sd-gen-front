import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FaceSwapPage } from './face-swap.page';

describe('FaceSwapPage', () => {
  let component: FaceSwapPage;
  let fixture: ComponentFixture<FaceSwapPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(FaceSwapPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
