import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export class TreeNode {

  public id: string;
  public label: string;
  public data: any;
  public children: Array<TreeNode>;
  public iconLeaf: IconDefinition;
  public iconExpanded: IconDefinition;
  public iconCollapsed: IconDefinition;

}
