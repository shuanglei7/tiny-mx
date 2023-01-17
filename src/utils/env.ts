import { isDef } from './tool';

function getGlobal() {
  if (typeof globalThis !== 'undefined') return globalThis;
  if (typeof self !== 'undefined') return self;
  if (typeof window !== 'undefined') return window;
  if (typeof global !== 'undefined') return global;
  return null;
}

export const globalVar: any = getGlobal();

export function getInstance(name: string) {
  return isDef(globalVar) && isDef(globalVar[name]) ? globalVar[name] : null;
}

export function setInstance<T>(name: any, value: T, independent = false): T {
  if (globalVar && !independent) {
    Object.defineProperty(globalVar, name, {
      enumerable: false,
      configurable: false,
      writable: false,
      value: value,
    });

    return globalVar[name];
  } else {
    return value;
  }
}
