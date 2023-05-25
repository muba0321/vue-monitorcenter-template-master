<template>
  <div class="bubble-view">
    <Bubble v-for="(system, index) in systems" :key="index" :title="system.title" :content="system.content"></Bubble>
  </div>
</template>

<script>
import Bubble from './BubbleView.vue'

export default {
  components: {
    Bubble
  },
  props: {
    systems: Array
  }
}
</script>

<style scoped>
.bubble-view {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
</style>
