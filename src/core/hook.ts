import EventEmitter from './event-emitter';
import { isArray } from './../utils/tool';

/**
 * Hook事件池
 */
const hookEmitter = new EventEmitter();
const hookBeforeEmitter = new EventEmitter();

function getHookAPIName(namespace: string, apiName: string) {
  return namespace + '.' + apiName;
}

/**
 * 为各功能组件增强Hook能力
 */
export default class Hook {
  /**
   * 为组件提供一个命名空间
   * @param namespace
   */
  private _hook_namespace: string;

  constructor(namespace: string) {
    this._hook_namespace = namespace;
  }

  /**
   * 监听HookAfter API事件
   * @param apiName
   * @param fn
   */
  hook(apiName: any, fn: any) {
    if (typeof apiName === 'function') {
      hookEmitter.on(this._hook_namespace, apiName);
    } else {
      hookEmitter.on(getHookAPIName(this._hook_namespace, apiName), fn);
    }
  }

  hookAfter(apiName: any, fn: any) {
    this.hook(apiName, fn);
  }
  /**
   * 移除HookAfter API事件
   * @param apiName
   * @param fn
   */
  unhook(apiName: any, fn: any) {
    if (typeof apiName === 'function') {
      hookEmitter.off(this._hook_namespace, apiName);
    } else {
      hookEmitter.off(getHookAPIName(this._hook_namespace, apiName), fn);
    }
  }

  unhookAfter(apiName: any, fn: any) {
    this.unhook(apiName, fn);
  }
  /**
   * 执行HookAfter API
   * @param {string} apiName
   * @param args
   */
  _execHook(apiName: any, ...args: any[]) {
    hookEmitter.emit.apply(hookEmitter, [
      getHookAPIName(this._hook_namespace, apiName),
      ...args,
    ]);
    hookEmitter.emit.apply(hookEmitter, [
      this._hook_namespace,
      apiName,
      ...args,
    ]);
  }

  _execHookAfter(apiName: any, ...args: any[]) {
    this._execHook.apply(this, [apiName, ...args]);
  }

  /**
   * 监听Before Hook API事件
   * @param apiName
   * @param fn
   */
  hookBefore(apiName: any, fn: any) {
    if (typeof apiName === 'function') {
      hookBeforeEmitter.on(this._hook_namespace, apiName);
    } else {
      hookBeforeEmitter.on(getHookAPIName(this._hook_namespace, apiName), fn);
    }
  }

  /**
   * 移除HookBefore API事件
   * @param apiName
   * @param fn
   */
  unhookBefore(apiName: any, fn: any) {
    if (typeof apiName === 'function') {
      hookBeforeEmitter.off(this._hook_namespace, apiName);
    } else {
      hookBeforeEmitter.off(getHookAPIName(this._hook_namespace, apiName), fn);
    }
  }

  /**
   * 执行HookBefore API
   * @param {string} apiName
   * @param args
   */
  _execHookBefore(apiName: any, ...args: any[]) {
    var apiResult = hookBeforeEmitter.emit.apply(hookBeforeEmitter, [
      getHookAPIName(this._hook_namespace, apiName),
      ...args,
    ]);
    var namespaceResult = hookBeforeEmitter.emit.apply(hookBeforeEmitter, [
      this._hook_namespace,
      apiName,
      ...args,
    ]);
    return this.shoudBreak(apiResult) || this.shoudBreak(namespaceResult);
  }

  shoudBreak(resultList: any) {
    return isArray(resultList) && resultList.some(item => item === false);
  }
}
