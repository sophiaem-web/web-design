<script setup>
import { ref, computed } from 'vue'
import GreetingCard from './components/GreetingCard.vue'

// reactive state
const visitorName = ref('')
const count = ref(0)
const skills = ref([
  { id: 1, name: 'HTML & CSS', done: true },
  { id: 2, name: 'JavaScript', done: true },
  { id: 3, name: 'Vue 3 (Composition API)', done: true },
  { id: 4, name: 'Vue Router & Pinia', done: false },
  { id: 5, name: 'Express + SQLite (Experiment 3)', done: false },
])

// computed property: derived from state
const progress = computed(() => {
  const done = skills.value.filter((s) => s.done).length
  return Math.round((done / skills.value.length) * 100)
})

// methods called from the template with @click
function increment() {
  count.value++
}
function reset() {
  count.value = 0
}
function toggleSkill(id) {
  const skill = skills.value.find((s) => s.id === id)
  if (skill) skill.done = !skill.done
}
</script>

<template>
  <div class="page">
    <header class="hero">
      <p class="badge">Assignment 2 · In-class task</p>
      <h1>A Vue page, built by an agent</h1>
      <p class="subtitle">
        This single-page application was scaffolded with Vite and written by
        <strong>WorkBuddy</strong>, an AI agent. It demonstrates the core Vue 3
        template syntax: interpolation, <code>v-model</code>,
        <code>v-for</code>, <code>v-bind</code>, <code>v-on</code> and
        computed properties.
      </p>
    </header>

    <main>
      <!-- v-model two-way binding on the input -->
      <section class="card">
        <h2>1 · Two-way binding</h2>
        <p>Type your name — the card below updates instantly via <code>v-model</code>.</p>
        <input
          v-model.trim="visitorName"
          type="text"
          placeholder="Your name…"
          aria-label="Your name"
        />
        <!-- passing data down with props -->
        <GreetingCard :name="visitorName || 'stranger'" />
      </section>

      <section class="card">
        <h2>2 · Events</h2>
        <p>Bound with the <code>v-on</code> shorthand <code>@click</code>.</p>
        <div class="counter-row">
          <button @click="increment">Clicked {{ count }} times</button>
          <button class="ghost" @click.once="reset">Reset (once)</button>
        </div>
      </section>

      <section class="card">
        <h2>3 · List rendering &amp; computed</h2>
        <p>
          Rendered with <code>v-for</code> and a stable <code>:key</code>.
          Progress is a computed property — currently
          <strong>{{ progress }}%</strong>.
        </p>
        <div class="bar"><div class="bar-fill" :style="{ width: progress + '%' }"></div></div>
        <ul class="skills">
          <li v-for="skill in skills" :key="skill.id">
            <label>
              <input type="checkbox" :checked="skill.done" @change="toggleSkill(skill.id)" />
              <span :class="{ done: skill.done }">{{ skill.name }}</span>
            </label>
          </li>
        </ul>
      </section>
    </main>

    <footer>
      <p>
        IN3288 Web Front-End Design · Experiment 2 · Built with
        VS Code, Node, Git and WorkBuddy
      </p>
    </footer>
  </div>
</template>

<style scoped>
.page {
  max-width: 760px;
  margin: 0 auto;
  padding: 2.5rem 1.25rem 3rem;
}
.hero {
  text-align: center;
  margin-bottom: 2.5rem;
}
.badge {
  display: inline-block;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #2563eb;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 999px;
  padding: 0.3rem 0.9rem;
  margin-bottom: 1rem;
}
h1 {
  font-size: 2.2rem;
  margin: 0 0 0.75rem;
  color: #111827;
}
.subtitle {
  color: #4b5563;
  line-height: 1.7;
}
.card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 1.5rem 1.75rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.card h2 {
  margin-top: 0;
  font-size: 1.15rem;
  color: #111827;
}
.card p {
  color: #4b5563;
}
input[type='text'] {
  width: 100%;
  padding: 0.6rem 0.9rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  margin-bottom: 1rem;
  box-sizing: border-box;
}
input[type='text']:focus {
  outline: 2px solid #2563eb;
  outline-offset: 1px;
  border-color: #2563eb;
}
.counter-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
button {
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
}
button:hover {
  background: #1d4ed8;
}
button.ghost {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}
button.ghost:hover {
  background: #e5e7eb;
}
.bar {
  height: 10px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
  margin: 0.5rem 0 1rem;
}
.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #2563eb, #10b981);
  border-radius: 999px;
  transition: width 0.3s ease;
}
.skills {
  list-style: none;
  padding: 0;
  margin: 0;
}
.skills li {
  padding: 0.45rem 0;
  border-bottom: 1px dashed #e5e7eb;
}
.skills li:last-child {
  border-bottom: none;
}
.skills label {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
}
.skills .done {
  text-decoration: line-through;
  color: #9ca3af;
}
footer {
  text-align: center;
  color: #9ca3af;
  font-size: 0.85rem;
  margin-top: 2rem;
}
</style>
