<template>
  <div>
    <el-collapse :class="['formal-container', formalStackList.length || 'empty']">
      <p
        v-if="!formalStackList.length"
        class="draggable-area help"
      >
        将下方备选进展拖动至该区域编辑事件
      </p>
      <draggable
        v-model="formalStackList"
        :options="{ group: 'stacks' }"
        :class="['draggable-area', 'arrange-stack', !reversed || 'reversed']"
      >
        <el-collapse-item
          v-for="(stack, i) of formalStackList"
          :key="stack.id"
          :name="stack.id"
        >
          <template slot="title">
            <div class="collapse-title">
              <span>
                {{ formalStackList.length - i }}.
                {{ stack.title }} -
                {{ getTime(stack) || '无初始日期' }}
                <el-tag
                  v-if="i === 0"
                  size="mini"
                  :disable-transitions="true"
                >
                  最新进展
                </el-tag>
                <el-tag
                  v-else-if="i === formalStackList.length - 1"
                  size="mini"
                  :disable-transitions="true"
                >
                  首个进展
                </el-tag>
              </span>
            </div>
          </template>
          <p>{{ stack.description }}</p>
          <el-button
            type="text"
            @click="edit(stack)"
          >
            编辑进展
          </el-button>
        </el-collapse-item>
      </draggable>
    </el-collapse>
    <div class="save-button">
      <span>发布推送</span>
      <el-switch v-model="enableNotification" />
      <el-button
        size="medium"
        type="primary"
        :loading="saving"
        @click="changeOrder"
      >
        保存修改
      </el-button>
    </div>
    <h4 class="subtitle">
      备选进展
    </h4>
    <draggable
      v-model="remainingStackList"
      :options="{ group: 'stacks' }"
      class="remaining-list"
    >
      <event-stack-card
        v-for="stack of remainingStackList"
        :key="stack.id"
        :stack="stack"
        @click="edit(stack)"
      />
    </draggable>

    <el-dialog
      title="编辑进度"
      :visible.sync="dialogVisible"
      :append-to-body="true"
      @close="finishEditing()"
    >
      <div class="sorter">
        修改基本信息
      </div>
      <event-stack-editor
        v-if="stackEdited"
        :stack="stackEdited"
        @edited="finishEditing()"
      />
      <div class="divider" />
      <div class="sorter">
        管理进展新闻
      </div>
      <event-stack-news-arrange
        v-if="stackEdited"
        :stack="stackEdited"
      />
    </el-dialog>
  </div>
</template>

<script>
import draggable from 'vuedraggable';
import ElCollapse from 'element-ui/lib/collapse';
import ElCollapseItem from 'element-ui/lib/collapse-item';
import EventStackCard from '~/components/EventStack/EventStackCard.vue';
import EventStackEditor from '~/components/EventStack/EventStackEditor.vue';
import EventStackNewsArrange from '~/components/EventStack/EventStackNewsArrange.vue';

import getLocalTime from '~/utils/getLocalTime.js';

import '~/static/element/collapse.css';
import '~/static/element/collapse-item.css';

export default {
  components: {
    draggable,
    'el-collapse': ElCollapse,
    'el-collapse-item': ElCollapseItem,
    'event-stack-card': EventStackCard,
    'event-stack-editor': EventStackEditor,
    'event-stack-news-arrange': EventStackNewsArrange,
  },
  props: {
    'event': Object,
    'reversed': Boolean,
  },
  data() {
    return {
      stackList: [],
      formalStackList: [],
      remainingStackList: [],
      dialogVisible: false,
      stackEdited: null,
      saving: false,
      enableNotification: true,
    };
  },
  async created() {
    await this.updateStackList();
  },
  methods: {
    async updateStackList() {
      this.stackList = await this.$store.dispatch('fetchStackList', {
        where: {
          eventId: this.event.id,
        },
      });
      this.formalStackList = this.stackList.filter(s => s.status === 'admitted' && s.order >= 0);
      this.remainingStackList = this.stackList.filter(s => s.status !== 'admitted' || s.order < 0);
      this.formalStackList.sort((a, b) => b.order - a.order);
    },
    async changeOrder() {
      this.saving = true;
      try {
        const changeList = [];
        for (let i = this.formalStackList.length - 1; i >= 0; i--) {
          changeList.push({
            id: this.formalStackList[this.formalStackList.length - i - 1].id,
            enableNotification: this.enableNotification,
            order: i,
          });
        }
        for (const stack of this.remainingStackList) {
          if (stack.order >= 0) {
            changeList.push({
              id: stack.id,
              enableNotification: this.enableNotification,
              order: -1,
            });
          }
        }
        await this.$axios.put('stack/list', {
          stackList: changeList,
        });
        await this.updateStackList();
        this.$message.success('修改成功');
      } catch (err) {
        this.$message.error('修改过程中发生错误');
        console.error(err);
      } finally {
        this.saving = false;
      }
    },
    edit(stack) {
      this.stackEdited = { ...stack };
      this.dialogVisible = true;
    },
    async finishEditing() {
      this.dialogVisible = false;
      this.stackEdited = null;
      await this.updateStackList();
    },
    getTime(stack) {
      if (!stack || !stack.time) return;
      const time = getLocalTime(stack.time);
      return `${time.getFullYear()}年${time.getMonth() + 1}月${time.getDate() }日`;
    },
  },
};
</script>

<style lang="scss" scoped>
  .formal-container {
    position: relative;
    width: 100%;
    margin-top: .5rem;
  }

  .formal-container:not(.empty) {
    border-bottom: none;
  }

  .draggable-area {
    min-height: 3rem;
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .draggable-area:not(.help) {
    padding-bottom: 1rem;
  }

  .draggable-area.help {
    text-align: center;
    vertical-align: middle;
    background-color: #fcfcfc;
    position: absolute;
    line-height: 3rem;
    top: 0;
    z-index: -100;
    font-size: 14px;
  }

  .reversed {
    flex-direction: column-reverse;
  }

  .collapse-title {
    height: 100%;
    display: flex;
    align-items: center;
    overflow: hidden;
  }

  .collapse-title > *:not(:last-child) {
    margin-right: .25rem;
  }

  .save-button {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-top: .5rem;
  }

  .save-button > * {
    margin-left: .5rem;
  }

  .save-button span {
    font-size: 14px;
  }

  .subtitle {
    margin-top: 1rem;
  }

  .remaining-list {
    display: flex;
    flex-wrap: wrap;
  }

  .sorter {
    width: 100%;
    text-align: left;
    margin-top: 0;
  }
</style>
