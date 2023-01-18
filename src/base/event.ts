import EventEmitter from '../core/event-emitter';
import Hook from '../core/hook';
import { getInstance, setInstance } from '../utils/env';

const namespace = '__MX_EVENT__';

export interface EmitRecord {
  eventName: string;
  args?: any;
}

export class Event extends Hook {
  private emitter: EventEmitter;
  private _emptyEmit: EmitRecord[] = [];

  private get _events() {
    return this.emitter._events;
  }

  constructor() {
    super(namespace);

    this.emitter = new EventEmitter();
  }

  private runRemain(eventName: string) {
    this._emptyEmit
      .filter((e) => e.eventName === eventName)
      .forEach((payload) => {
        this.emitter.emit(
          { eventName: payload.eventName, isMakeupCall: true },
          ...payload.args
        );
      });
    this._emptyEmit = this._emptyEmit.filter((e) => e.eventName !== eventName);
  }

  on(eventName: string, listener: Function, needMakeup = true) {
    const metaName = 'on';
    const shouldBreak =
      this._execHookBefore(metaName, eventName, listener) === false;
    if (!shouldBreak) return;
    this.emitter.on(eventName, listener, needMakeup);
    !!needMakeup && this.runRemain(eventName);
    this._execHookAfter(metaName, eventName, listener);
  }

  off(eventName: string, listener?: Function) {
    const metaName = 'off';
    const shouldBreak =
      this._execHookBefore(metaName, eventName, listener) === false;
    if (!shouldBreak) return;
    this.emitter.off(eventName, listener);
    this._execHookAfter(metaName, eventName, listener);
  }

  emit(eventName: string, ...args: any) {
    const metaName = 'emit';
    const shouldBreak =
      this._execHookBefore(metaName, eventName, ...args) === false;
    if (!shouldBreak) return [];
    let result: any[] = [];
    if (!this.emitter.has(eventName)) {
      this._emptyEmit.push({ eventName, args });
    } else {
      if (
        this.emitter._events[eventName].every(
          (handler) => handler && handler.needMakeup === false
        )
      ) {
        this._emptyEmit.push({ eventName, args });
      }
      result = this.emitter.emit(eventName, ...args);
    }
    this._execHookAfter(metaName, eventName, ...args);
    return result;
  }
}

let instance: Event = getInstance(namespace);

if (!instance) {
  instance = setInstance(namespace, new Event());
}

export default instance;
