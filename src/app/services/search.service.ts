import { EventEmitter, Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Search } from '../models';

import { Observable } from 'rxjs/Observable';
import { ISubscription } from 'rxjs/Subscription';

@Injectable()
export class SearchService {

  private _search: Search;
  private _searchStream: Observable<Search>;
  private _searchStreamSub: ISubscription;

  public constructor(private _http: Http) { }

  public search(term: string): Observable<Array<string>> {
    if (!this._searchStream) {
      this._searchStream = this._http.get('files/json/search.json')
        .map(res => <Search>res.json())
        .share();

      this._searchStreamSub = this._searchStream.subscribe((search: Search) => {
        this._search = search;
      });
    }

    if (!term || !term.trim()) {
      return Observable.of(new Array<string>());
    }

    let terms: Array<string> = term.trim()
      .toLowerCase()
      .split(' ')
      .filter(t => t && t.trim());

    return this._search
      ? Observable.of(this.filterSearch(this._search, terms))
      : this._searchStream.map((search: Search) => this.filterSearch(search, terms));
  }


  private filterSearch(search: Search, terms: Array<string>): Array<string> {
    let chapterIdsForTerms: Array<Array<string>> = new Array<Array<string>>();

    for (let i = 0; i < terms.length; i++) {
      let term: string = terms[i];
      let wordIndices: Array<number> = new Array<number>();

      this._search.words.forEach((word, index) => {
        if (word.indexOf(term) >= 0) {
          wordIndices.push(index);
        }
      });

      if (!wordIndices.length) {
        return null;
      }

      let chapterIds: Array<string> = new Array<string>();

      wordIndices.forEach(index => {
        this._search.chapters[index].forEach(id => {
          if (chapterIds.indexOf(id) < 0) {
            chapterIds.push(id);
          }
        });
      });

      if (!chapterIds.length) {
        return null;
      }

      chapterIdsForTerms.push(chapterIds);
    }

    if (!chapterIdsForTerms.length) {
      return null;
    } else if (chapterIdsForTerms.length === 1) {
      return chapterIdsForTerms[0];
    }

    let chapterIds: Array<string> = chapterIdsForTerms[0];

    for (let i = 1; i < chapterIdsForTerms.length; i++) {
      chapterIds = this.intersectArrays(chapterIds, chapterIdsForTerms[i]);

      if (!chapterIds.length) {
        return null;
      }
    }

    return chapterIds;
  }

  private intersectArrays(x: Array<string>, y: Array<string>): Array<string> {
    let result: Array<string> = new Array<string>();

    for (let i = 0; i < x.length; i++) {
      for (let j = 0; j < y.length; j++) {
        if (x[i] === y[j]) {
          result.push(x[i]);
          break;
        }
      }
    }

    return result;
  }
}
