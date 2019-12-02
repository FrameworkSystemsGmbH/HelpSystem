import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCog, faSearch, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

import { ListComponent } from 'app/controls/list/list.component';
import { ListItem } from 'app/controls/list/listitem';
import { ChapterService } from 'app/services/chapter.service';
import { SearchService } from 'app/services/search.service';
import { StateService } from 'app/services/state.service';
import { SelectedChapterChangedEventArgs } from 'app/eventargs/selectedchapterchanged.eventargs';
import { Chapter } from 'app/models/chapter';

@Component({
  selector: 'hlp-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {

  @Input()
  public style: any;

  @Input()
  public styleClass: any;

  @ViewChild('txtSearch', { static: false })
  public txtSearch: ElementRef;

  @ViewChild('listComp', { static: false })
  public listComp: ListComponent;

  public iconCog: IconDefinition = faCog;
  public iconSearch: IconDefinition = faSearch;
  public iconWarning: IconDefinition = faExclamationCircle;

  public searchTerm: string;
  public searchTermLast: string;
  public searching: boolean;
  public chapterItems: Array<ListItem>;

  private _inputSubject: Subject<string>;
  private _inputSubjectSub: Subscription;
  private _searchSubject: Subject<string>;
  private _searchSubjectSub: Subscription;
  private _selectedChapterSub: Subscription;

  constructor(
    private _chapterService: ChapterService,
    private _searchService: SearchService,
    private _stateService: StateService,
    private _changeDetectorRef: ChangeDetectorRef) { }

  public ngOnInit(): void {
    this._searchSubject = new Subject<string>();
    this._searchSubjectSub = this._searchSubject.pipe(
      distinctUntilChanged(),
      switchMap(term => this._searchService.search(term)),
      switchMap(chapterIds => this._chapterService.findChaptersByIds(chapterIds))
    ).subscribe(chapters => {
      this.chapterItems = this.buildChapterList(chapters);
      this.searching = false;
      this.setChapter(this._stateService.getSelectedChapter(), (this.constructor as any).name);
    });

    this._inputSubject = new Subject<string>();
    this._inputSubjectSub = this._inputSubject.pipe(
      distinctUntilChanged()
    ).subscribe(term => {
      this.searching = true;
      this.searchTermLast = term;
      this._stateService.searchFilter = term;
      this._changeDetectorRef.detectChanges();
      this._searchSubject.next(term);
    });

    this._selectedChapterSub = this._stateService.selectedChapterChanged.subscribe((args: SelectedChapterChangedEventArgs) => {
      this.setChapter(args.chapter, args.type);
    });

    const searchFilter = this._stateService.searchFilter;

    if (searchFilter) {
      this.searchTerm = searchFilter;
      this._inputSubject.next(searchFilter);
    }

    if (this.txtSearch != null) {
      this.txtSearch.nativeElement.focus();
    }
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

    const items: Array<ListItem> = new Array<ListItem>();

    for (let i = 0; i < chapters.length; i++) {
      const chapter: Chapter = chapters[i];
      const listItem: ListItem = new ListItem();
      listItem.id = chapter.id;
      listItem.label = chapter.label;
      listItem.data = chapter;
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

      if (type !== (this.constructor as any).name) {
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
    this._stateService.selectChapter(item ? item.data : null, (this.constructor as any).name);
  }

  public search(): void {
    this._inputSubject.next(this.searchTerm);
  }
}
