<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <kd-ol-map :edit-geom-enabled="true"></kd-ol-map> 
  </div>
</template>

<script>

import KdOlMap from '@/components/v-Olmap.vue'

export default {
  name: 'kdmappage',
  components: {  KdOlMap  },
  data(){
    return{
      msg:"商场平面图"
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
