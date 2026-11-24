# Assignment 2 — A Vue page built with WorkBuddy

IN3288 Web Front-End Design · Assignment 2 (in-class task)

A single-page application created with **Vite + Vue 3** and written by the
**WorkBuddy** AI agent (VS Code · Git · Node.js · Gitee).

## What the page demonstrates

- **Interpolation** — `{{ count }}`, `{{ progress }}`
- **`v-model`** — two-way binding on the name input (with `.trim`)
- **`v-bind` shorthand** — `:name`, `:checked`, `:style`, `:key`
- **`v-on` shorthand** — `@click`, `@change`, including the `.once` modifier
- **`v-for`** — list rendering with a stable `:key` from the data
- **`ref` / `computed`** — reactive state and a derived progress value
- **Components & props** — `GreetingCard.vue` receives `name` down from `App.vue`

## Structure

```
src/
├── App.vue                     # main page (state, events, list rendering)
├── components/
│   └── GreetingCard.vue        # child component (props)
├── main.js                     # app entry, mounts #app
├── style.css                   # global styles
└── assets/
```

## Run it

```bash
npm install
npm run dev      # development server
npm run build    # production build
npm run preview  # preview the build
```

## Submit to Gitee

```bash
git remote add origin https://gitee.com/<your-username>/vue-workbuddy-page.git
git push -u origin master
```
