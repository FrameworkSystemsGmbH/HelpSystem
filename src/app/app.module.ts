import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';

import { ALL_COMPONENTS } from './components/_all.components';
import { ALL_CONTROLS } from './controls/_all.controls';
import { ALL_SERVICES } from './services/_all.services';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  declarations: [
    AppComponent,
    ALL_CONTROLS,
    ALL_COMPONENTS
  ],
  providers: [
    Title,
    ALL_SERVICES
  ],
  bootstrap: [
    AppComponent
  ]
})
// tslint:disable-next-line:no-unnecessary-class
export class AppModule { }
