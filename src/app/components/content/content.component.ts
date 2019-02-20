import { Component, ChangeDetectorRef, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCog, faBook, faFolder, faFolderOpen } from '@fortawesome/free-solid-svg-icons';

import { TreeComponent } from 'app/controls/tree/tree.component';
import { TreeNode } from 'app/controls/tree/treenode';
import { ChapterService } from 'app/services/chapter.service';
import { StateService } from 'app/services/state.service';
import { SelectedChapterChangedEventArgs } from 'app/eventargs/selectedchapterchanged.eventargs';
import { Chapter } from 'app/models/chapter';

@Component({
  selector: 'hlp-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss']
})
export class ContentComponent implements OnInit, OnDestroy {

  @Input() public style: any;
  @Input() public styleClass: any;

  @ViewChild('treeComp') public treeComp: TreeComponent;

  public iconCog: IconDefinition = faCog;
  public iconLeaf: IconDefinition = faBook;
  public iconFolder: IconDefinition = faFolder;
  public iconFolderOpen: IconDefinition = faFolderOpen;

  public initialized: boolean;
  public chapterNodes: Array<TreeNode>;

  private _chapterNodesSub: Subscription;
  private _selectedChapterSub: Subscription;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _chapterService: ChapterService,
    private _stateService: StateService) { }

  public ngOnInit(): void {
    this._chapterNodesSub = this._chapterService.getChapters().pipe(
      map(chapters => this.buildChapterTree(chapters))
    ).subscribe(nodes => {
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
    this._stateService.selectChapter(node ? node.data : null, (this.constructor as any).name);
  }

  private buildChapterTree(chapters: Array<Chapter>): Array<TreeNode> {
    if (!chapters || !chapters.length) {
      return null;
    }

    const nodes: Array<TreeNode> = new Array<TreeNode>();

    for (let i = 0; i < chapters.length; i++) {
      const chapter: Chapter = chapters[i];
      const treeNode: TreeNode = new TreeNode();
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

      if (type !== (this.constructor as any).name) {
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
