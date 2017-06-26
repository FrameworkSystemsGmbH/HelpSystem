import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChildren
} from '@angular/core';

import { TreeNodeComponent } from './treenode.component';
import { TreeNode } from './treenode.model';

@Component({
  selector: 'hlp-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss']
})
export class TreeComponent {

  @Input() nodes: Array<TreeNode>;
  @Input() iconLeaf: string;
  @Input() iconExpanded: string;
  @Input() iconCollapsed: string;
  @Input() style: any;
  @Input() styleClass: any;
  @Input() checkIsNodeSelected: (selected: TreeNode, node: TreeNode) => boolean;

  @Output() onNodeSelected: EventEmitter<TreeNode> = new EventEmitter<TreeNode>();

  @ViewChildren(TreeNodeComponent) nodeComps: QueryList<TreeNodeComponent>;

  private _selectedNode: TreeNode;

  constructor(private _changeDetectorRef: ChangeDetectorRef) { }

  public getSelectedNode(): TreeNode {
    return this._selectedNode;
  }

  public selectNodeInternal(node: TreeNode): void {
    this.selectNode(node);
    this.onNodeSelected.emit(node);
  }

  public selectNode(node: TreeNode): void {
    this._selectedNode = node;
  }

  public selectNodeById(id: string) {
    this.selectNode(this.findNodeByIdRecursive(this.nodes, id));
  }

  public isNodeSelected(node: TreeNode): boolean {
    return this.checkIsNodeSelected && this.checkIsNodeSelected(this._selectedNode, node);
  }

  public collapseAll(): void {
    if (this.nodeComps && this.nodeComps.length) {
      this.nodeComps.forEach((nodeComp: TreeNodeComponent) => {
        return nodeComp.collapseAll();
      });
    }
  }

  public expandToSelectedNode(): void {
    let idPath: Array<string> = this.getNodeIdPath(this._selectedNode);
    if (this.nodeComps && this.nodeComps.length && idPath && idPath.length) {
      let idToExpand: string = idPath[0];
      let nodeCompsArr: Array<TreeNodeComponent> = this.nodeComps.toArray();
      for (let i = 0; i < nodeCompsArr.length; i++) {
        let nodeComp: TreeNodeComponent = nodeCompsArr[i];
        if (nodeComp.node.id === idToExpand) {
          if (nodeComp.isLeaf()) {
            return;
          }

          if (!nodeComp.expanded) {
            nodeComp.toggle();
          }

          this._changeDetectorRef.detach();
          this._changeDetectorRef.detectChanges();
          this._changeDetectorRef.reattach();

          if (idPath.length > 1) {
            let remainingIds = idPath.splice(1);
            nodeComp.expandToSelectedNode(remainingIds);
          }

          return;
        }
      }
    }
  }

  public expandSelectedNode(): void {
    if (this.nodeComps && this.nodeComps.length) {
      this.nodeComps.some((node: TreeNodeComponent) => {
        return node.expandSelectedNode();
      });
    }
  }

  public scrollSelectedIntoView(): void {
    if (this.nodeComps && this.nodeComps.length) {
      this.nodeComps.some((nodeComp: TreeNodeComponent) => {
        return nodeComp.scrollSelectedIntoView();
      });
    }
  }

  private findNodeByIdRecursive(nodes: Array<TreeNode>, id: string): TreeNode {
    if (nodes && nodes.length && id) {
      for (let i = 0; i < nodes.length; i++) {
        let node: TreeNode = nodes[i];
        if (node.id === id) {
          return node;
        } else if (node.children && node.children.length) {
          let child: TreeNode = this.findNodeByIdRecursive(node.children, id);
          if (child) {
            return child;
          }
        }
      }
    }

    return null;
  }

  private getNodeIdPath(target: TreeNode): Array<string> {
    if (!target) {
      return null;
    }

    let result: Array<string> = new Array<string>();

    return this.getNodeIdPathRecursive(this.nodes, target, result) ? result.reverse() : null;
  }

  private getNodeIdPathRecursive(nodes: Array<TreeNode>, target: TreeNode, result: Array<string>): boolean {
    if (nodes && nodes.length && target) {
      for (let i = 0; i < nodes.length; i++) {
        let node: TreeNode = nodes[i];
        if (node.id === target.id) {
          result.push(node.id);
          return true;
        } else if (node.children && node.children.length) {
          if (this.getNodeIdPathRecursive(node.children, target, result)) {
            result.push(node.id);
            return true;
          }
        }
      }
    }

    return false;
  }
}
