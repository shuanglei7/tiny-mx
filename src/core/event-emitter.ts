/**
 * 事件发生器
 */
interface MxEvtHandler {
  needMakeup: boolean;
  listener: (...args: any[]) => void;
}

export interface IEvents {
  [key: string]: MxEvtHandler[];
}

interface MxEvtEmitParam {
  eventName: string;
  isMakeupCall?: boolean;
}

export default class EventEmitter {
  _events: IEvents = {};

  constructor() {}
  /**
   * 检查某个事件是否被监听
   * @param {string} evtName
   */
  has(evtName: string): number | false {
    if (!evtName) return false;
    return this._events[evtName] && this._events[evtName].length;
  }
  /**
   * 监听事件
   * @param {string} evtName
   * @param {*} fn
   */
  on(evtName: string, listener: (...args: any[]) => void, needMakeup = true) {
    if (!this._events[evtName]) {
      this._events[evtName] = [];
    }
    this._events[evtName].push({ listener, needMakeup });
  }

  /**
   * 移除事件
   * @param {string} evtName
   * @param {*} fn 注:不传则移除所有事件
   */
  off(evtName: string, fn?: (...args: any[]) => void) {
    if (!fn || !this._events[evtName]) {
      this._events[evtName] = [];
      return;
    }
    this._events[evtName] = this._events[evtName].filter(
      (handler) => handler.listener !== fn
    );
  }

  /**
   * 触发事件
   * @param {string} evtName
   * @param {any[]} args
   */
  emit(evtParam: string | MxEvtEmitParam, ...args: any[]) {
    const evtName =
      typeof evtParam === "string" ? evtParam : evtParam.eventName;
    const isMakeupCall = typeof evtParam !== "string" && evtParam.isMakeupCall;
    const evts = this._events[evtName];

    if (evts) {
      return evts.map((handler) =>
        isMakeupCall
          ? handler.needMakeup && handler.listener(...args)
          : handler.listener(...args)
      );
    }
    return [];
  }
}
