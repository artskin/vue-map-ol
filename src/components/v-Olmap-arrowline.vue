<style scoped>
.v-ol-map{position: relative;width: 1000px;height: 700px;}
#tools{position: absolute;right: 0;top: 0;z-index: 99;padding: 10px;}
#tools .el-radio-group{border-radius: 5px;background: rgba(255, 255, 255, .3);padding: 3px;}
.volmap{border: 1px dashed #ccc;background: #07263b}
.volmap canvas{background: hotpink;}
</style>

<template>
  <div class="v-ol-map">
    <div ref="volmap" class="volmap">

    </div>
  </div>
</template>

<script>
import Map from 'ol/Map'

//背景图片
import View from 'ol/View';
import ImageLayer from 'ol/layer/Image'
import Projection from 'ol/proj/Projection'
import Static from 'ol/source/ImageStatic'
import {getCenter} from 'ol/extent';

//绘制图形
import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {Circle as CircleStyle, Fill,Icon, Stroke, Style} from 'ol/style';
import GeoJSON from 'ol/format/GeoJSON';

import al from '../assets/arrowline.js'

//加载静态资源
import '../assets/style/ol/ol.css'
import bgImgSrc from '../assets/img/floor2.png'
import cameraSrc from '../assets/img/camera2@2x.svg?v=1'
var cameraJson = 'https://raw.githubusercontent.com/artskin/vue-map-ol/master/src/assets/data/hm-test.json';


export default {
  name: 'arrowLineMap',
  data(){
    return{
      msg:"PX Level 2",
      mapData:{
        drawType:'null'
      },
      map:{},
      props: {
        msg2: String
      }
    }
  },
  mounted () {
    this.mapData.extent = [0, 0, 1920, 1080];
    this.mapData.projection = new Projection({
      code: 'xkcd-image',
      units: 'pixels',
      extent: this.mapData.extent
    });
    //console.log(this.volView())
    this.map = this.volMap(this.$refs.volmap,this.volView())
    this.mapData.source = new VectorSource();

    ////append line arrow on map
    if(al.layers && al.layers.length > 0){
      for (var i = 0;i < al.layers.length; i++){
          this.map.addLayer(al.layers[i]);
      }
    }

  },
  methods: {
    volLayers(){
        let _this = this;
        var ArrLayer = [];

        ////static image layer
        ArrLayer.push(new ImageLayer({
            source: new Static({
                url: bgImgSrc,
                projection: _this.mapData.projection,
                imageExtent: _this.mapData.extent
            })
        }))

        //// camera device layer
        ArrLayer.push(new VectorLayer({
            source:new VectorSource({
                url: cameraJson,
                format: new GeoJSON(),
                wrapX: false
            }),
            style: new Style({
                image: new Icon(/** @type {module:ol/style/Icon~Options} */ ({
                anchor: [0.5, 100],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                opacity: 1,
                rotation:0,
                rotateWithView:true,
                scale:0.15,
                fill:"#14fb24",
                color:"#14fb24",
                src: cameraSrc,
                })),
                stroke: new Stroke({
                width: 1,
                color: [114, 182, 61, .8]
                }),
                fill: new Fill({
                color: [30, 138, 112, 0.3]
                })
            })
        }));
        
        return ArrLayer
    },
    volView(){
      let _this = this;
      return new View({
        projection: _this.mapData.projection,
        center: getCenter(_this.mapData.extent),
        zoom: 2,
        maxZoom: 8
      })
    },
    volMap (el, view) {
      console.log(this.volLayers());
      return new Map({
        target: el,
        layers:this.volLayers(),
        view: view
      })
    }
  }
}

console.log("arrow line component 2");
</script>
