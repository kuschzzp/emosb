<template>
  <div class="list-switcher">
    <el-dropdown
      class="list-dropdown"
      trigger="click"
      :disabled="disabled"
      @command="handleCommand"
    >
      <button
        class="list-trigger"
        type="button"
        :disabled="disabled"
        aria-label="切换或管理决策清单"
        aria-haspopup="menu"
      >
        <span class="list-trigger__mark" aria-hidden="true">
          <i class="el-icon-collection"></i>
        </span>
        <span class="list-trigger__copy">
          <span class="list-trigger__title">
            <strong :title="currentList.name">{{ currentList.name }}</strong>
          </span>
        </span>
        <span class="list-trigger__count">{{ currentList.items.length }} 项</span>
        <i class="el-icon-arrow-down" aria-hidden="true"></i>
      </button>

      <el-dropdown-menu slot="dropdown" class="decision-list-menu">
        <el-dropdown-item
          v-for="list in lists"
          :key="list.id"
          :command="{ type: 'select', id: list.id }"
          :class="{ 'is-active': list.id === activeId }"
        >
          <span class="decision-list-menu__marker" aria-hidden="true">
            <i v-if="list.id === activeId" class="el-icon-check"></i>
          </span>
          <span class="decision-list-menu__copy">
            <span class="decision-list-menu__title">
              <strong class="decision-list-menu__name" :title="list.name">
                {{ list.name }}
              </strong>
            </span>
            <small>{{ list.items.length }} 项</small>
          </span>
        </el-dropdown-item>
        <el-dropdown-item
          divided
          class="decision-list-menu__action"
          :command="{ type: 'create' }"
        >
          <i class="el-icon-plus" aria-hidden="true"></i>
          <span>新建清单</span>
        </el-dropdown-item>
        <el-dropdown-item
          class="decision-list-menu__action"
          :command="{ type: 'manage' }"
        >
          <i class="el-icon-setting" aria-hidden="true"></i>
          <span>管理清单</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
export default {
  name: 'ListSwitcher',
  props: {
    lists: {
      type: Array,
      required: true
    },
    activeId: {
      type: String,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    currentList() {
      return this.lists.find(list => list.id === this.activeId)
        || this.lists[0]
        || { name: '暂无清单', items: [] }
    }
  },
  methods: {
    handleCommand(command) {
      if (command.type === 'select') {
        this.$emit('select', command.id)
      } else if (command.type === 'create') {
        this.$emit('create')
      } else if (command.type === 'manage') {
        this.$emit('manage')
      }
    }
  }
}
</script>

<style scoped>
.list-switcher { flex: 1; min-width: 0; }
.list-dropdown { display: block; }
.list-trigger { display: flex; align-items: center; width: 100%; min-height: 82px; gap: 12px; padding: 14px 18px; border: 0; color: var(--ink); background: transparent; cursor: pointer; text-align: left; }
.list-trigger:hover:not(:disabled) { background: var(--wheat-soft); }
.list-trigger__mark { flex: 0 0 auto; color: var(--tomato-dark); font-size: 28px; }
.list-trigger__copy { min-width: 0; flex: 0 1 auto; }
.list-trigger__title { display: block; }
.list-trigger__title strong { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 20px; font-weight: 800; }
.list-trigger__count { flex: 0 0 auto; color: var(--ink-soft); font-size: 16px; white-space: nowrap; }
.list-trigger .el-icon-arrow-down { flex: 0 0 auto; margin-left: auto; font-size: 14px; }
@media (max-width: 1000px) { .list-trigger { padding: 12px; gap: 8px; min-height: 68px; } .list-trigger__title strong { font-size: 16px; } .list-trigger__count { font-size: 13px; } .list-trigger__mark { font-size: 23px; } }
@media (max-width: 767px) { .list-trigger { min-height: 62px; } }
@media (max-width: 359px) { .list-trigger__count { display: none; } }
</style>
