import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCog, faFilter, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

import { ListComponent } from 'app/controls/list/list.component';
import { ListItem } from 'app/controls/list/listitem';
import { ChapterService } from 'app/services/chapter.service';
import { IndexService } from 'app/services/index.service';
import { StateService } from 'app/services/state.service';
import { SelectedIndexChangedEventArgs } from 'app/eventargs/selectedindexchanged.eventargs';
import { SelectedChapterChangedEventArgs } from 'app/eventargs/selectedchapterchanged.eventargs';
import { Index } from 'app/models/index';
import { Chapter } from 'app/models/chapter';

@Component({
  selector: 'hlp-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit, OnDestroy {

  @Input()
  public style: any;

  @Input()
  public styleClass: any;

  @ViewChild('txtFilter', { static: false })
  public txtFilter: ElementRef;

  @ViewChild('indexListComp', { static: false })
  public indexListComp: ListComponent;

  @ViewChild('chapterListComp', { static: false })
  public chapterListComp: ListComponent;

  public iconCog: IconDefinition = faCog;
  public iconFilter: IconDefinition = faFilter;
  public iconWarning: IconDefinition = faExclamationCircle;

  public filterTerm: string;
  public loading: boolean;
  public initialized: boolean;
  public indexItems: Array<ListItem>;
  public chapterItems: Array<ListItem>;

  private _inputSubject: Subject<string>;
  private _inputSubjectSub: Subscription;
  private _filterSubject: Subject<string>;
  private _filterSubjectSub: Subscription;
  private _selectedIndexSub: Subscription;
  private _chapterItemsSubject: Subject<Array<string>>;
  private _chapterItemsSubjectSub: Subscription;
  private _selectChapterSubject: Subject<string>;
  private _selectChapterSubjectSub: Subscription;
  private _selectedChapterSub: Subscription;

  constructor(
    private _chapterService: ChapterService,
    private _indexService: IndexService,
    private _stateService: StateService,
    private _changeDetectorRef: ChangeDetectorRef) { }

  public ngOnInit(): void {
    this._filterSubject = new Subject<string>();
    this._filterSubjectSub = this._filterSubject.pipe(
      distinctUntilChanged(),
      switchMap(term => this._indexService.getIndices(term))
    ).subscribe(indices => {
      this.indexItems = this.buildIndexList(indices);
      this.initialized = true;
      this.loading = false;
      this.setIndex(this._stateService.getSelectedIndex(), (this.constructor as any).name);
    });

    this._inputSubject = new Subject<string>();
    this._inputSubjectSub = this._inputSubject.pipe(
      distinctUntilChanged()
    ).subscribe(term => {
      this.loading = true;
      this._changeDetectorRef.detectChanges();
      this._stateService.indexFilter = term;
      this._filterSubject.next(term);
    });

    this._chapterItemsSubject = new Subject<Array<string>>();
    this._chapterItemsSubjectSub = this._chapterItemsSubject.pipe(
      switchMap(chapterIds => this._chapterService.findChaptersByIds(chapterIds))
    ).subscribe(chapters => {
      this.chapterItems = this.buildChapterList(chapters);
      this.setChapter(this._stateService.getSelectedChapter());
    });

    this._selectChapterSubject = new Subject<string>();
    this._selectChapterSubjectSub = this._selectChapterSubject.pipe(
      switchMap(id => this._chapterService.findChapterById(id))
    ).subscribe(chapter => {
      this._stateService.selectChapter(chapter);
    });

    this._selectedIndexSub = this._stateService.selectedIndexChanged
      .subscribe((args: SelectedIndexChangedEventArgs) => {
        this.setIndex(args.index, args.type);
      });

    this._selectedChapterSub = this._stateService.selectedChapterChanged
      .subscribe((args: SelectedChapterChangedEventArgs) => {
        this.setChapter(args.chapter, args.type);
      });

    const indexFilter = this._stateService.indexFilter;

    if (indexFilter) {
      this.filterTerm = indexFilter;
      this._inputSubject.next(indexFilter);
    } else {
      this._inputSubject.next(null);
    }

    if (this.txtFilter != null) {
      this.txtFilter.nativeElement.focus();
    }
  }

  public ngOnDestroy(): void {
    this._inputSubjectSub.unsubscribe();
    this._filterSubjectSub.unsubscribe();
    this._selectedIndexSub.unsubscribe();
    this._chapterItemsSubjectSub.unsubscribe();
    this._selectChapterSubjectSub.unsubscribe();
    this._selectedChapterSub.unsubscribe();
  }

  private buildIndexList(indices: Array<Index>, flag: boolean = false): Array<ListItem> {
    if (!indices || !indices.length) {
      return null;
    }

    const items: Array<ListItem> = new Array<ListItem>();

    for (let i = 0; i < indices.length; i++) {
      const index: Index = indices[i];
      const listItem: ListItem = new ListItem();
      listItem.id = index.label;
      listItem.label = index.label;
      listItem.data = index;
      listItem.children = this.buildIndexList(index.children, true);
      items.push(listItem);
    }

    return items;
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
      listItem.children = this.buildChapterList(chapter.children);
      items.push(listItem);
    }

    return items;
  }

  private buildChapterListForSelectedIndex(): void {
    this.chapterItems = [];
    const selectedItem: ListItem = this.indexListComp.getSelectedItem();
    if (selectedItem && selectedItem.data && selectedItem.data.chapters && selectedItem.data.chapters.length > 1) {
      this._chapterItemsSubject.next(selectedItem.data.chapters);
    }
  }

  private setIndex(index: Index, type: any = null): void {
    if (!this.indexListComp && this.indexItems) {
      this._changeDetectorRef.detectChanges();
    }

    if (this.indexListComp) {
      this.indexListComp.selectItemById(index ? index.label : null);

      if (type !== (this.constructor as any).name) {
        this.indexListComp.scrollSelectedIntoView();
      }

      this.buildChapterListForSelectedIndex();
    }
  }

  private setChapter(chapter: Chapter, type: any = null): void {
    if (!this.chapterListComp && this.chapterItems) {
      this._changeDetectorRef.detectChanges();
    }

    if (this.chapterListComp) {
      this.chapterListComp.selectItemById(chapter ? chapter.id : null);

      if (type !== (this.constructor as any).name) {
        this.chapterListComp.scrollSelectedIntoView();
      }
    }
  }

  public checkIsIndexSelected(selected: ListItem, item: ListItem): boolean {
    return selected && item && selected.label === item.label;
  }

  public checkCanSelectIndex(item: ListItem): boolean {
    return item.data && item.data.chapters && item.data.chapters.length > 0;
  }

  public onIndexItemSelected(item: ListItem): void {
    if (item.data && item.data.chapters && item.data.chapters.length > 1) {
      this._stateService.selectIndex(item.data, (this.constructor as any).name);
    } else {
      this._stateService.selectIndex(item.data, (this.constructor as any).name, false);
      this._selectChapterSubject.next(item.data.chapters[0]);
    }
  }

  public checkIsChapterSelected(selected: ListItem, item: ListItem): boolean {
    return selected && selected.data && item && item.data && selected.data.id === item.data.id;
  }

  public checkCanSelectChapter(item: ListItem): boolean {
    return true;
  }

  public onChapterItemSelected(item: ListItem): void {
    this._stateService.selectChapter(item.data, (this.constructor as any).name);
  }

  public filter(): void {
    this._inputSubject.next(this.filterTerm);
  }
}
