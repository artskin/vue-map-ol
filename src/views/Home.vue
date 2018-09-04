<style>
  .mymaps-container{
    display: flex;
    width: 100%;
    background-color: #1b6d85;
    text-align: center;
  }

  .mymaps-element{
    margin: auto;
    padding: 10px;
    float: left;
    width: 45%;
    height: 550px;
    border: 1px solid black;
  }
</style>

<template>
  <div>
  <h1>{{msg}}</h1>
  <div class="mymaps-container">
    <div class="mymaps-element">
      <cgil-ol-map id="map1"
                              :geom-wkt="mygeom1"
                              :edit-geom-enabled="true"
                              v-on:gomapSaveGeomClick="saveGeometry1">
      </cgil-ol-map>
      <textarea id="txtgeom1" rows="8" cols="60" v-model="mygeom1"></textarea>
      <p>Saved geometry :</p>
      <textarea id="loggeom1" rows="8" cols="60" ></textarea>
    </div>
    <div class="mymaps-element">
      <cgil-ol-map id="map2"
                              :geom-wkt="mygeom2"
                              v-on:gomapSaveGeomClick="saveGeometry2">
      </cgil-ol-map>
      <textarea id="txtgeom2" rows="8" cols="60" v-model="mygeom2"></textarea>
      <p>Saved geometry</p>
      <textarea id="loggeom2" rows="8" cols="60" ></textarea>
    </div>
  </div>
  </div>
</template>

<script>  
  //import 'cgil-vue-olmap/dist/cgil-vue-olmap.css'
  import cgilOlMap from 'cgil-vue-olmap'
  export default {
    name: 'testvue2MapOlSwiss21781',
    components: {cgilOlMap},
    data () {
      return {
        msg: 'Testing 2 vue2MapOlSwiss21781 Maps side by side',
        mygeom1: null,
        mygeom2: `MULTIPOLYGON(
        ((537884.03 152099.71,537883.73 152088.79,537891.14 152087.34,537892.39 152098.71,537884.03 152099.71)),
        ((537893.10 152094.40,537892.40 152087.44,537896.56 152087.04,537893.10 152094.40))
        )`
      }
    },
    methods: {
      saveGeometry1: function (val) {
        console.info('In PARENT TEST VUE2-MAP 1  event gomapSaveGeomClick received : ', val)
        let logtxt = document.getElementById('loggeom1')
        logtxt.innerText = val
      },
      saveGeometry2: function (val) {
        console.info('In PARENT TEST VUE2-MAP 2 event gomapSaveGeomClick received : ', val)
        let logtxt = document.getElementById('loggeom2')
        logtxt.innerText = val
      }
    }
  }
</script>