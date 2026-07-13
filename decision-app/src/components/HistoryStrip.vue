<template>
  <section class="history-strip" aria-labelledby="history-title">
    <header class="history-header">
      <div>
        <span class="section-kicker">RECENT PICKS</span>
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
        <small>{{ String(index + 1).padStart(2, '0') }}</small>
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
    history: {
      type: Array,
      required: true
    }
  }
}
</script>

<style scoped>
.history-strip {
  margin-top: 72px;
  padding-top: 30px;
  border-top: 1px solid var(--line);
}

.history-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
}

.history-header h2 {
  margin: 7px 0 0;
  font-family: var(--serif);
  font-size: 25px;
  font-weight: 700;
  line-height: 1.2;
}

.text-button {
  min-height: 40px;
  padding: 0 3px;
  border: 0;
  border-bottom: 1px solid transparent;
  color: var(--ink-muted);
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  transition: color 160ms ease, border-color 160ms ease;
}

.text-button:hover {
  border-bottom-color: var(--tomato);
  color: var(--tomato-dark);
}

.text-button:focus-visible {
  outline: 3px solid var(--focus);
  outline-offset: 3px;
}

.history-list {
  display: grid;
  margin: 22px 0 0;
  padding: 0;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  list-style: none;
}

.history-item {
  display: flex;
  min-width: 0;
  min-height: 54px;
  padding: 13px 16px;
  border-bottom: 1px solid var(--line-soft);
  align-items: center;
  gap: 13px;
  color: var(--ink-soft);
}

.history-item:nth-child(odd) {
  border-right: 1px solid var(--line-soft);
}

.history-item small {
  flex: 0 0 auto;
  color: var(--tomato);
  font-family: var(--mono);
  font-size: 10px;
  font-weight: 800;
}

.history-item span {
  min-width: 0;
  overflow-wrap: anywhere;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.45;
}

.history-empty {
  display: flex;
  min-height: 92px;
  margin-top: 22px;
  padding: 19px 20px;
  border: 1px dashed rgba(91, 62, 42, 0.24);
  border-radius: 4px 14px 4px 14px;
  align-items: center;
  gap: 15px;
  color: var(--ink-muted);
  background: rgba(255, 250, 242, 0.44);
}

.history-empty__icon {
  display: grid;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  place-items: center;
  color: var(--tomato);
  background: var(--wheat-soft);
  font-size: 18px;
}

.history-empty strong,
.history-empty small {
  display: block;
}

.history-empty strong {
  margin-bottom: 4px;
  color: var(--ink-soft);
  font-size: 14px;
}

.history-empty small {
  font-size: 12px;
  line-height: 1.5;
}

@media (max-width: 767px) {
  .history-strip {
    margin-top: 54px;
    padding-top: 25px;
  }

  .history-list {
    grid-template-columns: 1fr;
  }

  .history-item:nth-child(odd) {
    border-right: 0;
  }

  .history-empty {
    padding: 17px;
  }
}
</style>
