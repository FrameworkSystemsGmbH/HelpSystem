import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, OnDestroy, Renderer, ViewChild } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { ISubscription } from 'rxjs/Subscription';

import { ListComponent, ListItem } from '../../controls/list';
import { SelectedChapterChangedEventArgs, SelectedIndexChangedEventArgs, SelectedTabChangedEventArgs } from '../../eventargs';
import { ChapterService, IndexService, StateService } from '../../services';
import { Chapter, Index, Tab } from '../../models';

@Component({
  selector: 'hlp-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit, OnDestroy {

  @Input() style: any;
  @Input() styleClass: any;

  @ViewChild('txtFilter') txtFilter: ElementRef;
  @ViewChild('indexListComp') indexListComp: ListComponent;
  @ViewChild('chapterListComp') chapterListComp: ListComponent;

  public filterTerm: string;
  public loading: boolean;
  public initialized: boolean;
  public indexItems: Array<ListItem>;
  public chapterItems: Array<ListItem>;

  private _inputSubject: Subject<string>;
  private _inputSubjectSub: ISubscription;
  private _filterSubject: Subject<string>;
  private _filterSubjectSub: ISubscription;
  private _selectedIndexSub: ISubscription;
  private _chapterItemsSubject: Subject<Array<string>>;
  private _chapterItemsSubjectSub: ISubscription;
  private _selectChapterSubject: Subject<string>;
  private _selectChapterSubjectSub: ISubscription;
  private _selectedChapterSub: ISubscription;

  constructor(
    private _chapterService: ChapterService,
    private _indexService: IndexService,
    private _stateService: StateService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _renderer: Renderer) { }

  public ngOnInit(): void {
    this._filterSubject = new Subject<string>();
    this._filterSubjectSub = this._filterSubject
      .distinctUntilChanged()
      .switchMap(term => this._indexService.getIndices(term))
      .subscribe(indices => {
        this.indexItems = this.buildIndexList(indices);
        this.initialized = true;
        this.loading = false;
        this.setIndex(this._stateService.getSelectedIndex(), (<any>this.constructor).name);
      });

    this._inputSubject = new Subject<string>();
    this._inputSubjectSub = this._inputSubject
      .distinctUntilChanged()
      .subscribe(term => {
        this.loading = true;
        this._changeDetectorRef.detectChanges();
        this._stateService.indexFilter = term;
        this._filterSubject.next(term);
      });

    this._chapterItemsSubject = new Subject<Array<string>>();
    this._chapterItemsSubjectSub = this._chapterItemsSubject
      .switchMap(chapterIds => this._chapterService.findChaptersByIds(chapterIds))
      .subscribe(chapters => {
        this.chapterItems = this.buildChapterList(chapters);
        this.setChapter(this._stateService.getSelectedChapter());
      });

    this._selectChapterSubject = new Subject<string>();
    this._selectChapterSubjectSub = this._selectChapterSubject
      .switchMap(id => this._chapterService.findChapterById(id))
      .subscribe(chapter => {
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


    let indexFilter = this._stateService.indexFilter;

    if (indexFilter) {
      this.filterTerm = indexFilter;
      this._inputSubject.next(indexFilter);
    } else {
      this._inputSubject.next(null);
    }

    this._renderer.invokeElementMethod(this.txtFilter.nativeElement, 'focus');
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

    let items: Array<ListItem> = new Array<ListItem>();

    for (let i = 0; i < indices.length; i++) {
      let index: Index = indices[i];
      let listItem: ListItem = new ListItem();
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

  private buildChapterListForSelectedIndex(): void {
    this.chapterItems = [];
    let selectedItem: ListItem = this.indexListComp.getSelectedItem();
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

      if (type !== (<any>this.constructor).name) {
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

      if (type !== (<any>this.constructor).name) {
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
      this._stateService.selectIndex(item.data, (<any>this.constructor).name);
    } else {
      this._stateService.selectIndex(item.data, (<any>this.constructor).name, false);
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
    this._stateService.selectChapter(item.data, (<any>this.constructor).name);
  }

  public filter(): void {
    this._inputSubject.next(this.filterTerm);
  }
}
