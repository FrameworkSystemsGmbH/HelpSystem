import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  forwardRef,
  Inject,
  Input,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';

import { TreeComponent } from './tree.component';
import { TreeNode } from './treenode';

@Component({
  selector: 'hlp-treenode',
  templateUrl: './treenode.component.html',
  styleUrls: ['./treenode.component.scss']
})
export class TreeNodeComponent {

  private static ICON_CLASS: string = 'hlp-treenode-icon fa fa-fw';

  @Input()
  public node: TreeNode;

  @ViewChild('nodeRef')
  public nodeRef: ElementRef;

  @ViewChildren(TreeNodeComponent)
  public nodeComps: QueryList<TreeNodeComponent>;

  public expanded: boolean = false;

  constructor(
    @Inject(forwardRef(() => TreeComponent)) private _tree: TreeComponent,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  public getIcon(): string {
    let icon;

    if (this.isLeaf()) {
      icon = this.node.iconLeaf ? this.node.iconLeaf : this._tree.iconLeaf;
    } else {
      if (this.expanded) {
        icon = this.node.iconExpanded ? this.node.iconExpanded : this._tree.iconExpanded;
      } else {
        icon = this.node.iconCollapsed ? this.node.iconCollapsed : this._tree.iconCollapsed;
      }
    }

    if (icon) {
      return TreeNodeComponent.ICON_CLASS + ' ' + icon;
    }
  }

  public onClick(event: any): void {
    if (this.isLeaf() || (event.target.className && event.target.className.indexOf('hlp-treenode-icon') === -1)) {
      this.select();
    }
  }

  public select(): void {
    if (!this.isSelected()) {
      this._tree.selectNodeInternal(this.node);
    }
  }

  public toggle(event: any = null): void {
    this.expanded = !this.expanded;
  }

  public isLeaf(): boolean {
    return !this.node.children || !this.node.children.length;
  }

  public isSelected(): boolean {
    return this._tree.isNodeSelected(this.node);
  }

  public collapseAll(): void {
    if (this.nodeComps && this.nodeComps.length) {
      this.nodeComps.forEach((nodeComp: TreeNodeComponent) => {
        nodeComp.collapseAll();
      });
    }

    if (this.expanded) {
      this.toggle();
    }
  }

  public expandToSelectedNode(idPath: Array<string>): void {
    if (this.nodeComps && this.nodeComps.length && idPath && idPath.length) {
      const idToExpand: string = idPath[0];
      const nodeCompsArr: Array<TreeNodeComponent> = this.nodeComps.toArray();
      for (let i = 0; i < nodeCompsArr.length; i++) {
        const nodeComp: TreeNodeComponent = nodeCompsArr[i];
        if (nodeComp.node.id === idToExpand) {
          if (!nodeComp.expanded) {
            nodeComp.toggle();
          }

          this._changeDetectorRef.detach();
          this._changeDetectorRef.detectChanges();
          this._changeDetectorRef.reattach();

          if (idPath.length > 1) {
            const remainingIds = idPath.splice(1);
            nodeComp.expandToSelectedNode(remainingIds);
          }

          return;
        }
      }
    }
  }

  public expandSelectedNode(): boolean {
    if (this.isSelected()) {
      if (!this.expanded) {
        this.toggle();
      }
      return true;
    }

    if (this.nodeComps && this.nodeComps.length) {
      return this.nodeComps.some((nodeComp: TreeNodeComponent) => {
        return nodeComp.expandSelectedNode();
      });
    }
  }

  public scrollSelectedIntoView(): boolean {
    if (this.isSelected()) {
      this.nodeRef.nativeElement.scrollIntoView(true);
      return true;
    }

    if (this.nodeComps && this.nodeComps.length) {
      return this.nodeComps.some((nodeComp: TreeNodeComponent) => {
        return nodeComp.scrollSelectedIntoView();
      });
    }
  }
}
