export abstract class BaseError {
  public readonly title: string;
  public readonly message: string;

  constructor(message: string, title: string = 'BASE_ERR') {
    this.message = message;
    this.title = title;
  }
}