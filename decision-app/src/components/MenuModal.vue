<template>
  <el-drawer
    class="manage-drawer-shell"
    custom-class="decision-manage-drawer"
    title="管理清单"
    :visible="visible"
    :with-header="false"
    :wrapper-closable="true"
    :close-on-press-escape="true"
    :before-close="beforeClose"
    size="68%"
    append-to-body
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="drawer-layout">
      <header class="drawer-header">
        <div class="drawer-header__copy">
          <span class="section-kicker">让每份清单，都有自己的手气</span>
          <h2>管理清单</h2>
          <p>把想法写下来，剩下的交给手气。</p>
        </div>
        <button
          type="button"
          class="icon-button"
          aria-label="关闭清单管理"
          @click="requestClose"
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
            @click="requestCreate"
          >
            <i class="el-icon-plus" aria-hidden="true"></i>
            <span>新建清单</span>
          </button>

          <div class="drawer-list" role="group" aria-label="决策清单">
            <button
              v-for="list in lists"
              :key="list.id"
              type="button"
              class="drawer-list-item"
              :class="{ 'is-active': list.id === activeId }"
              :aria-pressed="list.id === activeId ? 'true' : 'false'"
              :title="list.name"
              @click="requestSelect(list.id)"
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

            <fieldset class="theme-field">
              <legend>卡面主题 <span>可选</span></legend>
              <p class="field-help">只改变插画和文案，不影响抽取规则。</p>
              <div class="theme-options">
                <label
                  v-for="theme in themes"
                  :key="theme.id"
                  class="theme-option"
                  :class="{ 'is-selected': draftTheme === theme.id }"
                >
                  <input
                    v-model="draftTheme"
                    type="radio"
                    name="card-theme"
                    :value="theme.id"
                  >
                  <img :src="theme.image" alt="" width="64" height="48">
                  <span>{{ theme.name }}</span>
                </label>
              </div>
            </fieldset>

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
              @click="requestSync"
            >
              恢复默认菜品
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
const { THEMES, getTheme } = require('../utils/themes')

export default {
  name: 'MenuModal',
  props: {
    visible: { type: Boolean, required: true },
    lists: { type: Array, required: true },
    activeId: { type: String, required: true }
  },
  data() {
    return {
      maxListNameLength: MAX_LIST_NAME_LENGTH,
      maxListItems: MAX_LIST_ITEMS,
      themes: THEMES,
      draftName: '',
      draftItems: '',
      draftTheme: 'general',
      savedDraft: '',
      submitted: false,
      confirmingDiscard: false
    }
  },
  computed: {
    activeList() {
      return this.lists.find(list => list.id === this.activeId) || null
    },
    normalizedCount() {
      return normalizeItems(this.draftItems).length
    },
    draftSnapshot() {
      return JSON.stringify([this.draftName, this.draftItems, this.draftTheme])
    },
    isDirty() {
      return this.draftSnapshot !== this.savedDraft
    },
    validation() {
      return validateListDraft(
        { name: this.draftName, itemsText: this.draftItems, theme: this.draftTheme },
        this.lists,
        this.activeId
      )
    },
    nameError() {
      return this.submitted && this.validation.field === 'name'
        ? this.validation.message : ''
    },
    itemsError() {
      return this.submitted && this.validation.field === 'items'
        ? this.validation.message : ''
    }
  },
  watch: {
    activeList: {
      immediate: true,
      handler() { this.resetDraft() }
    },
    visible(value) {
      if (value) this.resetDraft()
    }
  },
  methods: {
    resetDraft() {
      const list = this.activeList
      this.draftName = list ? list.name : ''
      this.draftItems = list ? list.items.join('\n') : ''
      this.draftTheme = getTheme(list && list.theme).id
      this.submitted = false
      this.savedDraft = this.draftSnapshot
    },
    async allowDiscard() {
      if (!this.isDirty) return true
      if (this.confirmingDiscard) return false
      this.confirmingDiscard = true
      try {
        await this.$confirm('这份清单还有未保存的修改，离开后将丢弃这些修改。', '放弃修改？', {
          confirmButtonText: '放弃修改',
          cancelButtonText: '继续编辑',
          type: 'warning',
          customClass: 'decision-confirm'
        })
        return true
      } catch {
        return false
      } finally {
        this.confirmingDiscard = false
      }
    },
    async beforeClose(done) {
      if (await this.allowDiscard()) done()
    },
    requestClose() {
      this.beforeClose(() => this.$emit('update:visible', false))
    },
    async requestSelect(id) {
      if (id === this.activeId) return
      if (await this.allowDiscard()) this.$emit('select', id)
    },
    async requestCreate() {
      if (await this.allowDiscard()) this.$emit('create')
    },
    async requestSync() {
      if (await this.allowDiscard()) this.$emit('sync-defaults', this.activeId)
    },
    async save() {
      this.submitted = true
      if (!this.validation.ok) return
      this.$emit('save', {
        id: this.activeId,
        name: this.validation.name,
        itemsText: this.validation.items.join('\n'),
        theme: this.draftTheme
      })
      await this.$nextTick()
      this.resetDraft()
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
  font-family: var(--sans);
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
  border-radius: 12px;
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
  grid-template-columns: 220px minmax(0, 1fr);
}

.drawer-sidebar {
  display: flex;
  min-height: 0;
  padding: 22px 18px 20px;
  border-right: 1px solid var(--line);
  flex-direction: column;
  background: var(--paper);
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
  font-size: 12px;
}

.create-list-button {
  display: flex;
  width: 100%;
  min-height: 44px;
  margin: 14px 0 12px;
  padding: 0 13px;
  border: 2px dashed var(--ink);
  border-radius: 12px;
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
  border-radius: 12px;
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
  border: 2px solid var(--ink);
  color: var(--ink);
  background: #d9c9f4;
  box-shadow: 3px 3px 0 var(--ink);
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
  font-size: 12px;
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
  font-size: 12px;
}

.drawer-sidebar .delete-button {
  width: 100%;
  min-height: 44px;
  margin: 14px 0 0;
  border-radius: 12px;
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
  font-size: 12px;
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
  font-family: var(--sans);
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
  font-size: 12px;
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
  border: 1.5px solid var(--ink);
  border-radius: 12px;
  color: var(--ink);
  background: #fffdf8;
  transition: border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease;
}

.editor-form ::v-deep .el-input__inner {
  height: 46px;
}

.editor-form ::v-deep .el-textarea__inner {
  min-height: 230px !important;
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
  font-size: 12px;
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
  border-radius: 12px;
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
  border: 2px solid var(--ink);
  color: var(--ink);
  background: var(--tomato);
  box-shadow: 3px 3px 0 var(--ink);
}

.save-button.el-button:hover,
.save-button.el-button:focus {
  border-color: var(--ink);
  color: var(--ink);
  background: #ff8766;
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

.drawer-header { border-bottom: 2px solid var(--ink); }
.drawer-header h2 { font-weight: 900; }
.drawer-header p { font-size: 14px; }
.drawer-sidebar { border-right: 2px solid var(--ink); }
.drawer-actions { border-top: 2px solid var(--ink); background: var(--paper-soft); box-shadow: none; }
.drawer-actions .el-button, .drawer-sidebar .el-button { border-width: 1.5px; }
.icon-button { border: 2px solid var(--ink); }
.field-heading label { font-size: 14px; }
.theme-field { min-width: 0; margin: 24px 0; padding: 0; border: 0; }
.theme-field legend { padding: 0; font-size: 14px; font-weight: 800; }
.theme-field legend > span { margin-left: 5px; color: var(--ink-muted); font-size: 12px; font-weight: 400; }
.theme-field .field-help { margin-top: 5px; }
.theme-options { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; margin-top: 12px; }
.theme-option {
  position: relative;
  display: flex;
  min-width: 0;
  padding: 16px 4px 10px;
  border: 1.5px solid var(--line);
  border-radius: 12px;
  align-items: center;
  flex-direction: column;
  gap: 6px;
  background: #fffdf5;
  cursor: pointer;
}
.theme-option input { position: absolute; top: 7px; left: 7px; width: 14px; height: 14px; margin: 0; accent-color: #594094; }
.theme-option img { width: 58px; height: 48px; object-fit: contain; }
.theme-option > span { font-size: 12px; font-weight: 700; }
.theme-option:hover { border-color: var(--ink); }
.theme-option.is-selected { border-color: var(--ink); background: #e6dbfb; box-shadow: 2px 2px 0 var(--ink); }
.theme-option:focus-within { outline: 3px solid var(--focus); outline-offset: 2px; }
@media (max-width: 767px) {
  .drawer-sidebar { border-right: 0; }
  .drawer-header { padding-top: calc(18px + env(safe-area-inset-top)); padding-bottom: 16px; }
  .drawer-header .section-kicker { display: none; }
  .drawer-header h2 { font-size: 26px; }
  .drawer-header p { font-size: 13px; }
  .drawer-sidebar { max-height: 210px; padding: 12px 18px; }
  .drawer-sidebar__heading { display: none; }
  .drawer-sidebar { grid-template-rows: minmax(58px, 1fr) 40px; gap: 8px; }
  .drawer-list { flex-direction: row; grid-row: 1; overflow-x: auto; overflow-y: hidden; }
  .drawer-list-item { flex: 0 0 160px; }
  .create-list-button, .drawer-sidebar .delete-button { grid-row: 2; min-height: 40px; }
  .editor-header { min-height: 60px; }
  .editor-form { padding: 18px; }
  .drawer-actions { padding: 14px 18px calc(14px + env(safe-area-inset-bottom)); }
  .drawer-actions .el-button { padding: 10px; font-size: 13px; }
  .theme-options { gap: 5px; }
  .theme-option img { width: 42px; height: 40px; }
  .theme-option > span { font-size: 11px; }
}
</style>
