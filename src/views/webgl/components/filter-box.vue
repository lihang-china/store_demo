<template>
    <div class="filter-box">
        <slot>

        </slot>
    </div>
</template>
<style scoped>
.filter-box {
    color: rgb(253,254,255);
    padding:12px;
    margin: 12px;
    width: auto;
    height: auto;
    border-radius: 4px;
    backdrop-filter: saturate(100%) blur(8px);
    background-color: rgba(0, 0, 0, 0.3);
}
</style>
