<template>
  <div class="list-switcher">
    <el-dropdown
      class="list-dropdown"
      trigger="click"
      :disabled="disabled"
      @command="$emit('select', $event)"
    >
      <button
        class="list-trigger"
        type="button"
        :disabled="disabled"
        aria-label="切换决策清单"
        aria-haspopup="listbox"
      >
        <span class="list-trigger__copy">
          <small>当前清单</small>
          <strong>{{ currentList.name }}</strong>
        </span>
        <span class="list-trigger__count">{{ currentList.items.length }} 项</span>
        <i class="el-icon-arrow-down" aria-hidden="true"></i>
      </button>

      <el-dropdown-menu slot="dropdown" class="decision-list-menu">
        <el-dropdown-item
          v-for="list in lists"
          :key="list.id"
          :command="list.id"
          :class="{ 'is-active': list.id === activeId }"
        >
          <span class="decision-list-menu__name">{{ list.name }}</span>
          <small>{{ list.items.length }} 项</small>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>

    <el-button
      class="manage-button"
      icon="el-icon-setting"
      :disabled="disabled"
      @click="$emit('manage')"
    >
      管理
    </el-button>
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
  }
}
</script>

<style scoped>
.list-switcher {
  display: flex;
  align-items: stretch;
  gap: 10px;
}

.list-dropdown {
  display: block;
}

.list-trigger {
  display: flex;
  align-items: center;
  min-width: 226px;
  height: 58px;
  padding: 8px 13px 8px 15px;
  border: 1px solid var(--line);
  border-radius: 10px 4px 10px 4px;
  color: var(--ink);
  background: rgba(255, 250, 242, 0.88);
  box-shadow: 0 8px 24px rgba(85, 55, 33, 0.08);
  cursor: pointer;
  transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease, background-color 160ms ease;
}

.list-trigger:hover:not(:disabled) {
  border-color: rgba(214, 80, 50, 0.42);
  background: var(--paper-soft);
  box-shadow: 0 10px 28px rgba(85, 55, 33, 0.13);
  transform: translateY(-1px);
}

.list-trigger:active:not(:disabled) {
  transform: translateY(1px);
}

.list-trigger:focus-visible {
  outline: 3px solid var(--focus);
  outline-offset: 3px;
}

.list-trigger:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.list-trigger__copy {
  min-width: 0;
  margin-right: auto;
  text-align: left;
}

.list-trigger__copy small {
  display: block;
  margin-bottom: 3px;
  color: var(--ink-muted);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.list-trigger__copy strong {
  display: block;
  max-width: 110px;
  overflow: hidden;
  font-size: 14px;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-trigger__count {
  flex: 0 0 auto;
  margin-left: 12px;
  padding: 5px 7px;
  border-radius: 4px;
  color: #74421f;
  background: var(--wheat-soft);
  font-size: 10px;
  font-weight: 800;
}

.list-trigger .el-icon-arrow-down {
  margin-left: 8px;
  color: var(--tomato);
  font-size: 12px;
}

.manage-button.el-button {
  height: 58px;
  padding: 0 16px;
  border-color: var(--line);
  border-radius: 4px 10px 4px 10px;
  color: var(--ink-soft);
  background: rgba(255, 250, 242, 0.66);
  font-weight: 700;
  transition: border-color 160ms ease, color 160ms ease, background-color 160ms ease, transform 160ms ease;
}

.manage-button.el-button:hover,
.manage-button.el-button:focus {
  border-color: var(--tomato);
  color: var(--tomato-dark);
  background: var(--paper-soft);
}

.manage-button.el-button:active {
  transform: translateY(1px);
}

.manage-button.el-button:focus-visible {
  outline: 3px solid var(--focus);
  outline-offset: 3px;
}

@media (max-width: 767px) {
  .list-switcher {
    width: 100%;
  }

  .list-dropdown {
    flex: 1;
    min-width: 0;
  }

  .list-trigger {
    width: 100%;
    min-width: 0;
    height: 54px;
  }

  .list-trigger__copy strong {
    max-width: min(34vw, 150px);
  }

  .manage-button.el-button {
    height: 54px;
  }
}

@media (max-width: 420px) {
  .list-trigger__count {
    display: none;
  }

  .manage-button.el-button {
    padding: 0 13px;
  }
}
</style>
