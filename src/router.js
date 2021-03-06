import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/home',
      name: 'home',
      component: Home
    },
    {
      path: '/',
      name: 'kdmappage',
      component: () => import(/* webpackChunkName: "about" */ './views/olmap.vue')
    },
    {
      path: '/map_leaflet',
      name: 'map_leaflet',
      component: () => import(/* webpackChunkName: "about" */ './views/map_leaflet.vue')
    },
    {
      path: '/arrowline',
      name: 'arrowlinepage',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/arrowline.vue')
    }
  ]
})
