<template>
  <div class="about">
    <cgil-ol-map :edit-geom-enabled="true"></cgil-ol-map> 
  </div>
</template>
<script>
//import 'cgil-vue-olmap/dist/cgil-vue-olmap.css'
import cgilOlMap from 'cgil-vue-olmap'
//import HelloWorld from '@components/HelloWorld.vue'
//import cgilOlMap from 'cgil-vue-olmap'

export default {
  name: 'App',
  components: {  cgilOlMap  }
}
</script>