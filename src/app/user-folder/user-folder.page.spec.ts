import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserFolderPage } from './user-folder.page';

describe('UserFolderPage', () => {
  let component: UserFolderPage;
  let fixture: ComponentFixture<UserFolderPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(UserFolderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
