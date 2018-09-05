      import Map from 'ol/Map.js';
      import View from 'ol/View.js';
      import GeoJSON from 'ol/format/GeoJSON.js';
      import {Heatmap as HeatmapLayer, Tile as TileLayer} from 'ol/layer.js';
      import Stamen from 'ol/source/Stamen.js';
      import VectorSource from 'ol/source/Vector.js';
      

      //// url to fetch geojson data
      var urlData = "https://raw.githubusercontent.com/artskin/vue-map-ol/master/src/assets/data/hm-test.json";

      //// const
      var blurV = 50;
      var radiusV = 35;
      var frequencyInSecond = 10 * 1000;

	console.log("hm 1");
      var vectorSource = new VectorSource({
        url: urlData,
        format: new GeoJSON(),
        wrapX: false
        //features: (new GeoJSON()).readFeatures(dummyobj)
      });
console.log("hm 2");
      var vector = new HeatmapLayer({
        source: vectorSource,
        blur: blurV,
        radius: radiusV
      });
	  console.log("hm 3");
      ////realtime refresh
      var req = require('request');
       var realtimeRefreshData = function(){
           setTimeout(() => {
             req(urlData, function (error, response, body) {
               console.log("response body:");
               console.log(body);
               console.log("vector :");
               console.log(vectorSource);

              
             realtimeRefreshData();
             });
             console.log("refresing");
           }, frequencyInSecond);
       }
      realtimeRefreshData();
      

      var raster = new TileLayer({
        source: new Stamen({
          layer: 'toner'
        })
      });
console.log("hm 4");
      

      export default{
        layers:[raster, vector],
      }
