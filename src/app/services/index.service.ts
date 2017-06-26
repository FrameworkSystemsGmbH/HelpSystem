import { EventEmitter, Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Index } from '../models';

import { Observable } from 'rxjs/Observable';
import { ISubscription } from 'rxjs/Subscription';

@Injectable()
export class IndexService {

  private _indices: Array<Index>;
  private _indicesStream: Observable<Array<Index>>;
  private _indicesStreamSub: ISubscription;

  public constructor(private _http: Http) { }

  public getIndices(term: string): Observable<Array<Index>> {
    if (!this._indicesStream) {
      this._indicesStream = this._http.get('files/json/index.json')
        .map(res => <Array<Index>>res.json())
        .share();

      this._indicesStreamSub = this._indicesStream.subscribe((indices: Array<Index>) => {
        this._indices = indices;
      });
    }

    if (!term || !term.trim()) {
      return this._indices ? Observable.of(this._indices) : this._indicesStream;
    }

    let termLower: string = term.trim().toLowerCase();

    return this._indices
      ? Observable.of(this.filterIndices(this._indices, termLower))
      : this._indicesStream.map((indices: Array<Index>) => this.filterIndices(indices, termLower));
  }

  private filterIndices(indices: Array<Index>, term: string): Array<Index> {
    let filteredIndices: Array<Index> = new Array<Index>();

    if (indices && indices.length) {
      indices.forEach(index => {
        let filteredChildren: Array<Index>;

        if (index.children && index.children.length) {
          filteredChildren = this.filterIndices(index.children, term);
        }

        if ((filteredChildren && filteredChildren.length) || ((index.label.toLowerCase().indexOf(term) >= 0) && index.chapters && index.chapters.length)) {
          let clone: Index = this.cloneIndexWithoutChildren(index);
          clone.children = filteredChildren;
          filteredIndices.push(clone);
        }
      });
    }

    return filteredIndices.length ? filteredIndices : null;
  }

  private cloneIndexWithoutChildren(index: Index): Index {
    let clone: Index = new Index();
    clone.label = index.label;
    clone.chapters = index.chapters;
    return clone;
  }
}
