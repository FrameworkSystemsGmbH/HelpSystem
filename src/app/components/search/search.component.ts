import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, OnDestroy, Renderer, ViewChild } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { ISubscription } from 'rxjs/Subscription';

import { ListComponent, ListItem } from '../../controls/list';

import { SelectedChapterChangedEventArgs, SelectedTabChangedEventArgs } from '../../eventargs';
import { ChapterService, SearchService, StateService } from '../../services';
import { Chapter, Tab } from '../../models';

@Component({
  selector: 'hlp-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {

  @Input() style: any;
  @Input() styleClass: any;

  @ViewChild('txtSearch') txtSearch: ElementRef;
  @ViewChild('listComp') listComp: ListComponent;

  public searchTerm: string;
  public searchTermLast: string;
  public searching: boolean;
  public chapterItems: Array<ListItem>;

  private _inputSubject: Subject<string>;
  private _inputSubjectSub: ISubscription;
  private _searchSubject: Subject<string>;
  private _searchSubjectSub: ISubscription;
  private _selectedChapterSub: ISubscription;

  constructor(
    private _chapterService: ChapterService,
    private _searchService: SearchService,
    private _stateService: StateService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _renderer: Renderer) { }

  public ngOnInit(): void {
    this._searchSubject = new Subject<string>();
    this._searchSubjectSub = this._searchSubject
      .distinctUntilChanged()
      .switchMap(term => this._searchService.search(term))
      .switchMap(chapterIds => this._chapterService.findChaptersByIds(chapterIds))
      .subscribe(chapters => {
        this.chapterItems = this.buildChapterList(chapters);
        this.searching = false;
        this.setChapter(this._stateService.getSelectedChapter(), (<any>this.constructor).name);
      });

    this._inputSubject = new Subject<string>();
    this._inputSubjectSub = this._inputSubject
      .distinctUntilChanged()
      .subscribe(term => {
        this.searching = true;
        this.searchTermLast = term;
        this._stateService.searchFilter = term;
        this._changeDetectorRef.detectChanges();
        this._searchSubject.next(term);
      });

    this._selectedChapterSub = this._stateService.selectedChapterChanged.subscribe((args: SelectedChapterChangedEventArgs) => {
      this.setChapter(args.chapter, args.type);
    });

    let searchFilter = this._stateService.searchFilter;

    if (searchFilter) {
      this.searchTerm = searchFilter;
      this._inputSubject.next(searchFilter);
    }

    this._renderer.invokeElementMethod(this.txtSearch.nativeElement, 'focus');
  }

  public ngOnDestroy(): void {
    this._inputSubjectSub.unsubscribe();
    this._searchSubjectSub.unsubscribe();
    this._selectedChapterSub.unsubscribe();
  }

  private buildChapterList(chapters: Array<Chapter>): Array<ListItem> {
    if (!chapters || !chapters.length) {
      return null;
    }

    let items: Array<ListItem> = new Array<ListItem>();

    for (let i = 0; i < chapters.length; i++) {
      let chapter: Chapter = chapters[i];
      let listItem: ListItem = new ListItem();
      listItem.id = chapter.id;
      listItem.label = chapter.label;
      listItem.data = chapter;
      listItem.children = this.buildChapterList(chapter.children);
      items.push(listItem);
    }

    return items;
  }

  public setChapter(chapter: Chapter, type: any = null): void {
    if (!this.listComp && this.chapterItems) {
      this._changeDetectorRef.detectChanges();
    }

    if (this.listComp) {
      this.listComp.selectItemById(chapter ? chapter.id : null);

      if (type !== (<any>this.constructor).name) {
        this.listComp.scrollSelectedIntoView();
      }
    }
  }

  public checkIsItemSelected(selected: ListItem, item: ListItem): boolean {
    return selected && selected.data && item && item.data && selected.data.id === item.data.id;
  }

  public checkCanSelectChapter(item: ListItem): boolean {
    return true;
  }

  public onItemSelected(item: ListItem): void {
    this._stateService.selectChapter(item ? item.data : null, (<any>this.constructor).name);
  }

  public search(): void {
    this._inputSubject.next(this.searchTerm);
  }
}
