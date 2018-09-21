import { Component, ChangeDetectorRef, EventEmitter, Input, OnInit, OnDestroy, Output, QueryList, ViewChildren } from '@angular/core';
import { Subscription } from 'rxjs';

import { ListService } from 'app/controls/list/list.service';
import { ListItemComponent } from 'app/controls/list/listitem.component';
import { ListItem } from 'app/controls/list/listitem';

@Component({
  selector: 'hlp-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  providers: [ListService]
})
export class ListComponent implements OnInit, OnDestroy {

  @Input()
  public items: Array<ListItem>;

  @Input()
  public style: any;

  @Input()
  public styleClass: any;

  @Input()
  public checkCanSelectItem: (item: ListItem) => boolean;

  @Input()
  public checkIsItemSelected: (selectedItem: ListItem, item: ListItem) => boolean;

  @Output()
  public onItemSelected: EventEmitter<ListItem> = new EventEmitter<ListItem>();

  @ViewChildren(ListItemComponent)
  public itemComps: QueryList<ListItemComponent>;

  private _onItemSelectedSub: Subscription;

  constructor(
    private listService: ListService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  public ngOnInit(): void {
    this.listService.Initialize(this.checkCanSelectItem, this.checkIsItemSelected);
    this._onItemSelectedSub = this.listService.onItemSelected.subscribe((item: ListItem) => this.onItemSelected.emit(item));
  }

  public ngOnDestroy(): void {
    if (this._onItemSelectedSub) {
      this._onItemSelectedSub.unsubscribe();
    }
  }

  public selectItemById(id: string) {
    this.listService.selectItem(this.findItemRecursive(this.items, (item: ListItem) => id === item.id), false);
  }

  public getSelectedItem(): ListItem {
    return this.listService.getSelectedItem();
  }

  private findItemRecursive(items: Array<ListItem>, exp: (listItem: ListItem) => boolean): ListItem {
    if (items && items.length && exp) {
      for (let i = 0; i < items.length; i++) {
        const item: ListItem = items[i];
        if (exp(item)) {
          return item;
        } else if (item.children && item.children.length) {
          const child: ListItem = this.findItemRecursive(item.children, exp);
          if (child) {
            return child;
          }
        }
      }
    }

    return null;
  }

  public scrollSelectedIntoView(): void {
    this._changeDetectorRef.detectChanges();

    if (this.itemComps && this.itemComps.length) {
      this.itemComps.some((itemComp: ListItemComponent) => {
        return itemComp.scrollSelectedIntoView();
      });
    }
  }
}
