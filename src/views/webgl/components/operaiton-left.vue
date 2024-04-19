<template>
    <filter-box class="operation-left">
        <ul>
            <li>区域名称1</li>
            <li>区域名称2</li>
        </ul>
    </filter-box>
</template>
<script lang="ts" setup>
import filterBox from './filter-box.vue';
</script>
<style scoped>
ul {
    padding: 0;
    margin: 0;
}

li {
    list-style: none;
    padding: 10px 0;
    border-bottom: 1px solid rgba(255,255,255,0.5);
    text-align: center;
}
li:hover{
    cursor: pointer;
    font-weight: 600;
}
.operation-left {
    position: absolute;
    padding: 0;
    margin: 0;
    top: 160px;
    width: 100px;
    height: 600px;
}
</style>
