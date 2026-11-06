<template>
  <section class="decision-stage" :class="{ 'is-running': isRunning, 'has-result': hasResult }" aria-labelledby="page-title">
    <div class="decision-copy">
      <h1 id="page-title" :class="{ 'long-title': listName.length > 10 }">{{ headline }}</h1>
      <p class="hero-description">{{ theme.description }}</p>
      <slot></slot>
      <button class="draw-button" type="button" :disabled="isRunning" @click="$emit('draw')">
        <span>{{ buttonLabel }}</span>
        <i :class="isRunning ? 'el-icon-loading' : 'el-icon-right'" aria-hidden="true"></i>
      </button>
      <p class="fairness-note">公平随机，每个选项都有机会。</p>
    </div>

    <div class="ticket-stage">
      <img class="ticket-background" src="/illustrations/card-stack.webp" alt="" width="600" height="700">
      <div class="ticket-content">
        <span class="ticket-heading">{{ isRunning ? '好运正在靠近' : hasResult ? theme.resultLabel : theme.waitingLabel }}</span>
        <img :key="theme.id" class="theme-illustration" :src="theme.image" alt="" width="220" height="180">
        <div v-if="hasResult || isRunning" class="ticket-answer" :class="{ 'long-answer': displayValue.length > 12 }" :aria-hidden="isRunning ? 'true' : 'false'">{{ displayValue }}</div>
        <span v-else class="ticket-pending">未揭晓</span>
        <p v-if="hasResult" class="ticket-source">来自「{{ listName }}」</p>
        <span v-if="isRunning" class="ticket-progress" aria-hidden="true">让手气再转一会儿…</span>
      </div>
      <button class="pull-button" type="button" :disabled="isRunning" :aria-label="isRunning ? '正在抽取' : hasResult ? '拉签，再抽一次' : '拉签，抽一个答案'" @click="$emit('draw')">
        {{ isRunning ? '抽取中' : hasResult ? '再抽一次' : '拉签' }}<i class="el-icon-bottom" aria-hidden="true"></i>
      </button>
    </div>
    <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">{{ hasResult ? `${theme.resultLabel}：${displayValue}` : isRunning ? '正在抽取，请稍候' : '' }}</p>
  </section>
</template>

<script>
export default {
  name: 'DecisionStage',
  props: {
    listName: { type: String, required: true },
    theme: { type: Object, required: true },
    displayValue: { type: String, default: '' },
    isRunning: { type: Boolean, default: false },
    hasResult: { type: Boolean, default: false }
  },
  computed: {
    headline() { return this.listName === '今天吃什么' ? '今天吃什么？' : this.listName },
    buttonLabel() {
      if (this.isRunning) return '正在替你选…'
      return this.hasResult ? '再抽一次' : this.theme.buttonLabel
    }
  }
}
</script>

<style scoped>
.decision-stage { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: center; gap: 14px; min-height: 680px; padding: 14px 0 50px; }
.decision-copy { position: relative; z-index: 2; padding-left: 6px; }
h1 { margin: 0 0 22px; font-size: clamp(44px, 7.5vw, 110px); font-weight: 950; text-shadow: 1.2px 0 currentColor, -1.2px 0 currentColor; letter-spacing: -0.065em; line-height: 1.18; overflow-wrap: anywhere; }
h1.long-title { text-shadow: none; font-size: clamp(34px, 4vw, 58px); letter-spacing: -0.025em; }
.hero-description { margin: 0; font-size: clamp(17px, 2vw, 25px); font-weight: 650; line-height: 1.7; }
.draw-button { display: flex; align-items: center; justify-content: center; gap: 24px; width: 100%; min-height: 94px; margin: 26px 0 0; padding: 18px 24px; border: 3px solid var(--ink); border-radius: 32px; color: var(--ink); background: var(--tomato); box-shadow: 7px 7px 0 var(--peach); cursor: pointer; font-size: clamp(23px, 2.7vw, 36px); font-weight: 900; transition: transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease; }
.draw-button:hover:not(:disabled) { background: #ff7957; transform: translate(-2px, -2px); box-shadow: 9px 9px 0 var(--peach); }
.draw-button:active:not(:disabled) { transform: translate(4px, 4px); box-shadow: 2px 2px 0 var(--peach); }
.draw-button i { font-size: 1.2em; }
.fairness-note { margin: 24px 0 0 16px; color: var(--ink-muted); font-size: 16px; }
.ticket-stage { position: relative; width: 100%; aspect-ratio: 6 / 7; max-width: 600px; justify-self: center; }
.ticket-background { width: 100%; height: 100%; object-fit: contain; display: block; }
.ticket-content { position: absolute; top: 15%; left: 20%; width: 61%; height: 63%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 16px 10px; transform: rotate(5deg); text-align: center; }
.ticket-heading { font-size: clamp(17px, 2.9vw, 40px); font-weight: 900; line-height: 1.4; }
.theme-illustration { width: 76%; height: 48%; object-fit: contain; margin: 16px 0; transition: width 300ms ease, height 300ms ease, margin 300ms ease; }
.ticket-pending { margin-top: 6px; font-size: clamp(17px, 2.2vw, 28px); font-weight: 850; }
.ticket-answer { width: 100%; overflow-wrap: anywhere; max-height: 55%; overflow-y: auto; padding: 0 6px; font-size: clamp(22px, 3.4vw, 46px); font-weight: 950; line-height: 1.35; }
.ticket-answer.long-answer { font-size: clamp(18px, 2.2vw, 29px); }
.ticket-source { max-width: 100%; margin: 14px 0 0; font-size: 13px; line-height: 1.5; overflow-wrap: anywhere; }
.has-result .theme-illustration, .is-running .theme-illustration { width: 24%; height: 18%; margin: 12px 0; }
.ticket-progress { margin-top: 16px; font-size: 13px; }
.pull-button { position: absolute; bottom: 7%; left: 40%; display: flex; align-items: center; justify-content: center; gap: 8px; min-width: 28%; min-height: 54px; padding: 12px 16px; border: 3px solid var(--ink); border-radius: 14px; color: var(--ink); background: var(--tomato); font-size: 19px; font-weight: 900; cursor: pointer; transform: rotate(5deg); transition: transform 160ms ease, background-color 160ms ease; }
.pull-button:hover:not(:disabled) { background: #ff7957; transform: rotate(5deg) translateY(4px); }
.is-running .ticket-stage { animation: shuffle 280ms ease-in-out infinite alternate; }
.has-result .ticket-answer { animation: reveal 350ms ease-out; }
@keyframes shuffle { from { transform: rotate(-2deg) translateY(-3px); } to { transform: rotate(2deg) translateY(3px); } }
@keyframes reveal { from { opacity: 0; transform: translateY(10px) scale(.94); } to { opacity: 1; transform: translateY(0) scale(1); } }
@media (min-width: 1100px) { .ticket-stage { top: -30px; width: 110%; max-width: 660px; margin: -35px 0; } }
@media (max-width: 1000px) and (min-width: 768px) {
 .decision-stage { min-height: 580px; padding-bottom: 34px; gap: 0; } h1 { font-size: 6.1vw; text-shadow: none; } .draw-button { min-height: 76px; font-size: 25px; border-radius: 24px; } .pull-button { min-height: 44px; padding: 7px 10px; font-size: 14px; } .ticket-content { padding: 6px; } .ticket-source { font-size: 11px; }
}
@media (max-width: 767px) {
 .decision-stage { grid-template-columns: minmax(0, 1fr); min-height: auto; gap: 14px; padding: 28px 0 34px; }
 .decision-copy { display: contents; }
 h1 { grid-row: 1; margin: 0; font-size: clamp(36px, 10vw, 62px); letter-spacing: -0.045em; }
 h1.long-title { font-size: 34px; }
 .hero-description { grid-row: 2; font-size: 16px; margin: 0; }
 .decision-copy ::v-deep .list-controls { grid-row: 3; margin-top: 8px; }
 /* Keep the primary action above the tall ticket and away from browser docks.
    This also matches the DOM's keyboard and screen-reader order. */
 .draw-button { grid-row: 4; min-height: 70px; margin: 0; padding: 14px 20px; border-radius: 23px; font-size: 25px; line-height: 1.2; box-shadow: 5px 5px 0 var(--peach); }
 .draw-button i { line-height: 1; }
 .fairness-note { grid-row: 5; margin: 8px 0 0; text-align: center; font-size: 13px; }
 .ticket-stage { grid-row: 6; width: min(340px, 100%); }
 .ticket-heading { font-size: 24px; } .ticket-pending { font-size: 22px; } .ticket-answer { font-size: 30px; } .ticket-answer.long-answer { font-size: 20px; }
 .pull-button { min-height: 44px; padding: 8px 12px; font-size: 15px; border-width: 2px; }
 .ticket-source { font-size: 11px; }
}
@media (max-width: 767px) and (max-height: 700px) {
 .decision-stage { padding-top: 16px; gap: 12px; }
 .draw-button { min-height: 60px; padding: 12px 20px; font-size: 23px; }
 .ticket-stage { width: min(280px, 100%); }
 .ticket-heading { font-size: 21px; }
 .ticket-content { padding: 8px 6px; }
 .theme-illustration { margin: 10px 0; }
 .ticket-answer { font-size: 26px; }
 .ticket-answer.long-answer { font-size: 18px; }
}
@media (prefers-reduced-motion: reduce) { .ticket-stage, .ticket-answer { animation: none !important; } .theme-illustration { transition: none; } }
</style>
