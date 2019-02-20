import { Subject } from 'rxjs';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

import { TreeNode } from 'app/controls/tree/treenode';

export class TreeService {

  private _selectedNode: TreeNode;

  private _iconLeaf: IconDefinition;
  private _iconExpanded: IconDefinition;
  private _iconCollapsed: IconDefinition;

  private _checkIsNodeSelected: (selected: TreeNode, node: TreeNode) => boolean;

  public onNodeSelected: Subject<TreeNode>;

  public Initialize(
    iconLeaf: IconDefinition,
    iconExpanded: IconDefinition,
    iconCollapsed: IconDefinition,
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

  public getIconLeaf(): IconDefinition {
    return this._iconLeaf;
  }

  public getIconExpanded(): IconDefinition {
    return this._iconExpanded;
  }

  public getIconCollapsed(): IconDefinition {
    return this._iconCollapsed;
  }

  public checkIsNodeSelected(node: TreeNode): boolean {
    return this._checkIsNodeSelected && this._checkIsNodeSelected(this._selectedNode, node);
  }
}
