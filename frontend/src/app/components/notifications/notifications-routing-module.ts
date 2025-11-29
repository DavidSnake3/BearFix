import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotificationsComponent } from './notifications/notifications';
import { ResetPasswordComponent } from './reset-password/reset-password';

const routes: Routes = [
  { path: '', component: NotificationsComponent },
  { path: 'reset', component: ResetPasswordComponent },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotificationsRoutingModule { }
