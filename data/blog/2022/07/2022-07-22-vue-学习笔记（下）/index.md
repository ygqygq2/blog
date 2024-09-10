---
title: "Vue 学习笔记（下）"
date: "2022-07-22"
categories:
  - "development"
tags:
  - "vue"
  - "前端"
  - "学习"
---

# 1\. 混入 Mixin

基本用法：

```js
const myMixin = {
  data() {
    return { number: 2 };
  },
};

const app = Vue.createApp({
  data() {
    return { number: 1 };
  },
  mixins: [myMixin],
  template: `
        <div>
            <div>{{ number }}</div>
        </div>
        `,
});

const vm = app.mount("#root");
```

- 组件 data, methods 优先级高于 mixin data, methods 优先级
- 生命周期函数先执行 mixin 里的，再执行组件里的
- 组件中的自定义属性优先级高于 mixin 中的属性优先级
- 默认 mixin 是局部的，需要声明注入，全局 mixin 直接定义在 `app` 中，不需要明确注入
- `app.config.optionMergesrategies.number` 定义 mixin 属性优先级

```js
const myMixin = {
  number: 1,
};

const app = Vue.createApp({
  mixins: [myMixin],
  number: 2,
  template: `
        <div>
            <div>{{ this.$options.number }}</div>
        </div>
        `,
});

app.config.optionMergeStrategies.number = (mixinVal, appValue) => {
  return mixinVal || appValue;
};

const vm = app.mount("#root");
```

# 2\. 自定义指令 directives

其支持各种生命周期函数

```js
const directives = {
  focus: {
    mounted(el) {
      el.focus();
    },
  },
};

const app = Vue.createApp({
  directives: directives,
  template: `
        <div>
            <input v-focus>
        </div>
        `,
});

const vm = app.mount("#root");
```

使用数据控制 directive

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1, minimum-scale=1, user-scalable=no"
    />
    <title>directives</title>
    <script src="https://cdn.bootcdn.net/ajax/libs/vue/3.2.37/vue.global.js"></script>
    <style>
      .header {
        position: absolute;
      }
    </style>
  </head>
  <div id="root"></div>

  <body></body>
  <script>
    const app = Vue.createApp({
      data() {
        return {
          distance: 100,
        };
      },
      template: `
        <div>
            <div v-pos:top="distance" class="header">
                <input />
            </div>
        </div>
        `,
    });

    // app.directive('pos', (el, binding) => {
    //     el.style[binding.arg] = (binding.value + 'px');
    // });

    app.directive("pos", {
      mounted(el, binding) {
        el.style[binding.arg] = binding.value + "px";
      },
      updated(el, binding) {
        el.style[binding.arg] = binding.value + "px";
      },
    });

    const vm = app.mount("#root");
  </script>
</html>
```

# 3\. 传送门 teleport

默认 html dom 是层层嵌套，`teleport` 可以把组件里的 dom 元素直接传送到其它位置进行展示。

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1, minimum-scale=1, user-scalable=no"
    />
    <title>传送门</title>
    <script src="https://cdn.bootcdn.net/ajax/libs/vue/3.2.37/vue.global.js"></script>
    <style>
      .area {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 200px;
        height: 300px;
        transform: translate(-50%, -50%);
        background-color: green;
      }

      .mask {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        background-color: #000;
        opacity: 0.5;
      }
    </style>
  </head>
  <div id="root"></div>

  <body></body>
  <script>
    const app = Vue.createApp({
      data() {
        return {
          show: false,
        };
      },
      methods: {
        handleBtnClick() {
          this.show = !this.show;
        },
      },
      template: `
        <div class="area">
            <button @click="handleBtnClick">按钮</button>
            <teleport to="body">
                <div class="mask" v-show="show"></div>
            </teleport>
        </div>
        `,
    });

    const vm = app.mount("#root");
  </script>
</html>
```

# 4\. render 函数

template -> render -> h -> 虚拟 DOM（JS 对象）-> 真实 DOM -> 展示页面上

```js
const app = Vue.createApp({
  template: `
        <my-title :level="2">
            hello world
        </my-title>
        `,
});

app.component("my-title", {
  props: ["level"],
  render() {
    const { h } = Vue;
    return h("h" + this.level, {}, this.$slots.default());
  },
});

const vm = app.mount("#root");
```

# 5\. 插件 plugin

把通用性的功能封装起来

```js
const myPlugin = {
  install(app, options) {
    app.provide("name", "Hello World");
  },
};
const app = Vue.createApp({
  template: `
        <my-title />
        `,
});

app.component("my-title", {
  inject: ["name"],
  template: `<div>{{name}}</div>`,
});

app.use(myPlugin, { name: "test" });

const vm = app.mount("#root");
```

# 6\. setup 函数

为了增加代码的可维护性，`setup` 可以将相关代码段聚集在一起。 setup 函数执行在 created 之前，即实例被完全初始化之前。

```js
const app = Vue.createApp({
  template: `
        <div @click="handleClick">{{name}}</div>
        `,
  methods: {
    test() {
      console.log(this.$options.setup());
    },
  },
  mounted() {
    this.test();
  },
  setup(props, context) {
    return {
      name: "hello",
      handleClick: () => {
        alert("click");
      },
    };
  },
});

const vm = app.mount("#root");
```

# 7\. ref、reactive 响应式引用

原理：通过 proxy 对数据进行封装，当数据变化时， 触发模板等内容的更新

ref 只适合处理基本类型的数据

```js
const app = Vue.createApp({
  template: `
        <div>{{name}}</div>
        `,
  setup(props, context) {
    const { ref } = Vue;
    // proxy , 'hello' 变成 proxy({value: 'hello'}) 这样的一个响应式引用
    let name = ref("hello");
    setTimeout(() => {
      name.value = "world";
    }, 2000);
    return {
      name,
    };
  },
});

const vm = app.mount("#root");
```

reactive 处理非基础类型的数据

```js
const app = Vue.createApp({
  template: `
        <div>{{nameObj[0]}}</div>
        `,
  setup(props, context) {
    const { reactive } = Vue;
    const nameObj = reactive([123]);
    setTimeout(() => {
      nameObj[0] = 456;
    }, 2000);
    return {
      nameObj,
    };
  },
});

const vm = app.mount("#root");
```

`readonly` 使用

```js
const app = Vue.createApp({
  template: `
        <div>{{nameObj[0]}}</div>
        `,
  setup(props, context) {
    const { reactive, readonly } = Vue;
    const nameObj = reactive([123]);
    const copyNameObj = readonly(nameObj);
    setTimeout(() => {
      nameObj[0] = 456;
      copyNameObj[0] = 456;
    }, 2000);
    return {
      nameObj,
      copyNameObj,
    };
  },
});

const vm = app.mount("#root");
```

`toRefs` 会把 `proxy({name: 'hello'})` 转换成 `{name: proxy({value: 'hello'})}`

```js
const app = Vue.createApp({
  template: `
        <div>{{name}}</div>
        `,
  setup(props, context) {
    const { reactive, readonly, toRefs } = Vue;
    const nameObj = reactive({ name: "hello" });
    setTimeout(() => {
      nameObj.name = "world";
    }, 2000);
    const { name } = toRefs(nameObj);
    return {
      name,
    };
  },
});

const vm = app.mount("#root");
```

# 8\. toRef 以及 context

`toRef` 将属性转换成响应式引用

```js
const app = Vue.createApp({
  template: `
        <div>name: {{name}}, age: {{age}}</div>
        `,
  setup(props, context) {
    const { reactive, toRef } = Vue;
    const data = reactive({
      name: "hello",
      age: 0,
    });
    const name = toRef(data, "name");
    const age = toRef(data, "age");
    setTimeout(() => {
      age.value = "20";
    }, 2000);
    return { name, age };
  },
});

const vm = app.mount("#root");
```

`context` 中 `slots`

```js
const app = Vue.createApp({
  template: `
            <child>parent</child>
        `,
});

app.component("child", {
  setup(props, context) {
    const { h } = Vue;
    const { attrs, slots, emit } = context;
    // console.log(attrs.app);  // None-Props 属性
    return () => h("div", {}, slots.default());
  },
});

const vm = app.mount("#root");
```

`context` 中 `emit`

```js
const app = Vue.createApp({
  methods: {
    handleChange() {
      alert("change");
    },
  },
  template: `
            <child @change="handleChange">parent</child>
        `,
});

app.component("child", {
  template: '<div @click="handleClick">123</div>',
  setup(props, context) {
    const { h } = Vue;
    const { attrs, slots, emit } = context;
    function handleClick() {
      emit("change");
    }
    return { handleClick };
  },
});

const vm = app.mount("#root");
```

# 9\. 计算属性 computed

使用 composition api 配合 `computed`

```js
const app = Vue.createApp({
  setup() {
    const { ref, computed } = Vue;
    const count = ref(0);
    const handleClick = () => {
      count.value += 1;
    };
    // const countAddFive = computed(() => {
    //     return count.value + 5;
    // });
    let countAddFive = computed({
      get: () => {
        return count.value + 5;
      },
      set: (param) => {
        count.value = param - 5;
      },
    });
    setTimeout(() => {
      countAddFive.value = 100;
    }, 2000);
    return {
      count,
      handleClick,
      countAddFive,
    };
  },
  template: `
            <div>
                <span @click="handleClick">{{count}}</span> -- {{countAddFive}}
            </div>
        `,
});

const vm = app.mount("#root");
```

# 10\. 侦听器 watch 和 watchEffect

`watch` 具备一定的惰性，参数可以拿到当前值和之前值

```js
const app = Vue.createApp({
  setup() {
    const { reactive, watch, toRefs } = Vue;
    const nameObj = reactive({ name: "hello" });
    watch(
      () => nameObj.name,
      (currentValue, preValue) => {
        console.log(currentValue, preValue);
      }
    );
    const { name } = toRefs(nameObj);
    return { name };
  },
  template: `
            <div>
                <div>
                    Name: <input v-model="name"/>
                </div>
                <div>
                    Name is {{ name }}
                </div>
            </div>
        `,
});

const vm = app.mount("#root");
```

一个侦听多个数据的变化

```js
const app = Vue.createApp({
  setup() {
    const { reactive, watch, toRefs } = Vue;
    const nameObj = reactive({ name: "hello", englishName: "world" });
    watch([() => nameObj.name, () => nameObj.englishName], ([curName, curEng], [preName, preEng]) => {
      console.log(curName, preName, "---", curEng, preEng);
    });
    const { name, englishName } = toRefs(nameObj);
    return { name, englishName };
  },
  template: `
            <div>
                <div>
                    Name: <input v-model="name"/>
                </div>
                <div>
                    Name is {{ name }}
                </div>
                <div>
                    English Name: <input v-model="englishName"/>
                </div>
                <div>
                    English Name is {{ englishName }}
                </div>
            </div>
        `,
});

const vm = app.mount("#root");
```

watch 和 watchEffect 的区别：

- watchEffect 没有惰性，立即执行，即代码一加载就执行；
- 不需要传递要侦听的内容，自动会感知代码依赖，不需要传递很多参数，只要传递一个回调函数
- 不能获取之前数据的值

```js
const app = Vue.createApp({
  setup() {
    const { reactive, watch, watchEffect, toRefs } = Vue;
    const nameObj = reactive({ name: "hello", englishName: "world" });
    // watch([() => nameObj.name, () => nameObj.englishName], ([curName, curEng], [preName, preEng]) => {
    //     console.log(curName, preName, '---', curEng, preEng);
    // }, { immediate: true });
    const stop = watchEffect(() => {
      console.log("nameObj.name", nameObj.name);
      setTimeout(() => {
        stop();
      }, 5000);
    });
    const { name, englishName } = toRefs(nameObj);
    return { name, englishName };
  },
  template: `
            <div>
                <div>
                    Name: <input v-model="name"/>
                </div>
                <div>
                    Name is {{ name }}
                </div>
                <div>
                    English Name: <input v-model="englishName"/>
                </div>
                <div>
                    English Name is {{ englishName }}
                </div>
            </div>
        `,
});

const vm = app.mount("#root");
```

# 11\. 生命周期函数

`mounted` => `onMounted` `beforeUpdate` => `onBeforeUpdate` ...

`setup` 执行在 `beforeCreate` 和 `created` 之间，所以没有这 2 个函数对应的 composition api 生命周期函数。

`onRenderTracked` 渲染后收集响应式的依赖。 `onRenderTriggered` 每次重新渲染被触发的时候。

```js
const app = Vue.createApp({
  template: `
        <div>Hello world</div>
        `,
  setup() {
    const {
      onBeforeMount,
      onMounted,
      onBeforeUpdate,
      onUpdated,
      onBeforeUnmount,
      onUnmounted,
      onRenderTracked,
      onRenderTriggered,
    } = Vue;
    onBeforeMount(() => {
      console.log("onBeforeMount");
    });
  },
});

const vm = app.mount("#root");
```

# 12\. provide inject ref 用法

使用 `readonly` 处理单向数据流

```js
const app = Vue.createApp({
  template: `
        <div>
            <child />
        </div>
        `,
  setup() {
    const { provide, ref, readonly } = Vue;
    const name = ref("hello");
    provide("name", readonly(name));
    provide("changeName", (value) => {
      name.value = value;
    });
    return {};
  },
});

app.component("child", {
  setup() {
    const { inject } = Vue;
    const name = inject("name");
    const changeName = inject("changeName");
    const handleClick = () => {
      changeName("world");
    };
    return { name, handleClick };
  },
  template: `<div @click="handleClick">{{name}}</div>`,
});

const vm = app.mount("#root");
```

获取真实的 DOM 元素节点

```js
const app = Vue.createApp({
  template: `
        <div>
            <div ref="hello">hello world</div>
        </div>
        `,
  setup() {
    const { ref, onMounted } = Vue;
    const hello = ref(null);
    onMounted(() => {
      console.log(hello.value);
    });
    return { hello };
  },
});

const vm = app.mount("#root");
```
