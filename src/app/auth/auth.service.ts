import { Injectable } from '@angular/core';
import { SdGenApiService } from 'src/app/services/sd-gen-api.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private Sd: SdGenApiService) { }

  isAuthenticated(): Observable<boolean> {
    var token = localStorage.getItem('token');
    return this.Sd.getAuthCheck(token).pipe(
      map((data: any) => {
        return data.status === 200;
      })
    );
  }
}
