import Map from 'ol/Map.js';
import View from 'ol/View.js';
import Point from 'ol/geom/Point.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import { Vector as VectorLayer} from 'ol/layer.js';
import {Vector as VectorSource} from 'ol/source.js';
import {Icon, Stroke, Style} from 'ol/style.js';

var urlData = "https://raw.githubusercontent.com/artskin/vue-map-ol/master/src/assets/data/line-arrow-test.json";
var vectorSource = new VectorSource({
    url: urlData,
    format: new GeoJSON(),
    wrapX: false
  });

var styleFunction = function(feature) {
  var geometry = feature.getGeometry();
  var styles = [
    // linestring
    new Style({
      stroke: new Stroke({
        color: '#ffcc33',
        width: 2
      })
    })
  ];

  geometry.forEachSegment(function(start, end) {
    var dx = end[0] - start[0];
    var dy = end[1] - start[1];
    var rotation = Math.atan2(dy, dx);
    // arrows
    styles.push(new Style({
      geometry: new Point(end),
      image: new Icon({
        src: 'data/arrow.png',
        anchor: [0.75, 0.5],
        rotateWithView: true,
        rotation: -rotation
      })
    }));
  });

  return styles;
};
var vector = new VectorLayer({
  source: vectorSource,
  style: styleFunction
});

export default{
    layers:[vector]
}