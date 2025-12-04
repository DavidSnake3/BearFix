import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // AÑADE ESTOS

import { HomeRoutingModule } from './home-routing-module';
import { DashboardComponent } from './dashboard/dashboard';
import { Perfil } from './perfil/perfil';
import { TranslocoModule } from '@jsverse/transloco';

@NgModule({
  declarations: [
    Perfil,
    DashboardComponent,
  ],
  imports: [
    TranslocoModule,
    CommonModule,
    HomeRoutingModule,
    FormsModule,        
    ReactiveFormsModule
  ],
  exports: [
    Perfil
  ]
})
export class HomeModule { }