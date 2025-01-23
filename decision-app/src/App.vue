<template>
  <el-container class="main-container">
    <el-main>
      <div class="content-wrapper">
        <div class="content-inner">
          <h2 id="title" class="title-text">来，交给命运去选择吧～</h2>
          <el-card shadow="always" class="menu-card">
            <div id="order" class="menu-text" v-if="selectedMenu">{{ selectedMenu }}</div>
            <div v-else class="menu-text placeholder">等待选择...</div>
          </el-card>
          <el-button
              id="btn"
              type="primary"
              size="large" 
              @click="toggleSelection"
              class="action-button"
              :class="{'is-running': isRunning}"
          >
            {{ isRunning ? '停止' : '开始' }}
          </el-button>
        </div>
      </div>
    </el-main>

    <el-button
        id="setting"
        type="info"
        icon="el-icon-setting"
        @click="showModal = true"
        class="setting-button"
        circle
    ></el-button>

    <MenuModal
        :showModal="showModal"
        :menuText="menuText"
        @update:showModal="showModal = $event"
        @save="saveMenu"
    />
  </el-container>
</template>

<script>
import MenuModal from './components/MenuModal.vue';

export default {
  components: {
    MenuModal
  },
  data() {
    return {
      menu: JSON.parse(localStorage.getItem('chishenme_menu')) || [
        "酸辣土豆丝", "可乐鸡翅", "麻婆豆腐", "红烧肉", "糖醋排骨", "西红柿炒鸡蛋", "青椒炒肉丝", "鱼香肉丝",
        "水煮肉片", "西红柿炖牛腩", "菠萝咕噜肉", "咖喱鸡翅", "香辣牛肉", "水煮鱼", "酸菜鱼", "虾皮鸡蛋羹", 
        "皮蛋拌豆腐", "清蒸大闸蟹", "微波番茄虾", "麻辣鱼", "宫保鸡丁", "家常豆腐", "皮蛋瘦肉粥", "红烧冬瓜",
        "湘式小炒五花肉", "剁椒鱼头", "红烧鱼块", "清蒸鲈鱼", "酸辣汤", "秘制红焖羊肉", "酱牛肉", "蒜苔炒腊肉"
      ],
      isRunning: false,
      selectedMenu: '',
      interval: null,
      showModal: false,
      menuText: this.menu,
    };
  },
  mounted() {
    this.menuText = this.menu.join("\n");
  },
  methods: {
    toggleSelection() {
      if (this.isRunning) {
        clearInterval(this.interval);
        this.isRunning = false;
      } else {
        this.interval = setInterval(() => {
          const randomIndex = Math.floor(Math.random() * this.menu.length);
          this.selectedMenu = this.menu[randomIndex];
        }, 50);
        this.isRunning = true;
      }
    },
    saveMenu(menuText) {
      this.showModal = false;
      const newMenu = menuText.split("\n").filter(item => item.trim() !== '');
      this.menu = newMenu;
      localStorage.setItem('chishenme_menu', JSON.stringify(this.menu));
      this.menuText = menuText;
    }
  }
};
</script>

<style scoped>
* {
  font-family: "Microsoft YaHei", sans-serif;
}

.main-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;
  overflow: hidden;
}

.content-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  position: relative;
  z-index: 1;
}

.content-inner {
  width: 100%;
  max-width: 600px;
}

.title-text {
  color: #409EFF;
  text-align: center;
  margin-bottom: 30px;
  font-size: 2.5em;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  animation: fadeIn 1s ease-in;
}

.menu-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  padding: 30px;
  margin-bottom: 30px;
  position: relative;
  z-index: 2;
}

.menu-card:hover {
  transform: translateY(-5px);
}

.menu-text {
  text-align: center;
  margin: 20px 0;
  font-size: 40px;
  font-weight: bold;
  color: #303133;
  transition: all 0.3s ease;
}

.placeholder {
  color: #909399;
  font-size: 30px;
}

.action-button {
  width: 180px;
  height: 50px;
  font-size: 18px;
  border-radius: 25px;
  margin: 40px auto;
  display: block;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
}

.action-button:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.action-button.is-running {
  background-color: #F56C6C;
  border-color: #F56C6C;
}

.setting-button {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 999;
  transition: all 0.3s ease;
}

.setting-button:hover {
  transform: rotate(90deg);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
