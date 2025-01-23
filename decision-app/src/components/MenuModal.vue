<template>
  <el-dialog
      title="可选项设置"
      :visible="showModal"
      width="50%"
      @close="handleClose"
      custom-class="menu-dialog"
  >
    <div class="dialog-content">
      <p class="dialog-tip" style="text-align: center; font-size: 16px;">在下方输入您想要的选项，每行一个哦～</p>
      <el-input
          type="textarea"
          v-model="localMenuText"
          rows="10"
          placeholder="请输入菜单项，每行一个"
          class="menu-textarea"
      ></el-input>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose" class="cancel-btn">取 消</el-button>
      <el-button type="primary" @click="handleSave" class="save-btn">保 存</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  props: {
    showModal: Boolean,
    menuText: String
  },
  data() {
    return {
      localMenuText: this.menuText
    };
  },
  methods: {
    handleSave() {
      this.$emit('save', this.localMenuText);
      this.$emit('update:showModal', false);
    },
    handleClose() {
      this.$emit('update:showModal', false);
    }
  },
  watch: {
    menuText(newVal) {
      this.localMenuText = newVal;
    }
  }
};
</script>

<style scoped>
.menu-dialog {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  animation: dialogFadeIn 0.3s ease-out;
}

@keyframes dialogFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.menu-dialog >>> .el-dialog__title {
  font-size: 24px;
  color: #409EFF;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(64,158,255,0.2);
}

.menu-dialog >>> .el-dialog__header {
  padding: 25px;
  background: linear-gradient(to right, #f8f9fa, #e9ecef);
  border-bottom: 1px solid #ebeef5;
  border-radius: 20px 20px 0 0;
}

.dialog-content {
  padding: 20px 0;
}

.dialog-tip {
  color: #606266;
  font-size: 16px;
  margin-bottom: 20px;
  animation: tipBounce 0.5s ease-out;
}

@keyframes tipBounce {
  0% { transform: translateY(-10px); opacity: 0; }
  50% { transform: translateY(5px); }
  100% { transform: translateY(0); opacity: 1; }
}

.menu-textarea >>> .el-textarea__inner {
  border-radius: 12px;
  padding: 20px;
  font-size: 16px;
  line-height: 1.8;
  border-color: #dcdfe6;
  transition: all 0.3s ease;
  text-align: center;
  background: #f8f9fa;
  resize: none;
}

.menu-textarea >>> .el-textarea__inner:focus {
  border-color: #409EFF;
  box-shadow: 0 0 15px rgba(64,158,255,0.25);
  background: #fff;
  transform: translateY(-2px);
}

.dialog-footer {
  text-align: right;
  padding: 20px 30px;
  border-top: 0px solid #ebeef5;
}

.cancel-btn, .save-btn {
  padding: 12px 30px;
  font-size: 15px;
  border-radius: 25px;
  transition: all 0.3s;
  letter-spacing: 2px;
}

.cancel-btn {
  background: #f2f6fc;
  border-color: #dcdfe6;
}

.cancel-btn:hover {
  background: #e6ebf5;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.save-btn {
  background: linear-gradient(135deg, #409EFF, #3a8ee6);
  border: none;
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64,158,255,0.4);
  background: linear-gradient(135deg, #66b1ff, #409EFF);
}

.el-dialog {
  max-width: 80%;
  margin-top: 8vh !important;
}
</style>
