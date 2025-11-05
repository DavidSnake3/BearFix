import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Header } from './header/header';
import { Footer } from './footer/footer';
import { Sidebar } from './sidebar/sidebar';



@NgModule({
  declarations: [
    Header,
    Sidebar,
    Footer
  ],
  imports: [
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