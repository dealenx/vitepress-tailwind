#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
    try {
        console.log('🚀 Начинаем создание проекта VitePress с Tailwind CSS...');

        // Запрашиваем имя проекта
        const projectName = process.argv[2];
        if (!projectName) {
            console.error('❌ Пожалуйста, укажите имя проекта');
            process.exit(1);
        }

        // Создаем директорию проекта
        if (!fs.existsSync(projectName)) {
            fs.mkdirSync(projectName);
        }
        process.chdir(projectName);

        // Инициализируем VitePress
        console.log('📦 Инициализация VitePress...');
        execSync('npx vitepress init', { stdio: 'inherit' });

        // Проверяем, создана ли папка .vitepress
        if (!fs.existsSync('.vitepress')) {
            console.log('⚠️ Папка .vitepress не найдена. Пропускаем настройку шаблона...');
            console.log('📝 Вы можете запустить скрипт еще раз, когда папка .vitepress будет создана.');
            process.exit(0);
        }

        // Обновляем package.json
        console.log('📦 Обновление package.json...');
        const packageJsonPath = 'package.json';
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

        // Добавляем или обновляем devDependencies
        packageJson.devDependencies = {
            ...packageJson.devDependencies,
            "vitepress": "^1.6.3",
            "vue": "^3.3.4",
            '@tailwindcss/postcss': '^4.1.3',
            '@tailwindcss/vite': '^4.1.3',
            'tailwindcss': '^4.1.3'
        };

        fs.writeFileSync(
            packageJsonPath,
            JSON.stringify(packageJson, null, 2)
        );

        // Создаем конфигурацию Tailwind
        console.log('⚙️ Настройка Tailwind CSS...');
        const tailwindConfig = {
            content: [
                './docs/**/*.{vue,js,ts,jsx,tsx,md}',
                './.vitepress/**/*.{vue,js,ts,jsx,tsx,md}',
            ],
            theme: {
                extend: {},
            },
            plugins: [],
        };

        // Проверяем существующие конфигурационные файлы
        const getConfigPath = (baseName) => {
            const extensions = ['.mts', '.mjs', '.ts', '.js'];
            for (const ext of extensions) {
                const path = `${baseName}${ext}`;
                if (fs.existsSync(path)) return path;
            }
            return `${baseName}.js`; // По умолчанию используем .js
        };

        const tailwindConfigPath = getConfigPath('tailwind.config');

        fs.writeFileSync(
            tailwindConfigPath,
            `export default ${JSON.stringify(tailwindConfig, null, 2)}`
        );

        // Создаем конфигурацию PostCSS
        fs.writeFileSync(
            'postcss.config.mjs',
            `import { postcssIsolateStyles } from 'vitepress'

export default {
    plugins: [
        postcssIsolateStyles({
            includeFiles: [/vp-doc\\.css/, /base\\.css/]
        })
    ]
}
`
        );

        // Обновляем конфигурацию VitePress
        console.log('⚙️ Настройка VitePress...');

        const vitepressConfigPath = getConfigPath('.vitepress/config');

        if (fs.existsSync(vitepressConfigPath)) {
            const configContent = `import { defineConfig } from "vitepress";
import tailwindcss from "@tailwindcss/vite";

// https://vitepress.vuejs.org/config/app-configs
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
});
`;

            fs.writeFileSync(vitepressConfigPath, configContent);
        } else {
            console.log('⚠️ Файл конфигурации VitePress не найден. Пропускаем обновление конфигурации...');
        }

        // Создаем директорию theme если её нет
        if (!fs.existsSync('.vitepress/theme')) {
            fs.mkdirSync('.vitepress/theme', { recursive: true });
        }

        // Создаем файл tailwind.css
        fs.writeFileSync(
            '.vitepress/theme/tailwind.css',
            `@import "tailwindcss";`
        );

        // Обновляем index.ts/js в theme
        const themeIndexPath = fs.existsSync('.vitepress/theme/index.ts')
            ? '.vitepress/theme/index.ts'
            : '.vitepress/theme/index.js';

        if (fs.existsSync(themeIndexPath)) {
            let themeContent = fs.readFileSync(themeIndexPath, 'utf-8');

            // Проверяем, есть ли уже импорт файла CSS
            if (themeContent.includes("import './style.css'")) {
                themeContent = themeContent.replace(
                    "import './style.css'",
                    "import './style.css'\nimport './tailwind.css'"
                );
            } else {
                // Добавляем импорт в начало файла
                themeContent = "import './tailwind.css'\n" + themeContent;
            }

            fs.writeFileSync(themeIndexPath, themeContent);
        } else {
            // Если файл не существует, создаем его
            fs.writeFileSync(
                '.vitepress/theme/index.js',
                `import './tailwind.css'

export default {}`
            );
        }

        // Создаем .gitignore
        console.log('📦 Создание .gitignore...');
        fs.writeFileSync(
            '.gitignore',
            `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local
.vitepress/cache
# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?`
        );

        // Создаем .cursor/rules директорию и main-rules.mdc файл
        console.log('📦 Создание правил для Cursor...');

        // Создаем директорию .cursor/rules если она не существует
        if (!fs.existsSync('.cursor')) {
            fs.mkdirSync('.cursor');
        }
        if (!fs.existsSync('.cursor/rules')) {
            fs.mkdirSync('.cursor/rules');
        }

        fs.writeFileSync(
            '.cursor/rules/main-rules.mdc',
            `"You are an expert in Node.js, Vitepress, Vue 3, and Tailwind v4.
      
      Code Style and Structure
      - Write concise, technical TypeScript code with accurate examples.
      - Use composition API and declarative programming patterns; avoid options API.
      - Prefer iteration and modularization over code duplication.
      - Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError).
      - Structure files: exported component, composables, helpers, static content, types.
      
      Naming Conventions
      - Use lowercase with dashes for directories (e.g., .vitepress/theme/components/auth-wizard).
      - Use PascalCase for component names (e.g., AuthWizard.vue).
      - Use camelCase for composables (e.g., useAuthState.ts).
      
      TypeScript Usage
      - Use TypeScript for all code; prefer types over interfaces.
      - Avoid enums; use const objects instead.
      - Use Vue 3 with TypeScript, leveraging defineComponent and PropType.
      
      Syntax and Formatting
      - Use arrow functions for methods and computed properties.
      - Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements.
      - Use template syntax for declarative rendering.
      
      UI and Styling
      - Use  Tailwind for components and styling.
      - Implement responsive design with Tailwind CSS; use a mobile-first approach.
      
      
      Key Conventions
      - Optimize Web Vitals (LCP, CLS, FID).
      - Take into account the features of Vitapress, as the site is based on it. 

      
      Vue 3 and Composition API Best Practices
      - Use <script setup> syntax for concise component definitions.
      - Leverage ref, reactive, and computed for reactive state management.
      - Use provide/inject for dependency injection when appropriate.
      - Implement custom composables for reusable logic.
      
      Follow the official Vitepress and Vue.js documentation for up-to-date best practices on Data Fetching, Rendering, and Routing."`
        );

        console.log('✅ Проект успешно создан!');
        console.log('\n📝 Следующие шаги:');
        console.log('1. Перейдите в директорию проекта: cd ' + projectName);
        console.log('2. Установите зависимости: npm install');
        console.log('3. Запустите проект: npm run docs:dev');
        console.log('4. Откройте http://localhost:5173 в браузере');

    } catch (error) {
        console.error('❌ Ошибка при создании проекта:', error);
        process.exit(1);
    }
}

main(); 