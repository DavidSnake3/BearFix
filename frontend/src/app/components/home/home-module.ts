import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // AÑADE ESTOS

import { HomeRoutingModule } from './home-routing-module';
import { DashboardComponent } from './dashboard/dashboard';

@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    FormsModule,        
    ReactiveFormsModule 
  ]
})
export class HomeModule { }