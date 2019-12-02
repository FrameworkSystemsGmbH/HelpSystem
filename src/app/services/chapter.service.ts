import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of as obsOf } from 'rxjs';
import { map, share } from 'rxjs/operators';

import { Chapter } from 'app/models/chapter';
import { Dictionary } from 'app/models/dictionary';

@Injectable()
export class ChapterService {

  private _dictionary: Dictionary;
  private _dictionaryStream: Observable<Dictionary>;

  public constructor(private _http: HttpClient) {
    this._dictionaryStream = this._http.get('files/json/dictionary.json').pipe(
      map(res => res as Dictionary),
      share()
    );

    this._dictionaryStream.subscribe((dictionary: Dictionary) => {
      this._dictionary = dictionary;
    });
  }

  private getDictionary(): Observable<Dictionary> {
    return this._dictionary ? obsOf(this._dictionary) : this._dictionaryStream;
  }

  public getChapters(): Observable<Array<Chapter>> {
    return this.getDictionary().pipe(
      map(dictionary => dictionary.chapters)
    );
  }

  public findChapterById(id: string): Observable<Chapter> {
    return id
      ? this.getDictionary().pipe(map(dictionary => this.findChapterByIdRecursive(dictionary.chapters, id)))
      : obsOf(null as Chapter);
  }

  public findChaptersByReference(reference: string): Observable<Chapter> {
    if (!reference) {
      return obsOf(null as Chapter);
    }

    return this.getDictionary().pipe(
      map(dictionary => {
        let chapter: Chapter = this.findChapterByReferenceRecursive(dictionary.chapters, reference);

        if (!chapter) {
          chapter = this.findPropertyByReferenceRecursive(dictionary.properties, reference);
        }

        return chapter;
      })
    );
  }

  public findChaptersByIds(ids: Array<string>): Observable<Array<Chapter>> {
    if (!ids || !ids.length) {
      return obsOf(new Array<Chapter>());
    }

    return this.getChapters().pipe(
      map(chapters => {
        const result: Array<Chapter> = new Array<Chapter>();

        ids.forEach(id => {
          const foundChapter: Chapter = this.findChapterByIdRecursive(chapters, id);
          if (foundChapter) {
            result.push(foundChapter);
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
      })
    );
  }

  private findChapterByIdRecursive(chapters: Array<Chapter>, id: string): Chapter {
    if (chapters && chapters.length) {
      for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        if (chapter.id === id) {
          return chapter;
        } else if (chapter.children && chapter.children.length) {
          const subChapter: Chapter = this.findChapterByIdRecursive(chapter.children, id);
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
        const chapter = chapters[i];
        if (chapter.references && chapter.references.some((value: string) => value.toLowerCase() === reference.toLowerCase())) {
          return chapter;
        } else if (chapter.children && chapter.children.length) {
          const subChapter: Chapter = this.findChapterByReferenceRecursive(chapter.children, reference);
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
        const property = properties[i];
        if (property.id && property.id.toLowerCase() === reference.toLowerCase()) {
          return property;
        }
      }
    }

    return null;
  }
}
