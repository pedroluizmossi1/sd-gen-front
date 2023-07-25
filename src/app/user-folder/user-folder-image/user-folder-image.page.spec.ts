import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserFolderImagePage } from './user-folder-image.page';

describe('UserFolderImagePage', () => {
  let component: UserFolderImagePage;
  let fixture: ComponentFixture<UserFolderImagePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(UserFolderImagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
