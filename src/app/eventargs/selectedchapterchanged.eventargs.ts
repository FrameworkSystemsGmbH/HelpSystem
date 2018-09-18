import { Chapter } from 'app/models/chapter';

export class SelectedChapterChangedEventArgs {

  private _chapter: Chapter;
  private _type: any;

  constructor(chapter: Chapter, type: any) {
    this._chapter = chapter;
    this._type = type;
  }

  public get chapter(): Chapter {
    return this._chapter;
  }

  public get type(): any {
    return this._type;
  }
}
