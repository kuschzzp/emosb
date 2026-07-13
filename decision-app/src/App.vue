<template>
  <div id="decision-app" class="app-shell">
    <div class="ambient-shape ambient-shape--one" aria-hidden="true"></div>
    <div class="ambient-shape ambient-shape--two" aria-hidden="true"></div>
    <div class="ambient-dots" aria-hidden="true"></div>

    <header class="app-header">
      <a class="brand" href="#decision-main" aria-label="帮我选首页">
        <span class="brand-mark">签</span>
        <span class="brand-copy">
          <strong>帮我选</strong>
          <small>Pick something good</small>
        </span>
      </a>

      <ListSwitcher
        :lists="state.lists"
        :active-id="state.activeListId"
        :disabled="isRunning"
        @select="switchList"
        @manage="openManager"
      />
    </header>

    <main id="decision-main" class="main-content">
      <section class="hero-copy" aria-labelledby="page-title">
        <div>
          <span class="section-kicker">LEAVE IT TO CHANCE</span>
          <h1 id="page-title">别纠结，交给今天的手气。</h1>
          <p>
            从「{{ activeList.name }}」里抽一个答案，给选择做减法。
          </p>
        </div>
        <div class="hero-ticket" aria-hidden="true">
          <span>NO.</span>
          <strong>{{ ticketNumber }}</strong>
          <small>{{ activeList.items.length }} OPTIONS</small>
        </div>
      </section>

      <DecisionStage
        :list-name="activeList.name"
        :display-value="selectedValue"
        :is-running="isRunning"
        :has-result="Boolean(selectedValue) && !isRunning"
        @draw="startDraw"
      />

      <HistoryStrip
        :history="activeList.history"
        @clear="clearHistory"
      />
    </main>

    <footer class="app-footer">
      <span><i class="el-icon-collection" aria-hidden="true"></i>{{ state.lists.length }} 份清单</span>
      <span><i class="el-icon-lock" aria-hidden="true"></i>所有数据只保存在这台设备</span>
    </footer>

    <MenuModal
      :visible="managerVisible"
      :lists="state.lists"
      :active-id="state.activeListId"
      @update:visible="managerVisible = $event"
      @select="switchList"
      @create="createNewList"
      @save="saveList"
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
  MAX_HISTORY,
  createList,
  loadState,
  saveState,
  validateListDraft
} = require('./utils/storage')

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
    ticketNumber() {
      const listIndex = this.state.lists.findIndex(
        list => list.id === this.state.activeListId
      )
      return String(Math.max(listIndex + 1, 1)).padStart(2, '0')
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

      const totalSteps = 21
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
    createNewList() {
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
      list.updatedAt = Date.now()

      if (!list.items.includes(this.selectedValue)) {
        this.selectedValue = ''
      }

      if (this.persist()) {
        this.$message.success(`「${list.name}」已保存`)
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
.app-shell {
  position: relative;
  min-height: 100vh;
  padding-bottom: 28px;
  overflow: hidden;
  background:
    linear-gradient(90deg, transparent 0, transparent calc(100% - 1px), rgba(91, 62, 42, 0.035) calc(100% - 1px)),
    var(--paper);
}

.ambient-shape,
.ambient-dots {
  position: absolute;
  pointer-events: none;
}

.ambient-shape {
  border: 1px solid rgba(214, 80, 50, 0.12);
  border-radius: 50%;
}

.ambient-shape--one {
  top: 154px;
  left: -190px;
  width: 420px;
  height: 420px;
}

.ambient-shape--two {
  top: 420px;
  right: -155px;
  width: 310px;
  height: 310px;
  border-color: rgba(237, 201, 111, 0.4);
}

.ambient-dots {
  top: 126px;
  right: 5vw;
  width: 92px;
  height: 58px;
  opacity: 0.38;
  background-image: radial-gradient(circle, var(--tomato) 1.2px, transparent 1.4px);
  background-size: 12px 12px;
  transform: rotate(7deg);
}

.app-header {
  position: relative;
  z-index: 3;
  display: flex;
  width: min(1120px, calc(100% - 64px));
  min-height: 102px;
  margin: 0 auto;
  padding: 22px 0;
  border-bottom: 1px solid var(--line);
  align-items: center;
  justify-content: space-between;
  gap: 28px;
}

.brand {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
  color: var(--ink);
  text-decoration: none;
}

.brand:focus-visible {
  border-radius: 6px;
  outline: 3px solid var(--focus);
  outline-offset: 4px;
}

.brand-mark {
  display: grid;
  width: 48px;
  height: 48px;
  border-radius: 5px 15px 5px 15px;
  place-items: center;
  color: #fffaf2;
  background: var(--tomato);
  box-shadow: 5px 5px 0 var(--wheat);
  font-family: var(--serif);
  font-size: 21px;
  font-weight: 700;
  transform: rotate(-2deg);
}

.brand-copy strong,
.brand-copy small {
  display: block;
}

.brand-copy strong {
  font-family: var(--serif);
  font-size: 20px;
  line-height: 1.1;
}

.brand-copy small {
  margin-top: 5px;
  color: var(--ink-muted);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.main-content {
  position: relative;
  z-index: 2;
  width: min(760px, calc(100% - 40px));
  margin: 0 auto;
  padding: 68px 0 86px;
}

.hero-copy {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 34px;
}

.hero-copy h1 {
  max-width: 660px;
  margin: 13px 0 14px;
  font-family: var(--serif);
  font-size: clamp(36px, 6vw, 58px);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.12;
  text-wrap: balance;
}

.hero-copy p {
  margin: 0;
  color: var(--ink-muted);
  font-size: 15px;
  line-height: 1.7;
}

.hero-ticket {
  position: relative;
  display: flex;
  width: 112px;
  min-height: 104px;
  padding: 14px;
  border: 1px dashed rgba(91, 62, 42, 0.3);
  border-radius: 3px 12px 3px 12px;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  color: var(--ink-muted);
  background: rgba(255, 250, 242, 0.52);
  transform: rotate(2deg);
}

.hero-ticket::before,
.hero-ticket::after {
  position: absolute;
  top: 48%;
  width: 12px;
  height: 22px;
  border-radius: 50%;
  background: var(--paper);
  content: '';
}

.hero-ticket::before {
  left: -7px;
}

.hero-ticket::after {
  right: -7px;
}

.hero-ticket span,
.hero-ticket small {
  font-family: var(--mono);
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.hero-ticket strong {
  margin: 5px 0 7px;
  color: var(--tomato);
  font-family: var(--serif);
  font-size: 32px;
  line-height: 1;
}

.app-footer {
  position: relative;
  z-index: 2;
  display: flex;
  width: min(1120px, calc(100% - 64px));
  margin: 0 auto;
  padding-top: 22px;
  border-top: 1px solid var(--line);
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  color: var(--ink-muted);
  font-size: 11px;
}

.app-footer span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.app-footer i {
  color: var(--tomato);
}

@media (max-width: 767px) {
  .app-shell {
    padding-bottom: calc(24px + env(safe-area-inset-bottom));
  }

  .ambient-shape--one {
    top: 230px;
    left: -250px;
  }

  .ambient-shape--two {
    top: 600px;
    right: -220px;
  }

  .ambient-dots {
    top: 180px;
    right: -18px;
  }

  .app-header {
    width: min(100% - 32px, 580px);
    padding: calc(18px + env(safe-area-inset-top)) 0 19px;
    align-items: stretch;
    flex-direction: column;
    gap: 20px;
  }

  .brand-mark {
    width: 44px;
    height: 44px;
  }

  .main-content {
    width: min(100% - 32px, 580px);
    padding: 42px 0 64px;
  }

  .hero-copy {
    display: block;
  }

  .hero-copy h1 {
    margin-top: 11px;
    font-size: clamp(34px, 10vw, 46px);
  }

  .hero-copy p {
    max-width: 92%;
    font-size: 14px;
  }

  .hero-ticket {
    display: none;
  }

  .app-footer {
    width: min(100% - 32px, 580px);
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }
}

@media (max-width: 390px) {
  .main-content,
  .app-header,
  .app-footer {
    width: calc(100% - 28px);
  }
}
</style>
