import { Subject } from 'rxjs';

import { ListItem } from 'app/controls/list/listitem';

export class ListService {

  private _selectedItem: ListItem;

  private _checkCanSelectItem: (item: ListItem) => boolean;
  private _checkIsItemSelected: (selected: ListItem, item: ListItem) => boolean;

  public onItemSelected: Subject<ListItem>;

  public Initialize(
    checkCanSelectItem: (item: ListItem) => boolean,
    checkIsItemSelected: (selected: ListItem, item: ListItem) => boolean
  ): void {
    this._checkCanSelectItem = checkCanSelectItem;
    this._checkIsItemSelected = checkIsItemSelected;
    this.onItemSelected = new Subject<ListItem>();
  }

  public getSelectedItem(): ListItem {
    return this._selectedItem;
  }

  public selectItem(item: ListItem, fireEvent: boolean = true) {
    if (item != null) {
      this._selectedItem = item;

      if (fireEvent) {
        this.onItemSelected.next(this._selectedItem);
      }
    }
  }

  public checkCanSelectItem(item: ListItem): boolean {
    return this._checkCanSelectItem && this._checkCanSelectItem(item);
  }

  public checkIsItemSelected(item: ListItem): boolean {
    return this._checkIsItemSelected && this._checkIsItemSelected(this._selectedItem, item);
  }
}
