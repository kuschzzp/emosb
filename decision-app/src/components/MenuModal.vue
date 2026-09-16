<template>
  <el-drawer
    class="manage-drawer-shell"
    custom-class="decision-manage-drawer"
    title="管理清单"
    :visible="visible"
    :with-header="false"
    :wrapper-closable="true"
    :close-on-press-escape="true"
    size="68%"
    append-to-body
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="drawer-layout">
      <header class="drawer-header">
        <div class="drawer-header__copy">
          <span class="section-kicker">YOUR LISTS</span>
          <h2>管理清单</h2>
          <p>把想法写下来，剩下的交给手气。</p>
        </div>
        <button
          type="button"
          class="icon-button"
          aria-label="关闭清单管理"
          @click="$emit('update:visible', false)"
        >
          <i class="el-icon-close" aria-hidden="true"></i>
        </button>
      </header>

      <div class="drawer-workspace">
        <aside class="drawer-sidebar" aria-label="清单列表">
          <div class="drawer-sidebar__heading">
            <strong>我的清单</strong>
            <span>{{ lists.length }} 份</span>
          </div>

          <button
            type="button"
            class="create-list-button"
            @click="$emit('create')"
          >
            <i class="el-icon-plus" aria-hidden="true"></i>
            <span>新建清单</span>
          </button>

          <div class="drawer-list" role="listbox" aria-label="决策清单">
            <button
              v-for="list in lists"
              :key="list.id"
              type="button"
              role="option"
              class="drawer-list-item"
              :class="{ 'is-active': list.id === activeId }"
              :aria-selected="list.id === activeId ? 'true' : 'false'"
              :title="list.name"
              @click="$emit('select', list.id)"
            >
              <span class="drawer-list-item__marker" aria-hidden="true">
                <i v-if="list.id === activeId" class="el-icon-check"></i>
              </span>
              <span class="drawer-list-item__copy">
                <span class="drawer-list-item__title">
                  <strong>{{ list.name }}</strong>
                  <span
                    v-if="list.isBuiltIn"
                    class="built-in-badge"
                    title="系统内置清单"
                  >内置</span>
                </span>
                <small>{{ list.items.length }} 项</small>
              </span>
            </button>
          </div>

          <el-button
            class="delete-button"
            icon="el-icon-delete"
            :disabled="lists.length <= 1"
            :title="lists.length <= 1 ? '至少保留一份清单' : '删除当前清单'"
            @click="$emit('remove', activeId)"
          >
            删除当前清单
          </el-button>
        </aside>

        <section v-if="activeList" class="drawer-editor" aria-label="编辑当前清单">
          <header class="editor-header">
            <div class="editor-header__copy">
              <span class="editor-header__eyebrow">正在编辑</span>
              <span class="editor-header__title">
                <strong :title="activeList.name">{{ activeList.name }}</strong>
                <span
                  v-if="activeList.isBuiltIn"
                  class="built-in-badge"
                  title="系统内置清单"
                >内置</span>
              </span>
            </div>
            <span class="editor-header__count">{{ activeList.items.length }} 项</span>
          </header>

          <div class="editor-form">
            <div class="field-group" :class="{ 'has-error': nameError }">
              <div class="field-heading">
                <label for="list-name">清单名称</label>
                <span>{{ draftName.length }} / {{ maxListNameLength }}</span>
              </div>
              <el-input
                id="list-name"
                v-model="draftName"
                :maxlength="maxListNameLength"
                placeholder="例如：周末去哪"
                :aria-invalid="nameError ? 'true' : 'false'"
                @input="submitted = false"
              ></el-input>
              <p v-if="nameError" class="field-error" role="alert">
                <i class="el-icon-warning-outline" aria-hidden="true"></i>
                {{ nameError }}
              </p>
            </div>

            <div class="field-group" :class="{ 'has-error': itemsError }">
              <div class="field-heading">
                <label for="list-items">候选项</label>
                <span>{{ normalizedCount }} / {{ maxListItems }}</span>
              </div>
              <el-input
                id="list-items"
                v-model="draftItems"
                type="textarea"
                :rows="12"
                resize="none"
                placeholder="每行输入一个选项"
                :aria-invalid="itemsError ? 'true' : 'false'"
                @input="submitted = false"
              ></el-input>
              <p v-if="itemsError" class="field-error" role="alert">
                <i class="el-icon-warning-outline" aria-hidden="true"></i>
                {{ itemsError }}
              </p>
              <p v-else class="field-help">
                空行与重复项会在保存时自动整理，至少保留 2 项。
              </p>
            </div>
          </div>

          <footer class="drawer-actions">
            <el-button
              class="sync-button"
              icon="el-icon-refresh"
              @click="$emit('sync-defaults', activeId)"
            >
              同步默认菜单
            </el-button>
            <el-button class="save-button" type="primary" @click="save">
              保存修改
            </el-button>
          </footer>
        </section>
      </div>
    </div>
  </el-drawer>
</template>

<script>
const {
  MAX_LIST_NAME_LENGTH,
  MAX_LIST_ITEMS,
  normalizeItems,
  validateListDraft
} = require('../utils/storage')

export default {
  name: 'MenuModal',
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    lists: {
      type: Array,
      required: true
    },
    activeId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      maxListNameLength: MAX_LIST_NAME_LENGTH,
      maxListItems: MAX_LIST_ITEMS,
      draftName: '',
      draftItems: '',
      submitted: false
    }
  },
  computed: {
    activeList() {
      return this.lists.find(list => list.id === this.activeId) || null
    },
    normalizedCount() {
      return normalizeItems(this.draftItems).length
    },
    validation() {
      return validateListDraft(
        { name: this.draftName, itemsText: this.draftItems },
        this.lists,
        this.activeId
      )
    },
    nameError() {
      return this.submitted && this.validation.field === 'name'
        ? this.validation.message
        : ''
    },
    itemsError() {
      return this.submitted && this.validation.field === 'items'
        ? this.validation.message
        : ''
    }
  },
  watch: {
    activeList: {
      immediate: true,
      handler(list) {
        this.draftName = list ? list.name : ''
        this.draftItems = list ? list.items.join('\n') : ''
        this.submitted = false
      }
    }
  },
  methods: {
    save() {
      this.submitted = true

      if (!this.validation.ok) {
        return
      }

      this.$emit('save', {
        id: this.activeId,
        name: this.validation.name,
        itemsText: this.validation.items.join('\n')
      })
      this.submitted = false
    }
  }
}
</script>

<style scoped>
.drawer-layout {
  display: flex;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  color: var(--ink);
  background: var(--paper-soft);
}

.drawer-header {
  display: flex;
  padding: 30px 28px 24px;
  border-bottom: 1px solid var(--line);
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.drawer-header h2 {
  margin: 8px 0 7px;
  font-family: var(--serif);
  font-size: 29px;
  line-height: 1.1;
}

.drawer-header p {
  margin: 0;
  color: var(--ink-muted);
  font-size: 13px;
  line-height: 1.6;
}

.icon-button {
  display: grid;
  flex: 0 0 auto;
  width: 42px;
  height: 42px;
  padding: 0;
  border: 1px solid var(--line);
  border-radius: 4px 10px 4px 10px;
  place-items: center;
  color: var(--ink-soft);
  background: transparent;
  cursor: pointer;
  font-size: 18px;
  transition: border-color 160ms ease, color 160ms ease, background-color 160ms ease, transform 160ms ease;
}

.icon-button:hover {
  border-color: var(--tomato);
  color: var(--tomato-dark);
  background: var(--wheat-soft);
  transform: rotate(4deg);
}

.icon-button:focus-visible {
  outline: 3px solid var(--focus);
  outline-offset: 3px;
}

.drawer-workspace {
  display: grid;
  flex: 1;
  min-height: 0;
  grid-template-columns: 260px minmax(0, 1fr);
}

.drawer-sidebar {
  display: flex;
  min-height: 0;
  padding: 22px 18px 20px;
  border-right: 1px solid var(--line);
  flex-direction: column;
  background: #f7ecdc;
}

.drawer-sidebar__heading,
.field-heading,
.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.drawer-sidebar__heading {
  padding: 0 4px;
  font-size: 12px;
}

.drawer-sidebar__heading > span,
.field-heading > span {
  color: var(--ink-muted);
  font-family: var(--mono);
  font-size: 10px;
}

.create-list-button {
  display: flex;
  width: 100%;
  min-height: 44px;
  margin: 14px 0 12px;
  padding: 0 13px;
  border: 1px dashed rgba(214, 80, 50, 0.42);
  border-radius: 4px 10px 4px 10px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--tomato-dark);
  background: rgba(255, 250, 242, 0.58);
  cursor: pointer;
  font-size: 12px;
  font-weight: 800;
  transition: border-color 160ms ease, background-color 160ms ease, color 160ms ease;
}

.create-list-button:hover {
  border-color: var(--tomato);
  background: var(--paper-soft);
}

.drawer-list {
  display: flex;
  flex: 1;
  min-height: 0;
  padding: 2px;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  scrollbar-width: thin;
}

.drawer-list-item {
  display: flex;
  width: 100%;
  min-height: 62px;
  padding: 10px 11px;
  border: 1px solid transparent;
  border-radius: 4px 10px 4px 10px;
  align-items: center;
  gap: 9px;
  color: var(--ink-soft);
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: border-color 160ms ease, color 160ms ease, background-color 160ms ease;
}

.drawer-list-item:hover {
  border-color: rgba(91, 62, 42, 0.12);
  color: var(--ink);
  background: rgba(255, 250, 242, 0.72);
}

.create-list-button:focus-visible,
.drawer-list-item:focus-visible {
  outline: 3px solid var(--focus);
  outline-offset: 2px;
}

.drawer-list-item.is-active {
  border-color: var(--tomato);
  color: var(--tomato-dark);
  background: var(--wheat-soft);
  box-shadow: inset 3px 0 0 var(--tomato);
}

.drawer-list-item__marker {
  display: grid;
  flex: 0 0 22px;
  width: 22px;
  height: 22px;
  border: 1px solid var(--line);
  border-radius: 50%;
  place-items: center;
  color: var(--tomato-dark);
  background: rgba(255, 250, 242, 0.62);
  font-size: 11px;
}

.drawer-list-item.is-active .drawer-list-item__marker {
  border-color: var(--tomato);
  background: var(--paper-soft);
}

.drawer-list-item__copy {
  flex: 1;
  min-width: 0;
}

.drawer-list-item__copy small {
  display: block;
}

.drawer-list-item__title {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: 6px;
}

.drawer-list-item__copy strong {
  display: -webkit-box;
  min-width: 0;
  overflow: hidden;
  flex: 1;
  font-size: 13px;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.drawer-list-item__copy small {
  margin-top: 4px;
  color: var(--ink-muted);
  font-size: 10px;
}

.drawer-sidebar .delete-button {
  width: 100%;
  min-height: 44px;
  margin: 14px 0 0;
  border-radius: 4px 10px 4px 10px;
}

.drawer-editor {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  background: var(--paper-soft);
}

.editor-header {
  min-height: 72px;
  padding: 15px 30px;
  border-bottom: 1px solid var(--line-soft);
}

.editor-header__copy {
  min-width: 0;
}

.editor-header__eyebrow {
  display: block;
  margin-bottom: 4px;
  color: var(--ink-muted);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.editor-header__title {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 7px;
}

.editor-header__title strong {
  min-width: 0;
  overflow: hidden;
  flex: 1;
  font-family: var(--serif);
  font-size: 18px;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.editor-header__count {
  flex: 0 0 auto;
  padding: 5px 8px;
  border-radius: 4px;
  color: #74421f;
  background: var(--wheat-soft);
  font-family: var(--mono);
  font-size: 10px;
  font-weight: 800;
}

.editor-form {
  flex: 1;
  min-height: 0;
  padding: 26px 30px 34px;
  overflow-y: auto;
}

.field-group + .field-group {
  margin-top: 24px;
}

.field-heading {
  margin-bottom: 9px;
}

.field-heading label {
  color: var(--ink-soft);
  font-size: 12px;
  font-weight: 800;
}

.editor-form ::v-deep .el-input__inner,
.editor-form ::v-deep .el-textarea__inner {
  border-color: var(--line);
  border-radius: 4px 10px 4px 10px;
  color: var(--ink);
  background: #fffdf8;
  transition: border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease;
}

.editor-form ::v-deep .el-input__inner {
  height: 46px;
}

.editor-form ::v-deep .el-textarea__inner {
  min-height: 290px !important;
  padding: 14px 15px;
  line-height: 1.75;
}

.editor-form ::v-deep .el-input__inner:hover,
.editor-form ::v-deep .el-textarea__inner:hover {
  border-color: rgba(214, 80, 50, 0.48);
}

.editor-form ::v-deep .el-input__inner:focus,
.editor-form ::v-deep .el-textarea__inner:focus {
  border-color: var(--tomato);
  background: #fff;
  box-shadow: 0 0 0 3px var(--focus);
}

.field-group.has-error ::v-deep .el-input__inner,
.field-group.has-error ::v-deep .el-textarea__inner {
  border-color: var(--danger);
}

.field-help,
.field-error {
  margin: 8px 2px 0;
  font-size: 11px;
  line-height: 1.55;
}

.field-help {
  color: var(--ink-muted);
}

.field-error {
  color: var(--danger);
  font-weight: 700;
}

.field-error i {
  margin-right: 4px;
}

.drawer-actions {
  display: grid;
  padding: 18px 30px calc(18px + env(safe-area-inset-bottom));
  border-top: 1px solid var(--line);
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
  gap: 10px;
  background: rgba(255, 250, 242, 0.97);
  box-shadow: 0 -10px 30px rgba(85, 55, 33, 0.06);
}

.drawer-actions .el-button,
.drawer-sidebar .el-button {
  min-height: 48px;
  margin: 0;
  border-radius: 4px 11px 4px 11px;
  font-weight: 800;
}

.sync-button.el-button {
  border-color: rgba(91, 62, 42, 0.28);
  color: var(--ink-soft);
  background: #fffdf8;
}

.sync-button.el-button:hover,
.sync-button.el-button:focus {
  border-color: var(--tomato);
  color: var(--tomato-dark);
  background: var(--wheat-soft);
}

.delete-button.el-button {
  border-color: rgba(171, 69, 52, 0.3);
  color: var(--danger);
  background: transparent;
}

.delete-button.el-button:hover:not(.is-disabled),
.delete-button.el-button:focus:not(.is-disabled) {
  border-color: var(--danger);
  color: #8f3125;
  background: #fff0e8;
}

.save-button.el-button {
  border-color: var(--tomato-dark);
  color: #fffaf2;
  background: var(--tomato);
}

.save-button.el-button:hover,
.save-button.el-button:focus {
  border-color: #8e291c;
  color: #fffaf2;
  background: var(--tomato-dark);
}

.drawer-actions .el-button:focus-visible,
.drawer-sidebar .el-button:focus-visible {
  outline: 3px solid var(--focus);
  outline-offset: 3px;
}

@media (max-width: 767px) {
  .drawer-header {
    padding: calc(22px + env(safe-area-inset-top)) 20px 20px;
  }

  .drawer-workspace {
    display: flex;
    flex-direction: column;
  }

  .drawer-sidebar {
    display: grid;
    flex: 0 0 auto;
    max-height: 254px;
    padding: 16px 20px;
    border-right: 0;
    border-bottom: 1px solid var(--line);
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: auto minmax(68px, 1fr) 44px;
    gap: 10px;
  }

  .drawer-sidebar__heading {
    grid-column: 1 / -1;
  }

  .drawer-list {
    grid-column: 1 / -1;
    grid-row: 2;
  }

  .drawer-list-item {
    min-height: 56px;
  }

  .create-list-button,
  .drawer-sidebar .delete-button {
    min-height: 44px;
    margin: 0;
    grid-row: 3;
  }

  .create-list-button {
    grid-column: 1;
  }

  .drawer-sidebar .delete-button {
    grid-column: 2;
  }

  .drawer-editor {
    flex: 1;
  }

  .editor-header {
    min-height: 62px;
    padding: 12px 20px;
  }

  .editor-form {
    padding: 22px 20px 28px;
  }

  .drawer-actions {
    padding-right: 20px;
    padding-left: 20px;
  }
}
</style>
