<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
@import "../assets/style/leaflet.css";
@import "../assets/style/leaflet.draw.css";
#map{border: 1px dashed rgba(6,77,41,.5);height: 600px;}
.leaflet-div-icon{border-radius: 10px;transform: scale(0.3);background:rgba(255,204,0,.6);border:1px dotted rgba(255,204,0,.8);}
</style>

<template>
  <div class="hello">
    <h1>{{ msg }}-{{id}}</h1>
    <div id="map">
      <l-map ref="map" style="height: 100%; width: 100%;"
      :min-zoom="minZoom"
      :max-zoom="maxZoom"
      :zoom="zoom"
      :center="center"
      :crs="crs">
      <l-image-overlay
        :url="url"
        :bounds="bounds"/>
      <l-marker
        v-for="star in stars"
        :lat-lng="star"
        :key="star.name">
        <l-popup :content="star.name"/>
      </l-marker>
      <l-polyline :lat-lngs="travel"/>
    </l-map>
    </div>
  </div>
</template>

<script>
import { LMap, LImageOverlay, LMarker, LPopup,LPolyline } from 'vue2-leaflet';
//轨迹模块
import { AntPath, antPath } from 'leaflet-ant-path';
//h绘图模块
import 'leaflet-draw';//require('leaflet-draw');
//热力图模块
import 'leaflet.heat';

import axios from 'axios';
var store = require('store');

//项目配置
import DrawLocal from '../assets/drawLocal.js';
var data_geoJson = '/mock/pxmap_0F.json';

export default {
  name: 'leaflet',
  components: {  LMap,LImageOverlay, LMarker, LPopup,LPolyline  },
  data(){
    return{
      msg:"leaflet map",
      id: +new Date(),
      map: null,
      url: '/images/PX-1F.png',
      bounds: [[-540,-960], [1080, 1920]],
      minZoom: -2,
      maxZoom: 1,
      // center: [540,960],
      zoom:-2,
      crs: L.CRS.Simple,
      stars: [
        { name: 'Sol', lng: 175.2, lat: 145.0 },
        { name: 'Mizar', lng: 41.6, lat: 130.1 },
        { name: 'Krueger-Z', lng: 13.4, lat: 56.5 },
        { name: 'Deneb', lng: 218.7, lat: 8.3 }
      ],
      travel: []
      //travel: [[145.0, 175.2], [8.3, 218.7]]
    }
  },
  mounted(){
    var _this = this;
    this.map = this.$refs.map.mapObject;
    var drawnItems = new L.FeatureGroup();
    console.log(this.map.getCenter())
    
    this.map.addLayer(drawnItems);

    var MyCustomMarker = L.Icon.extend({
      options: {
        shadowUrl: null,
        iconAnchor: new L.Point(12, 12),
        iconSize: new L.Point(40, 40),
        iconUrl: './images/icon-camera.png'
      }
    });

    var drawPoint = new L.DivIcon({
      iconSize: new L.Point(8, 8)
    });
    L.drawLocal = DrawLocal.drawSetting;

    var options = {
      draw : {
        position : 'topleft',
        polygon : {
            title : 'Draw a sexy polygon!',
            allowIntersection : false,
            drawError : {
              color : '#b00b00',
              timeout : 1000
            },
            shapeOptions : {
              color : '#bada55',
              weight: 2,
            },
            icon: drawPoint,
            showArea : true
        },
        polyline : true,
        rectangle : false,
        circle : false,
        marker: {
          icon: new MyCustomMarker()
        }
      },
      edit: {
        featureGroup: drawnItems
      }
    };
    var drawControl = new L.Control.Draw(options);
    this.map.addControl(drawControl);
    this.map.on(L.Draw.Event.CREATED, function (ev) {
      var coords=[];
      var shaptype = ev.layerType;
      if(shaptype =="polygon"){
        coords = ToCoords(ev.layer.getLatLngs()[0])
      }else if(shaptype =="polyline"){
        coords = ToCoords(ev.layer.getLatLngs())
      }else{
        //coordPoints = ev.layer.getLatLng();
        coords = L.GeoJSON.latLngToCoords(ev.layer.getLatLng())
      }

      function ToCoords(latLngs) {
        var coords = [];
        for (var i = 0, len = latLngs.length; i < len; i++) {
          //coords.push(L.GeoJSON.latLngToCoords(latLngs[i]));
          coords.push([latLngs[i].lat,latLngs[i].lng]);
        }
        return coords;
      }

      store.set("coords",coords);
      var layer = ev.layer;
      drawnItems.addLayer(layer);

      console.log(ev,JSON.stringify(coords))

      // switch(ev.layerType){
      //   case "polygon":
          
      //   break;
      //   case "marker":
          
      //   break;
      //   case "circlemarker":
      //   break;
      //   default:
      // }
    });

    //heatmap
    var heat = L.heatLayer([
        [300.5, 200.5, 2000], // lat, lng, intensity
        [320.6, 300.4, 5000],
        [400.6, 200.4, 3000],
        [260.6, 300.4, 800],
    ], {
      radius: 30,
      blur:20,
      gradient: {0.4: 'blue', 0.65: 'lime', 1: 'red'}
    }).addTo(this.map);

    //渲染Jeojson
    var myStyle = {
      "color": "#00f",
      "weight": 3,
      "opacity": 0.5,
    };
    axios.get('/mock/pxmap_1F.json').then((req)=>{
      data_geoJson = req.data;
      //console.log(data_geoJson)
      var layerGeo = L.geoJSON(data_geoJson, {
        style:myStyle
      }).addTo(this.map);
      layerGeo.on('click',function(e){
        console.log(e,e.layer.feature.properties.name) //当前点击的物体的名称
      })
    })

    //轨迹图
    var antLatlngs = [[-12.890625,-348.5],[-7.640625,-336],[-7.640625,-321.5],[-12.140625,-309],[-21.140625,-299.5],[-39.640625,-287.5],[-64.890625,-278.5],[-95.140625,-261.75],[-114.640625,-243.25],[-123.140625,-226.25],[-129.390625,-204.25],[-133.390625,-186.5],[-139.140625,-174.25],[-144.390625,-167.75]]
    var antOptions = {delay: -300, dashArray: [10,20], weight: 10, color: "#FF00ea", pulseColor: "#FFFFFF"};
    
    this.map.on("zoomend", function(){
      var zoomLeaval = this.map.getZoom();
      console.log(zoomLeaval)
      // antOptions.delay = 10+100*zoomLeaval
      
      // var animationDuration = 1 + antOptions.delay/3/this.map.getZoom() +"s";
      // console.log(this.map.getZoom(),antOptions.delay,animationDuration);
      // let antPolyline = new AntPath(antLatlngs, antOptions);
    }, this);
    // Usethe constructor...
    let antPolyline = new AntPath(antLatlngs, antOptions);
    // ... or use the factory
    //antPolyline = antPath(latlngs, options);
    
    antPolyline.addTo(this.map);
    
  },
  methods: {
    zoomUpdate (zoom) {
      this.currentZoom = zoom;
      console.log(zoom)
    },
    centerUpdate (center) {
      this.currentCenter = center;
    },
    showLongText () {
      this.showParagraph = !this.showParagraph;
    },
    popupClick () {
      alert('Popup Click!');
    },
    refresh: function () {
      this.id = +new Date()
    }
  },
}
</script>