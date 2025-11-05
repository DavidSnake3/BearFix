import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TecnicosRoutingModule } from './tecnicos-routing-module';
import { TecnicosComponent } from './tecnicos/tecnicos';




@NgModule({
  declarations: [
    TecnicosComponent
  ],
  imports: [
    CommonModule,
    TecnicosRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class TecnicosModule { }