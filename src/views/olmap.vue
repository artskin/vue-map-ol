<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <v-ol-map :edit-geom-enabled="true" :key="id"></v-ol-map>
  </div>
</template>

<script>

import VOlMap from '@/components/v-Olmap.vue'

export default {
  name: 'kdmappage',
  components: {  VOlMap  },
  data(){
    return{
      msg:"商场平面图",
      id: +new Date()
    }
  },
  methods: {
    refresh: function () {
      this.id = +new Date()
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
