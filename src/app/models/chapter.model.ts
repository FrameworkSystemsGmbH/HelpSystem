export class Chapter {

  public id: string;
  public label: string;
  public file: string;
  public references: Array<string>;
  public children: Array<Chapter>;

}
