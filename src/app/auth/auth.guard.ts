import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators'; // Import the map operator
import { SdGenApiService } from '../services/sd-gen-api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router, private Sd: SdGenApiService) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.authService.isAuthenticated().pipe(
      map((isLoggedIn: boolean) => {
        if (isLoggedIn) {
          var tokenTtl = localStorage.getItem('token_ttl') || new Date();
          var currDate = new Date();
          if (new Date(tokenTtl) < currDate) {
            this.Sd.postRefreshToken(localStorage.getItem('token')).subscribe(
              (res) => {
                if (res.status === 200) {
                  localStorage.setItem('token', res.body.token);
                  localStorage.setItem('token_ttl', new Date(currDate.getTime() + (res.body.ttl - 2800) * 1000).toString());
                }
              },
              (err) => {
                console.log(err);
              }
            );
          }
          return true;
        } else {
          this.router.navigate(['/login']);
          return false;
        }
      })
    );
  }
}
