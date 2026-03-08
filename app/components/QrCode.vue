<script setup lang="ts">
import QRCode from 'qrcode'

const props = defineProps<{
  value: string
  size?: number
}>()

const canvas = ref<HTMLCanvasElement>()
const size = computed(() => props.size || 160)

watch(() => props.value, render, { immediate: true })

async function render() {
  await nextTick()
  if (!canvas.value) return
  await QRCode.toCanvas(canvas.value, props.value, {
    width: size.value,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  })
}

onMounted(render)
</script>

<template>
  <canvas ref="canvas" class="rounded-xl" :width="size" :height="size" />
</template>
