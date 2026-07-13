<template>
  <section
    class="decision-stage"
    :class="{ 'is-running': isRunning, 'has-result': hasResult }"
    aria-labelledby="decision-stage-label"
  >
    <div class="decision-stage__shadow" aria-hidden="true"></div>
    <div class="decision-stage__paper">
      <span id="decision-stage-label" class="decision-stage__label">
        {{ statusLabel }}
      </span>
      <div
        :key="displayValue"
        class="decision-stage__value"
        :aria-hidden="isRunning ? 'true' : 'false'"
      >
        {{ displayValue || '准备好了吗？' }}
      </div>
      <p>{{ helperText }}</p>
      <span class="decision-stage__stamp" aria-hidden="true">GOOD<br>LUCK</span>
    </div>

    <el-button
      class="draw-button"
      :loading="isRunning"
      :disabled="isRunning"
      @click="$emit('draw')"
    >
      <span>{{ buttonLabel }}</span>
      <i v-if="!isRunning" class="el-icon-right" aria-hidden="true"></i>
    </el-button>

    <p class="sr-only" aria-live="polite">
      {{ hasResult ? `已选中${displayValue}` : '' }}
    </p>
  </section>
</template>

<script>
export default {
  name: 'DecisionStage',
  props: {
    listName: {
      type: String,
      required: true
    },
    displayValue: {
      type: String,
      default: ''
    },
    isRunning: {
      type: Boolean,
      default: false
    },
    hasResult: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    statusLabel() {
      if (this.isRunning) return '答案正在靠近'
      if (this.hasResult) return '这次就选它'
      return '等待你的选择'
    },
    helperText() {
      if (this.isRunning) return '别急，让好运多转一会儿。'
      if (this.hasResult) return `来自「${this.listName}」`
      return '点一下按钮，把纠结交给手气。'
    },
    buttonLabel() {
      if (this.isRunning) return '正在替你选…'
      if (this.hasResult) return '再来一次'
      return '开始抽取'
    }
  }
}
</script>

<style scoped>
.decision-stage {
  position: relative;
  margin-top: 34px;
}

.decision-stage__shadow {
  position: absolute;
  z-index: 0;
  top: 13px;
  right: -13px;
  bottom: 80px;
  left: 13px;
  border-radius: 5px 28px 5px 28px;
  background: var(--wheat);
  opacity: 0.86;
  transform: rotate(0.6deg);
}

.decision-stage__paper {
  position: relative;
  z-index: 1;
  display: flex;
  min-height: 285px;
  padding: 48px 58px;
  border: 1px solid var(--line);
  border-radius: 5px 28px 5px 28px;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  background:
    linear-gradient(rgba(255, 250, 242, 0.94), rgba(255, 250, 242, 0.94)),
    repeating-linear-gradient(0deg, rgba(91, 62, 42, 0.03) 0, rgba(91, 62, 42, 0.03) 1px, transparent 1px, transparent 4px);
  box-shadow: var(--shadow-soft);
  text-align: center;
}

.decision-stage__paper::before,
.decision-stage__paper::after {
  position: absolute;
  top: 50%;
  width: 22px;
  height: 44px;
  border: 1px solid var(--line);
  border-radius: 50%;
  background: var(--paper);
  content: '';
  transform: translateY(-50%);
}

.decision-stage__paper::before {
  left: -12px;
}

.decision-stage__paper::after {
  right: -12px;
}

.decision-stage__label {
  color: var(--tomato);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.2em;
}

.decision-stage__value {
  max-width: 100%;
  margin: 21px 0 17px;
  overflow-wrap: anywhere;
  color: var(--tomato-dark);
  font-family: var(--serif);
  font-size: clamp(42px, 8vw, 72px);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.05;
}

.decision-stage__paper p {
  margin: 0;
  color: var(--ink-muted);
  font-size: 14px;
  line-height: 1.7;
}

.decision-stage__stamp {
  position: absolute;
  right: 25px;
  bottom: 22px;
  display: grid;
  width: 54px;
  height: 54px;
  border: 1px solid rgba(214, 80, 50, 0.26);
  border-radius: 50%;
  place-items: center;
  color: rgba(175, 56, 36, 0.48);
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 0.08em;
  line-height: 1.15;
  transform: rotate(-12deg);
}

.draw-button.el-button {
  position: relative;
  z-index: 2;
  display: flex;
  width: min(100%, 350px);
  min-height: 56px;
  margin: 36px auto 0;
  border: 1px solid var(--tomato-dark);
  border-radius: 5px 14px 5px 14px;
  align-items: center;
  justify-content: center;
  color: #fffaf2;
  background: var(--tomato);
  box-shadow: 0 12px 24px rgba(175, 56, 36, 0.22);
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.04em;
  transition: background-color 160ms ease, box-shadow 160ms ease, transform 160ms ease, border-color 160ms ease;
}

.draw-button.el-button:hover,
.draw-button.el-button:focus {
  border-color: #8e291c;
  color: #fffaf2;
  background: var(--tomato-dark);
  box-shadow: 0 15px 28px rgba(175, 56, 36, 0.28);
  transform: translateY(-2px);
}

.draw-button.el-button:active {
  box-shadow: 0 7px 16px rgba(175, 56, 36, 0.2);
  transform: translateY(1px);
}

.draw-button.el-button:focus-visible {
  outline: 3px solid var(--focus);
  outline-offset: 4px;
}

.draw-button.el-button.is-disabled,
.draw-button.el-button.is-disabled:hover {
  border-color: #c68c79;
  color: rgba(255, 250, 242, 0.9);
  background: #c77e67;
  box-shadow: none;
  transform: none;
}

.draw-button .el-icon-right {
  margin-left: 12px;
  font-weight: 800;
}

.has-result .decision-stage__value {
  animation: result-enter 360ms cubic-bezier(0.22, 1, 0.36, 1);
}

.is-running .decision-stage__value {
  color: var(--ink);
  font-family: var(--sans);
  font-size: clamp(34px, 7vw, 62px);
  letter-spacing: -0.02em;
}

@keyframes result-enter {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 767px) {
  .decision-stage {
    margin-top: 26px;
  }

  .decision-stage__shadow {
    right: -7px;
    bottom: 74px;
    left: 7px;
  }

  .decision-stage__paper {
    min-height: 248px;
    padding: 38px 24px 48px;
  }

  .decision-stage__value {
    margin-top: 18px;
    font-size: clamp(36px, 12vw, 54px);
  }

  .decision-stage__stamp {
    right: 17px;
    bottom: 15px;
    width: 46px;
    height: 46px;
  }

  .draw-button.el-button {
    width: 100%;
    min-height: 54px;
    margin-top: 28px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .has-result .decision-stage__value {
    animation: none;
  }
}
</style>
