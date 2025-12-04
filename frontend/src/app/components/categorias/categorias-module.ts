import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CategoriasRoutingModule } from './categorias-routing-module';
import { CategoriasComponent } from './categorias/categorias';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';



@NgModule({
  declarations: [
    CategoriasComponent
  ],
  imports: [
    TranslocoModule,
    CommonModule,
    CategoriasRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class CategoriasModule { }
