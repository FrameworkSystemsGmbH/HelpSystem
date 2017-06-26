import { Index } from '../models';

export class SelectedIndexChangedEventArgs {

  private _index: Index;
  private _type: any;

  constructor(index: Index, type: any) {
    this._index = index;
    this._type = type;
  }

  public get index(): Index {
    return this._index;
  }

  public get type(): any {
    return this._type;
  }
}
