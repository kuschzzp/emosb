<template>
  <el-container>
    <el-main>
      <div class="row justify-content-center">
        <div class="col-xs-4"></div>
        <div class="col-xs-4">
          <h2 id="title">来，交给命运去选择吧～</h2>
          <el-card shadow="always" class="menu-card">
            <div id="order" class="text-primary text-center" v-if="selectedMenu">{{ selectedMenu }}</div>
          </el-card>
          <el-button
              id="btn"
              type="primary"
              size="medium"
              @click="toggleSelection"
              class="btn-center"
          >
            {{ isRunning ? '停止' : '开始' }}
          </el-button>
        </div>
        <div class="col-xs-4"></div>
      </div>
    </el-main>

    <el-button
        id="setting"
        type="info"
        icon="el-icon-setting"
        @click="showModal = true"
        circle
    ></el-button>

    <MenuModal
        :showModal="showModal"
        :menuText="menuText"
        @update:menuText="menuText = $event"
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
    // 初始化时，将菜单的文本格式化为换行分隔的字符串
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
  font-family: "Microsoft YaHei";
}

body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

button {
  outline: none !important;
}

#title {
  color: #bbb;
  text-align: center;
  margin-bottom: 30px;
  cursor: default;
  background-color: rgba(255, 255, 255, .5);
}

#order {
  text-align: center;
  margin-bottom: 30px;
  font-size: 26px;
  cursor: default;
  background-color: rgba(255, 255, 255, .5);
}

#btn {
  width: 150px;
  margin: 40px auto;
  display: table;
}

#setting {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 999;
}

.menu-card {
  padding: 20px;
  margin-bottom: 20px;
}

#order {
  text-align: center;
  margin-bottom: 30px;
  font-size: 40px;
  cursor: default;
  background-color: rgba(255, 255, 255, .5);
  color: black;
}

.btn-center {
  display: block;
  margin: 40px auto;
}
</style>
