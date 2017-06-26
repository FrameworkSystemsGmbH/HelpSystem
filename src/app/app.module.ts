import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';

import {
  ListComponent,
  ListItemComponent,
  TreeComponent,
  TreeNodeComponent
} from './controls';

import {
  ContentComponent,
  IndexComponent,
  NavigationComponent,
  SearchComponent,
  ViewerComponent
} from './components';

import {
  ChapterService,
  IndexService,
  SearchService,
  StateService
} from './services';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
  ],
  declarations: [
    AppComponent,
    ListComponent,
    ListItemComponent,
    TreeComponent,
    TreeNodeComponent,
    ContentComponent,
    IndexComponent,
    NavigationComponent,
    SearchComponent,
    ViewerComponent
  ],
  providers: [
    Title,
    ChapterService,
    IndexService,
    SearchService,
    StateService
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
