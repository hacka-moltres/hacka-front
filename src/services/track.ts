import { Observable, fromEvent, BehaviorSubject } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import uuid from 'uuid';

interface ISession {
  sessionId: string;
  email: string;
  phone: string;
}

class TrackService {
  private phoneKeywords = ['tel', 'telefone', 'phone', 'cellphone', 'phon'];
  private emailKeywords = ['email', 'e-mail'];

  private focus$ = new BehaviorSubject<HTMLInputElement>(null);
  private session$ = new BehaviorSubject<ISession>(null);

  constructor() {
    this.session$.next({
      sessionId: uuid.v4(),
      email: null,
      phone: null
    });

    this.onFocus().subscribe(element => this.focus$.next(element));
    this.isEmail();
    this.isPhone();
  }

  public identifyUser = () => {
    this.focus$.subscribe();
  };

  private watchEmail = (element: HTMLInputElement) =>
    fromEvent(element, 'keyup').subscribe((element: any) => console.log(element.target.value));

  private watchPhone = (element: HTMLInputElement) =>
    fromEvent(element, 'keyup').subscribe((element: any) => console.log(element.target.value));

  private isEmail = () => {
    this.focus$
      .pipe(
        filter(
          element => (!!element && !!element.name) || (!!element && !!element.type) || (!!element && !!element.id)
        ),
        filter(element => {
          if (!!element.name && !!this.emailKeywords.find(keyword => element.name.includes(keyword))) {
            return true;
          }

          if (!!element.id && !!this.emailKeywords.find(keyword => element.id.includes(keyword))) {
            return true;
          }

          if (!!element.type && element.type === 'email') {
            return true;
          }

          return false;
        })
      )
      .subscribe(element => this.watchEmail(element));
  };

  private isPhone = () => {
    this.focus$
      .pipe(
        filter(
          element => (!!element && !!element.name) || (!!element && !!element.type) || (!!element && !!element.id)
        ),
        filter(element => {
          if (!!element.name && !!this.phoneKeywords.find(keyword => element.name.includes(keyword))) {
            return true;
          }

          if (!!element.id && !!this.phoneKeywords.find(keyword => element.id.includes(keyword))) {
            return true;
          }

          if (!!element.type && element.type === 'tel') {
            return true;
          }

          return false;
        })
      )
      .subscribe(element => this.watchPhone(element));
  };

  private onFocus = (): Observable<HTMLInputElement> => {
    return fromEvent(document, 'click').pipe(map(() => document.activeElement as HTMLInputElement));
  };
}
const trackFactory = new TrackService();
export default trackFactory;
