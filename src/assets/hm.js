      import Map from 'ol/Map.js';
      import View from 'ol/View.js';
      import GeoJSON from 'ol/format/GeoJSON.js';
      import {Heatmap as HeatmapLayer, Tile as TileLayer} from 'ol/layer.js';
      import Stamen from 'ol/source/Stamen.js';
      import VectorSource from 'ol/source/Vector.js';
      

      //// dummy urls to fetch geojson data
      var urlData = "https://raw.githubusercontent.com/artskin/vue-map-ol/master/src/assets/data/hm-test.json";
      var urlData2 = "https://raw.githubusercontent.com/artskin/vue-map-ol/master/src/assets/data/hm-test2.json";
      var urls = [urlData,urlData2];
      //// to replace above url with api url
    
      //// const
      var blurV = 50;
      var radiusV = 35;
      var frequencyInSecond = 10 * 1000;

	    //console.log("hm 1");
      var vectorSource = new VectorSource({
        url: urlData,
        format: new GeoJSON(),
        wrapX: false
        //features: (new GeoJSON()).readFeatures(dummyobj)
      });

      //console.log("hm 2");
      var vector = new HeatmapLayer({
        source: vectorSource,
        blur: blurV,
        radius: radiusV
      });

	  //console.log("hm 3");
      ////realtime refresh
       var realtimeRefreshData = function(){
         var vs;
          setTimeout(() => {

          //// this is local testing logic
          var randNum = new Date().getMilliseconds();
          var index = randNum % 2;
          
          vectorSource = null;
          vectorSource = new VectorSource({
            url: urls[index],
            format: new GeoJSON(),
            wrapX: false
            //features: (new GeoJSON()).readFeatures(dummyobj)
          });
          vector.setSource(vectorSource);

          realtimeRefreshData();
          
          }, frequencyInSecond);
       }
      realtimeRefreshData();

      export default{
        layers:[vector],
      }
