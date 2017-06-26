import { EventEmitter, Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Chapter, Dictionary } from '../models';

import { Observable } from 'rxjs/Observable';
import { ISubscription } from 'rxjs/Subscription';

@Injectable()
export class ChapterService {

  private _dictionary: Dictionary;
  private _dictionaryStream: Observable<Dictionary>;
  private _dictionaryStreamSub: ISubscription;

  public constructor(private _http: Http) {
    this._dictionaryStream = this._http.get('files/json/dictionary.json')
      .map(res => <Dictionary>res.json())
      .share();

    this._dictionaryStreamSub = this._dictionaryStream.subscribe((dictionary: Dictionary) => {
      this._dictionary = dictionary;
    });
  }

  private getDictionary(): Observable<Dictionary> {
    return this._dictionary ? Observable.of(this._dictionary) : this._dictionaryStream;
  }

  public getChapters(): Observable<Array<Chapter>> {
    return this.getDictionary()
      .map(dictionary => dictionary.chapters);
  }

  public findChapterById(id: string): Observable<Chapter> {
    return id
      ? this.getDictionary().map(dictionary => this.findChapterByIdRecursive(dictionary.chapters, id))
      : Observable.empty<Chapter>();
  }

  public findChaptersByReference(reference: string): Observable<Chapter> {
    if (!reference) {
      return Observable.empty<Chapter>();
    }

    return this.getDictionary().map(dictionary => {
      let chapter: Chapter = this.findChapterByReferenceRecursive(dictionary.chapters, reference);

      if (!chapter) {
        chapter = this.findPropertyByReferenceRecursive(dictionary.properties, reference);
      }

      return chapter;
    });
  }

  public findChaptersByIds(ids: Array<string>): Observable<Array<Chapter>> {
    if (!ids || !ids.length) {
      return Observable.of(new Array<Chapter>());
    }

    return this.getChapters().map(chapters => {
      let result: Array<Chapter> = new Array<Chapter>();

      ids.forEach(id => {
        let found: Chapter = this.findChapterByIdRecursive(chapters, id);
        if (found) {
          result.push(found);
        }
      });

      return result.sort((left, right) => {
        if (left.label > right.label) {
          return 1;
        } else if (left.label === right.label) {
          return 0;
        } else {
          return -1;
        }
      });
    });
  }

  private findChapterByIdRecursive(chapters: Array<Chapter>, id: string): Chapter {
    if (chapters && chapters.length) {
      for (let i = 0; i < chapters.length; i++) {
        let chapter = chapters[i];
        if (chapter.id === id) {
          return chapter;
        } else if (chapter.children && chapter.children.length) {
          let subChapter: Chapter = this.findChapterByIdRecursive(chapter.children, id);
          if (subChapter) {
            return subChapter;
          }
        }
      }
    }

    return null;
  }

  private findChapterByReferenceRecursive(chapters: Array<Chapter>, reference: string): Chapter {
    if (chapters && chapters.length) {
      for (let i = 0; i < chapters.length; i++) {
        let chapter = chapters[i];
        if (chapter.references && chapter.references.some((value: string) => { return value.toLowerCase() === reference.toLowerCase(); })) {
          return chapter;
        } else if (chapter.children && chapter.children.length) {
          let subChapter: Chapter = this.findChapterByReferenceRecursive(chapter.children, reference);
          if (subChapter) {
            return subChapter;
          }
        }
      }
    }

    return null;
  }

  private findPropertyByReferenceRecursive(properties: Array<Chapter>, reference: string): Chapter {
    if (properties && properties.length) {
      for (let i = 0; i < properties.length; i++) {
        let property = properties[i];
        if (property.id && property.id.toLowerCase() === reference.toLowerCase()) {
          return property;
        }
      }
    }

    return null;
  }
}
