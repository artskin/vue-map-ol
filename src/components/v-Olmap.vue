<style scoped>
.v-ol-map{position: relative;width: 1000px;height: 700px;}
#tools{position: absolute;right: 0;top: 0;z-index: 99;padding: 5px;}
#tools .el-radio-group{border-radius: 5px;background: rgba(255, 255, 255, .3);padding: 3px;}
.volmap{border: 1px dashed #ccc;background: #07263b}
.volmap canvas{background: hotpink;}
</style>

<template>
  <div class="v-ol-map">
    <div id="tools">
      <el-radio-group v-model="mapData.drawType" size="small" @change="change(mapData.drawType)">
        <el-radio-button label="Polygon"><i class="el-icon-edit"></i></el-radio-button>
        <el-radio-button label="Point"><i class="el-icon-location-outline"></i></el-radio-button>
        <el-radio-button label="Circle" disabled><i class="el-icon-refresh"></i></el-radio-button>
        <el-radio-button label="edit"><i class="el-icon-edit-outline"></i></el-radio-button>
        <el-radio-button label="null"><i class="el-icon-rank"></i></el-radio-button>
      </el-radio-group>
    </div>
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

//draw
import {defaults as defaultInteractions,Translate,Draw, Modify, Snap} from 'ol/interaction';
import Select from 'ol/interaction/Select';
import MultiPolygon from 'ol/geom/MultiPolygon'

//加载静态资源
import '../assets/style/ol/ol.css'
import bgImgSrc from '../assets/img/floor2.png'
import cameraSrc from '../assets/img/camera@2x.svg'
var data_geoJson = 'https://artskin.github.io/vue-map-ol/src/assets/data/drawJson.json?v=7'

var store = require('store');


console.log(data_geoJson)

export default {
  name: 'KdOlMap',
  data(){
    return{
      msg:"商场平面图",
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
    var modify = new Modify({source: this.mapData.source});
    this.map.addInteraction(modify);
    
    //选择
    var select = new Select();
    this.map.addInteraction(select);
    select.on('select', function(e) {
      
      if(e.selected.length > 0){
        console.log(e.selected[0].values_.gID)
      }
    });
  },
  methods: {
    change(type){
      this.addDraw(type);
    },
    addDraw(typeVal){
      var _this = this;
      this.map.draw = new Draw({
        source: _this.mapData.source,
        // style:new Style({
        //   fill:new Fill({
        //     color:'rgba(255,0,255,.5)'
        //   }),
        //   stroke:new Stroke({//绘制路径
        //     color:'rgba(255,0,255,1)',
        //     width:3,
        //   }),
        //   image:new CircleStyle({//鼠标点的颜色形状
        //     fill:new Fill({
        //       color:'rgba(0,198,255,.5)'
        //     }),
        //     radius:10
        //   })
        // }),
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
      console.log(this.map.draw)
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
            anchor: [0.5, 100],
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            opacity: 1,
            rotation:-90,
            rotateWithView:true,
            scale:0.2,
            src: cameraSrc,
          })),
          stroke: new Stroke({
            width: 1,
            color: [255, 0, 0, 1]
          }),
          fill: new Fill({
            color: [0, 0, 255, 0.3]
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
      
      console.log(this.volLayers())
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
