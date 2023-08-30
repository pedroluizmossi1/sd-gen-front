import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams, HttpHeaders} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root' // Isso define o serviço como um serviço de nível raiz (singleton)
})
export class SdGenApiService {
  private apiUrl = environment.sdGenApiUrl;
  
  constructor(private http: HttpClient) {}

  
  // Auth
  postAuthLogin(data: any): Observable<HttpResponse<any>> {
    return this.http.post(`${this.apiUrl}/auth/login/`, data, { observe: 'response' });
  }
  
  getAuthCheck(token: any): Observable<HttpResponse<any>> {
    var param = new HttpParams().set('token', token);
    return this.http.get(`${this.apiUrl}/auth/check/`, { params: param, observe: 'response' });
  }

  postAuthLogout(token: any): Observable<HttpResponse<any>> {
    var headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/auth/logout/`, null, { headers: headers, observe: 'response' });
  }

  postAuthResetPasswordToken(data: any): Observable<HttpResponse<any>> {
    var params = new HttpParams().set('login', data.username);
    return this.http.post(`${this.apiUrl}/auth/password/reset/token/`, null, { params: params, observe: 'response' });
  }

  postAuthResetPassword(data: any): Observable<HttpResponse<any>> {
    var params = new HttpParams().set('login', data.username).set('reset_token', data.reset_token).set('new_password', data.new_password);
    return this.http.put(`${this.apiUrl}/auth/password/reset/`, null, { params: params, observe: 'response' });
  }

  postRefreshToken(data: any): Observable<HttpResponse<any>> {
    var params = new HttpHeaders().set('Authorization', `Bearer ${data.token}`);
    return this.http.post(`${this.apiUrl}/auth/token/refresh/`, null, { headers: params, observe: 'response' });
  }

  // User
  getUserProfile(token: any): Observable<HttpResponse<any>> {
    var headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/user/profile/`, { headers: headers, observe: 'response' });
  }

  putUserProfileImage(token: any, data: any): Observable<HttpResponse<any>> {
    var headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.apiUrl}/user/profile/image/`, data, { headers: headers, observe: 'response' });
  }

  postAuthRegister(data: any): Observable<HttpResponse<any>> {
    return this.http.post(`${this.apiUrl}/user/register/`, data, { observe: 'response' });
  }

  // User Model
  getUserModels(token: any): Observable<HttpResponse<any>> {
    var headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/user/model/all/`, { headers: headers, observe: 'response' });
  }

  // Folder

  getUserFolders(token: any): Observable<HttpResponse<any>> {
    var headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/user/folder/get/all/`, { headers: headers, observe: 'response' });
  }

  getUserFolder(token: any, folder_id: any): Observable<HttpResponse<any>> {
    var headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    var param = new HttpParams().set('id_or_folder', folder_id);
    return this.http.get(`${this.apiUrl}/user/folder/get/`, { headers: headers, params: param, observe: 'response' });
  }

  postUserFolder(token: any, data: any): Observable<HttpResponse<any>> {
    var headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/user/folder/create/`, data, { headers: headers, observe: 'response' })
  }

  deleteUserFolder(token: any, folder_id: any): Observable<HttpResponse<any>> {
    var headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    var param = new HttpParams().set('id_or_folder', folder_id);
    return this.http.delete(`${this.apiUrl}/user/folder/delete/`, { headers: headers, params: param, observe: 'response' });
  }

  // Image
  postGenerateImage(token: any, data: any, folder: any): Observable<HttpResponse<any>> {
    var params = new HttpParams().set('folder', folder);
    var headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/user/image/txt2img/`, data, { headers: headers, params: params, observe: 'response' });
  }

  postImageTxt2imgV2Sdxl(token: any, data: any, folder: any, refiner: boolean): Observable<HttpResponse<any>> {
    var params = new HttpParams().set('folder', folder,).set('refiner', refiner);
    var headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/user/image/txt2img/v2/sdxl/`, data, { headers: headers, params: params, observe: 'response' });
  }

  postImageTxt2imgV2Sd15(token: any, data: any, folder: any, Latent: boolean): Observable<HttpResponse<any>> {
    var params = new HttpParams().set('folder', folder).set('latent', Latent);
    var headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/user/image/txt2img/v2/sd15/`, data, { headers: headers, params: params, observe: 'response' });
  }

  getUserImage(token: any, image_id: any): Observable<HttpResponse<Blob>> {
    var headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    var param = new HttpParams().set('image_id', image_id);
    // Observe que o retorno aqui é HttpResponse<Blob>
    return this.http.get(`${this.apiUrl}/user/image/`, { headers: headers, params: param, observe: 'response', responseType: 'blob' });
  }

  getUserTxt2imgV2SdxlQueue(token: any): Observable<HttpResponse<any>> {
    var headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/user/image/txt2img/v2/sdxl/queue/`, { headers: headers, observe: 'response' });
  }

  getUserTxt2imgV2Sd15Queue(token: any): Observable<HttpResponse<any>> {
    var headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/user/image/txt2img/v2/sd15/queue/`, { headers: headers, observe: 'response' });
  }

  deleteUserImage(token: any, image_id: any): Observable<HttpResponse<any>> {
    var headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    var param = new HttpParams().set('image_id', image_id);
    return this.http.delete(`${this.apiUrl}/user/image/`, { headers: headers, params: param, observe: 'response' });
  }

  // Face Swap
  postGenerateFaceSwap(token: any, data: any, folder: any): Observable<HttpResponse<any>> {
    var params = new HttpParams().set('folder', folder);
    var headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/user/image/faceswap/`, data, { headers: headers, params: params, observe: 'response' });
  }

  postFaceSwapUpload(token: any, data: any, folder: any): Observable<HttpResponse<any>> {
    var params = new HttpParams().set('folder', folder);
    var headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/user/image/faceswap/upload/`, data, { headers: headers, params: params, observe: 'response' });
  }
  
  // Plan
  getUserPlan(token: any, plan: any): Observable<HttpResponse<any>> {
    var params = new HttpParams().set('id_or_plan', plan);
    var headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/plan/`, { headers: headers, params: params, observe: 'response' });
  }

}