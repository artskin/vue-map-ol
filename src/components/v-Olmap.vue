<style>
  .v-ol-map{position: relative;width: 100%;height: 700px;}
  #tools{position: absolute;right: 0;top: 0;z-index: 99;padding: 10px;}
  #tools .el-radio-group{border-radius: 3px;background: rgba(255, 255, 255, .3);padding: 3px;}
  #tools .el-radio-group:hover{background: rgba(255, 255, 255, .5);}
  #tools .el-radio-button__inner{background: rgba(0,60,136,0.5);color: #fff;border: 1px solid rgba(21, 120, 248, 0);margin-right: 1px;}
  #tools .el-radio-button--mini .el-radio-button__inner{padding: 7px 10px;}
  #tools .is-active .el-radio-button__inner{background: rgba(0,60,136,0.8);border: 1px solid rgba(0,60,136,1)}
  .el-radio-button__orig-radio:checked+.el-radio-button__inner{box-shadow: none;}
  .volmap{background: #1a1635}
</style>

<template>
  <div class="v-ol-map">
    <div id="tools">
      <el-radio-group v-model="mapConf.drawType" size="mini" @change="change(mapConf.drawType)">
        <el-radio-button label="Polygon"><i class="el-icon-edit"></i></el-radio-button>
        <el-radio-button label="Point"><i class="el-icon-location-outline"></i></el-radio-button>
        <el-radio-button label="refresh"><i class="el-icon-refresh"></i></el-radio-button>
        <el-radio-button label="null"><i class="el-icon-rank"></i></el-radio-button>
      </el-radio-group>
    </div>
    <div ref="volmap" class="volmap"></div>
    
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

//静态资源
import '../assets/style/ol/ol.css'
import mapSrc from '../assets/img/PX-0F.png'
//import cameraSrc from '../assets/img/icon_camera3.svg'
var cameraSrc = 'http://www.williambuck.com/portals/0/Skins/WilliamBuck2014/images/location-icon.svg'
var data_geoJson = '/mock/pxmap_0F.json'

var store = require('store');

export default {
  name: 'VOlMap',
  data(){
    return{
      mapConf:{
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
    this.mapConf.extent = [0, 0, 1920, 1080];
    this.mapConf.projection = new Projection({
      code: 'xkcd-image',
      units: 'pixels',
      extent: this.mapConf.extent
    });
    this.mapConf.source = new VectorSource();
    
    this.map = new Map(
      // {
      // target: this.$refs.volmap,
      // layers:this.volLayers(),
      // view: this.volView()
      // }
    );

    new Map({
      layers: [
        new TileLayer({source: new OSM()})// 创建一个使用Open Street Map地图源的瓦片图层
      ],
      view: new View({     // 设置显示地图的视图
        center: [0, 0],    // 定义地图显示中心于经度0度，纬度0度处
        zoom: 2            // 并且定义地图显示层级为2
      }),
      target: this.$refs.volmap   
    });
    
    this.selectLayer()
  },
  methods: {
    volView(){
      let _this = this;
      return new View({
        projection: _this.mapConf.projection,
        center: getCenter(_this.mapConf.extent),
        zoom: 2,
        maxZoom: 8
      })
    },
    volLayers(){
      let _this = this;
      var ArrLayer = [];
	    if(hm.layers && hm.layers.length > 0){
        for (var i = 0;i < hm.layers.length; i++){
          ArrLayer.push(hm.layers[i]);
        }
      }
	  
      ArrLayer.push(new ImageLayer({
        source: new Static({
          url: mapSrc,
          projection: _this.mapConf.projection,
          imageExtent: _this.mapConf.extent
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
    addVector(){
      //添加绘制区域层
      var polygonLayer = new VectorLayer({
        source: this.mapConf.source,
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
        source: _this.mapConf.source,
        style:new Style(drawStyle),
        type: typeVal,
      });
      this.map.addInteraction(this.map.draw);

      this.map.draw.on('drawend', function(e){
        console.log("完成后",e)
        _this.cleanDrawAction();
        _this.addVector();
        _this.saveDraw(e.target.mode_,e.target.sketchCoords_)
      });
    },
    cleanDrawAction(){
      this.mapConf.drawType = "null";
      this.map.removeInteraction(this.map.draw);
      this.map.removeInteraction(this.map.snap);
    },
    saveDraw(Dtype,Arr){
      store.set(Dtype,Arr);
    },
    editDraw(){
      // var modify = new Modify({source: this.mapConf.source});
      // this.map.addInteraction(modify);
      // this.map.snap = new Snap({source: this.mapConf.source});
      // this.map.addInteraction(this.map.snap);
    },
    selectLayer(){
      //选择
      var selectClick = new Select();
      this.map.addInteraction(selectClick);
      selectClick.on("select",function(ev){
        console.log(ev)
      })
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
    }
  }
}
</script>
