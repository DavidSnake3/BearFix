import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';
import { TicketsComponent } from './components/tickets/tickets/tickets';
import { RoleGuard } from './share/services/api/auth.guard';
import { DashboardComponent } from './components/home/dashboard/dashboard';
import { CategoriasComponent } from './components/categorias/categorias/categorias';
import { TecnicosComponent } from './components/tecnicos/tecnicos/tecnicos';
import { AsignacionesComponent } from './components/asignaciones/asignaciones/asignaciones';
import { DetalleAsignacionComponent } from './components/asignaciones/detalle-asignacion/detalle-asignacion';
import { HistorialComponent } from './components/tickets/historial/historial';
import { TodasAsignacionesComponent } from './components/asignaciones/todas-asignaciones/todas-asignaciones';
import { PageNotFound } from './share/page-not-found/page-not-found';
import { TicketsUserComponent } from './components/tickets/tickets-user/tickets-user';

const routes: Routes = [

  {
    path: 'auth',
    loadChildren: () => import('./components/auth/auth-module').then(m => m.AuthModule)
  },

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'tickets',
    component: TicketsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: 'ADM' }
  },
  {
    path: 'categorias',
    component: CategoriasComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: 'ADM' }
  },
  {
    path: 'tecnicos',
    component: TecnicosComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: 'ADM' }
  },
  {
    path: 'asignaciones',
    component: AsignacionesComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: ['TEC', 'ADM'] }
  },
    {
    path: 'Todas/asignaciones',
    component: TodasAsignacionesComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: ['TEC', 'ADM'] }
  },
  {
    path: 'asignaciones/detalle/:id',
    component: DetalleAsignacionComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: ['TEC', 'ADM'] }
  },
  {
    path: 'historial',
    component: HistorialComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: ['TEC', 'ADM', 'USR'] }
  },
  {
    path: 'tickets-user',
    component: TicketsUserComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: ['TEC', 'ADM', 'USR'] }
  },

  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },

  { path: '**', component: PageNotFound }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }