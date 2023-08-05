import { Routes } from '@angular/router';
import { AuthService } from './auth/auth.service'
import { AuthGuard } from './auth/auth.guard'

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'txt2img',
    loadComponent: () => import('./txt2img/txt2img.page').then( m => m.Txt2imgPage), canActivate: [AuthGuard]
  },
  {
    path: 'user-profile',
    loadComponent: () => import('./user-profile/user-profile.page').then( m => m.UserProfilePage), canActivate: [AuthGuard]
  },
  {
    path: 'user-folder',
    loadComponent: () => import('./user-folder/user-folder.page').then( m => m.UserFolderPage), canActivate: [AuthGuard]
  },
  {
    path: 'user-folder-image',
    loadComponent: () => import('./user-folder/user-folder-image/user-folder-image.page').then( m => m.UserFolderImagePage) , canActivate: [AuthGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.page').then( m => m.RegisterPage)
  },
  {
    path: 'login/reset-password',
    loadComponent: () => import('./login/reset-password/reset-password.page').then( m => m.ResetPasswordPage)
  }
]
