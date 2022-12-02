<template>
  <div>
    <Button @click="test">test</Button>
  </div>
</template>

<script setup lang="ts">
const test = async () => {
  const resp = await useFetch('/api/test', {
    method: 'post',
  })

  console.log(resp.data.value)
}
</script>

<style scoped></style>
