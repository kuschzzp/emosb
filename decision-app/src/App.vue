<template>
  <div id="decision-app" class="app-shell">
    <header class="app-header">
      <a class="brand" href="#decision-main" aria-label="帮我选首页">
        <img class="brand-mark" src="/illustrations/brand.webp" alt="" width="72" height="62">
        <strong>帮我选</strong>
        <span>趣味抽签小工具</span>
      </a>
      <button class="manage-button" type="button" @click="openManager">
        <i class="el-icon-s-fold" aria-hidden="true"></i><span>我的清单</span>
      </button>
    </header>

    <main id="decision-main" class="main-content">
      <DecisionStage
        :list-name="activeList.name"
        :theme="activeTheme"
        :display-value="selectedValue"
        :is-running="isRunning"
        :has-result="Boolean(selectedValue) && !isRunning"
        @draw="startDraw"
      >
        <div class="list-controls">
          <ListSwitcher
            :lists="state.lists"
            :active-id="state.activeListId"
            :disabled="isRunning"
            @select="switchList"
            @create="createNewList(true)"
            @manage="openManager"
          />
          <button class="edit-list-button" type="button" :disabled="isRunning" @click="openManager">
            编辑<i class="el-icon-arrow-right" aria-hidden="true"></i>
          </button>
        </div>
      </DecisionStage>
      <HistoryStrip :history="activeList.history" :theme="activeTheme" @clear="clearHistory" />
    </main>

    <footer class="app-footer">
      <span><i class="el-icon-lock" aria-hidden="true"></i>数据仅保存在当前浏览器</span>
      <span>{{ state.lists.length }} 份清单，装下每一种纠结</span>
    </footer>
    <MenuModal
      :visible="managerVisible"
      :lists="state.lists"
      :active-id="state.activeListId"
      @update:visible="managerVisible = $event"
      @select="switchList"
      @create="createNewList"
      @save="saveList"
      @sync-defaults="syncDefaultItems"
      @remove="removeList"
    />
  </div>
</template>

<script>
import ListSwitcher from './components/ListSwitcher.vue'
import DecisionStage from './components/DecisionStage.vue'
import HistoryStrip from './components/HistoryStrip.vue'
import MenuModal from './components/MenuModal.vue'

const {
  DEFAULT_ITEMS,
  MAX_HISTORY,
  createList,
  loadState,
  saveState,
  syncListWithDefaultItems,
  validateListDraft
} = require('./utils/storage')
const { getTheme } = require('./utils/themes')

export default {
  name: 'App',
  components: {
    ListSwitcher,
    DecisionStage,
    HistoryStrip,
    MenuModal
  },
  data() {
    return {
      state: loadState(window.localStorage),
      selectedValue: '',
      isRunning: false,
      drawTimer: null,
      managerVisible: false
    }
  },
  computed: {
    activeList() {
      return this.state.lists.find(list => list.id === this.state.activeListId)
        || this.state.lists[0]
    },
    activeTheme() {
      return getTheme(this.activeList.theme)
    }
  },
  beforeDestroy() {
    this.stopDraw()
  },
  methods: {
    persist(showError = true) {
      try {
        saveState(window.localStorage, this.state)
        return true
      } catch {
        if (showError) {
          this.$message.error('保存失败，请检查浏览器存储空间后重试')
        }
        return false
      }
    },
    prefersReducedMotion() {
      return typeof window.matchMedia === 'function'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    },
    pickRandomItem(list) {
      const randomIndex = Math.floor(Math.random() * list.items.length)
      return list.items[randomIndex]
    },
    stopDraw() {
      if (this.drawTimer) {
        window.clearTimeout(this.drawTimer)
      }
      this.drawTimer = null
      this.isRunning = false
    },
    finishDraw(listId) {
      if (!this.isRunning || this.state.activeListId !== listId) {
        return
      }

      const list = this.state.lists.find(item => item.id === listId)

      if (!list || !this.selectedValue) {
        this.stopDraw()
        return
      }

      this.isRunning = false
      this.drawTimer = null
      this.$set(
        list,
        'history',
        [this.selectedValue, ...list.history].slice(0, MAX_HISTORY)
      )
      list.updatedAt = Date.now()
      this.persist()
    },
    switchList(id) {
      if (!this.state.lists.some(list => list.id === id)) {
        return
      }

      this.stopDraw()
      this.state.activeListId = id
      this.selectedValue = ''
      this.persist(false)
    },
    openManager() {
      if (this.isRunning) this.selectedValue = ''
      this.stopDraw()
      this.managerVisible = true
    },
    startDraw() {
      if (this.isRunning || !this.activeList || this.activeList.items.length < 2) {
        return
      }

      const listId = this.activeList.id
      this.isRunning = true

      if (this.prefersReducedMotion()) {
        this.selectedValue = ''
        this.drawTimer = window.setTimeout(() => {
          if (this.state.activeListId !== listId) {
            return
          }
          this.selectedValue = this.pickRandomItem(this.activeList)
          this.finishDraw(listId)
        }, 160)
        return
      }

      const totalSteps = 15
      const tick = step => {
        if (!this.isRunning || this.state.activeListId !== listId) {
          return
        }

        this.selectedValue = this.pickRandomItem(this.activeList)

        if (step >= totalSteps) {
          this.finishDraw(listId)
          return
        }

        const progress = step / totalSteps
        const delay = 35 + Math.round(progress * progress * 120)
        this.drawTimer = window.setTimeout(() => tick(step + 1), delay)
      }

      tick(0)
    },
    createNewList(openManager = false) {
      this.stopDraw()

      let index = 1
      let name = '新清单 1'

      while (this.state.lists.some(list => list.name === name)) {
        index += 1
        name = `新清单 ${index}`
      }

      const list = createList(name, ['选项一', '选项二'])
      this.state.lists.push(list)
      this.state.activeListId = list.id
      this.selectedValue = ''

      if (openManager) {
        this.managerVisible = true
      }

      if (this.persist()) {
        this.$message.success('新清单已创建，可以开始填写选项了')
      }
    },
    saveList(draft) {
      this.stopDraw()

      const result = validateListDraft(
        draft,
        this.state.lists,
        draft.id
      )

      if (!result.ok) {
        this.$message.warning(result.message)
        return
      }

      const list = this.state.lists.find(item => item.id === draft.id)

      if (!list) {
        this.$message.error('没有找到这份清单，请重新选择')
        return
      }

      list.name = result.name
      list.items = result.items
      if (result.theme) this.$set(list, 'theme', result.theme)
      list.updatedAt = Date.now()

      if (!list.items.includes(this.selectedValue)) {
        this.selectedValue = ''
      }

      if (this.persist()) {
        this.$message.success(`「${list.name}」已保存`)
      }
    },
    async syncDefaultItems(id) {
      const listIndex = this.state.lists.findIndex(item => item.id === id)

      if (listIndex < 0) {
        this.$message.error('没有找到这份清单，请重新选择')
        return
      }

      const list = this.state.lists[listIndex]

      try {
        await this.$confirm(
          `将用 ${DEFAULT_ITEMS.length} 道默认菜品覆盖「${list.name}」的候选项，并清空它的抽取记录。`,
          '恢复默认菜品？',
          {
            confirmButtonText: '确认恢复',
            cancelButtonText: '取消',
            type: 'warning',
            customClass: 'decision-confirm'
          }
        )
      } catch {
        return
      }

      this.stopDraw()
      const syncedList = syncListWithDefaultItems(list)
      this.$set(this.state.lists, listIndex, syncedList)

      if (this.state.activeListId === id) {
        this.selectedValue = ''
      }

      if (this.persist()) {
        this.$message.success(
          `「${syncedList.name}」已同步为 ${syncedList.items.length} 道默认菜品`
        )
      }
    },
    async removeList(id) {
      if (this.state.lists.length <= 1) {
        this.$message.warning('至少保留一份清单')
        return
      }

      const list = this.state.lists.find(item => item.id === id)

      if (!list) {
        return
      }

      try {
        await this.$confirm(
          `删除「${list.name}」后，它的选项和记录都无法恢复。`,
          '删除这份清单？',
          {
            confirmButtonText: '确认删除',
            cancelButtonText: '先留着',
            type: 'warning',
            customClass: 'decision-confirm'
          }
        )
      } catch {
        return
      }

      this.stopDraw()
      this.state.lists = this.state.lists.filter(item => item.id !== id)
      this.state.activeListId = this.state.lists[0].id
      this.selectedValue = ''

      if (this.persist()) {
        this.$message.success(`「${list.name}」已删除`)
      }
    },
    async clearHistory() {
      if (!this.activeList.history.length) {
        return
      }

      try {
        await this.$confirm(
          `只会清空「${this.activeList.name}」的最近结果。`,
          '清空抽取记录？',
          {
            confirmButtonText: '确认清空',
            cancelButtonText: '取消',
            type: 'warning',
            customClass: 'decision-confirm'
          }
        )
      } catch {
        return
      }

      this.$set(this.activeList, 'history', [])

      if (this.persist()) {
        this.$message.success('当前清单的记录已清空')
      }
    }
  }
}
</script>

<style scoped>
.app-shell { min-height: 100vh; padding: 0 4.5vw 24px; }
.app-header, .main-content, .app-footer { width: min(1320px, 100%); margin: 0 auto; }
.app-header { min-height: 124px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
.brand { display: flex; align-items: center; gap: 16px; color: var(--ink); text-decoration: none; }
.brand-mark { width: 80px; height: 72px; object-fit: contain; }
.brand strong { font-size: 36px; letter-spacing: -1.5px; font-weight: 950; white-space: nowrap; }
.brand > span { font-size: 16px; margin-left: 6px; color: var(--ink-soft); }
.manage-button { display: inline-flex; align-items: center; justify-content: center; gap: 12px; min-height: 54px; padding: 12px 20px; border: 2px solid var(--ink); border-radius: 16px; color: var(--ink); background: transparent; font-size: 17px; font-weight: 750; cursor: pointer; }
.manage-button i { font-size: 23px; }
.manage-button:hover { background: var(--wheat-soft); }
.list-controls { display: flex; align-items: stretch; width: 100%; margin-top: 48px; border: 2px solid var(--ink); border-radius: 18px; background: var(--paper-soft); overflow: hidden; }
.edit-list-button { flex: 0 0 auto; display: flex; align-items: center; gap: 12px; align-self: center; min-height: 44px; padding: 4px 20px; border: 0; border-left: 1px solid var(--line); color: var(--purple-dark); background: transparent; font-size: 18px; font-weight: 800; cursor: pointer; }
.edit-list-button:hover { color: var(--ink); }
.app-footer { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: 24px; padding-top: 30px; color: var(--ink-muted); font-size: 13px; }
.app-footer span { display: inline-flex; gap: 7px; align-items: center; }
@media (max-width: 1000px) { .brand > span { display: none; } .list-controls { margin-top: 30px; } }
@media (max-width: 767px) {
 .app-shell { padding: 0 20px 24px; }
 .app-header { min-height: 90px; gap: 12px; }
 .brand { gap: 8px; } .brand-mark { width: 48px; height: 46px; } .brand strong { font-size: 25px; }
 .manage-button { min-height: 44px; padding: 8px 12px; font-size: 14px; gap: 7px; border-radius: 12px; }
 .manage-button i { font-size: 19px; }
 .list-controls { margin-top: 24px; border-radius: 14px; text-align: left; }
 .edit-list-button { padding: 4px 12px; gap: 6px; font-size: 15px; }
 .app-footer { justify-content: center; text-align: center; gap: 10px; padding-top: 24px; font-size: 12px; }
}
</style>
