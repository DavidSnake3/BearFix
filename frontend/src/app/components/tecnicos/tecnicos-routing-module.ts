import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TecnicosComponent } from './tecnicos/tecnicos';



const routes: Routes = [
  { path: '', component: TecnicosComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TecnicosRoutingModule { }