
<script setup lang="ts">
import TableComponent from "./TableComponent.vue";

const headers = ["ID", "名前", "年齢", "操作"];
const rows = [
  { id: 1, name: "太郎", age: 25 },
  { id: 2, name: "花子", age: 30 },
  { id: 3, name: "次郎", age: 28 },
];

const handleClick = (id: number) => {
  alert(`ID: ${id} の詳細を表示`);
};
</script>


<template>
  <TableComponent :headers="headers" :rows="rows">
    <template #cell="{ row }">
      <td>{{ row.id }}</td>
      <td>
        <div>
          {{ row.age }}
        </div>
        <div>
          {{ row.name }}
        </div>
      </td>
      <td>
        <button @click="handleClick(row.id)">詳細</button>
      </td>
    </template>
  </TableComponent>
</template>
