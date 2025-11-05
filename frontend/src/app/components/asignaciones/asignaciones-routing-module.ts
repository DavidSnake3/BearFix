import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AsignacionesComponent } from './asignaciones/asignaciones';
import { DetalleAsignacionComponent } from './detalle-asignacion/detalle-asignacion';
import { AuthGuard } from '../../guards/auth.guard';
import { RoleGuard } from '../../share/services/api/auth.guard';
import { TodasAsignacionesComponent } from './todas-asignaciones/todas-asignaciones';


const routes: Routes = [
  { path: '', component: AsignacionesComponent },
  {
    path: 'detalle/:id',
    component: DetalleAsignacionComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: ['TEC', 'ADM'] }
  },
  {
      path: 'asignaciones/todas',
    component: TodasAsignacionesComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: ['TEC', 'ADM'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AsignacionesRoutingModule { }
