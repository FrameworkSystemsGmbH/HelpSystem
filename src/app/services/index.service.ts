import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable, of as obsOf } from 'rxjs';
import { map, share } from 'rxjs/operators';

import { Index } from 'app/models';

@Injectable()
export class IndexService {

  private _indices: Array<Index>;
  private _indicesStream: Observable<Array<Index>>;

  public constructor(private _http: Http) { }

  public getIndices(term: string): Observable<Array<Index>> {
    if (!this._indicesStream) {
      this._indicesStream = this._http.get('files/json/index.json').pipe(
        map(res => res.json() as Array<Index>),
        share()
      );

      this._indicesStream.subscribe((indices: Array<Index>) => {
        this._indices = indices;
      });
    }

    if (!term || !term.trim()) {
      return this._indices ? obsOf(this._indices) : this._indicesStream;
    }

    const termLower: string = term.trim().toLowerCase();

    return this._indices
      ? obsOf(this.filterIndices(this._indices, termLower))
      : this._indicesStream.pipe(map((indices: Array<Index>) => this.filterIndices(indices, termLower)));
  }

  private filterIndices(indices: Array<Index>, term: string): Array<Index> {
    const filteredIndices: Array<Index> = new Array<Index>();

    if (indices && indices.length) {
      indices.forEach(index => {
        let filteredChildren: Array<Index>;

        if (index.children && index.children.length) {
          filteredChildren = this.filterIndices(index.children, term);
        }

        if ((filteredChildren && filteredChildren.length) || ((index.label.toLowerCase().indexOf(term) >= 0) && index.chapters && index.chapters.length)) {
          const clone: Index = this.cloneIndexWithoutChildren(index);
          clone.children = filteredChildren;
          filteredIndices.push(clone);
        }
      });
    }

    return filteredIndices.length ? filteredIndices : null;
  }

  private cloneIndexWithoutChildren(index: Index): Index {
    const clone: Index = new Index();
    clone.label = index.label;
    clone.chapters = index.chapters;
    return clone;
  }
}
