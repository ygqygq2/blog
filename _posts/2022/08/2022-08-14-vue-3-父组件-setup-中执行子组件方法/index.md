---
title: "Vue 3 父组件 setup 中执行子组件方法"
date: "2022-08-14"
categories: 
  - "develop"
tags: 
  - "vue"
---

Vue 3 父组件调用子组件方法，可以在生命周期函数中直接调用：

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport"
    content="width=device-width, initial-scale=1.0, maximum-scale=1, minimum-scale=1, user-scalable=no">
  <title>父组件调用子组件方法</title>
  <script src="https://cdn.bootcdn.net/ajax/libs/vue/3.2.37/vue.global.js"></script>
</head>
<div id="root"></div>

<body>

</body>
<script>
  const app = Vue.createApp({
    template: `
    <div>
    父页面
      <child ref="sonRef"/>
      <button @click="handleClick">test</button>
    </div>
  `,
    setup() {
      const { ref, onMounted } = Vue;
      const sonRef = ref();

      const handleClick = () => {
        sonRef.value.song();
      }

      onMounted(() => {
        console.log('这里执行子组件方法', sonRef.value.song());
      });

      return { sonRef, handleClick }
    }
  });

  app.component('child', {
    template: `
      <div>
        子页面
      </div>
    `,
    setup() {
      const song = () => alert('hello world');

      return {
        song,
      }

    }
  });
  app.mount('#root');
</script>

</html>
```
