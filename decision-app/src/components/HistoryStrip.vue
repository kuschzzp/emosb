<template>
  <section class="history-strip" aria-labelledby="history-title">
    <header class="history-header">
      <div>
        <h2 id="history-title">最近抽到</h2>
      </div>
      <button
        v-if="history.length"
        type="button"
        class="text-button"
        @click="$emit('clear')"
      >
        清空记录
      </button>
    </header>

    <ol v-if="history.length" class="history-list">
      <li
        v-for="(item, index) in history"
        :key="`${item}-${index}`"
        class="history-item"
      >
        <img :src="theme.image" alt="" width="54" height="48">
        <small class="sr-only">第 {{ index + 1 }} 条</small>
        <span>{{ item }}</span>
      </li>
    </ol>

    <div v-else class="history-empty">
      <span class="history-empty__icon" aria-hidden="true">
        <i class="el-icon-time"></i>
      </span>
      <span>
        <strong>第一条答案还在路上</strong>
        <small>完成一次抽取后，会在这里留下记录。</small>
      </span>
    </div>
  </section>
</template>

<script>
export default {
  name: 'HistoryStrip',
  props: {
    theme: { type: Object, required: true },
    history: {
      type: Array,
      required: true
    }
  }
}
</script>

<style scoped>
.history-strip { display: grid; grid-template-columns: 185px minmax(0, 1fr); align-items: center; gap: 28px; padding-top: 30px; border-top: 1px solid var(--line); }
.history-header { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; }
.history-header h2 { margin: 0; font-size: 25px; font-weight: 900; white-space: nowrap; }
.text-button { min-height: 36px; padding: 4px 0; border: 0; background: transparent; color: var(--ink-muted); cursor: pointer; font-size: 12px; }
.text-button:hover { color: var(--tomato-dark); }
.history-list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin: 0; padding: 0; list-style: none; }
.history-item { display: flex; align-items: center; gap: 12px; min-width: 0; padding: 10px 16px; border: 1px solid var(--line); border-radius: 16px; background: var(--paper-soft); }
.history-item img { flex: 0 0 auto; object-fit: contain; }
.history-item span { overflow-wrap: anywhere; font-size: 17px; font-weight: 750; line-height: 1.4; }
.history-empty { display: flex; align-items: center; gap: 14px; padding: 14px 0; color: var(--ink-muted); }
.history-empty__icon { font-size: 28px; }
.history-empty strong, .history-empty small { display: block; font-weight: 400; line-height: 1.7; }
.history-empty strong { font-size: 15px; } .history-empty small { font-size: 13px; }
@media (max-width: 1000px) { .history-strip { gap: 20px; grid-template-columns: 130px minmax(0, 1fr); } .history-item { padding: 8px 12px; gap: 7px; } .history-item img { width: 36px; height: 36px; } .history-item span { font-size: 14px; } .history-header h2 { font-size: 22px; } }
@media (max-width: 767px) { .history-strip { display: block; padding-top: 22px; } .history-header { flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: 16px; } .history-header h2 { font-size: 21px; } .history-list { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; } .history-item { min-height: 58px; } .history-empty { padding-top: 0; } }
</style>
