import {
  toString,
  isComplexPath,
  combingPathKey,
  showError,
  setValue,
} from "../utils/tool";
import { THE_PARAMETER_IS_ILLEGAL } from "../utils/errorCode";

export const get = (data: any, path: string | number) => {
  const tempData = data;
  if (tempData == null) return tempData;
  path = toString(path);
  if (path === "") return tempData;
  if (!isComplexPath(path)) return tempData[path];
  let ret;
  const keys = combingPathKey({ path }).keys;
  if (!keys.length) {
    return tempData;
  }
  const len = keys.length;
  for (let i = 0; i < len; ++i) {
    ret = (i ? ret : data)[keys[i]];
    if (ret == null) break;
  }
  return ret;
};

export const set = (data: any, path: string | number, value: any) => {
  path = toString(path);
  if (!(data && path)) {
    showError(THE_PARAMETER_IS_ILLEGAL);
    return null;
  }
  if (!isComplexPath(path)) {
    setValue(data, path, value);
    return data;
  }
  const keys = combingPathKey({ path }).keys;
  const tempData = data;
  for (let i = 0, len = keys.length; i < len; i++) {
    let key = keys[i];
    if (data[key] == null) {
      data[key] = {};
    }
    if (i === len - 1) {
      setValue(data, key, value);
    } else {
      data = data[key];
    }
  }

  return tempData;
};
