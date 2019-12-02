import { Component, ElementRef, Input, QueryList, ViewChild, ViewChildren } from '@angular/core';

import { ListService } from 'app/controls/list/list.service';
import { ListItem } from 'app/controls/list/listitem';

@Component({
  selector: 'hlp-listitem',
  templateUrl: './listitem.component.html',
  styleUrls: ['./listitem.component.scss']
})
export class ListItemComponent {

  @Input()
  public item: ListItem;

  @ViewChild('itemRef', { static: false })
  public itemRef: ElementRef;

  @ViewChildren(ListItemComponent)
  public itemComps: QueryList<ListItemComponent>;

  constructor(private listService: ListService) { }

  public canSelect(): boolean {
    return this.listService.checkCanSelectItem(this.item);
  }

  public isSelected(): boolean {
    return this.listService.checkIsItemSelected(this.item);
  }

  public select(): void {
    if (!this.isSelected() && this.canSelect()) {
      this.listService.selectItem(this.item);
    }
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

    return false;
  }
}
