import { Observable, fromEvent, BehaviorSubject } from 'rxjs';
import { map, filter, distinctUntilChanged } from 'rxjs/operators';
import uuid from 'uuid';

interface ISession {
  sessionId: string;
  fingerprint: string;
  tags: string[];
}

// eslint-disable-next-line max-len
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/;

class TrackService {
  private phoneKeywords = ['tel', 'telefone', 'phone', 'cellphone', 'phon'];
  private emailKeywords = ['email', 'e-mail'];

  private focus$ = new BehaviorSubject<HTMLInputElement>(null);
  private session$ = new BehaviorSubject<ISession>(null);

  constructor() {
    this.session$.next({
      sessionId: uuid.v4(),
      fingerprint: null,
      tags: []
    });

    this.onFocus().subscribe(element => this.focus$.next(element));

    this.isEmail();
    this.isPhone();
  }

  public identifyUser = () => {
    this.focus$.subscribe();
  };

  private watchEmail = (element: HTMLInputElement) =>
    fromEvent(element, 'keyup')
      .pipe(
        map(element => (element.target as HTMLInputElement).value),
        filter(email => emailRegex.test(email)),
        distinctUntilChanged((a, b) => a === b)
      )
      .subscribe(email => console.log(email));

  private watchPhone = (element: HTMLInputElement) =>
    fromEvent(element, 'keyup')
      .pipe(
        map(element => (element.target as HTMLInputElement).value),
        filter(phone => phoneRegex.test(phone)),
        filter(phone => phone.length > 7),
        distinctUntilChanged()
      )
      .subscribe(phone => console.log(phone));

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
