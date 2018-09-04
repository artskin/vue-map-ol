      import Map from 'ol/Map.js';
      import View from 'ol/View.js';
      import GeoJSON from 'ol/format/GeoJSON.js';
      import {Heatmap as HeatmapLayer, Tile as TileLayer} from 'ol/layer.js';
      import Stamen from 'ol/source/Stamen.js';
      import VectorSource from 'ol/source/Vector.js';
      

      //// url to fetch geojson data
      var urlData = "https://raw.githubusercontent.com/iorilan/vue-map-ol/lanliang/src/assets/data/hm-test.json";
      //// TODO may need to calculate based on the # of ppl
      var blurV = 50;
      var radiusV = 35;

      var vectorSource = new VectorSource({
        url: urlData,
        format: new GeoJSON(),
        wrapX: false
        //features: (new GeoJSON()).readFeatures(dummyobj)
      });
      var vector = new HeatmapLayer({
        source: vectorSource,
        blur: blurV,
        radius: radiusV
      });

      var raster = new TileLayer({
        source: new Stamen({
          layer: 'toner'
        })
      });

      export default{
        layers:[raster, vector],
      }
