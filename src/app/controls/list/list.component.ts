import { Component, ChangeDetectorRef, EventEmitter, Input, Output, QueryList, ViewChildren } from '@angular/core';

import { ListItemComponent } from './listitem.component';
import { ListItem } from './listitem.model';

@Component({
  selector: 'hlp-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent {

  @Input() items: Array<ListItem>;
  @Input() style: any;
  @Input() styleClass: any;
  @Input() checkIsItemSelected: (selected: ListItem, item: ListItem) => boolean;
  @Input() checkCanSelectItem: (item: ListItem) => boolean;
  @Input() showChildren: boolean = true;

  @Output() onItemSelected: EventEmitter<ListItem> = new EventEmitter<ListItem>();

  @ViewChildren(ListItemComponent) itemComps: QueryList<ListItemComponent>;

  private _selectedItem: ListItem;

  constructor(private _changeDetectorRef: ChangeDetectorRef) { }

  public getSelectedItem(): ListItem {
    return this._selectedItem;
  }

  public selectItemInternal(item: ListItem): void {
    this.selectItem(item);
    this.onItemSelected.emit(item);
  }

  public selectItem(item: ListItem): void {
    this._selectedItem = item;
  }

  public selectItemById(id: string) {
    this.selectItem(this.findItemByIdRecursive(this.items, id));
  }

  public isItemSelected(item: ListItem): boolean {
    return this.checkIsItemSelected && this.checkIsItemSelected(this._selectedItem, item);
  }

  public canSelectItem(item: ListItem): boolean {
    return this.checkCanSelectItem && this.checkCanSelectItem(item);
  }

  public scrollSelectedIntoView(): void {
    this._changeDetectorRef.detectChanges();

    if (this.itemComps && this.itemComps.length) {
      this.itemComps.some((itemComp: ListItemComponent) => {
        return itemComp.scrollSelectedIntoView();
      });
    }
  }

  private findItemByIdRecursive(items: Array<ListItem>, id: string): ListItem {
    if (items && items.length && id) {
      for (let i = 0; i < items.length; i++) {
        let item: ListItem = items[i];
        if (item.id === id) {
          return item;
        } else if (item.children && item.children.length) {
          let child: ListItem = this.findItemByIdRecursive(item.children, id);
          if (child) {
            return child;
          }
        }
      }
    }

    return null;
  }
}
