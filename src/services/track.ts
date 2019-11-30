import { Observable, fromEvent, BehaviorSubject, from, of } from 'rxjs';
import {
  map,
  filter,
  distinctUntilChanged,
  take,
  debounceTime,
  switchMap,
  timeout,
  withLatestFrom
} from 'rxjs/operators';
import uuid from 'uuid';
import Fingerprint2 from 'fingerprintjs2';
import apiService from './api';
import { API_URL } from 'settings';

interface ISession {
  sessionId: string;
  email: string;
  phone: string;
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
      email: null,
      phone: null,
      tags: []
    });

    this.onFocus().subscribe(element => this.focus$.next(element));

    this.isEmail();
    this.isPhone();
    this.getFingerprint();
  }

  public identifyUser = () => {
    this.session$
      .pipe(
        debounceTime(500),
        switchMap(session => apiService.post(API_URL, session))
      )
      .subscribe(session => console.log(session));
  };

  private setSession = (newSession: Partial<ISession>) => {
    this.session$
      .pipe(
        take(1),
        map((session): ISession => ({ ...session, ...newSession }))
      )
      .subscribe(session => this.session$.next(session));
  };

  private getFingerprint = () => {
    of(true)
      .pipe(
        timeout(50),
        switchMap(() => from(Fingerprint2.getPromise())),
        map(components => components.map(component => component.value)),
        map(values => Fingerprint2.x64hash128(values.join(''), 31)),
        withLatestFrom(this.session$)
      )
      .subscribe(([fingerprint, session]) =>
        this.setSession({
          tags: [...session.tags, `fingerprint:${fingerprint}`]
        })
      );
  };

  private onFocus = (): Observable<HTMLInputElement> => {
    return fromEvent(document, 'click').pipe(map(() => document.activeElement as HTMLInputElement));
  };

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

  private watchEmail = (element: HTMLInputElement) => {
    fromEvent(element, 'keyup')
      .pipe(
        map(element => (element.target as HTMLInputElement).value),
        filter(email => emailRegex.test(email)),
        distinctUntilChanged((a, b) => a === b)
      )
      .subscribe(email => this.setSession({ email }));
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

  private watchPhone = (element: HTMLInputElement) => {
    fromEvent(element, 'keyup')
      .pipe(
        map(element => (element.target as HTMLInputElement).value),
        filter(phone => phoneRegex.test(phone)),
        filter(phone => phone.length > 7),
        distinctUntilChanged()
      )
      .subscribe(phone => this.setSession({ phone }));
  };
}

const trackFactory = new TrackService();
export default trackFactory;
