<template>
  <el-dialog
      title="可选项设置"
      :visible="showModal"
      width="50%"
      @close="handleClose"
  >
    <el-textarea
        v-model="localMenuText"
        rows="10"
        placeholder="请输入菜单项，每行一个"
    ></el-textarea>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
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
      // 使用本地的 `localMenuText` 来操作，避免直接修改父组件的 prop
      localMenuText: this.menuText
    };
  },
  methods: {
    handleSave() {
      this.$emit('save', this.localMenuText);  // 通过事件将修改后的 menuText 传递给父组件
      this.$emit('update:showModal', false);  // 通过事件关闭弹框
    },
    handleClose() {
      this.$emit('update:showModal', false);  // 通过事件关闭弹框
    }
  },
  watch: {
    menuText(newVal) {
      this.localMenuText = newVal;  // 监听 menuText 的变化，更新本地的值
    }
  }
};
</script>

<style scoped>
.el-dialog {
  max-width: 80%;
}

.dialog-footer {
  text-align: right;
}
</style>
