<template>
  <card
    v-if="stack"
    class="stack-wrapper"
  >
    <span
      v-if="order"
      v-clipboard="stackUrl"
      v-analytics="{
        action: 'buttonClick',
        label: 'stackOrderNumber',
        value: stack.id
      }"
      class="order light-font"
      @success="copySuccess"
    >
      {{ order }}
    </span>
    <event-stack-content
      :stack="stack"
      :mode="mode"
      :is-latest-stack="isLatestStack"
    />
  </card>
</template>

<script>
import config from '~/const';
import EventStackContent from '~/components/EventStack/EventStackContent.vue';

export default {
  name: 'EventStack',
  components: {
    'event-stack-content': EventStackContent,
  },
  props: {
    stack: Object,
    order: Number,
    mode: String,
    event: Object,
    isLatestStack: Boolean,
  },
  computed: {
    stackUrl() {
      const event = this.event || this.stack.event;
      if (event.id) {
        return `${config.baseUrl}${event.id}/${this.stack.id}`;
      }

      return `config.baseUrl${event}/${this.stack.id}`;
    },
  },
  methods: {
    copySuccess() {
      this.$message.success('已将该进展分享链接拷贝至剪贴板');
    },
  },
};
</script>

<style lang="scss" scoped>
  @import "../../assets/variables.scss";

  .stack-wrapper {
    position: relative;
    padding: 0;
  }

  .order {
    font-size: 4.25rem;
    height: 4.25rem;
    line-height: 1;
    position: absolute;
    right: calc(100% - 1.25rem);
    top: .5rem;
    font-family: 'Times New Roman', Times, serif;
    cursor: pointer;
    font-weight: 900;
    transition: all .2s;
  }

  @media (max-width: 600px) {
    .order {
      position: relative;
      right: initial;
      top: 0;
      left: -.25rem;
      height: 3rem;
      font-size: 3.5rem;
      float: left;
      text-shadow: none !important;
    }

    .stack-wrapper {
      padding: .75rem 1rem;
    }
  }
</style>
