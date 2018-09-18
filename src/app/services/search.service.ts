import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable, of as obsOf } from 'rxjs';
import { map, share } from 'rxjs/operators';

import { Search } from 'app/models/search';

@Injectable()
export class SearchService {

  private _search: Search;
  private _searchStream: Observable<Search>;

  public constructor(private _http: Http) { }

  public search(term: string): Observable<Array<string>> {
    if (!this._searchStream) {
      this._searchStream = this._http.get('files/json/search.json').pipe(
        map(res => res.json() as Search),
        share()
      );

      this._searchStream.subscribe((search: Search) => {
        this._search = search;
      });
    }

    if (!term || !term.trim()) {
      return obsOf(new Array<string>());
    }

    const terms: Array<string> = term.trim()
      .toLowerCase()
      .split(' ')
      .filter(t => t && t.trim());

    return this._search
      ? obsOf(this.filterSearch(this._search, terms))
      : this._searchStream.pipe(map((search: Search) => this.filterSearch(search, terms)));
  }

  private filterSearch(search: Search, terms: Array<string>): Array<string> {
    const chapterIdsForTerms: Array<Array<string>> = new Array<Array<string>>();

    for (let i = 0; i < terms.length; i++) {
      const term: string = terms[i];
      const wordIndices: Array<number> = new Array<number>();

      search.words.forEach((word, index) => {
        if (word.indexOf(term) >= 0) {
          wordIndices.push(index);
        }
      });

      if (!wordIndices.length) {
        return null;
      }

      const chapterIds: Array<string> = new Array<string>();

      wordIndices.forEach(index => {
        search.chapters[index].forEach(id => {
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

    let resultChapterIds: Array<string> = chapterIdsForTerms[0];

    for (let i = 1; i < chapterIdsForTerms.length; i++) {
      resultChapterIds = this.intersectArrays(resultChapterIds, chapterIdsForTerms[i]);

      if (!resultChapterIds.length) {
        return null;
      }
    }

    return resultChapterIds;
  }

  private intersectArrays(x: Array<string>, y: Array<string>): Array<string> {
    const result: Array<string> = new Array<string>();

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
