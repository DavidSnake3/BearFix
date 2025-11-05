import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';



import { HTTP_INTERCEPTORS, HttpClientModule, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TokenInterceptor } from './share/interceptor/token.interceptor';
import { HttpErrorInterceptorService } from './share/interceptor/http-error-interceptor.service';

import { NgToastModule } from 'ng-angular-popup';

import { NgxSonnerToaster } from 'ngx-sonner';
import { App } from './app';
import { AppRoutingModule } from './app-routing-module';
import { AsignacionesModule } from './components/asignaciones/asignaciones-module';
import { CategoriasModule } from './components/categorias/categorias-module';
import { CoreModule } from './components/core/core-module';
import { TecnicosModule } from './components/tecnicos/tecnicos-module';
import { TicketsModule } from './components/tickets/tickets-module';

@NgModule({
  declarations: [
    App,
  ],
  imports: [
    BrowserModule,
    NgxSonnerToaster,
    AppRoutingModule,
    HttpClientModule,
    NgToastModule,
    TecnicosModule,
    CoreModule,
    CategoriasModule,
    TicketsModule,
    AsignacionesModule
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptorService,
      multi: true
    }
  ],
  bootstrap: [App],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }