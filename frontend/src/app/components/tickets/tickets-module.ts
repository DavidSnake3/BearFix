import { NgModule } from '@angular/core';


import { TicketsRoutingModule } from './tickets-routing-module';
import {  TicketsComponent } from './tickets/tickets';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HistorialComponent } from './historial/historial';
import { CommonModule } from '@angular/common';


@NgModule({
  declarations: [
    TicketsComponent,
    HistorialComponent
  ],
  imports: [
    CommonModule,
    TicketsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class TicketsModule { }
