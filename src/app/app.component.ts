import { Component, HostListener, OnInit, OnDestroy, NgZone, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Http } from '@angular/http';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { ContentComponent } from 'app/components/content/content.component';
import { ViewerComponent } from 'app/components/viewer/viewer.component';
import { ChapterService } from 'app/services/chapter.service';
import { StateService } from 'app/services/state.service';
import { SelectedTabChangedEventArgs } from 'app/eventargs/selectedtabchanged.eventargs';
import { Tab } from 'app/models/tab';
import { Meta } from 'app/models/meta';

@Component({
  selector: 'hlp-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  @ViewChild('contentComp') public contentComp: ContentComponent;
  @ViewChild('viewerComp') public viewerComp: ViewerComponent;

  private _initMetaSub: Subscription;
  private _selectedTabSub: Subscription;

  public selectedTab: Tab;
  public tabType = Tab;

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

    this._initMetaSub = this._http.get('files/json/meta.json').pipe(
      map(res => res.json() as Meta)
    ).subscribe(meta => {
      this._title.setTitle(meta.title);
    });

    this.loadReferencedChapter();

    (window as any).appComponentRef = {
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
    const reference: string = this.getUrlParameter('load');

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

    const url: string = window.location.href;

    const nameTrimmed: string = name.trim().replace(/[\[\]]/g, '\\$&');

    const regex: RegExp = new RegExp('[?&]' + nameTrimmed + '(=([^&#]*)|&|#|$)');
    const results: RegExpExecArray = regex.exec(url);

    if (!results) {
      return null;
    }

    if (!results[2]) {
      return '';
    }

    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }
}
