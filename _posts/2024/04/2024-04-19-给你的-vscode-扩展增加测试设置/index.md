---
title: "给你的 vscode 扩展增加测试设置"
date: "2024-04-19"
categories: 
  - "develop"
tags: 
  - "extension"
  - "test"
  - "vscode"
---

\# 1. 目的

vscode 作为当前最多人使用的编辑器和开发工具，其最强大之处就是有成熟的插件社区，但是使用过程中难免就会遇到插件功能不够称心或者插件不维护的情况。

随着 typescript 的越来越普及，很多人都会 ts，那为何不自己开发或者二次开发称心如意的插件呢？而插件的开发就需要测试，手工测试难免遗漏，那就给 vscode 扩展加上单元、集成测试吧。

\[Mocha\](https://mochajs.org/) 作为 vscode 官方测试工具 \[vscode-test\](https://github.com/microsoft/vscode-test-cli) 的默认框架，必须编译成 js 后才可以测试，我是不大爽的，奈何 vscode 扩展集成测试必须使用它，但是单元测试可以使用 \[jest\](https://jestjs.io/) / \[vitest\](https://vitest.dev/) 直接来测试 ts 代码。

本文使用插件 【\[turbo-file-header\](https://github.com/ygqygq2/turbo-file-header)】 仓库作为示例来讲解 \[vitest 作为 vscode 扩展单元测试\](#2-vitest-作为-vscode-扩展单元测试)、\[vscode-test 集成测试\](#3-vscode-test-集成测试)、\[mocha 自定义脚本集成测试\](#4-自定义-runner-集成测试)。

\# 2. vitest 作为 vscode 扩展单元测试 单元测试使用 \`.spec.ts\` 作为测试文件和后缀集成测试区分开来。使用 \[jest-mock-vscode\](https://github.com/streetsidesoftware/jest-mock-vscode) npm 包来整合 vitest，其使用说明我不再作详细说明，我这里列一下我的 \`vite.config.ts\` 配置：

\`vite.config.ts\`：

\`\`\` /// import path from 'path';

import { defineConfig } from 'vite';

export default defineConfig({ plugins: \[\], resolve: { alias: \[ { find: /^~(.+)/, replacement: path.join(process.cwd(), 'node\_modules/$1'), }, { find: /^@\\/(.+)/, replacement: path.join(process.cwd(), 'src/$1'), }, \], }, test: { include: \['src/test/unit/\*\*/\*.spec.ts'\], coverage: { exclude: \['node\_modules', 'out', 'src/test', 'src/typings', '.vscode-test'\], }, }, }); \`\`\`

\`package.json\` scripts 设置：

\`\`\` "test:unit": "vitest unit --watch=false", "test:coverage": "vitest run --coverage", \`\`\`

\`tsconfig.json\` 中的别名设置：

\`\`\` "paths": { "@/\*": \["src/\*"\] }, \`\`\`

\# 3. vscode-test 集成测试 集成测试使用 \`.test.ts\` 作为测试文件后缀和集成测试区分开来。\[vscode-test-cli\](https://github.com/microsoft/vscode-test-cli/) 配置我不再作详细说明，这里列一下 \`.vscode-test.mjs\` 配置中的 mocha 别名支持 \`require\` 配置，当然要安装 \`ts-node\` \`tsconfig-paths\` 这两个 npm 包。

\`\`\` mocha: { ui: 'bdd', require: \['ts-node/register', 'tsconfig-paths/register'\], }, \`\`\`

断点调试的 \`launch.json\` 配置：(因为 \`.vscode-test.mjs\` 有 \`launchArgs\` 配置，断点配置以 args 为准，为了不冲突，建议单独弄一个配置，我这里使用 \`.vscode-test-debug.mjs\` )

\`launch.json\`:

\`\`\` { "name": "Test: e2e", "type": "extensionHost", "request": "launch", "runtimeExecutable": "${execPath}", "testConfiguration": "${workspaceFolder}/.vscode-test-debug.mjs", "args": \[ "${workspaceFolder}/sampleWorkspace/test.code-workspace", "--extensionDevelopmentPath=${workspaceFolder}", "--disable-extensions" \], "env": { "mode": "debug", "TS\_NODE\_PROJECT": "${workspaceFolder}/tsconfig.json" }, "preLaunchTask": "npm: test-compile", "sourceMaps": true }, \`\`\`

\`package.json\` scripts 设置：（扩展编译是使用的 esbuild 设置的 compile 命令，测试文件使用 tsc 编译）

\`\`\` "clean": "rimraf out/", "test-compile": "npm run clean && tsc -p ./ && npm run compile", "test": "npm run test-compile && vscode-test", \`\`\`

\# 4. 自定义 Runner 集成测试

根据官方说明\[设置自定义 Runner\](https://code.visualstudio.com/api/working-with-extensions/testing-extension#advanced-setup-your-own-runner) 和我的仓库示例，跟着配置即可。这里列一下我的断点配置：

\`launch.json\`:

\`\`\` { "name": "Test: e2e use mocha", "type": "extensionHost", "request": "launch", "runtimeExecutable": "${execPath}", "args": \[ "${workspaceFolder}/sampleWorkspace/test.code-workspace", "--disable-extensions", "--extensionDevelopmentPath=${workspaceFolder}", "--extensionTestsPath=${workspaceFolder}/out/test/suite/index" \], "env": { "NODE\_ENV": "test", "TS\_NODE\_PROJECT": "${workspaceFolder}/tsconfig.json" }, "outFiles": \["${workspaceFolder}/out/test/\*\*/\*.js"\], "preLaunchTask": "npm: test-compile", "sourceMaps": true }, \`\`\`

\`package.json\` scripts 设置：（扩展编译是使用的 esbuild 设置的 compile 命令，测试文件使用 tsc 编译）

\`\`\` "clean": "rimraf out/", "test-compile": "npm run clean && tsc -p ./ && npm run compile", "test:suite:mocha": "npm run test-compile && node out/test/runTests.js", \`\`\`

\# 5. 小结

因为是使用真实实例作集成测试，感觉性能有些低，有些操作要等待点时间才能得到正确结果，所以测试文件中可以考虑适当加个 sleep 函数(timtout 等待)来等待正确结果。

期待以后的版本可以使用 jest 或者 vitest 代替 mocha 集成测试。

参考资料：

\[1\] https://code.visualstudio.com/api/working-with-extensions/testing-extension \[2\] https://github.com/microsoft/vscode-test-cli \[3\] https://github.com/microsoft/vscode-extension-samples/tree/main/helloworld-test-cli-sample \[4\] https://github.com/microsoft/vscode-extension-samples/tree/main/helloworld-test-sample \[5\] https://github.com/streetsidesoftware/jest-mock-vscode \[6\] https://github.com/prettier/prettier-vscode \[7\] https://github.com/ygqygq2/turbo-file-header
