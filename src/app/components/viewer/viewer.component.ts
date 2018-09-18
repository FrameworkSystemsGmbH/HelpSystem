import { Component, ElementRef, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';

import { StateService } from 'app/services/state.service';
import { SelectedChapterChangedEventArgs } from 'app/eventargs/selectedchapterchanged.eventargs';
import { Chapter } from 'app/models/chapter';

@Component({
  selector: 'hlp-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss']
})
export class ViewerComponent implements OnInit, OnDestroy {

  @ViewChild('frame')
  public frame: ElementRef;

  @Input()
  public style: any;

  @Input()
  public styleClass: any;

  private _selectedChapterSub: Subscription;
  private _doPrintFrameSub: Subscription;

  constructor(private _stateService: StateService) { }

  public ngOnInit(): void {
    this._selectedChapterSub = this._stateService.selectedChapterChanged.subscribe((args: SelectedChapterChangedEventArgs) => {
      this.setChapter(args.chapter);
    });

    this._doPrintFrameSub = this._stateService.doPrintFrame
      .subscribe(() => {
        this.print();
      });
  }

  public ngOnDestroy(): void {
    this._selectedChapterSub.unsubscribe();
    this._doPrintFrameSub.unsubscribe();
  }

  public setStartPage(): void {
    this.setChapter(undefined);
  }

  private setChapter(chapter: Chapter): void {
    if (chapter) {
      this.setFile(chapter.file);
    } else if (chapter === undefined) {
      this.setFile('index.html');
    } else {
      this.setFile('notfound.html');
    }
  }

  private getFrame(): any {
    const nativeFrame: any = this.frame.nativeElement;
    return nativeFrame.contentWindow || nativeFrame.contentDocument.document || nativeFrame.contentDocument;
  }

  private setFile(file: string): void {
    this.getFrame().location.replace(window.location.pathname + 'files/html/' + file);
  }

  public print(): void {
    this.printFrameExec(this.getFrame());
  }

  private printFrameExec(frame: any): void {
    if (!frame) {
      return;
    }

    const ua: string = navigator.userAgent;

    const ie: boolean = ua.indexOf('MSIE') > 0 || ua.indexOf('Edge') > 0 || ua.indexOf('Trident') > 0 || ua.indexOf('rv:11') > 0;

    if (ie && frame.document.execCommand) {
      try {
        frame.document.execCommand('print', false, null);
      } catch (error) {
        this.printFrame(frame);
      }
    } else {
      this.printFrame(frame);
    }
  }

  private printFrame(frame: any): void {
    if (!frame) {
      return;
    }

    frame.focus();
    frame.print();
  }
}
