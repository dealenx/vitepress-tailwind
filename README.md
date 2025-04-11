# VitePress + Tailwind CSS Starter

A template for quickly starting a project with [VitePress](https://vitepress.dev/) and [Tailwind CSS v4](https://tailwindcss.com/).

## Features

- 🚀 Tailwind CSS v4 integration
- ⚡️ Optimized VitePress configuration
- 🧩 Ready-to-use project structure
- 🖌️ Responsive design out of the box

## Usage

### Creating a new project

```bash
# Using npx
npx @dealenx/vitepress-tailwind my-docs

# Or with the init command
npx @dealenx/vitepress-tailwind init my-docs
```

### Running the project

```bash
cd my-docs
npm install
npm run docs:dev
```

## Development

For local development and testing of the template:

```bash
git clone https://github.com/dealenx/vitepress-tailwind.git
cd vitepress-tailwind
yarn install
yarn run dev
```


### Using Tailwind in Markdown

You can use Tailwind CSS classes directly in your Markdown content with the `:::raw` directive:

```md
:::raw
<div class="overflow-hidden">
    <div class="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div class="relative mx-auto max-w-4xl grid space-y-5 sm:space-y-10">
            <!-- Title -->
            <div class="text-center">
                <p class="text-xs font-semibold text-gray-500 uppercase mb-3">
                    Hello, Friend!
                </p>
                <h1 class="text-3xl text-gray-800 font-bold sm:text-5xl lg:text-6xl lg:leading-tight">
                    Your are looking at <span class="text-blue-500">Tailwind Content</span>
                </h1>
            </div>
        </div>
    </div>
</div>
:::
```

This approach allows you to create complex and responsive layouts directly in your Markdown files, using the full power of Tailwind CSS.

### Importing External Components

You can also import and use external components through the `:::raw` directive, which is **especially important** for proper rendering:

```md
<script setup>
import Sigma from './.vitepress/theme/components/Sigma.vue'
</script>

:::raw
<Sigma />
:::
```

The `:::raw` directive allows the component to be displayed without special processing by VitePress. **This is a key feature** for correctly displaying Vue components within Markdown, as it prevents the component's HTML markup from being converted to plain text.

## Подключение Tailwind CSS к существующему проекту VitePress

Если у вас уже есть проект VitePress и вы хотите добавить в него поддержку Tailwind CSS v4, выполните следующие шаги:

### 1. Установите необходимые зависимости

```bash
# Используя npm
npm install -D @tailwindcss/postcss@^4.1.3 @tailwindcss/vite@^4.1.3 tailwindcss@^4.1.3
```
через yarn:
```bash
yarn add -D @tailwindcss/postcss@^4.1.3 @tailwindcss/vite@^4.1.3 tailwindcss@^4.1.3
```

### 2. Создайте конфигурацию PostCSS

Создайте файл `postcss.config.mjs` в корне проекта:

```js
import { postcssIsolateStyles } from 'vitepress'

export default {
    plugins: [
        postcssIsolateStyles({
            includeFiles: [/vp-doc\.css/, /base\.css/]
        })
    ]
}
```

### 3. Обновите конфигурацию VitePress

Откройте файл `.vitepress/config.js` (или `.ts`) и обновите его, добавив плагин Tailwind CSS:

```js
import { defineConfig } from "vitepress";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // Ваша существующая конфигурация
  vite: {
    plugins: [tailwindcss()],
  },
});
```

### 4. Создайте CSS-файл Tailwind

Создайте директорию `.vitepress/theme`, если она не существует, и добавьте файл `tailwind.css`:

```bash
mkdir -p .vitepress/theme
```

Содержимое файла `.vitepress/theme/tailwind.css`:

```css
@import "tailwindcss";
```

### 5. Подключите Tailwind CSS в теме VitePress

Откройте или создайте файл `.vitepress/theme/index.js` (или `.ts`):

```js
import "./tailwind.css";
import DefaultTheme from "vitepress/theme";

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {},
};
```

### 6. Проверьте интеграцию

Запустите сервер разработки, чтобы проверить, что Tailwind CSS интегрирован корректно:

```bash
npm run docs:dev
# или с yarn
yarn docs:dev
```

Теперь вы можете использовать классы Tailwind в своих Markdown-файлах с помощью директивы `:::raw`:

```md
:::raw
<div class="bg-blue-500 text-white p-4 rounded-lg">
  Это блок, стилизованный с помощью Tailwind CSS
</div>
:::
```

