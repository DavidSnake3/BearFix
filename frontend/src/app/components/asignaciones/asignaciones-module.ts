import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AsignacionesRoutingModule } from './asignaciones-routing-module';
import { AsignacionesComponent } from './asignaciones/asignaciones';
import { DetalleAsignacionComponent } from './detalle-asignacion/detalle-asignacion';
import {  TodasAsignacionesComponent } from './todas-asignaciones/todas-asignaciones';



@NgModule({
  declarations: [
    AsignacionesComponent,
    DetalleAsignacionComponent,
    TodasAsignacionesComponent
  ],
  imports: [
    CommonModule,
    AsignacionesRoutingModule,
    RouterModule
  ]
})
export class AsignacionesModule { }