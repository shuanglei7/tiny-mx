# tiny-mx

## 快速开始

### 安装：

NPM:

```shell
npm i tiny-mx --save
```

引用：

```javascript
import mx from 'tiny-mx';
```

## 使用

### mx.store

- 如何操作数据

```javascript
// 初始化
mx.store.set({
  status: '',
});
// or 直接使用update
mx.store.update({
  status: '',
});

// 获取数据
const status = mx.store.get('status');

// 更新数据
mx.store.update('status', 'newVal');
// 更新子数据
mx.store.update('roomData.message.help', []);
// 更新数组数据，roomData.group0.players是一个数组
mx.store.update('roomData.group0.players.0.realMyCoin', realMyCoin);
```

- 监听数据变化

参数：

1. key(string): state 字段，支持连缀形式（e.g. roomData.message.help）

2. callback(Function): 监听数据变化的回调函数

3. forceInit(boolean): 是否立即执行一次（用于处理监听时机晚于 update 的情况，会立即取当前 store 中对应的 key 值，触发 callback）

```javascript
// 监听数据变化
mx.store.on(
  'status',
  (data) => {
    console.log(data);
    this.set({
      status: data,
    });
  },
  true
);
```

### event

```javascript
// 触发事件执行，可传递任意个参数
mx.event.emit('event', 'test', 'test2');

const listener = (a, b) => {
  // do something
  console.log(a); // 'test'
  console.log(b); // 'test2'
};
// 监听事件
mx.event.on('event', listener);

// 移除监听
mx.event.off('event', listener);
mx.event.off('event'); // 移除该事件的所有监听器

// 检查某个事件是否被监听
mx.event.has('event');
```

## 扩展

Mx 的每个模块提供了一定的 hooks 以便支持更加灵活的扩展能力。

以下是目前支持的部分：

### event

```javascript
mx.event.hook('on', function(evtName, fn) {
  // 监听 Event 的 on 行为
});
mx.event.hook('off', function(evtName, fn) {
  // 监听 Event 的 off 行为
});
mx.event.hook('emit', function(evtName, data) {
  // 监听 Event 的 emit 行为
});
mx.event.hook(function(action, ...args) {
  // 监听 Event 所有的 hook 行为
  // action: on / off / emit
});
```
