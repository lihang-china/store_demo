<template>
    <!-- <div class="box"></div> -->
   <operaiton-left />
    <!-- <operaiton-right />  -->
    <canvas id="canvas">浏览器版本过低，请升级浏览器版本或更换浏览器</canvas>
</template>
<script lang="ts" setup>
import operaitonLeft from './components/operaiton-left.vue';
import operaitonRight from './components/operation-right.vue';
import { onMounted } from 'vue';
import CreateScene from './create'
const initScene = () => {
    let app = new CreateScene('canvas')
    app.importMesh('./mesh/', 'model.gltf')
}
onMounted(() => {
    initScene()
})
</script>
<style scoped>
#canvas {
    width: 100%;
    height: 100%;
}

.box {
    width: 260px;
    height: 320px;
    position: absolute;
    left: 20px;
    top: 20px;
    border-radius: 20px;
    /* filrte saturate(150%) blur(8px) */
    backdrop-filter: saturate(150%) blur(8px);
    background-color: rgba(42, 100, 163, 0.5);
    padding: 20px;
}
</style>
