<template>
  <div class="inline">
    <a
      v-if="news"
      class="news"
      :href="`/${news.event.id || news.event}/${news.id}`"
      onclick="return false;"
      @click="dialogVisible = true"
    ><i class="icon-newspaper" />{{ news.title }}</a>
    <span
      v-else-if="error"
      class="news error"
    >该新闻不存在或被隐藏</span>
    <span
      v-else
      class="news loading"
    ><i class="el-icon-loading" /> 新闻加载中</span>

    <el-dialog
      :visible.sync="dialogVisible"
      :append-to-body="true"
      class="comment-news"
    >
      <div slot="title" />
      <event-news-content
        v-if="news"
        :news="news"
        mode="quote"
        @redirect="dialogVisible = false"
      />
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'CommentItemNews',
  props: {
    content: Number,
  },
  data() {
    return {
      news: null,
      error: false,
      dialogVisible: false,
    };
  },
  async created() {
    await this.getNews();
  },
  methods: {
    async getNews() {
      try {
        this.news = await this.$store.dispatch('getNews', this.content);
      } catch (err) {
        console.error(err);
        this.error = true;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
  @import '../../assets/variables.scss';

  .news {
    color: $light-color;
    font-size: .8rem;
    background-color: $light-background;
    border-radius: .125rem;
    padding: .25rem;
    margin: 0;
    cursor: pointer;
    padding-bottom: .1125rem;
    border-bottom: .1125rem solid transparent;
  }

  .news.error {
    background-color: $error-background;
    color: $error-color;
  }

  .news:hover {
    border-bottom-color: $light-border;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  .news.error:hover {
    border-bottom-color: $error-border;
  }

  .icon-newspaper {
    position: relative;
    margin-left: .125rem;
    margin-right: .25rem;
    top: 1px;
  }
</style>
