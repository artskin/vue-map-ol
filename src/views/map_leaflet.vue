<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
@import "../assets/style/leaflet.css";
/* ================================================================== */
/* Toolbars
/* ================================================================== */

.leaflet-draw-section {
	position: relative;
}

.leaflet-draw-toolbar {
	margin-top: 12px;
}

.leaflet-draw-toolbar-top {
	margin-top: 0;
}

.leaflet-draw-toolbar-notop a:first-child {
	border-top-right-radius: 0;
}

.leaflet-draw-toolbar-nobottom a:last-child {
	border-bottom-right-radius: 0;
}

.leaflet-draw-toolbar a {
	background-image: url('/images/spritesheet.png');
	background-image: linear-gradient(transparent, transparent), url('/images/spritesheet.svg');
	background-repeat: no-repeat;
	background-size: 300px 30px;
	background-clip: padding-box;
}

.leaflet-retina .leaflet-draw-toolbar a {
	background-image: url('/images/spritesheet-2x.png');
	background-image: linear-gradient(transparent, transparent), url('/images/spritesheet.svg');
}

.leaflet-draw a {
	display: block;
	text-align: center;
	text-decoration: none;
}

.leaflet-draw a .sr-only {
	position: absolute;
	width: 1px;
	height: 1px;
	padding: 0;
	margin: -1px;
	overflow: hidden;
	clip: rect(0, 0, 0, 0);
	border: 0;
}

/* ================================================================== */
/* Toolbar actions menu
/* ================================================================== */

.leaflet-draw-actions {
	display: none;
	list-style: none;
	margin: 0;
	padding: 0;
	position: absolute;
	left: 26px; /* leaflet-draw-toolbar.left + leaflet-draw-toolbar.width */
	top: 0;
	white-space: nowrap;
}

.leaflet-touch .leaflet-draw-actions {
	left: 32px;
}

.leaflet-right .leaflet-draw-actions {
	right: 26px;
	left: auto;
}

.leaflet-touch .leaflet-right .leaflet-draw-actions {
	right: 32px;
	left: auto;
}

.leaflet-draw-actions li {
	display: inline-block;
}

.leaflet-draw-actions li:first-child a {
	border-left: none;
}

.leaflet-draw-actions li:last-child a {
	-webkit-border-radius: 0 4px 4px 0;
	border-radius: 0 4px 4px 0;
}

.leaflet-right .leaflet-draw-actions li:last-child a {
	-webkit-border-radius: 0;
	border-radius: 0;
}

.leaflet-right .leaflet-draw-actions li:first-child a {
	-webkit-border-radius: 4px 0 0 4px;
	border-radius: 4px 0 0 4px;
}

.leaflet-draw-actions a {
	background-color: #919187;
	border-left: 1px solid #AAA;
	color: #FFF;
	font: 11px/19px "Helvetica Neue", Arial, Helvetica, sans-serif;
	line-height: 28px;
	text-decoration: none;
	padding-left: 10px;
	padding-right: 10px;
	height: 28px;
}

.leaflet-touch .leaflet-draw-actions a {
	font-size: 12px;
	line-height: 30px;
	height: 30px;
}

.leaflet-draw-actions-bottom {
	margin-top: 0;
}

.leaflet-draw-actions-top {
	margin-top: 1px;
}

.leaflet-draw-actions-top a,
.leaflet-draw-actions-bottom a {
	height: 27px;
	line-height: 27px;
}

.leaflet-draw-actions a:hover {
	background-color: #A0A098;
}

.leaflet-draw-actions-top.leaflet-draw-actions-bottom a {
	height: 26px;
	line-height: 26px;
}

/* ================================================================== */
/* Draw toolbar
/* ================================================================== */

.leaflet-draw-toolbar .leaflet-draw-draw-polyline {
	background-position: -2px -2px;
}

.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-draw-polyline {
	background-position: 0 -1px;
}

.leaflet-draw-toolbar .leaflet-draw-draw-polygon {
	background-position: -31px -2px;
}

.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-draw-polygon {
	background-position: -29px -1px;
}

.leaflet-draw-toolbar .leaflet-draw-draw-rectangle {
	background-position: -62px -2px;
}

.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-draw-rectangle {
	background-position: -60px -1px;
}

.leaflet-draw-toolbar .leaflet-draw-draw-circle {
	background-position: -92px -2px;
}

.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-draw-circle {
	background-position: -90px -1px;
}

.leaflet-draw-toolbar .leaflet-draw-draw-marker {
	background-position: -122px -2px;
}

.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-draw-marker {
	background-position: -120px -1px;
}

.leaflet-draw-toolbar .leaflet-draw-draw-circlemarker {
	background-position: -273px -2px;
}

.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-draw-circlemarker {
	background-position: -271px -1px;
}

/* ================================================================== */
/* Edit toolbar
/* ================================================================== */

.leaflet-draw-toolbar .leaflet-draw-edit-edit {
	background-position: -152px -2px;
}

.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-edit-edit {
	background-position: -150px -1px;
}

.leaflet-draw-toolbar .leaflet-draw-edit-remove {
	background-position: -182px -2px;
}

.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-edit-remove {
	background-position: -180px -1px;
}

.leaflet-draw-toolbar .leaflet-draw-edit-edit.leaflet-disabled {
	background-position: -212px -2px;
}

.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-edit-edit.leaflet-disabled {
	background-position: -210px -1px;
}

.leaflet-draw-toolbar .leaflet-draw-edit-remove.leaflet-disabled {
	background-position: -242px -2px;
}

.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-edit-remove.leaflet-disabled {
	background-position: -240px -2px;
}

/* ================================================================== */
/* Drawing styles
/* ================================================================== */

.leaflet-mouse-marker {
	background-color: #fff;
	cursor: crosshair;
}

.leaflet-draw-tooltip {
	background: rgb(54, 54, 54);
	background: rgba(0, 0, 0, 0.5);
	border: 1px solid transparent;
	-webkit-border-radius: 4px;
	border-radius: 4px;
	color: #fff;
	font: 12px/18px "Helvetica Neue", Arial, Helvetica, sans-serif;
	margin-left: 20px;
	margin-top: -21px;
	padding: 4px 8px;
	position: absolute;
	visibility: hidden;
	white-space: nowrap;
	z-index: 6;
}

.leaflet-draw-tooltip:before {
	border-right: 6px solid black;
	border-right-color: rgba(0, 0, 0, 0.5);
	border-top: 6px solid transparent;
	border-bottom: 6px solid transparent;
	content: "";
	position: absolute;
	top: 7px;
	left: -7px;
}

.leaflet-error-draw-tooltip {
	background-color: #F2DEDE;
	border: 1px solid #E6B6BD;
	color: #B94A48;
}

.leaflet-error-draw-tooltip:before {
	border-right-color: #E6B6BD;
}

.leaflet-draw-tooltip-single {
	margin-top: -12px
}

.leaflet-draw-tooltip-subtext {
	color: #f8d5e4;
}

.leaflet-draw-guide-dash {
	font-size: 1%;
	opacity: 0.6;
	position: absolute;
	width: 5px;
	height: 5px;
}

/* ================================================================== */
/* Edit styles
/* ================================================================== */

.leaflet-edit-marker-selected {
	background-color: rgba(254, 87, 161, 0.1);
	border: 4px dashed rgba(254, 87, 161, 0.6);
	-webkit-border-radius: 4px;
	border-radius: 4px;
	box-sizing: content-box;
}

.leaflet-edit-move {
	cursor: move;
}

.leaflet-edit-resize {
	cursor: pointer;
}

/* ================================================================== */
/* Old IE styles
/* ================================================================== */

.leaflet-oldie .leaflet-draw-toolbar {
	border: 1px solid #999;
}
#map{border: 1px dashed #ccc;height: 600px;}
.leaflet-div-icon{border-radius: 10px;transform: scale(0.3);background: chocolate;}

</style>

<template>
  <div class="hello">
    <h1>{{ msg }}-{{id}}</h1>
    <div id="map">
      <l-map
      ref="map"
      :min-zoom="minZoom"
      :zoom="zoom"
      :crs="crs"
      style="height: 100%; width: 100%;">
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
import 'leaflet-draw';

console.log(L.Draw)

export default {
  name: 'leaflet',
  components: {  LMap,LImageOverlay, LMarker, LPopup,LPolyline  },
  data(){
    return{
      msg:"leaflet map",
      id: +new Date(),
      map: null,
      url: '/images/PX-0F.png',
      bounds: [[-540, -960], [1080, 1920]],
      minZoom: -2,
      zoom:-1,
      crs: L.CRS.Simple,
      stars: [
        { name: 'Sol', lng: 175.2, lat: 145.0 },
        { name: 'Mizar', lng: 41.6, lat: 130.1 },
        { name: 'Krueger-Z', lng: 13.4, lat: 56.5 },
        { name: 'Deneb', lng: 218.7, lat: 8.3 }
      ],
      travel: [[145.0, 175.2], [8.3, 218.7]]
    }
  },
  mounted(){
    var _this = this;
    this.map = this.$refs.map.mapObject;
    var drawnItems = new L.FeatureGroup();
    console.log(drawnItems)
    this.map.addLayer(drawnItems);
    var drawControl = new L.Control.Draw({
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
                      color : '#bada55'
                    },
                    showArea : true
                },
                polyline : false,
                rectangle : false,
                circle : false,
                marker : false
            },
      edit: {
        featureGroup: drawnItems
      }
    });
    this.map.addControl(drawControl);
    this.map.on(L.Draw.Event.CREATED, function (event) {
      var layer = event.layer;
      drawnItems.addLayer(layer);
    });
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


