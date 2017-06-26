import { Tab } from '../models';

export class SelectedTabChangedEventArgs {

  private _tab: Tab;
  private _type: any;

  constructor(tab: Tab, type: any) {
    this._tab = tab;
    this._type = type;
  }

  public get tab(): Tab {
    return this._tab;
  }

  public get type(): any {
    return this._type;
  }
}
