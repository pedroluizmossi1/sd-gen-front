import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { HttpClientModule } from "@angular/common/http";
import { FormsModule, FormGroup } from '@angular/forms';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { register } from 'swiper/element/bundle';
import { GALLERY_CONFIG, GalleryConfig } from 'ng-gallery';
import { NgxJsonViewerModule } from 'ngx-json-viewer';

// register Swiper custom elements
register();

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy, },
    importProvidersFrom(IonicModule.forRoot({}), [
      HttpClientModule,
      FormsModule,
      FormGroup,
    ]),
    { provide: GALLERY_CONFIG,useValue: {
      autoHeight: true,
      imageSize: 'cover'
    } as GalleryConfig },
    NgxJsonViewerModule,    
    provideRouter(routes),
  ],
});
