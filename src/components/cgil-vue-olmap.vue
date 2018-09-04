<style>
  
</style>

<template>
  <div ref="mainzone" class="main">
    <slot></slot>
      <el-container style="height: 100%">
        <el-header :height="toolbarHeight">
          <el-row type="flex" justify="space-between" class="row-bg" :gutter="1">
            <!--xs < 768px >= sm < 992px >= md < 1200px >= lg <1920px >= xl -->
            <el-col :xs="18" :sm="18" :md="16" :lg="14" :xl="13">
              <div class="grid-content bg-edit-toolbar" v-if="editGeomEnabled">
                <el-button-group>
                  <!--
                  <el-button id="cmdClear" type="warning" size="small" round @click="clearNewFeatures">Clear</el-button>
                  -->

                  <el-select v-if="isSmallScreen" id="modeSelector" :size="sizeOfControl"
                             v-on:change="changeMode" v-model="uiMode"
                             title="Cliquez pour sélectionner le mode de travail">
                    <el-option
                      v-for="item in modeOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                    </el-option>
                  </el-select>
                  <el-radio-group v-if="!isSmallScreen" v-model="uiMode" v-on:change="changeMode"
                                  :size="sizeOfControl"
                                  title="Cliquez pour sélectionner le mode de travail">
                    <el-radio-button v-for="item in modeOptions"
                                     :label="item.value" :key="item.value">{{item.label}}
                    </el-radio-button>
                  </el-radio-group>

                </el-button-group>
                <el-button id="cmdSave" v-show="editGeomEnabled " type="warning" :size="sizeOfControl"
                           @click="saveNewFeatures">Sauver
                </el-button>
                <span class="gostatus" v-show="(getNumPolygons > 0) && !isSmallScreen">{{getNumPolygons}} Polygones</span>
              </div>
              <div class="grid-content" v-if="!editGeomEnabled && searchEnabled">
                <cg-vue-auto-complete ref="mysearch"
                                      placeholder="Recherchez la position d'une adresse en entrant quelques caractères de celle-ci..."
                                      :size="sizeOfControl"
                                      :initial-ajax-data-source="geoAdrUrl"
                                      v-model="addressFound"
                                      @input="gotoSelectedAdr"
                                      @errorajax="aNetworkProblemHappened"
                ></cg-vue-auto-complete>
              </div>
            </el-col>
            <!-- <el-col :xs="0" :sm="3" :md="4" :lg="6" :xl="8">
              <div class="grid-content bg-purple-light" v-if="editGeomEnabled">
                <cg-vue-auto-complete ref="mysearch"
                                      placeholder="Recherchez la position d'une adresse en entrant quelques caractères de celle-ci..."
                                      :size="sizeOfControl"
                                      :initial-ajax-data-source="geoAdrUrl"
                                      v-model="addressFound"
                                      @input="gotoSelectedAdr"
                                      @errorajax="aNetworkProblemHappened"
                ></cg-vue-auto-complete>
              </div>
            </el-col> -->
            <!-- CONFIG layerSelector-->
            <el-col :xs="0" :sm="5" :md="3" :lg="3" :xl="3">
              <div class="grid-content bg-blue hidden-sm-and-down"
                   v-show="!isSmallScreen">
                <el-select :size="sizeOfControl"
                           v-on:change="changeLayer" v-model="activeLayer"
                           title="Cliquez pour sélectionner le fond de plan">
                  <el-option
                    v-for="item in layerOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
              </div>
            </el-col>
            <!-- CONFIG -->
            <el-col :xs="1" :sm="1" :md="1" :lg="1" :xl="1">
              <div class="grid-content" style="margin-right: auto; margin-left: auto">
                <el-button :size="sizeOfControl" type="primary"
                           @click="toggleConfig()"
                           style=" float:right; right: 1px;"
                           icon="el-icon-setting">
                </el-button>
              </div>
            </el-col>
          </el-row>
          <el-card class="box-card">
            <el-form label-position="left">
              <el-form-item label="Commune pour les adresses:" :size="sizeOfControl">
                <el-select v-model="currentOfsFilter" placeholder="Select"
                           :size="sizeOfControl"
                           style=" float:right; right: 1px;"
                           @change="updateOfsFilter">
                  <el-option
                    v-for="item in arrListCities"
                    :key="item.ofs"
                    :label="item.label"
                    :value="item.ofs">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="Choix du fond de plan :" :size="sizeOfControl">
                <el-select :size="sizeOfControl"
                           v-on:change="changeLayer" v-model="activeLayer"
                           style=" float:right; right: 1px;"
                           title="Cliquez pour sélectionner le fond de plan">
                  <el-option
                    v-for="item in layerOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-form>
          </el-card>
        </el-header>
        <el-main  style="padding: 0">
          <div ref="mymap" class="map-content"></div>
        </el-main>
      </el-container>
    </div>
</template>

<script>
import {BASE_REST_API_URL, DEV, geoJSONUrl} from './config'
/* TODO : test a way to include only what i need from element-ui
   in the mean time you need to
   import ElementUI from 'element-ui'
   import 'element-ui/lib/theme-chalk/index.css'
   Vue.use(ElementUI)
  import {Button, ButtonGroup, Container, Header, RadioGroup, Select, Option } from 'element-ui'
  */

import OlCollection from 'ol/collection'
import OlFormatWKT from 'ol/format/wkt'
import {dumpObject2String, isNullOrUndefined} from 'cgil-html-utils'
import Log from 'cgil-log'
// not using cgil-vue-autocomplete npm to handle element-ui integration
import cgVueAutoComplete from './cgil-vue-autocomplete-element-ui'
import {
  addGeoJSONPolygonLayer,
  addGeoJsonPolygonToLayer,
  loadGeoJsonUrlPolygonLayer,
  addWktPolygonToLayer,
  dumpFeatureToString,
  getMultiPolygonWktGeometryFromPolygonFeaturesInLayer,
  getNumberFeaturesInLayer,
  getNumVerticesPolygonFeature,
  getOlMap,
  getOlView,
  getWktGeometryFeaturesInLayer,
  initNewFeaturesLayer,
  isValidPolygon,
  setCreateMode,
  setModifyMode,
  setTranslateMode
} from './OpenLayersSwiss21781'

import listCities from './communesBBLidar2012'

// this.$Vue.components(Container.name, Container)

const positionGareLausanne = [537892.8, 152095.7]
const SMALL_SCREEN_WIDTH = 638 // smaller then the xs at <768 but at purpose !
const MEDIUM_SCREEN_WIDTH = 992
const MIN_HEIGHT = 700
const TOOLBARHEIGHT = 34
const MODULE_NAME = 'cgilVueOlMap'
const log = (DEV) ? new Log(MODULE_NAME, 4) : new Log(MODULE_NAME, 1);

export default {
  name: 'vue2MapOlSwiss21781',
  // components: {Button, Container, Header, RadioGroup, Select, Option},
  components: {cgVueAutoComplete},
  data () {
    return {
      msg: 'Basic OpenLayers Map',
      toolbarHeight: `${TOOLBARHEIGHT}px`,
      mapHeight: `${MIN_HEIGHT}px`,
      isSmallScreen: false,
      showConfig: false,
      sizeOfControl: 'small',
      uiMode: 'NAVIGATE',
      ol_interaction_draw: null,
      ol_map: null,
      ol_view: null,
      maxFeatureIdCounter: 0, // to give an id to polygon features
      ol_newFeatures: null, // ol collection of features used as vector source for CREATE mode
      ol_newFeaturesLayer: null, // Vector Layer for storing new features
      ol_Active_Interactions: [],
      activeLayer: 'fonds_geo_osm_bdcad_couleur',
      addressFound: null, // selected address to search
      currentOfsFilter: 0,
      arrListCities: [],
      geoAdrUrl: `${BASE_REST_API_URL}adresses/search_position?ofs=${this.ofsFilter}`, // backend to find address
      modeOptions: [{
        value: 'NAVIGATE',
        label: 'Navigation'
      }, {
        value: 'CREATE',
        label: 'Création'
      }, {
        value: 'EDIT',
        label: 'Edition'
      }, {
        value: 'TRANSLATE',
        label: 'Déplacer'
      }],
      layerOptions: [{
        value: 'fonds_geo_osm_bdcad_couleur',
        label: 'Plan ville couleur'
      }, {
        value: 'fonds_geo_osm_bdcad_gris',
        label: 'Plan cadastral (gris)'
      }, {
        value: 'orthophotos_ortho_lidar_2016',
        label: 'Orthophotos 2016'
      }, {
        value: 'orthophotos_ortho_lidar_2012',
        label: 'Orthophotos 2012'
      }]
    }
  },
  props: {
    zoom: {
      type: Number,
      default: 13
    },
    center: {
      type: Array,
      default: () => (positionGareLausanne)
    },
    baseLayer: {
      type: String,
      default: 'fonds_geo_osm_bdcad_couleur'
    },
    editGeomEnabled: {
      type: Boolean,
      default: false
    },
    searchEnabled: {
      type: Boolean,
      default: false
    },
    geomWkt: { // this geometry in WKT format wil be editable
      type: String,
      default: null
    },
    geomGeoJSON: { // this geometry in geomJSON format wil be editable
      type: Object,
      default: null
    },
    geojsonurl: { // this one allows to add a layer
      type: String,
      default: '',
    },
    ofsFilter: {
      type: Number,
      default: 0 // 0 to allow search address on all cities in city area, 5586 use lausanne only,
    }
  },
  watch: {
    geomWkt: function () {
      // TODO : here is a good place to see if change is really a different geometry from previous
      this._updateGeometry()
    },
    geomGeoJSON: function () {
      this._updateGeometry()
    }
  },
  computed: {
    getNumPolygons: function () {
      return getNumberFeaturesInLayer(this.ol_newFeaturesLayer)
    }
  },
  methods: {
    _updateGeometry: function () {
      if (!isNullOrUndefined(this.geomWkt)) {
        log.t(`# in _updateGeometry for geomWkt`, this.geomWkt)
        // TODO check for identical features and do not add them twice
        const numFeaturesAdded = addWktPolygonToLayer(this.ol_newFeaturesLayer, this.geomWkt, this.maxFeatureIdCounter)
        if (isNullOrUndefined(numFeaturesAdded)) {
          log.e(`# ERROR tying to add this invalid Geom from geomWkt : ${this.geomWkt}`, this.geomWkt)
        } else {
          log.l(`Successfully added this geomWkt to layer now layer has ${numFeaturesAdded} features !`)
          this.maxFeatureIdCounter += numFeaturesAdded
        }
      }
      if (!isNullOrUndefined(this.geomGeoJSON)) {
        // TODO check for identical features and do not add them twice
        log.t(`# in _updateGeometry for geomGeoJSON`, this.geomGeoJSON)
        const numFeaturesAdded = addGeoJsonPolygonToLayer(this.ol_newFeaturesLayer, this.geomGeoJSON, this.maxFeatureIdCounter)
        if (isNullOrUndefined(numFeaturesAdded)) {
          log.e(`# ERROR tying to add this invalid Geom from geomGeoJSON: ${this.geomGeoJSON}`, this.geomGeoJSON)
        } else {
          log.l(`Successfully added this geomGeoJSON to layer now layer has ${numFeaturesAdded} features !`)
          this.maxFeatureIdCounter += numFeaturesAdded
        }
      }
      if (getNumberFeaturesInLayer(this.ol_newFeaturesLayer) > 0) {
         log.t(`# in _updateGeometry adjusting view to extent of features:`, )
        // cgil added 2 lines of code to recenter the view to the actual geometry layer
        const extent = this.ol_newFeaturesLayer.getSource()
                           .getExtent();
        log.l(`# in _updateGeometry extent :`, extent)
        this.ol_map.getView()
            .fit(extent, this.ol_map.getSize());
      }
    },
    changeLayer: function (event) {
      let selectedLayer = null
      if (isNullOrUndefined(event.target)) {
        selectedLayer = this.activeLayer
      } else {
        selectedLayer = event.target.value
      }
      let layers = this.ol_map.getLayers()
      layers.forEach((layer) => {
        log.l(`## in changeLayer layers.forEach: layer = ${layer.get('title')}`, layer)
        let layerName = layer.get('source').layer_
        if (layer.get('type') === 'base') {
          if (layerName === selectedLayer) {
            layer.setVisible(true)
          } else {
            layer.setVisible(false)
          }
        }
      })
    },
    changeMode: function (event) {
      let selectedMode = null
      if (isNullOrUndefined(event.target)) {
        selectedMode = this.uiMode
      } else {
        selectedMode = event.target.value
      }
      if (DEV) log.l(`## in changeMode selectedMode = ${selectedMode}`)
      this.ol_Active_Interactions.forEach((Interaction) => {
        this.ol_map.removeInteraction(Interaction)
      })
      switch (selectedMode) {
        case 'NAVIGATE':
          break
        case 'CREATE':
          // TODO TEST VALIDITY OF NEW GEOMETRY IN CREATE MODE, not only when editing
          this.ol_interaction_draw = setCreateMode(
            this.ol_map,
            this.ol_newFeatures,
            this.ol_Active_Interactions,
            this.maxFeatureIdCounter,
            (newGeom) => {
              // here is a good place to save geometry
              const formatWKT = new OlFormatWKT()
              let featureWKTGeometry = formatWKT.writeFeature(newGeom)
              if (DEV) {
                log.l(`## in changeMode callback for setCreateMode`, newGeom)
                log.l(`** newGeom in wkt format : ${featureWKTGeometry}`)
              }
              let wkt = getMultiPolygonWktGeometryFromPolygonFeaturesInLayer(this.ol_newFeaturesLayer)
              this.$emit('gomapgeomchanged', wkt)
            })
          break
        case 'EDIT':
          setModifyMode(this.ol_map, this.ol_newFeaturesLayer, this.ol_Active_Interactions,
            (newGeom) => {
              log.t(`## in changeMode callback for setModifyMode`, newGeom)
              // log.l(`** newGeom in wkt format : ${featureWKTGeometry}`)
              let wkt = getMultiPolygonWktGeometryFromPolygonFeaturesInLayer(this.ol_newFeaturesLayer)
              this.$emit('gomapgeomchanged', wkt)
              log.l(`** BEGIN LAYER CONTENTS **\n${getWktGeometryFeaturesInLayer(this.ol_newFeaturesLayer)}\n** END LAYER CONTENTS **`)
            })
          break
        case 'TRANSLATE':
          // TODO simplify precision of coords after a translate
          setTranslateMode(this.ol_map, this.ol_newFeaturesLayer, this.ol_Active_Interactions)
          break
        default:
          if (DEV) log.w(`## in changeMode selectedMode = ${selectedMode} NOT IMPLEMENTED`)
      }
    },
    clearNewFeatures: function () {
      if (this.ol_newFeatures !== null) {
        this.ol_newFeatures.clear()
        this.ol_Active_Interactions.forEach((Interaction) => {
          this.ol_map.removeInteraction(Interaction)
        })
        this.uiMode = 'NAVIGATE'
      }
    },
    saveNewFeatures: function () {
      if (this.ol_newFeatures !== null) {
        let wkt = getMultiPolygonWktGeometryFromPolygonFeaturesInLayer(this.ol_newFeaturesLayer)
        this.$emit('gomapSaveGeomClick', wkt)
        this.showMessage(`Data SAVED ${wkt}`)
      }
    },
    showMessage: function (message, type = 'success') {
      const h = this.$createElement
      this.$message({
        message: h('p', null, [
          h('span', null, message),
          h('i', {style: 'color: teal'}, 'VNode')
        ]),
        type: type
      })
    },
    gotoSelectedAdr: function (objSelected) {
      log.t(`# doSomethingWithSelectedAdr`, objSelected)
      if (!isNullOrUndefined(objSelected)) {
        // this.arrSelectionsAdresse.push(objSelected)
        if (!isNullOrUndefined(objSelected.id)) {
          const arrCoords = objSelected.id.split('_')
          const newPos = [ Number.parseFloat(arrCoords[0]) , Number.parseFloat(arrCoords[1])]
          this.ol_view.setCenter(newPos)
          this.ol_view.setZoom(9)
        }
      }
    },
    aNetworkProblemHappened: function (msg) {
      log.e(`aNetworkProblemHappened --> ${msg}`)
    },
    toggleConfig: function () {
      this.showConfig = !this.showConfig
      this.toolbarHeight = this.showConfig ? '166px' : '34px'
    },
    updateOfsFilter: function (val) {
      log.t(`# updateOfsFilter new citiy filter :${this.currentOfsFilter}`, val)
      this.geoAdrUrl = `${BASE_REST_API_URL}adresses/search_position?ofs=${this.currentOfsFilter}`
      this.$refs.mysearch.setAjaxDataSource(this.geoAdrUrl)
    },
    updateScreen: function () {
        log.t(`# updateScreen screen Width x Height : ${this.$refs.mainzone.clientWidth} x ${this.$refs.mainzone.clientHeight}`)
        this.$refs.mymap.style.height = `${this.$refs.mainzone.clientHeight - TOOLBARHEIGHT}px`;
        if (this.$refs.mainzone.clientWidth < 0) {
          if (this.$refs.mymap.clientWidth < SMALL_SCREEN_WIDTH) {
            this.isSmallScreen = true
            this.sizeOfControl = 'mini'
          } else {
            this.isSmallScreen = false
            this.sizeOfControl = 'small'
          }
          if (this.$refs.main.clientWidth > MEDIUM_SCREEN_WIDTH) {
            if (this.showConfig === true) {
              // this.toggleConfig()
            }
          }
          this.ol_map.updateSize()
        } else {
          this.ol_map.updateSize()
        }
    }
  }, // end of methods section
  mounted () {
    log.t(`## in mounted `)
    this.currentOfsFilter = this.ofsFilter // on fixe la valeur initiale de la commune
    this.geoAdrUrl = `${BASE_REST_API_URL}adresses/search_position?ofs=${this.currentOfsFilter}`
    // this.$refs.mysearch.setAjaxDataSource(this.geoAdrUrl)
    log.t(`## in mounted geoJSONUrl : ${geoJSONUrl}`)
    this.arrListCities = listCities
    this.ol_view = getOlView(this.center, this.zoom);
    console.log(this.ol_view)
    if (DEV) {
      // log.l(`geoJSONUrl : ${geoJSONUrl}`)
      // log.l(`geomWkt : ${this.geomWkt}`)
    }
    if (this.$refs.mymap.clientWidth < 626) {
      this.isSmallScreen = true
      this.sizeOfControl = 'mini'
    } else {
      this.isSmallScreen = false
      this.sizeOfControl = 'small'
    }
    this.ol_map = getOlMap(this.$refs.mymap, this.ol_view)
    if (this.geojsonurl.length > 4) {
      log.l(`will enter in loadGeoJsonUrlPolygonLayer(geojsonurl:${this.geojsonurl}`);
      loadGeoJsonUrlPolygonLayer(this.ol_map, this.geojsonurl);
    }
    this.ol_newFeatures = new OlCollection()
    this.ol_newFeaturesLayer = initNewFeaturesLayer(this.ol_map, this.ol_newFeatures)
    this._updateGeometry()
    this.updateScreen()
    // ## EVENTS ##
    this.ol_map.on('click',
      (evt) => {
        if (DEV) {
          log.t(`## BEGIN GoMap click callback : ${Number(evt.coordinate[0]).toFixed(2)},${Number(evt.coordinate[1]).toFixed(2)}}`)
          // log.l(`** BEGIN LAYER CONTENTS **\n${getWktGeometryFeaturesInLayer(this.ol_newFeaturesLayer)}\n** END LAYER CONTENTS **`)
          // let wkt = getMultiPolygonWktGeometryFromPolygonFeaturesInLayer(this.ol_newFeaturesLayer)
          // log.l(wkt)
        }
        if (this.uiMode === 'NAVIGATE') {
          this.ol_map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
            log.l(`## GoMap click evt feature detected : \n${dumpFeatureToString(feature)}`, feature)
            if (!isNullOrUndefined(layer)) log.l(`   feature found in layer : `, layer.get('name'))
            log.l(dumpObject2String(feature.getProperties()))
            this.$emit('selfeature', feature)
          })
        } else {
          if (this.uiMode === 'CREATE') {
            if (!isNullOrUndefined(this.ol_interaction_draw)) {
              if (this.ol_interaction_draw.getActive() === true) {
                let numVertices = getNumVerticesPolygonFeature(this.ol_interaction_draw.currentFeature);
                console.log("s")
                if (numVertices > 3) {
                  let ok = isValidPolygon(this.ol_interaction_draw.currentFeature, evt.coordinate)
                  if (ok) {
                    log.t(`## GoMap click in CREATE MODE ${dumpFeatureToString(this.ol_interaction_draw.currentFeature)}`, this.ol_interaction_draw.currentFeature)
                  } else {
                    log.w(`## WARNING SELF-INTERSECT GoMap click in CREATE MODE ${dumpFeatureToString(this.ol_interaction_draw.currentFeature)}`, this.ol_interaction_draw.currentFeature)
                    this.ol_interaction_draw.removeLastPoint()
                  }
                }
              }
            }
          }
          this.$emit('gomapclick', evt.coordinate)
        }
        log.t(`## END GoMap click callback : ${Number(evt.coordinate[0]).toFixed(2)},${Number(evt.coordinate[1]).toFixed(2)}}`)
      })
    window.onresize = () => {
      log.l(`## GoMap IN onresize client Width x Height : ${this.$refs.mainzone.clientWidth} x ${this.$refs.mainzone.clientHeight}`)
      /*// log.l(`screen clientWidth ${this.$refs.mymap.clientWidth}`)
      if (this.$refs.mymap.clientWidth < SMALL_SCREEN_WIDTH) {
        this.isSmallScreen = true
        this.sizeOfControl = 'mini'
      } else {
        this.isSmallScreen = false
        this.sizeOfControl = 'small'
      }
      if (this.$refs.mymap.clientWidth > MEDIUM_SCREEN_WIDTH) {
        if (this.showConfig === true) {
          // this.toggleConfig()
        }
      }
      this.ol_map.updateSize()*/
      this.updateScreen()
    }
  }
}
</script>
