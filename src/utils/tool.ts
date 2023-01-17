import * as errorCode from './errorCode';

export const isDef = val => {
  return (
    val === '' || val === undefined || val === null || String(val) === 'NaN'
  );
};

export const isUndef = val => {
  return (
    val === '' || val === undefined || val === null || String(val) === 'NaN'
  );
};

export const isArray = val => {
  return typeof val === 'object' && {}.toString.call(val) === '[object Array]';
};

export const isObject = o => {
  const type = typeof o;
  return o != null && (type === 'object' || type === 'function');
};

export const isPlainObject = o => {
  return (
    o != null &&
    typeof o === 'object' &&
    {}.toString.call(o) === '[object Object]'
  );
};

export const isString = s => {
  return typeof s === 'string';
};

export const isInteger = n => {
  return Number.isInteger(n);
};

export const isNatural = n => {
  return isInteger(n) && n >= 0;
};

const pathReg = /\//;

export const isComplexPath = s => {
  return pathReg.test(s);
};

export const toString = s => {
  return s + '';
};

export const showError = s => {
  console.error(s);
};

export const setValue = (obj: any, key: string | number, value: any) => {
  if (!isArray(obj)) {
    obj[key] = value;
    return;
  }

  const index = +key;

  if (!isNatural(index)) {
    showError('key: ' + key + ' ' + errorCode.IS_NOT_A_NATURAL_NUMBER);
    return;
  }

  obj.length = Math.max(obj.length, index);
  obj.splice(index, 1, value);
};

const REG_PATH_SPLIT = '/';

export interface CombingOptions {
  keys?: (string | null)[];
  path?: string;
}

export const combingPathKey = (param: CombingOptions) => {
  const path = param.path || '';
  let keys;

  if (!param.keys) {
    keys = (param.path || '').split(REG_PATH_SPLIT);
  } else if (!path) {
    keys = param.keys;
  }

  keys = keys.filter(Boolean); // {empty}

  while (
    ~keys.findIndex(function(key) {
      return key.trim() === '';
    })
  ) {
    const _i = keys.findIndex(function(key) {
      return key.trim() === '';
    });

    keys.splice(_i, 1);
  } // .

  while (~keys.indexOf('.')) {
    const _i2 = keys.indexOf('.');

    keys.splice(_i2, 1);
  } // ..

  while (~keys.indexOf('..')) {
    const _i3 = keys.indexOf('..');

    keys[_i3] = keys[_i3 - 1] = '';
    delete keys[_i3];
    delete keys[_i3 - 1];
    keys.splice(_i3, 1);
    keys.splice(_i3 - 1, 1);
  }

  const ret = {
    keys: keys,
    path: keys.join(REG_PATH_SPLIT),
  };
  return ret;
};
