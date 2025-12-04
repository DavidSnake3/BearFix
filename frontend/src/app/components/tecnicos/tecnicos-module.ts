import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TecnicosRoutingModule } from './tecnicos-routing-module';
import { TecnicosComponent } from './tecnicos/tecnicos';
import { TranslocoModule } from '@jsverse/transloco';




@NgModule({
  declarations: [
    TecnicosComponent
  ],
  imports: [
    TranslocoModule,
    CommonModule,
    TecnicosRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class TecnicosModule { }