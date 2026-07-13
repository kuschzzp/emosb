<template>
  <el-drawer
    class="manage-drawer-shell"
    custom-class="decision-manage-drawer"
    title="管理清单"
    :visible="visible"
    :with-header="false"
    :wrapper-closable="true"
    :close-on-press-escape="true"
    size="440px"
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

      <div class="drawer-list-section">
        <div class="drawer-list-heading">
          <strong>我的清单</strong>
          <span>{{ lists.length }} 份</span>
        </div>
        <div class="drawer-list-row" role="group" aria-label="决策清单">
          <button
            v-for="list in lists"
            :key="list.id"
            type="button"
            class="drawer-list-chip"
            :class="{ 'is-active': list.id === activeId }"
            :aria-pressed="list.id === activeId ? 'true' : 'false'"
            @click="$emit('select', list.id)"
          >
            <strong>{{ list.name }}</strong>
            <small>{{ list.items.length }} 项</small>
          </button>
          <button
            type="button"
            class="drawer-list-chip is-create"
            @click="$emit('create')"
          >
            <i class="el-icon-plus" aria-hidden="true"></i>
            <strong>新建清单</strong>
          </button>
        </div>
      </div>

      <div v-if="activeList" class="editor-form">
        <div class="field-group" :class="{ 'has-error': nameError }">
          <div class="field-heading">
            <label for="list-name">清单名称</label>
            <span>{{ draftName.length }} / 20</span>
          </div>
          <el-input
            id="list-name"
            v-model="draftName"
            maxlength="20"
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
            <span>{{ normalizedCount }} / 200</span>
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
          class="delete-button"
          :disabled="lists.length <= 1"
          :title="lists.length <= 1 ? '至少保留一份清单' : '删除当前清单'"
          @click="$emit('remove', activeId)"
        >
          删除清单
        </el-button>
        <el-button class="save-button" type="primary" @click="save">
          保存修改
        </el-button>
      </footer>
    </div>
  </el-drawer>
</template>

<script>
const { normalizeItems, validateListDraft } = require('../utils/storage')

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

.drawer-list-section {
  padding: 21px 28px 20px;
  border-bottom: 1px solid var(--line);
}

.drawer-list-heading,
.field-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.drawer-list-heading {
  margin-bottom: 12px;
  font-size: 12px;
}

.drawer-list-heading > span,
.field-heading > span {
  color: var(--ink-muted);
  font-family: var(--mono);
  font-size: 10px;
}

.drawer-list-row {
  display: flex;
  margin: 0 -28px;
  padding: 0 28px 7px;
  gap: 9px;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scrollbar-width: thin;
}

.drawer-list-chip {
  display: flex;
  flex: 0 0 136px;
  min-height: 66px;
  padding: 11px 12px;
  border: 1px solid var(--line);
  border-radius: 4px 12px 4px 12px;
  align-items: flex-start;
  flex-direction: column;
  justify-content: center;
  color: var(--ink-soft);
  background: #f7ecdc;
  cursor: pointer;
  text-align: left;
  transition: border-color 160ms ease, color 160ms ease, background-color 160ms ease, transform 160ms ease, box-shadow 160ms ease;
}

.drawer-list-chip:hover {
  border-color: rgba(214, 80, 50, 0.4);
  color: var(--ink);
  background: #fff4e3;
  transform: translateY(-1px);
}

.drawer-list-chip:focus-visible {
  outline: 3px solid var(--focus);
  outline-offset: 2px;
}

.drawer-list-chip.is-active {
  border-color: var(--tomato);
  color: var(--tomato-dark);
  background: var(--wheat-soft);
  box-shadow: inset 0 -3px 0 rgba(214, 80, 50, 0.14);
}

.drawer-list-chip strong {
  display: block;
  width: 100%;
  overflow: hidden;
  font-size: 13px;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drawer-list-chip small {
  margin-top: 6px;
  color: var(--ink-muted);
  font-size: 10px;
}

.drawer-list-chip.is-create {
  border-style: dashed;
  align-items: center;
  flex-direction: row;
  gap: 7px;
  color: var(--tomato-dark);
  background: transparent;
}

.drawer-list-chip.is-create strong {
  width: auto;
}

.editor-form {
  flex: 1;
  min-height: 0;
  padding: 24px 28px 34px;
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
  min-height: 250px !important;
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
  padding: 18px 28px calc(18px + env(safe-area-inset-bottom));
  border-top: 1px solid var(--line);
  grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
  gap: 10px;
  background: rgba(255, 250, 242, 0.97);
  box-shadow: 0 -10px 30px rgba(85, 55, 33, 0.06);
}

.drawer-actions .el-button {
  min-height: 48px;
  margin: 0;
  border-radius: 4px 11px 4px 11px;
  font-weight: 800;
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

.drawer-actions .el-button:focus-visible {
  outline: 3px solid var(--focus);
  outline-offset: 3px;
}

@media (max-width: 767px) {
  .drawer-header {
    padding: calc(22px + env(safe-area-inset-top)) 20px 20px;
  }

  .drawer-list-section {
    padding: 18px 20px;
  }

  .drawer-list-row {
    margin: 0 -20px;
    padding-right: 20px;
    padding-left: 20px;
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
