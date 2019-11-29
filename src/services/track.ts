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

  private isEmail = () => {
    this.focus$
      .pipe(
        filter(element => !!element && !!element.name),
        filter(element => !!this.emailKeywords.find(keyword => element.name.includes(keyword)))
      )
      .subscribe(() => console.log('isEmail'));
  };

  private isPhone = () => {
    this.focus$
      .pipe(
        filter(element => !!element && !!element.name),
        filter(element => !!this.phoneKeywords.find(keyword => element.name.includes(keyword)))
      )
      .subscribe(() => console.log('isPhone'));
  };

  private onFocus = (): Observable<HTMLInputElement> => {
    return fromEvent(document, 'click').pipe(map(() => document.activeElement as HTMLInputElement));
  };
}
const trackFactory = new TrackService();
export default trackFactory;
