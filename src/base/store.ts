import * as dataManager from '../core/dataManager';
import { getInstance, setInstance } from '../utils/env';

const namespace = '__MX_STORE__';

type RecordObject<T = any> = Record<string, T>;

export class Store {
  private store: RecordObject = {};
  private asyncUpdateList: any[] = [];
  private nextTickCalls: Function[] = [];
  private attachList: any[] = [];
  private pathChangeMap: RecordObject<Array<(data?: any) => void>> = {};

  private asyncUpdateTicking = false;

  private _addToStore(name: string, data: any) {
    if (this.store[name]) {
      console.error(
        'you are setting store namespace [' + name + '] more than once'
      );
    }

    this.store = dataManager.set(this.store, name, data);
  }

  add(path: string, data: any) {
    this._addToStore(path, data);
    this._updateHandler(path);
  }

  private _handlePathChange(path: any) {
    if (!this.pathChangeMap[path]) {
      return;
    }

    this.pathChangeMap[path].forEach((listener) => {
      const data = dataManager.get(this.store, this._formatPath(path));
      listener(data);
    });
  }

  _formatPath(path: string): string {
    return path.split('.').join('/');
  }

  update(path: string, data: any) {
    const newData = dataManager.set(this.store, this._formatPath(path), data);

    if (newData) {
      this.store = newData;

      this._updateHandler(path);
    }
  }

  slientUpdate(path: string, data: any) {
    const newData = dataManager.set(this.store, this._formatPath(path), data);

    if (newData) {
      this.store = newData;
    }
  }

  asyncUpdate<T>(path: string, data: any): Promise<T> {
    const newData = dataManager.set(this.store, this._formatPath(path), data);

    if (newData) {
      this.store = newData;
    }

    let resolve, reject;
    const result = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    this.asyncUpdateList.push({
      path: path,
      resolve: resolve,
      reject: reject,
    });

    if (!this.asyncUpdateTicking) {
      this.asyncUpdateTicking = true;

      this._asyncUpdateHandler();
    }

    return result as Promise<T>;
  }

  nextTick(cb: Function) {
    typeof cb === 'function' && this.nextTickCalls.push(cb);
  }

  set(subStore: RecordObject) {
    const keys = Object.keys(subStore);
    for (const i in keys) {
      const key = keys[i];
      this._addToStore(key, subStore[key]);
      this._pathUpdate(key);
    }
    this._updateHandler();
  }

  get(name: any) {
    if (name === undefined) {
      return this.store;
    }
    return dataManager.get(this.store, name.split('.').join('/'));
  }

  getStore() {
    return this.store;
  }

  private _updateChildPath(path: any) {
    const keys = Object.keys(this.pathChangeMap);
    for (let k in keys) {
      let key = keys[k];
      if (key !== path && key.indexOf(path) === 0) {
        for (let i = 0; i < this.pathChangeMap[key].length; i++) {
          this.pathChangeMap[key][i](
            dataManager.get(this.store, key.split('.').join('/'))
          );
        }
      }
    }
  }

  private _pathUpdate(path: any) {
    this._updateChildPath(path);
    path = path.split('.');
    let p = '';
    for (let i in path) {
      p += p ? '.' + path[i] : path[i];
      this._handlePathChange(p);
    }
  }

  private _updateHandler(path = '') {
    //全量订阅
    for (let i in this.attachList) {
      this.attachList[i](this.store, path);
    }
    if (!path) return;
    //路径订阅
    this._pathUpdate(path);
  }

  private _asyncUpdateHandler() {
    Promise.resolve()
      .then(() => {
        const uniqueList: any[] = [];
        this.asyncUpdateList.forEach((item) => {
          if (!uniqueList.find((tar) => tar.path === item.path)) {
            uniqueList.push(item);
          }
        });
        uniqueList.forEach((item) => {
          this._updateHandler(item.path);
        });
        this.asyncUpdateList.forEach((item) => {
          item.resolve(
            dataManager.get(this.store, this._formatPath(item.path))
          );
        });
        this.nextTickCalls.forEach((cb) => {
          cb();
        });
        this.asyncUpdateTicking = false;
        this.asyncUpdateList = [];
        this.nextTickCalls = [];
      })
      .catch((err) => {
        console.error(err);
      });
  }

  onChange(cb: Function) {
    this.attachList.push(cb);
  }

  private _addToPathChange(path: string, cb: (data: any) => any) {
    if (!this.pathChangeMap[path]) {
      this.pathChangeMap[path] = [];
    }
    this.pathChangeMap[path].push(cb);
  }

  private _removeFromPathChange(path: string, cb: (data: any) => any) {
    if (!this.pathChangeMap[path]) {
      return;
    }
    this.pathChangeMap[path] = this.pathChangeMap[path].filter(
      (fn) => fn !== cb
    );
  }

  on(path: string, cb: (data: any) => any, forceInit = false) {
    if (typeof path !== 'string') {
      console.error('only string accept');
      return;
    }
    this._addToPathChange(path, cb);
    if (forceInit) {
      cb(dataManager.get(this.store, this._formatPath(path)));
    }
  }

  off(path: string, cb: (data: any) => any) {
    if (typeof path !== 'string') {
      throw new Error('store.off path only accept string');
    }
    this._removeFromPathChange(path, cb);
  }
}

let instance: Store = getInstance(namespace);

if (!instance) {
  instance = setInstance(namespace, new Store());
}

export default instance;
