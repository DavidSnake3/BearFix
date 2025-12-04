import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Header } from './header/header';
import { Footer } from './footer/footer';
import { Sidebar } from './sidebar/sidebar';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TranslocoModule } from '@jsverse/transloco';
import { MatOptionModule } from '@angular/material/core';



@NgModule({
  declarations: [
    Header,
    Sidebar,
    Footer
  ],
  imports: [
    TranslocoModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    CommonModule,
    RouterModule
  ],
  exports: [
    Header,
    Sidebar,
    Footer
  ]
})
export class CoreModule { }