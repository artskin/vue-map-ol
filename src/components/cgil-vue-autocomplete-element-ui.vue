<template>
    <div>
        <div id='formFeedBack' class="alert alert-danger" v-if="isError">
            <strong>{{errMsg}}</strong>
        </div>

        <el-input name="search" ref="search" :size="size"
                  prefix-icon="el-icon-search" clearable
                  v-model='searchText' @keydown.enter="enter"
                  @keydown.tab="close" @keydown.up="up"
                  @keydown.down="down" @keydown.esc="close" @keyup='update'
                  @focus="gotFocus()"
                  v-bind:class="{isloading : isAjaxCallRunning}"
                  :placeholder="placeholder"
                  required="required">
        </el-input>

        <ul v-if="showSugestions" ref='suggestion' class="suggestion" tabindex="0">
            <template v-for="(result, key) in arrResults">
                <li :key="key" :data="result.id" @click.prevent="itemSelected(result, $event)" class="suggestion-item"
                    :class="{'suggestionitem__selected' : isSelected(key) }">{{ result[labelFieldName] }}
                </li>
            </template>
        </ul>
    </div>
</template>

<script>
import axios from 'axios'
import {isNullOrUndefined, debounce} from 'cgil-html-utils'
import Log from 'cgil-log'
import {DEV} from './config'
const MODULE_NAME = 'cgilVueAutoComplete'
const log = (DEV) ? new Log(MODULE_NAME, 4) : new Log(MODULE_NAME, 1);
const debounceDelay = 350 // in ms
const minChars = 2
// const cache = {}
axios.defaults.timeout = 4000
export default {
  name: 'cgilVueAutoComplete',
  components: {}, // end of components section
  data: () => {
    return {
      searchText: '',
      previousSearch: '',
      selectedIndex: null,
      isError: false,
      errMsg: '',
      selected: '',
      ajaxDataSource: null,
      isAjaxCallRunning: false,
      showSugestions: false,
      eventListener: null, // pour detecter click en dehor suggestion
      arrAxiosSource: [],
      arrAjaxResults: [], // when isAjaxDataSourceWithFilter is false we keep data here
      arrResults: [{
        id: 0,
        label: 'aucun résultats trouvés...'

      }]
    }
  }, // end of data section
  props: {
    placeholder: {
      type: String,
      default: ''
    },
    idFieldName: {
      type: String,
      default: 'id'
    },
    labelFieldName: {
      type: String,
      default: 'label'
    },
    initialAjaxDataSource: {
      type: String,
      default: ''
    },
    isAjaxDataSourceWithFilter: {
      type: Boolean,
      default: true
    },
    size: {
      type: String,
      default: 'small'
    }
  }, // end of props section
  watch: {
    searchText: function (val) {
      let search = val.trim()
      // if (search !== this.selected) {
      // new search begins so reset selected
      // this.selected = ''
      // this.selectedIndex = null
      // }
      if (this.isAjaxDataSourceWithFilter) {
        if (search.length < minChars) {
          this.arrResults = []
        }
        if (search !== this.previousSearch && this.selected.length < 1) {
          this.previousSearch = search
          if (search.length > minChars) {
            this.getData(search)
          }
        } else {
          // probably user pressed space
          if (!this.showSugestions && (this.arrResults.length > 1)) {
            this.showSugestions = true
          }
        }
      } else {
        // here isAjaxDataSourceWithFilter = false
        // so we are only filtering existing data with search criteria
        if (search !== this.previousSearch) {
          this.previousSearch = search
          // 'Åland(les Îles) Châtæü éöà☀ … 山田太郎☯ ˵ĈĀŇĂƊǠ˶ ☺' => aland(les iles) chatæu eoa☀ … 山田太郎☯ ˵canaɗa˶ ☺
          let searchNormalized = search.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
          this.arrResults = this.arrAjaxResults.filter(o => o[this.labelFieldName + '_normalized'].includes(searchNormalized))
        }
      }
    }
  }, // end of watch section
  created: function () {
    this.ajaxDataSource = this.initialAjaxDataSource
    log.t(`### created src: ${this.ajaxDataSource} , with filter? ${this.isAjaxDataSourceWithFilter}`)
    if (!this.isAjaxDataSourceWithFilter) {
      // we can load once the data from remote server and forget about it
      this.getData()
    }
  }, // end of created section
  mounted: function () {
    this.ajaxDataSource = this.initialAjaxDataSource
    log.t(`### mounted src: ${this.ajaxDataSource} , with filter? ${this.isAjaxDataSourceWithFilter}`)
  }, // end of created section
  methods: {
    setAjaxDataSource: function (newAjaxDataSource) {
      this.ajaxDataSource = newAjaxDataSource
      log.t(`### setAjaxDataSource src: ${this.ajaxDataSource} , with filter? ${this.isAjaxDataSourceWithFilter}`)
    },
    handleSearch: function (query, cb) {
      log.l(`## In handleSearch`, query, cb)
      let search = query.trim()
      if (this.isAjaxDataSourceWithFilter) {
        if (search.length < minChars) {
          this.arrResults = []
        }
        if (search !== this.previousSearch && this.selected.length < 1) {
          this.previousSearch = search
          if (search.length > minChars) {
            this.getData(search)
          }
        } else {
          // probably user pressed space
          if (!this.showSugestions && (this.arrResults.length > 1)) {
            this.showSugestions = true
          }
        }
      }
    },
    handleSelect: function (item) {
      log.l(`## In handleSelect`, item)
    },
    getData: debounce(function (query = '', cb = null) {
      var that = this
      log.t(`## in getData ${this.ajaxDataSource}`)
      log.l(`## In getData debounce CALLBACK : "${query}"`, query, cb)

      if (that.arrAxiosSource.length > 0) {
        that.arrAxiosSource.map(function (s) {
          s.cancel()
        })
        that.arrAxiosSource = []
      }
      var CancelToken = axios.CancelToken
      var source = CancelToken.source()
      that.arrAxiosSource.push(source)
      that.arrResults = []
      this.selectedIndex = null
      that.isAjaxCallRunning = true
      that.isError = false
      axios.get(this.ajaxDataSource , {
        params: { query: query },
        cancelToken: source.token
      }).then(function (response) {
        log.l(`#### AJAX CALL SUCCESS: "${query}" => num results = ${response.data.length}`)
        response.data.forEach(function (record) {
          that.arrResults.push(record)
        })
        that.isAjaxCallRunning = false
        if (that.arrResults.length > 0) {
          if (that.isAjaxDataSourceWithFilter) {
            that.showSugestions = true
            that.setEventListener()
          } else {
            that.arrAjaxResults = that.arrResults.map((val) => {
              let o = {}
              let labelNormalized = val[that.labelFieldName].normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
              o[that.labelFieldName + '_normalized'] = labelNormalized
              o[that.labelFieldName] = val[that.labelFieldName]
              o[that.idFieldName] = val[that.idFieldName]
              return o
            })
          }
        }
        that.isError = false
      })
        .catch(function (thrown) {
          if (axios.isCancel(thrown)) {
            log.w(`#### AJAX CALL CANCELED : "${query}" : ${thrown.message}`)
          } else {
            log.e(`#### AJAX ERROR on GET  ${that.ajaxDataSource}${query}`, thrown)
            that.errMsg = `Un problème est survenu pendant l'appel réseau AJAX sur : ${that.ajaxDataSource}${query} Message d'erreur reçu : ${thrown.message}`
            if (!window.navigator.onLine) {
              that.errMsg += 'EN CE MOMENT VOUS N\'AVEZ PAS DE RESEAU ! veuillez réessayez quand votre connexion sera rétablie '
            }
            log.e(that.errMsg)
            that.$emit('errorajax', that.errMsg)
            that.isError = true
          }
          that.isAjaxCallRunning = false
        })
    }, debounceDelay), // end of getData
    update: function (evt) {
      log.t('#Update Event ==> key: ' + evt.key + ', query: "' + this.searchText + '"')
      switch (evt.key) {
        case 'ArrowDown':
          // this.$refs.suggestion.focus()
      }
    },
    itemSelected: function (result, evt) {
      log.t('## itemSelected', result, evt)
      let tempObj = {}
      if (!isNullOrUndefined(result)) {
        tempObj = {...result}
      } else {
        tempObj[this.idFieldName] = evt.srcElement.data
        tempObj[this.labelFieldName] = evt.srcElement.innerText
      }
      // Emit the selected value through the input event
      this.$emit('input', tempObj)
      this.searchText = tempObj[this.labelFieldName]
      this.previousSearch = tempObj[this.labelFieldName]
      // this.selected = tempObj[this.labelFieldName]
      this.selectedIndex = null
      log.l(` data selected is : ${tempObj[this.idFieldName]}`)
      this.close()
    },
    isSelected: function (key) {
      return key === this.selectedIndex
    },
    up: function () {
      if (this.showSugestions) {
        log.t(`## up  selectedIndex:${this.selectedIndex} hasVerticalScrollbar: ${this.hasVerticalScrollbar(this.$refs.suggestion)}`)
        if (this.selectedIndex === 0) {
          this.selectedIndex = this.arrResults.length - 1
        } else {
          this.selectedIndex = this.selectedIndex - 1
          if (this.hasVerticalScrollbar(this.$refs.suggestion)) {
            this.scrollVertical(this.$refs.suggestion, -1)
          }
        }
      }
    },
    down: function () {
      if (this.showSugestions) {
        log.t(`## down   selectedIndex:${this.selectedIndex} hasVerticalScrollbar: ${this.hasVerticalScrollbar(this.$refs.suggestion)}`)
        if (this.selectedIndex === null) {
          this.selectedIndex = 0
          return
        }
        if (this.selectedIndex === this.arrResults.length - 1) {
          this.selectedIndex = 0
        } else {
          this.selectedIndex = this.selectedIndex + 1
          if (this.hasVerticalScrollbar(this.$refs.suggestion) && this.selectedIndex > 5) {
            this.scrollVertical(this.$refs.suggestion, 1)
          }
        }
      }
    },
    enter: function () {
      if (!isNullOrUndefined(this.selectedIndex)) {
        this.itemSelected(this.arrResults[this.selectedIndex])
      }
    },
    gotFocus: function () {
      log.t('## gotFocus  ')
      if (!this.isAjaxDataSourceWithFilter) {
        this.showSugestions = true
        this.setEventListener()
      }
    },
    close: function () {
      log.t('## close  ')
      this.showSugestions = false
      this.arrResults = []
      this.removeEventListener()
    },
    reset: function () {
      log.t('## reset  ')
      this.searchText = ''
      this.arrResults = []
      // let tempObj = {}
      // reset the selected value through the input event
      this.$emit('input', null)
    },
    setEventListener: function () {
      log.t('## setEventListener  ')
      if (this.eventListener) {
        return false
      }
      this.eventListener = true
      document.addEventListener('click', this.clickOutsideListener, true)
      return true
    },
    removeEventListener: function () {
      log.t('## removeEventListener  :')
      this.eventListener = false
      document.removeEventListener('click', this.clickOutsideListener, true)
    },
    clickOutsideListener: function (evt) {
      let test = (evt.target !== this.$refs.suggestion) && (evt.target !== this.$refs.search)
      log.t('## clickOutsideListener  :', evt, evt.target, test)
      if (test) {
        this.close()
      }
    },
    hasVerticalScrollbar: function (el) {
      return el.scrollHeight > el.clientHeight
    },
    scrollVertical: function (el, numLines) {
      log.t(`## scrollVertical  numLines: ${numLines}`)
      log.l(`element scrollTop before: ${el.scrollTop}`)
      let offsetY = el.children[0].clientHeight || 12
      el.scrollTop += (numLines * offsetY)
      log.l(`element scrollTop after : ${el.scrollTop}`)
    }
  } // end of methods section
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

    .suggestion {
        margin: 0;
        padding: 0;
        list-style-type: none;
        z-index: 1000;
        position: absolute;
        max-height: 400px;
        overflow-y: auto;
        background: #fff;
        width: 100%;
        border: 1px solid #ccc;
        border-top: 0;
        color: #000;
        text-align: left;

    }

    .suggestion-item {
        cursor: pointer;
        list-style-type: none;
        padding-left: 10px;
    }

    .suggestion-item:hover {
        background: rgba(0, 180, 255, .075);
    }

    .suggestionitem__selected {
        background: rgba(0, 150, 255, .075);
        border: #3E82F7 solid 1px;
    }

    .isloading {
        background: white url("./ui-anim_basic_16x16.gif") center no-repeat;
        background-position-x: 80%;
    }

</style>
