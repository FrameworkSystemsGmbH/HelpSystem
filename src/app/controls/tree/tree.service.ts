import { Subject } from 'rxjs';

import { TreeNode } from 'app/controls/tree/treenode';

export class TreeService {

  private _selectedNode: TreeNode;

  private _iconLeaf: string;
  private _iconExpanded: string;
  private _iconCollapsed: string;

  private _checkIsNodeSelected: (selected: TreeNode, node: TreeNode) => boolean;

  public onNodeSelected: Subject<TreeNode>;

  public Initialize(
    iconLeaf: string,
    iconExpanded: string,
    iconCollapsed: string,
    checkIsNodeSelected: (selected: TreeNode, node: TreeNode) => boolean
  ): void {
    this._iconLeaf = iconLeaf;
    this._iconExpanded = iconExpanded;
    this._iconCollapsed = iconCollapsed;
    this._checkIsNodeSelected = checkIsNodeSelected;
    this.onNodeSelected = new Subject<TreeNode>();
  }

  public getSelectedNode(): TreeNode {
    return this._selectedNode;
  }

  public selectNode(node: TreeNode, fireEvent: boolean = true) {
    if (node != null) {
      this._selectedNode = node;

      if (fireEvent) {
        this.onNodeSelected.next(this._selectedNode);
      }
    }
  }

  public getIconLeaf(): string {
    return this._iconLeaf;
  }

  public getIconExpanded(): string {
    return this._iconExpanded;
  }

  public getIconCollapsed(): string {
    return this._iconCollapsed;
  }

  public checkIsNodeSelected(node: TreeNode): boolean {
    return this._checkIsNodeSelected && this._checkIsNodeSelected(this._selectedNode, node);
  }
}
