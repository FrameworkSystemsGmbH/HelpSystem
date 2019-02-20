import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AppComponent } from 'app/app.component';

import { ALL_COMPONENTS } from 'app/components/_all.components';
import { ALL_CONTROLS } from 'app/controls/_all.controls';
import { ALL_SERVICES } from 'app/services/_all.services';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    FontAwesomeModule
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
