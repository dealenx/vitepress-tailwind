#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Function for requesting user input
function promptUser(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

// Function for interactive Yes/No selection with arrow keys
function promptYesNo(question) {
    const stdin = process.stdin;
    const stdout = process.stdout;

    // Set raw mode to get keypresses
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    let selectedOption = true; // true = Yes, false = No

    // Display question with diamond symbol
    stdout.write(`\n\x1b[36m◆ ${question}\x1b[0m\n`);

    // Function to render options
    const renderOptions = () => {
        stdout.write('\r\x1b[K'); // Clear line
        if (selectedOption) {
            stdout.write('\x1b[32m● Yes\x1b[0m / \x1b[90m○ No\x1b[0m');
        } else {
            stdout.write('\x1b[90m○ Yes\x1b[0m / \x1b[32m● No\x1b[0m');
        }
        // Hide cursor
        stdout.write('\x1b[?25l');
    };

    renderOptions();

    return new Promise((resolve) => {
        // Handle key presses
        stdin.on('data', (key) => {
            // Handle arrow keys, y/n, and enter
            if (key === '\u001B\u005B\u0044' || key === '\u001B\u005B\u0043' ||
                key.toLowerCase() === 'y' || key.toLowerCase() === 'n') { // Left/Right arrow or y/n
                selectedOption = !selectedOption;
                if (key.toLowerCase() === 'y') selectedOption = true;
                if (key.toLowerCase() === 'n') selectedOption = false;
                renderOptions();
            } else if (key === '\r' || key === '\n') { // Enter
                stdout.write('\n');
                // Show cursor before completion
                stdout.write('\x1b[?25h');
                stdin.setRawMode(false);
                stdin.pause();
                resolve(selectedOption);
            } else if (key === '\u0003') { // Ctrl+C
                // Show cursor before exit
                stdout.write('\x1b[?25h');
                process.exit();
            }
        });
    });
}

// Function to print help information
function printHelp() {
    console.log(`
🌟 @dealenx/vitepress-tailwind CLI 🌟

Commands:
  npx @dealenx/vitepress-tailwind [project_name]
  npx @dealenx/vitepress-tailwind init [project_name]

Examples:
  npx @dealenx/vitepress-tailwind my-docs
  npx @dealenx/vitepress-tailwind init my-docs
`);
}

async function main() {
    try {
        // Parse command line arguments
        const args = process.argv.slice(2);
        let projectName;

        if (args.length === 0) {
            printHelp();
            process.exit(0);
        }

        // Check for help command
        if (args[0] === '--help' || args[0] === '-h') {
            printHelp();
            process.exit(0);
        }

        // Check for init command
        if (args[0] === 'init') {
            projectName = args[1];
        } else {
            projectName = args[0];
        }

        if (!projectName) {
            console.error('❌ Please specify a project name');
            printHelp();
            process.exit(1);
        }

        console.log('🚀 Creating VitePress project with Tailwind CSS...');

        // Create project directory
        if (!fs.existsSync(projectName)) {
            fs.mkdirSync(projectName);
        }
        process.chdir(projectName);

        // Initialize VitePress
        console.log('📦 Initializing VitePress...');
        execSync('npx vitepress init', { stdio: 'inherit' });

        // Check if .vitepress folder was created
        if (!fs.existsSync('.vitepress')) {
            console.log('⚠️ Folder .vitepress not found. Skipping template setup...');
            console.log('📝 You can run the script again when the .vitepress folder is created.');
            process.exit(0);
        }

        // Update package.json
        console.log('📦 Updating package.json...');
        const packageJsonPath = 'package.json';
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

        // Add or update devDependencies
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

        // Create Tailwind configuration
        console.log('⚙️ Setting up Tailwind CSS...');
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

        // Check existing configuration files
        const getConfigPath = (baseName) => {
            const extensions = ['.mts', '.mjs', '.ts', '.js'];
            for (const ext of extensions) {
                const path = `${baseName}${ext}`;
                if (fs.existsSync(path)) return path;
            }
            return `${baseName}.js`; // Default to .js
        };

        const tailwindConfigPath = getConfigPath('tailwind.config');

        fs.writeFileSync(
            tailwindConfigPath,
            `export default ${JSON.stringify(tailwindConfig, null, 2)}`
        );

        // Create PostCSS configuration
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

        // Update VitePress configuration
        console.log('⚙️ Configuring VitePress...');

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
            console.log('⚠️ VitePress configuration file not found. Skipping configuration update...');
        }

        // Create theme directory if it doesn't exist
        if (!fs.existsSync('.vitepress/theme')) {
            fs.mkdirSync('.vitepress/theme', { recursive: true });
        }

        // Create tailwind.css file
        fs.writeFileSync(
            '.vitepress/theme/tailwind.css',
            `@import "tailwindcss";`
        );

        // Update index.ts/js in theme
        const themeIndexPath = fs.existsSync('.vitepress/theme/index.ts')
            ? '.vitepress/theme/index.ts'
            : '.vitepress/theme/index.js';

        if (fs.existsSync(themeIndexPath)) {
            let themeContent = fs.readFileSync(themeIndexPath, 'utf-8');

            // Check if CSS file is already imported
            if (themeContent.includes("import './style.css'")) {
                themeContent = themeContent.replace(
                    "import './style.css'",
                    "import './style.css'\nimport './tailwind.css'"
                );
            } else {
                // Add import at the beginning of the file
                themeContent = "import './tailwind.css'\n" + themeContent;
            }

            fs.writeFileSync(themeIndexPath, themeContent);
        } else {
            // If file doesn't exist, create it
            fs.writeFileSync(
                '.vitepress/theme/index.js',
                `import './tailwind.css'

export default {}`
            );
        }

        // Create .gitignore
        console.log('📦 Creating .gitignore...');
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

        // Ask whether to add rules for Cursor
        const addCursorRules = await promptYesNo('Add rules for Cursor editor?');

        if (addCursorRules) {
            console.log('📦 Creating Cursor rules...');

            // Create .cursor/rules directory if it doesn't exist
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
        }

        console.log('✅ Project successfully created!');
        console.log('\n📝 Next steps:');
        console.log('1. Navigate to project directory: cd ' + projectName);
        console.log('2. Install dependencies: npm install');
        console.log('3. Run the project: npm run dev');
        console.log('4. Open http://localhost:5173 in your browser');

    } catch (error) {
        console.error('❌ Error creating project:', error);
        process.exit(1);
    }
}

main(); 