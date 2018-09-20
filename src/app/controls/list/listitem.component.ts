import { Component, ElementRef, forwardRef, Inject, Input, QueryList, ViewChild, ViewChildren } from '@angular/core';

import { ListComponent } from 'app/controls/list/list.component';
import { ListItem } from 'app/controls/list/listitem';

@Component({
  selector: 'hlp-listitem',
  templateUrl: './listitem.component.html',
  styleUrls: ['./listitem.component.scss']
})
export class ListItemComponent {

  @Input()
  public item: ListItem;

  @ViewChild('itemRef')
  public itemRef: ElementRef;

  @ViewChildren(ListItemComponent)
  public itemComps: QueryList<ListItemComponent>;

  constructor(@Inject(forwardRef(() => ListComponent)) private _list: ListComponent) { }

  public onClick(event: any): void {
    this.select();
  }

  public select(): void {
    if (!this.isSelected() && this.canSelect()) {
      this._list.selectItemInternal(this.item);
    }
  }

  public isSelected(): boolean {
    return this._list.isItemSelected(this.item);
  }

  public canSelect(): boolean {
    return this._list.canSelectItem(this.item);
  }

  public showChildren(): boolean {
    return this._list.showChildren;
  }

  public scrollSelectedIntoView(): boolean {
    if (this.isSelected()) {
      this.itemRef.nativeElement.scrollIntoView(true);
      return true;
    }

    if (this.itemComps && this.itemComps.length) {
      return this.itemComps.some((itemComp: ListItemComponent) => {
        return itemComp.scrollSelectedIntoView();
      });
    }
  }
}
