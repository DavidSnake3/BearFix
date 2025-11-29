import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotificationsRoutingModule } from './notifications-routing-module';
import { NotificationsComponent } from './notifications/notifications';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {  ResetPasswordComponent } from './reset-password/reset-password';




@NgModule({
  declarations: [
    NotificationsComponent,
    ResetPasswordComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NotificationsRoutingModule,
    ReactiveFormsModule,
  ],
})
export class NotificationsModule { }
