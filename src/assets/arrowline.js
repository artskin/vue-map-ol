import Map from 'ol/Map.js';
import View from 'ol/View.js';
import Point from 'ol/geom/Point.js';
import Draw from 'ol/interaction/Draw.js';
import Feature from 'ol/Feature.js';
import LineString from 'ol/geom/LineString.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {OSM, Vector as VectorSource, Cluster} from 'ol/source.js';
import {Icon, Stroke, Style, Circle, Fill, Text} from 'ol/style.js';

import arrowPng from '../assets/img/arrow.png'

////TODO to get from api service
var coordinates = [
  [550.625,679.4531250000001],
  [901.875,404.4531250000001],
  [1139.375,829.4531250000001],
  [836.25,633.8281250000001]
];




////
var features = new Array();
for (var i = 0; i < coordinates.length; ++i) {
  features[i] = new Feature(new Point(coordinates[i]));
}

var source = new VectorSource({
  features: features
});

var clusterSource = new Cluster({
  distance: 40,
  source: source
});
var styleCache = {};
var clusterLayer = new VectorLayer({
    source: clusterSource,
    style: function (feature, resolution) {
        var size = feature.get('features').length;
		console.log("size of feature:"+size);
        var style = styleCache[size];
        if (!style) {
            style = [new Style({
                image: new Circle({
                    radius: 10,
                    stroke: new Stroke({
                        color: '#fff'
                    }),
                    fill: new Fill({
                        color: '#3399CC'
                    })
                }),
                text: new Text({
                    text: size.toString(),
                    fill: new Fill({
                        color: '#fff'
                    })
                })
            })];
            styleCache[size] = style;
        }
        return style;
    }
});

////
var vectorSource = new VectorSource({});
for (var i = 1; i < coordinates.length; i++) {
  var startPoint = coordinates[i-1];
  var endPoint = coordinates[i];
  var dx = endPoint[0] - startPoint[0];
  var dy = endPoint[1] - startPoint[1];
  var rotation = Math.atan2(dy, dx);

  var lineArray = [startPoint, endPoint];
  var featureLine = new Feature({
      geometry: new LineString(lineArray)
  });

  var lineStyle = new Style({
      stroke: new Stroke({
          color: '#ffcc33',
          width: 2
      })
  });
  featureLine.setStyle(lineStyle);
  vectorSource.addFeature(featureLine);
  
  var iconStyle = new Style({
      image: new Icon({
            src: arrowPng,
            anchor: [0.75, 0.5],
            rotateWithView: true,
            rotation: -rotation
          })
  });
  var iconFeature = new Feature({
      geometry: new Point(endPoint)
  });
  iconFeature.setStyle(iconStyle);
  vectorSource.addFeature(iconFeature);
}
var vectorLayer = new VectorLayer({
  source: vectorSource
});


export default{
    layers:[clusterLayer, vectorLayer]
}