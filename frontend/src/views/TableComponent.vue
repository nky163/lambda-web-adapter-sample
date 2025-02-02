<script setup lang="ts" generic="T">
defineProps<{
  headers: string[]
  rows: T[];
}>()
</script>

<template>
  <table border="1">
    <thead>
      <tr>
        <th v-for="(header, index) in headers" :key="index">
          {{ header }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, rowIndex) in rows" :key="rowIndex">
        <slot name="cell" :row="row" :rowIndex="rowIndex"></slot>
      </tr>
    </tbody>
  </table>
</template>


