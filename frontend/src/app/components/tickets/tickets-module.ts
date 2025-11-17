import { NgModule } from '@angular/core';


import { TicketsRoutingModule } from './tickets-routing-module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HistorialComponent } from './historial/historial';
import { TicketsComponent } from './tickets/tickets';
import { TicketsUserComponent } from './tickets-user/tickets-user';

@NgModule({
  declarations: [
    HistorialComponent,
    TicketsComponent,
    TicketsUserComponent,
  ],
  imports: [
    CommonModule,
    TicketsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class TicketsModule { }
