import { Injectable, EventEmitter } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { SelectedChapterChangedEventArgs } from 'app/eventargs/selectedchapterchanged.eventargs';
import { SelectedIndexChangedEventArgs } from 'app/eventargs/selectedindexchanged.eventargs';
import { SelectedTabChangedEventArgs } from 'app/eventargs/selectedtabchanged.eventargs';

import { Chapter } from 'app/models/chapter';
import { Index } from 'app/models';
import { Tab } from 'app/models/tab';
import { State } from 'app/models/state';

@Injectable()
export class StateService {

  public doPrintFrame: EventEmitter<Object> = new EventEmitter<Object>();

  public selectedChapterChanged: EventEmitter<SelectedChapterChangedEventArgs> = new EventEmitter<SelectedChapterChangedEventArgs>();
  public selectedIndexChanged: EventEmitter<SelectedIndexChangedEventArgs> = new EventEmitter<SelectedIndexChangedEventArgs>();
  public selectedTabChanged: EventEmitter<SelectedTabChangedEventArgs> = new EventEmitter<SelectedTabChangedEventArgs>();

  public indexFilter: string;
  public searchFilter: string;

  private _selectedTab: Tab;
  private _selectedChapter: Chapter;
  private _selectedIndex: Index;

  constructor(
    private _title: Title) { }

  public getSelectedChapter(): Chapter {
    return this._selectedChapter;
  }

  public getSelectedIndex(): Index {
    return this._selectedIndex;
  }

  public getSelectedTab(): Tab {
    return this._selectedTab ? this._selectedTab : Tab.Content;
  }

  public selectChapter(chapter: Chapter, componentType: any = null, pushState: boolean = true): void {
    if (chapter && this._selectedChapter && chapter.id === this._selectedChapter.id) {
      return;
    }

    if (chapter === null && this._selectedChapter === null) {
      return;
    }

    if (chapter === undefined && this._selectedChapter === undefined) {
      return;
    }

    this._selectedChapter = chapter;

    if (pushState) {
      this.pushState();
    }

    this.selectedChapterChanged.emit(new SelectedChapterChangedEventArgs(this._selectedChapter, componentType));
  }

  public selectIndex(index: Index, componentType: any = null, pushState: boolean = true): void {
    const indexLabel: string = index ? index.label : null;
    const selectedLabel: string = this._selectedIndex ? this._selectedIndex.label : null;

    if (indexLabel !== selectedLabel) {
      this._selectedIndex = index;

      if (pushState) {
        this.pushState();
      }

      this.selectedIndexChanged.emit(new SelectedIndexChangedEventArgs(this._selectedIndex, componentType));
    }
  }

  public selectTab(tab: Tab, componentType: any = null, pushState: boolean = true): void {
    if (tab !== this._selectedTab) {
      this._selectedTab = tab;

      if (!this._selectedTab) {
        this._selectedTab = Tab.Content;
      }

      if (pushState) {
        this.pushState();
      }

      this.selectedTabChanged.emit(new SelectedTabChangedEventArgs(this._selectedTab, componentType));
    }
  }

  private pushState(): void {
    if (window.history) {
      const state: State = new State();
      state.tab = this._selectedTab;
      state.chapter = this._selectedChapter;
      state.index = this._selectedIndex;
      window.history.pushState(state, this._title.getTitle());
    }
  }

  public loadState(state: State): void {
    if (state) {
      this.selectTab(state.tab, null, false);
      this.selectIndex(state.index, null, false);
      this.selectChapter(state.chapter, null, false);
    }
  }

  public printFrame(): void {
    this.doPrintFrame.emit();
  }
}
