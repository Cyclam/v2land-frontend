<template>
  <div class="share">
    <i
      class="el-icon-error border-color"
      @click="admit('rejected')"
    />
    <i
      class="el-icon-success border-color"
      @click="admit('admitted')"
    />
  </div>
</template>

<script>
export default {
  props: {
    news: Object,
  },
  methods: {
    admit(result) {
      this.$store.dispatch('editNews', {
        data: { status: result },
        id: this.news.id,
      }).then(() => {
        this.$emit(result);
      });
    },
  },
};
</script>

<style lang="scss" scoped>
  @import "../../assets/variables.scss";

  .share {
    display: flex;
    margin-top: .25rem;
    font-size: 2rem;
  }

  .border-color {
    padding: .4rem;
    margin: 0 .2rem;
    transition: all .2s;
    cursor: pointer;
  }

  .border-color:before {
    color: rgb(129, 207, 224);
    transition: all .2s;
  }

  .el-icon-error:hover:before {
    color: #fa5555;
  }

  .el-icon-success:hover:before {
    color: #67c23a;
  }
</style>
