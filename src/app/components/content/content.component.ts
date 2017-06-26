import { Component, ChangeDetectorRef, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';

import { ISubscription } from 'rxjs/Subscription';

import { TreeComponent, TreeNode } from '../../controls/tree';
import { SelectedChapterChangedEventArgs, SelectedTabChangedEventArgs } from '../../eventargs';
import { ChapterService, StateService } from '../../services';
import { Chapter, Tab } from '../../models';

@Component({
  selector: 'hlp-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss']
})
export class ContentComponent implements OnInit, OnDestroy {

  @Input() style: any;
  @Input() styleClass: any;

  @ViewChild('treeComp') treeComp: TreeComponent;

  public initialized: boolean;
  public chapterNodes: Array<TreeNode>;

  private _chapterNodesSub: ISubscription;
  private _selectedChapterSub: ISubscription;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _chapterService: ChapterService,
    private _stateService: StateService) { }

  public ngOnInit(): void {
    this._chapterNodesSub = this._chapterService.getChapters()
      .map(chapters => this.buildChapterTree(chapters))
      .subscribe(nodes => {
        this.chapterNodes = nodes;
        this.initialized = true;
        this.setChapter(this._stateService.getSelectedChapter());
      });

    this._selectedChapterSub = this._stateService.selectedChapterChanged
      .subscribe((args: SelectedChapterChangedEventArgs) => {
        this.setChapter(args.chapter, args.type);
      });

    this._changeDetectorRef.detectChanges();
  }

  public ngOnDestroy(): void {
    this._chapterNodesSub.unsubscribe();
    this._selectedChapterSub.unsubscribe();
  }

  public checkIsNodeSelected(selected: TreeNode, node: TreeNode): boolean {
    return selected && selected.data && selected.data.id && node && node.data && node.data.id && selected.data.id === node.data.id;
  }

  public onNodeSelected(node: TreeNode): void {
    this._stateService.selectChapter(node ? node.data : null, (<any>this.constructor).name);
  }

  private buildChapterTree(chapters: Array<Chapter>): Array<TreeNode> {
    if (!chapters || !chapters.length) {
      return null;
    }

    let nodes: Array<TreeNode> = new Array<TreeNode>();

    for (let i = 0; i < chapters.length; i++) {
      let chapter: Chapter = chapters[i];
      let treeNode: TreeNode = new TreeNode();
      treeNode.id = chapter.id;
      treeNode.label = chapter.label;
      treeNode.data = chapter;
      treeNode.children = this.buildChapterTree(chapter.children);
      nodes.push(treeNode);
    }

    return nodes;
  }

  private setChapter(chapter: Chapter, type: any = null): void {
    if (!this.treeComp && this.chapterNodes) {
      this._changeDetectorRef.detectChanges();
    }

    if (this.treeComp) {
      this.treeComp.selectNodeById(chapter ? chapter.id : null);

      if (type !== (<any>this.constructor).name) {
        this.scrollSelectedIntoView();
      } else {
        this.treeComp.expandSelectedNode();
      }
    }
  }

  private scrollSelectedIntoView(): void {
    if (this.treeComp) {
      this.treeComp.collapseAll();
      this.treeComp.expandToSelectedNode();
      this.treeComp.expandSelectedNode();
      this.treeComp.scrollSelectedIntoView();
    }
  }
}
