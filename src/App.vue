<style>
body{margin: 0;padding: 0;background-color: #15142b}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #b1b1b5;
  margin-top: 0px;
}
.el-header, .el-footer {
  background-color: #1f203a;
  text-align: left;
  line-height: 60px;
}

.el-aside {
  background-color: #0e0c28;
  line-height: 200px;
}
.el-menu{border-right: 0;}
</style>
<template>
  <div id="app">
    <el-container>
      <el-header>Shopping Mall</el-header>
      <el-container>
        <el-aside width="200px">
          <el-menu
            id="nav"
            default-active="$route.path"
            class="el-menu-vertical-demo"
            @open="handleOpen"
            @close="handleClose"
            background-color="#0e0c28"
            text-color="#7072a5"
            active-text-color="#fff"
            router>
            <el-submenu index="1">
              <template slot="title">
                <i class="el-icon-location"></i>
                <span>Dashboard</span>
              </template>
              <el-menu-item-group>
                <template slot="title">分组一</template>
                <el-menu-item index="/home">Home</el-menu-item>
                <el-menu-item index="/">Map-Openlayer</el-menu-item>
                <el-menu-item index="/arrowline">Arrow Line Map</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
            <el-menu-item index="/">
              <i class="el-icon-menu"></i>
              <span slot="title">Map-Openlayer</span>
            </el-menu-item>
            <el-menu-item index="/arrowline">
              <i class="el-icon-setting"></i>
              <span slot="title">Arrow Line Map</span>
            </el-menu-item>
            <el-menu-item index="3" disabled>
              <i class="el-icon-document"></i>
              <span slot="title">禁用</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-main>
          <router-view/>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
  export default {
    methods: {
      handleOpen(key, keyPath) {
        console.log(key, keyPath);
      },
      handleClose(key, keyPath) {
        console.log(key, keyPath);
      }
    }
  }
</script>