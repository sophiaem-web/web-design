<script setup>
// A tiny child component: receives data down via a prop
// (declared with its type) and renders it.
defineProps({
  name: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="greeting">
    <p>
      Hello, <strong>{{ name }}</strong>! 👋 This card is its own component —
      the name travels down from <code>App.vue</code> as a prop.
    </p>
  </div>
</template>

<style scoped>
.greeting {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  padding: 1rem 1.25rem;
  color: #166534;
}
.greeting p {
  margin: 0;
  line-height: 1.6;
}
</style>
