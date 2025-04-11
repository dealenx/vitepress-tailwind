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
        const postcssConfigPath = getConfigPath('postcss.config');

        fs.writeFileSync(
            tailwindConfigPath,
            `export default ${JSON.stringify(tailwindConfig, null, 2)}`
        );

        // Создаем конфигурацию PostCSS
        const postcssConfig = {
            plugins: {
                tailwindcss: {},
                autoprefixer: {},
            },
        };

        fs.writeFileSync(
            postcssConfigPath,
            `export default ${JSON.stringify(postcssConfig, null, 2)}`
        );

        // Обновляем конфигурацию VitePress
        console.log('⚙️ Настройка VitePress...');

        const vitepressConfigPath = getConfigPath('.vitepress/config');
        const vitepressConfig = fs.readFileSync(vitepressConfigPath, 'utf-8');

        const updatedConfig = vitepressConfig.replace(
            'export default defineConfig({',
            `export default defineConfig({
  vite: {
    css: {
      postcss: {
        plugins: [
          (await import('tailwindcss')).default,
          (await import('autoprefixer')).default,
        ],
      },
    },
  },`
        );

        fs.writeFileSync(vitepressConfigPath, updatedConfig);

        // Создаем глобальный CSS файл
        const globalCssPath = '.vitepress/theme/style.css';
        fs.writeFileSync(
            globalCssPath,
            `@tailwind base;
@tailwind components;
@tailwind utilities;`
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