import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { StateService } from 'app/services/state.service';
import { SelectedTabChangedEventArgs } from 'app/eventargs/selectedtabchanged.eventargs';
import { Tab } from 'app/models/tab';

@Component({
  selector: 'hlp-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit, OnDestroy {

  @Input()
  public style: any;

  @Input()
  public styleClass: any;

  private _selectedTab: Tab;
  private _selectedTabSub: Subscription;

  constructor(private _stateService: StateService) { }

  public ngOnInit(): void {
    this._selectedTab = this._stateService.getSelectedTab();
    this._selectedTabSub = this._stateService.selectedTabChanged.subscribe((args: SelectedTabChangedEventArgs) => {
      this._selectedTab = args.tab;
    });
  }

  public ngOnDestroy(): void {
    this._selectedTabSub.unsubscribe();
  }

  public isContentSelected(): boolean {
    return this._selectedTab === Tab.Content;
  }

  public isIndexSelected(): boolean {
    return this._selectedTab === Tab.Index;
  }

  public isSearchSelected(): boolean {
    return this._selectedTab === Tab.Search;
  }

  public showContent(event: any): void {
    this._stateService.selectTab(Tab.Content);
  }

  public showIndex(event: any): void {
    this._stateService.selectTab(Tab.Index);
  }

  public showSearch(event: any): void {
    this._stateService.selectTab(Tab.Search);
  }

  public print(event: any): void {
    this._stateService.printFrame();
  }
}
