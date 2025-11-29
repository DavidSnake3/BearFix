import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AsignacionesRoutingModule } from './asignaciones-routing-module';
import { AsignacionesComponent } from './asignaciones/asignaciones';
import { DetalleAsignacionComponent } from './detalle-asignacion/detalle-asignacion';
import {  TodasAsignacionesComponent } from './todas-asignaciones/todas-asignaciones';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    AsignacionesComponent,
    DetalleAsignacionComponent,
    TodasAsignacionesComponent
  ],
  imports: [
    CommonModule,
    AsignacionesRoutingModule,
    RouterModule,
    FormsModule
  ]
})
export class AsignacionesModule { }