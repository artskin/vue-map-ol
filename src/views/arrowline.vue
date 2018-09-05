<template>
<div>
<h1>{{msg}} </h1>
    <arrowLineMap ></arrowLineMap> 
</div>
</template>

<script>
console.log("arrowline.vue 1");

import arrowLineMap from '@/components/v-Olmap-arrowline.vue';

export default {
  name: 'arrowlinepage',
  components: {  arrowLineMap  },
  data(){
    return{
      msg:"Px arrow line map"
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
