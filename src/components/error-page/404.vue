<template>
  <div class="error-page">
    <div
      class="img"
      style=" background-image: url('/img/bg/404.svg');"
    />
    <div class="content">
      <h1>无访问权限</h1>
      <div class="desc">
        抱歉，您无权限访问此页面，请联系管理员！
      </div>
      <div class="actions">
        <router-link :to="{ path: '/' }">
          <el-button type="primary">
            返回首页
          </el-button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Error404'
}
</script>
<style lang="scss" scoped>
@import './style.scss';
</style>
