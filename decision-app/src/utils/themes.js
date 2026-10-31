const THEMES = [
  {
    id: 'general',
    name: '通用',
    buttonLabel: '抽一个答案',
    resultLabel: '这次抽到',
    waitingLabel: '答案藏在这张签里',
    description: '留一点惊喜，给每一种选择。',
    image: '/illustrations/general.webp',
    icon: 'el-icon-magic-stick'
  },
  {
    id: 'food',
    name: '吃什么',
    buttonLabel: '抽一道，开饭！',
    resultLabel: '今天就吃',
    waitingLabel: '今日好签',
    description: '纠结到此为止，让手气来决定。',
    image: '/illustrations/food.webp',
    icon: 'el-icon-fork-spoon'
  },
  {
    id: 'travel',
    name: '去哪里',
    buttonLabel: '抽一个目的地',
    resultLabel: '这次去',
    waitingLabel: '下一站，等你揭晓',
    description: '目的地交给手气，出发交给你。',
    image: '/illustrations/travel.webp',
    icon: 'el-icon-position'
  },
  {
    id: 'activity',
    name: '做什么',
    buttonLabel: '抽一件，开始！',
    resultLabel: '这次就做',
    waitingLabel: '下一件好事，待揭晓',
    description: '抽一个小计划，让今天动起来。',
    image: '/illustrations/activity.webp',
    icon: 'el-icon-finished'
  },
  {
    id: 'watch',
    name: '看什么',
    buttonLabel: '抽一部，开看！',
    resultLabel: '这次看',
    waitingLabel: '你的下一场精彩',
    description: '从清单里，抽一份今天的精彩。',
    image: '/illustrations/watch.webp',
    icon: 'el-icon-film'
  }
]

function getTheme(id) {
  return THEMES.find(theme => theme.id === id) || THEMES[0]
}

module.exports = { THEMES, getTheme }
