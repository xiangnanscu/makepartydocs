import { Buffer } from "buffer";

export function isWeixin() {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.match(/MicroMessenger/i) == "micromessenger") {
    return true;
  } else {
    return false;
  }
}
export function chunk(elements, n = 1) {
  const res = [];
  let unit = [];
  for (const e of elements) {
    if (unit.length === n) {
      res.push(unit);
      unit = [e];
    } else {
      unit.push(e);
    }
  }
  res.push(unit);
  return res;
}

export const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
export const encodeBase64 = (s) =>
  Buffer.from(s, "utf-8").toString("base64").replace(/\//g, "_").replace(/\+/g, "-");
export const decodeBase64 = (s) =>
  Buffer.from(s.replace(/_/g, "/").replace(/-/g, "+"), "base64").toString("utf-8");
export const repr = (s) => {
  const res = JSON.stringify(s);
  console.log(res);
  return res;
};
export const fromNow = (value) => {
  if (!value) {
    return "";
  }
  // 拿到当前时间戳和发布时的时间戳
  const curTime = new Date();
  const postTime = new Date(value);
  //计算差值
  const timeDiff = curTime.getTime() - postTime.getTime();
  // 单位换算
  const min = 60 * 1000;
  const hour = min * 60;
  const day = hour * 24;
  // 计算发布时间距离当前时间的 天、时、分
  const exceedDay = Math.floor(timeDiff / day);
  const exceedHour = Math.floor(timeDiff / hour);
  const exceedMin = Math.floor(timeDiff / min);
  // 最后判断时间差
  if (exceedDay < 1) {
    if (exceedHour < 24 && exceedHour > 0) {
      return exceedHour + "小时前";
    } else if (exceedMin < 60 && exceedMin > 0) {
      return exceedMin + "分钟前";
    } else {
      return "刚刚";
    }
  } else if (exceedDay < 7) {
    return `${exceedDay}天前`;
  } else if (curTime.getFullYear() == postTime.getFullYear()) {
    return value.slice(5, 10);
  } else {
    return value.slice(0, 10);
  }
};
export function uuid() {
  let timestamp = new Date().getTime();
  let perforNow =
    (typeof performance !== "undefined" && performance.now && performance.now() * 1000) || 0;
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    let random = Math.random() * 16;
    if (timestamp > 0) {
      random = (timestamp + random) % 16 | 0;
      timestamp = Math.floor(timestamp / 16);
    } else {
      random = (perforNow + random) % 16 | 0;
      perforNow = Math.floor(perforNow / 16);
    }
    return (c === "x" ? random : (random & 0x3) | 0x8).toString(16);
  });
}
const FIRST_DUP_ADDED = {};
export const findDups = (arr, callback) => {
  const already = {};
  const res = [];
  for (let i = 0; i < arr.length; i++) {
    const e = arr[i];
    const k = callback(e, i, arr);
    const a = already[k];
    if (a !== undefined) {
      if (a !== FIRST_DUP_ADDED) {
        res.push(a);
        already[k] = FIRST_DUP_ADDED;
      }
      res.push(e);
    } else {
      already[k] = e;
    }
  }
  return res;
};
export function objectContains(a, b) {
  for (const key in b) {
    if (Object.hasOwnProperty.call(b, key)) {
      if (!isSame(a[key], b[key])) {
        return false;
      }
    }
  }
  return true;
}
export function isSame(a, b) {
  if (typeof a !== typeof b) {
    return false;
  }
  if (typeof a !== "object") {
    return a === b;
  }
  if (a instanceof Array && b instanceof Array) {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = a.length - 1; i >= 0; i--) {
      if (!isSame(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }
  if (a instanceof Array || b instanceof Array) {
    return false;
  }
  return objectContains(a, b) && objectContains(b, a);
}
const sizeTable = {
  k: 1024,
  m: 1024 * 1024,
  g: 1024 * 1024 * 1024,
  kb: 1024,
  mb: 1024 * 1024,
  gb: 1024 * 1024 * 1024,
};
export function parseSize(t) {
  if (typeof t === "string") {
    const unit = t.replace(/^(\d+)([^\d]+)$/, "$2").toLowerCase();
    const ts = t.replace(/^(\d+)([^\d]+)$/, "$1").toLowerCase();
    const bytes = sizeTable[unit];
    if (!bytes) throw new Error("invalid size unit: " + unit);
    const num = parseFloat(ts);
    if (isNaN(num)) throw new Error("can't convert `" + ts + "` to a number");
    return num * bytes;
  } else if (typeof t === "number") {
    return t;
  } else {
    throw new Error("invalid type: " + typeof t);
  }
}
export const snakeToCamel = (s) => {
  return s.replace(/(_[a-zA-Z])/g, (c) => {
    return c[1].toUpperCase();
  });
};

export const toModelName = (s) => {
  return capitalize(snakeToCamel(s));
};

export const toChineseDatetime = (s) => {
  return `${s.slice(0, 4)}年${s.slice(5, 7)}月${s.slice(8, 10)}日${s.slice(11, 13)}点${s.slice(
    14,
    16,
  )}分`;
};

export const deepcopy = (o) => JSON.parse(JSON.stringify(o));

const unit_table = {
  s: 1,
  m: 60,
  h: 3600,
  d: 3600 * 24,
  w: 3600 * 24 * 7,
  M: 3600 * 24 * 30,
  y: 3600 * 24 * 365,
};
export function timeParser(t) {
  if (typeof t === "string") {
    const unit = t[t.length - 1];
    const secs = unit_table[unit];
    if (!secs) throw "invalid time unit: " + unit;
    const ts = t.substring(0, t.length - 1);
    const num = Number(ts);
    if (!num) throw "can't convert '" + (ts + "' to a number");
    return num * secs;
  } else if (typeof t === "number") {
    return t;
  } else {
    throw new Error("invalid type:" + typeof t);
  }
}

function centerLeftRankEven(arr) {
  const res = [];
  const n = arr.length;
  for (let i = n - 1; i >= 1; i = i - 2) {
    res.push(arr[i]);
  }
  for (let i = 0; i <= n - 2; i = i + 2) {
    res.push(arr[i]);
  }
  return res;
}

export function centerLeftRank(arr) {
  const n = arr.length;
  if (n % 2 === 0) {
    return centerLeftRankEven(arr);
  } else {
    const res = centerLeftRankEven(arr.slice(1));
    res.splice((n - 1) / 2, 0, arr[0]);
    return res;
  }
}

export function dataMasking(value) {
  return (
    value[0] +
    Array(value.length - 1)
      .fill("*")
      .join("")
  );
}

export function getChineseDate(date) {
  if (typeof date == "string") {
    date = new Date(date);
  }
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  return `${year}年${month}月${day}日 ${hour}:${minute}`;
}
