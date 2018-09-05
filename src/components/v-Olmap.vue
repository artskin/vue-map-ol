<style>
  .v-ol-map{position: relative;width: 800px;height: 600px;}
  #tools{position: absolute;right: 0;top: 0;z-index: 99;padding: 10px;}
  #tools .el-radio-group{border-radius: 3px;background: rgba(255, 255, 255, .3);padding: 3px;}
  #tools .el-radio-group:hover{background: rgba(255, 255, 255, .5);}
  #tools .el-radio-button__inner{background: rgba(0,60,136,0.5);color: #fff;border: 1px solid rgba(21, 120, 248, 0);margin-right: 1px;}
  #tools .el-radio-button--mini .el-radio-button__inner{padding: 7px 10px;}
  #tools .is-active .el-radio-button__inner{background: rgba(0,60,136,0.8);border: 1px solid rgba(0,60,136,1)}
  .el-radio-button__orig-radio:checked+.el-radio-button__inner{box-shadow: none;}
  .volmap{border: 1px dashed #ccc;background: #07263b}
</style>

<template>
  <div class="v-ol-map">
    <div id="tools">
      <el-radio-group v-model="mapData.drawType" size="mini" @change="change(mapData.drawType)">
        <el-radio-button label="Polygon"><i class="el-icon-edit"></i></el-radio-button>
        <el-radio-button label="Point"><i class="el-icon-location-outline"></i></el-radio-button>
        <el-radio-button label="refresh"><i class="el-icon-refresh"></i></el-radio-button>
        <el-radio-button label="null"><i class="el-icon-rank"></i></el-radio-button>
      </el-radio-group>
    </div>
    <div ref="volmap" class="volmap">
      Loading Map...
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
import {Circle as CircleStyle,RegularShape , Fill,Icon, Stroke, Style} from 'ol/style';
import GeoJSON from 'ol/format/GeoJSON';

//draw
import {defaults as defaultInteractions,Translate,Draw, Modify, Snap} from 'ol/interaction';
import Select from 'ol/interaction/Select';
import MultiPolygon from 'ol/geom/MultiPolygon'

import hm from '../assets/hm.js'

//加载静态资源
import '../assets/style/ol/ol.css'
import bgImgSrc from '../assets/img/floor2.png'
//import cameraSrc from '../assets/img/icon_camera3.svg'
var cameraSrc = 'http://www.williambuck.com/portals/0/Skins/WilliamBuck2014/images/location-icon.svg'
var data_geoJson = 'https://artskin.github.io/vue-map-ol/src/assets/data/drawJson.json?v=10'


var store = require('store');

export default {
  name: 'VOlMap',
  data(){
    return{
      mapData:{
        drawType:'null'
      },
      map:{},
      isRefresh:true,
      props: {
        //id: +new Date()
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
    
    //添加绘制区域层
    var polygonLayer = new VectorLayer({
      source: this.mapData.source,
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.5)'
        }),
        stroke: new Stroke({
          color: '#ffcc33',
          width: 2
        }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({
            color: '#ffcc33'
          })
        })
      })
    })
    this.map.addLayer(polygonLayer);

    //修改
    // var modify = new Modify({source: this.mapData.source});
    // this.map.addInteraction(modify);
    
    //选择
    var select = new Select();
    //this.map.addInteraction(select);
    this.map.addInteraction(new Select({
      // 设置选中后的style
      style: new Style({
        image: new Icon({
          size: [30, 30],
          src: cameraSrc,
          opacity: 1,
          scale: 1.2,
        }),
        stroke: new Stroke({
          width: 1,
          color: [114, 182, 61, 1]
        }),
        fill: new Fill({
          color: [30, 138, 112, 0.6]
        })
      })
    }));
  },
  methods: {
    change(type){
      this.cleanDrawAction();
      if(!type || type=="null"){
        return false;
      }
      if(type =="refresh"){
        this.$parent.refresh();
      }else{
        this.addDraw(type);
      }
    },
    addDraw(typeVal){
      var _this = this;
      var drawStyle = {
        image: new CircleStyle(/** @type {module:ol/style/Icon~Options} */ ({
          radius: 3,
          fill: new Fill({
            color: '#FFFF00'
          })
        })),
        stroke:new Stroke({//绘制路径
          lineDash:[1,2,3,4,5,6],
          color: [114, 182, 61, 1]
        }),
      }
      if(typeVal == "Point"){
        drawStyle = {
          image: new Icon(/** @type {module:ol/style/Icon~Options} */ ({
            size: [30, 30],
            src: cameraSrc,
            opacity: 0.8,
          })),
        }
      }
      this.map.draw = new Draw({
        source: _this.mapData.source,
        style:new Style(drawStyle),
        type: typeVal,
      });
      this.map.addInteraction(this.map.draw);

      // this.map.snap = new Snap({source: this.mapData.source});
      // this.map.addInteraction(this.map.snap);

      this.map.draw.on('drawend', function(e){
        console.log("完成后",e)
        _this.cleanDrawAction();
        _this.saveDraw(e.target.mode_,e.target.sketchCoords_)
      });
    },
    cleanDrawAction(){
      this.mapData.drawType = "null";
      this.map.removeInteraction(this.map.draw);
      this.map.removeInteraction(this.map.snap);
    },
    saveDraw(Dtype,Arr){
      store.set(Dtype,Arr);
    },
    volLayers(){
      let _this = this;
      var ArrLayer = [];
	  
	  if(hm.layers && hm.layers.length > 0){
        for (var i = 0;i < hm.layers.length; i++)
          ArrLayer.push(hm.layers[i]);
      }
	  
      ArrLayer.push(new ImageLayer({
        source: new Static({
          url: bgImgSrc,
          projection: _this.mapData.projection,
          imageExtent: _this.mapData.extent
        })
      }))

      ArrLayer.push(new VectorLayer({
        source:new VectorSource({
          url: data_geoJson,//读取图形数据
          format: new GeoJSON(),
          wrapX: false
        }),
        style: new Style({
          image: new Icon(/** @type {module:ol/style/Icon~Options} */ ({
            size: [30, 30],
            src: cameraSrc,
            opacity: 0.8,
          })),
          stroke: new Stroke({
            width: 1,
            lineDash:[1,2,3,4,5,6],
            color: [114, 182, 61, .8]
          }),
          fill: new Fill({
            color: [30, 138, 112, 0.3]
          })
        })
      }))
      
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
      // let olMousePosition = new OlMousePosition({
      //   coordinateFormat: olCoordinate.createStringXY(1),
      //   projection: 'EPSG:2181'
      //   /*
      //   className: 'map-mouse-position',
      //   target: document.getElementById('mousepos'),
      //   undefinedHTML: '&nbsp;'
      //   */
      // })
      return new Map({
        target: el,
        //loadTilesWhileAnimating: true,
        // projection: swissProjection,
        // controls: olControl.defaults({
        //   attributionOptions: ({
        //     collapsible: false
        //   })
        // }).extend([olMousePosition]),
        //layers: initWmtsLayers(),
        layers:this.volLayers(),
        view: view
      })
    }
  }
}
</script>
