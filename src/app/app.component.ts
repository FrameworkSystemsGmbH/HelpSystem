import { Component, HostListener, OnInit, OnDestroy, NgZone, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Http } from '@angular/http';

import { ISubscription } from 'rxjs/Subscription';

import { ContentComponent, ViewerComponent } from './components';
import { SelectedTabChangedEventArgs } from './eventargs';
import { ChapterService, StateService } from './services';
import { Chapter, Meta, Tab } from './models';

@Component({
  selector: 'hlp-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  @ViewChild('contentComp') contentComp: ContentComponent;
  @ViewChild('viewerComp') viewerComp: ViewerComponent;

  private _initMetaSub: ISubscription;
  private _selectedTabSub: ISubscription;

  public selectedTab: Tab;
  tabType = Tab;

  constructor(
    private _http: Http,
    private _zone: NgZone,
    private _title: Title,
    private _chapterService: ChapterService,
    private _stateService: StateService) { }

  public ngOnInit(): void {
    this.selectedTab = this._stateService.getSelectedTab();

    this._selectedTabSub = this._stateService.selectedTabChanged.subscribe((args: SelectedTabChangedEventArgs) => {
      this.selectedTab = args.tab;
    });

    this._initMetaSub = this._http.get('files/json/meta.json')
      .map(res => <Meta>res.json())
      .subscribe(meta => {
        this._title.setTitle(meta.title);
      });

    this.loadReferencedChapter();

    (<any>window).appComponentRef = {
      zone: this._zone,
      comp: this
    };
  }

  public ngOnDestroy(): void {
    this._initMetaSub.unsubscribe();
    this._selectedTabSub.unsubscribe();
  }

  @HostListener('window:popstate', ['$event'])
  public onPopState(event: PopStateEvent) {
    this._stateService.loadState(event.state);
  }

  public navigate(reference: string): void {
    if (reference) {
      this._chapterService.findChaptersByReference(reference).subscribe(chapter => {
        if (chapter) {
          this._stateService.selectChapter(chapter);
        }
      });
    }
  }

  private loadReferencedChapter(): void {
    let reference: string = this.getUrlParameter('load');

    if (reference && reference.trim()) {
      this._chapterService.findChaptersByReference(reference).subscribe(chapter => {
        if (chapter) {
          this._stateService.selectChapter(chapter);
        } else {
          this._stateService.selectChapter(null);
        }
      });
    } else {
      this.viewerComp.setStartPage();
    }
  }

  private getUrlParameter(name: string): string {
    if (!name || !name.trim()) {
      return null;
    }

    let url: string = window.location.href;

    name = name.trim().replace(/[\[\]]/g, '\\$&');

    let regex: RegExp = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    let results: RegExpExecArray = regex.exec(url);

    if (!results) {
      return null;
    }

    if (!results[2]) {
      return '';
    }

    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }
}