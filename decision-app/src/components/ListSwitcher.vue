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
          <small>当前清单</small>
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
.list-switcher {
  display: block;
}

.list-dropdown {
  display: block;
}

.list-trigger {
  display: flex;
  width: 286px;
  align-items: center;
  height: 58px;
  padding: 8px 13px 8px 10px;
  border: 1px solid var(--line);
  border-radius: 10px 4px 10px 4px;
  color: var(--ink);
  background: rgba(255, 250, 242, 0.88);
  box-shadow: 0 8px 24px rgba(85, 55, 33, 0.08);
  cursor: pointer;
  transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease, background-color 160ms ease;
}

.list-trigger__mark {
  display: grid;
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  margin-right: 10px;
  border: 1px solid rgba(214, 80, 50, 0.14);
  border-radius: 4px 10px 4px 10px;
  place-items: center;
  color: var(--tomato-dark);
  background: var(--wheat-soft);
  font-size: 16px;
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

.list-trigger__title {
  display: flex;
  width: 132px;
  min-width: 0;
  align-items: center;
  gap: 6px;
}

.list-trigger__copy strong {
  min-width: 0;
  overflow: hidden;
  font-size: 14px;
  flex: 1;
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
    height: 54px;
  }

  .list-trigger__title {
    width: min(52vw, 220px);
  }
}

@media (max-width: 420px) {
  .list-trigger__count {
    display: none;
  }
}
</style>
