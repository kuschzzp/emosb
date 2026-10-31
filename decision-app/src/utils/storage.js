const { getTheme } = require('./themes')

const STORAGE_KEY = 'decision_app_state_v2'
const LEGACY_STORAGE_KEY = 'chishenme_menu'
const MAX_HISTORY = 6
const MAX_LIST_NAME_LENGTH = 50
const MAX_LIST_ITEMS = 500

const DEFAULT_ITEMS = [
  '酸辣土豆丝',
  '可乐鸡翅',
  '麻婆豆腐',
  '红烧肉',
  '糖醋排骨',
  '西红柿炒鸡蛋',
  '青椒炒肉丝',
  '鱼香肉丝',
  '水煮肉片',
  '西红柿炖牛腩',
  '菠萝咕噜肉',
  '咖喱鸡翅',
  '香辣牛肉',
  '皮蛋拌豆腐',
  '宫保鸡丁',
  '家常豆腐',
  '皮蛋瘦肉粥',
  '红烧冬瓜',
  '湘式小炒五花肉',
  '酸辣汤',
  '秘制红焖羊肉',
  '酱牛肉',
  '蒜苔炒腊肉',
  '回锅肉',
  '梅菜扣肉',
  '京酱肉丝',
  '木须肉',
  '农家小炒肉',
  '土豆炖牛肉',
  '孜然牛肉',
  '黑椒牛柳',
  '葱爆羊肉',
  '孜然羊肉',
  '大盘鸡',
  '辣子鸡',
  '三杯鸡',
  '白切鸡',
  '黄焖鸡',
  '啤酒鸭',
  '蒜香排骨',
  '椒盐排骨',
  '糖醋里脊',
  '四喜丸子',
  '地三鲜',
  '干煸四季豆',
  '手撕包菜',
  '清炒西兰花',
  '蒜蓉空心菜',
  '蚝油生菜',
  '上汤娃娃菜',
  '香菇油菜',
  '荷塘小炒',
  '凉拌黄瓜',
  '凉拌木耳',
  '虎皮青椒',
  '鱼香茄子',
  '干锅花菜',
  '韭菜炒鸡蛋',
  '洋葱炒鸡蛋',
  '尖椒干豆腐',
  '千页豆腐',
  '冬瓜排骨汤',
  '玉米排骨汤',
  '莲藕排骨汤',
  '番茄菌菇汤',
  '小鸡炖蘑菇',
  '扬州炒饭',
  '腊味煲仔饭',
  '卤肉饭',
  '牛肉面',
  '炸酱面',
  '葱油拌面',
  '酸辣粉',
  '肉夹馍',
  '饺子',
  '馄饨',
  '生煎包',
  '锅贴',
  '东坡肉',
  '粉蒸肉',
  '腐乳肉',
  '锅包肉',
  '小酥肉',
  '红烧狮子头',
  '肉末茄子',
  '榨菜肉丝',
  '芹菜炒肉',
  '香干炒肉',
  '莴笋炒肉',
  '木耳炒肉',
  '尖椒炒肉',
  '土豆片炒肉',
  '莲藕炒肉片',
  '口水鸡',
  '葱油鸡',
  '盐焗鸡',
  '板栗烧鸡',
  '土豆烧鸡',
  '香菇炖鸡',
  '山药炖鸡',
  '鸡米花',
  '鸡肉咖喱',
  '烤鸡腿',
  '香酥鸭',
  '土豆烧鸭',
  '萝卜烧鸭',
  '黑椒牛肉粒',
  '红烧牛肉',
  '萝卜炖牛腩',
  '番茄肥牛',
  '金针菇肥牛',
  '牛肉炒饭',
  '羊肉炖萝卜',
  '红烧羊排',
  '手抓羊肉',
  '羊肉泡馍',
  '烤羊肉串',
  '蒜泥白肉',
  '水煮牛肉',
  '豆角焖肉',
  '咸蛋黄豆腐',
  '肉末豆腐',
  '锅塌豆腐',
  '白菜炖豆腐',
  '香煎豆腐',
  '豆腐煲',
  '番茄烧豆腐',
  '芹菜炒香干',
  '青椒炒鸡蛋',
  '苦瓜炒鸡蛋',
  '蒜黄炒鸡蛋',
  '木耳炒鸡蛋',
  '鸡蛋羹',
  '青椒土豆片',
  '干锅土豆片',
  '酸辣藕丁',
  '清炒山药',
  '清炒莴笋',
  '清炒芦笋',
  '蒜蓉油麦菜',
  '清炒小白菜',
  '白灼菜心',
  '干锅包菜',
  '红烧茄子',
  '茄子烧豆角',
  '西红柿烧茄子',
  '香菇烧冬瓜',
  '干锅杏鲍菇',
  '菌菇煲',
  '罗宋汤',
  '冬瓜丸子汤',
  '山药排骨汤',
  '萝卜牛腩汤',
  '西红柿鸡蛋汤',
  '小米粥',
  '南瓜粥',
  '盖浇饭',
  '咖喱鸡肉饭',
  '鸡蛋炒饭',
  '石锅拌饭'
]

function normalizeItems(input) {
  const source = Array.isArray(input)
    ? input
    : String(input || '').split(/\r?\n/)
  const seen = new Set()

  return source.reduce((items, value) => {
    const item = typeof value === 'string' ? value.trim() : ''

    if (item && !seen.has(item)) {
      seen.add(item)
      items.push(item)
    }

    return items
  }, [])
}

function normalizeHistory(input) {
  return (Array.isArray(input) ? input : [])
    .filter(item => typeof item === 'string' && item.trim())
    .map(item => item.trim())
    .slice(0, MAX_HISTORY)
}

function validateListDraft(draft, lists = [], currentId = '') {
  const name = String(draft.name || '').trim()
  const items = normalizeItems(draft.itemsText)

  if (!name) {
    return { ok: false, field: 'name', message: '请给清单起一个名字' }
  }

  if (name.length > MAX_LIST_NAME_LENGTH) {
    return {
      ok: false,
      field: 'name',
      message: `清单名称最多 ${MAX_LIST_NAME_LENGTH} 个字符`
    }
  }

  const normalizedName = name.toLocaleLowerCase()
  const hasDuplicateName = lists.some(list => (
    list.id !== currentId
    && typeof list.name === 'string'
    && list.name.trim().toLocaleLowerCase() === normalizedName
  ))

  if (hasDuplicateName) {
    return { ok: false, field: 'name', message: '已经有同名清单了' }
  }

  if (items.length < 2) {
    return { ok: false, field: 'items', message: '至少保留 2 个有效选项' }
  }

  if (items.length > MAX_LIST_ITEMS) {
    return {
      ok: false,
      field: 'items',
      message: `每份清单最多 ${MAX_LIST_ITEMS} 个选项`
    }
  }

  const result = { ok: true, name, items }

  // Keep older callers from accidentally resetting the existing theme.
  if (Object.prototype.hasOwnProperty.call(draft, 'theme')) {
    result.theme = getTheme(draft.theme).id
  }

  return result
}

function createId(now) {
  const suffix = Math.random().toString(36).slice(2, 8)
  return `list-${now}-${suffix}`
}

function createList(name, items, now = Date.now(), isBuiltIn = false, theme) {
  return {
    id: createId(now),
    name: String(name || '').trim(),
    isBuiltIn: Boolean(isBuiltIn),
    theme: getTheme(theme === undefined ? (isBuiltIn ? 'food' : 'general') : theme).id,
    items: normalizeItems(items),
    history: [],
    createdAt: now,
    updatedAt: now
  }
}

function createDefaultState(
  now = Date.now(),
  items = DEFAULT_ITEMS,
  isBuiltIn = true
) {
  const list = createList('今天吃什么', items, now, isBuiltIn)

  return {
    version: 2,
    activeListId: list.id,
    lists: [list]
  }
}

function syncListWithDefaultItems(list, now = Date.now()) {
  return {
    ...list,
    items: [...DEFAULT_ITEMS],
    history: [],
    updatedAt: now
  }
}

function sanitizeList(raw, now) {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const name = typeof raw.name === 'string' ? raw.name.trim() : ''
  const items = normalizeItems(raw.items)

  if (
    !name
    || name.length > MAX_LIST_NAME_LENGTH
    || items.length < 2
    || items.length > MAX_LIST_ITEMS
  ) {
    return null
  }

  const isBuiltIn = typeof raw.isBuiltIn === 'boolean'
    ? raw.isBuiltIn
    : name === '今天吃什么'

  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : createId(now),
    name,
    isBuiltIn,
    theme: getTheme(raw.theme === undefined ? (isBuiltIn ? 'food' : 'general') : raw.theme).id,
    items,
    history: normalizeHistory(raw.history),
    createdAt: Number.isFinite(raw.createdAt) ? raw.createdAt : now,
    updatedAt: Number.isFinite(raw.updatedAt) ? raw.updatedAt : now
  }
}

function sanitizeState(raw, now) {
  if (!raw || raw.version !== 2 || !Array.isArray(raw.lists)) {
    return null
  }

  const ids = new Set()
  const names = new Set()
  const lists = raw.lists.reduce((result, candidate) => {
    const list = sanitizeList(candidate, now)
    const normalizedName = list ? list.name.toLocaleLowerCase() : ''

    if (list && !ids.has(list.id) && !names.has(normalizedName)) {
      ids.add(list.id)
      names.add(normalizedName)
      result.push(list)
    }

    return result
  }, [])

  if (!lists.length) {
    return null
  }

  return {
    version: 2,
    activeListId: lists.some(list => list.id === raw.activeListId)
      ? raw.activeListId
      : lists[0].id,
    lists
  }
}

function tryPersist(storage, state) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

function loadState(storage, now = Date.now()) {
  if (!storage) {
    return createDefaultState(now)
  }

  try {
    const current = sanitizeState(
      JSON.parse(storage.getItem(STORAGE_KEY)),
      now
    )

    if (current) {
      tryPersist(storage, current)
      return current
    }
  } catch {
    // Continue with legacy migration and the built-in fallback.
  }

  try {
    const legacyItems = normalizeItems(
      JSON.parse(storage.getItem(LEGACY_STORAGE_KEY))
    )

    if (legacyItems.length >= 2) {
      const migrated = createDefaultState(now, legacyItems, false)
      tryPersist(storage, migrated)
      return migrated
    }
  } catch {
    // Continue with the built-in fallback.
  }

  const fallback = createDefaultState(now)
  tryPersist(storage, fallback)
  return fallback
}

function saveState(storage, state) {
  const safeState = sanitizeState(state, Date.now())

  if (!storage || !safeState) {
    throw new Error('INVALID_STATE')
  }

  storage.setItem(STORAGE_KEY, JSON.stringify(safeState))
}

module.exports = {
  STORAGE_KEY,
  LEGACY_STORAGE_KEY,
  DEFAULT_ITEMS,
  MAX_HISTORY,
  MAX_LIST_NAME_LENGTH,
  MAX_LIST_ITEMS,
  normalizeItems,
  validateListDraft,
  createList,
  createDefaultState,
  syncListWithDefaultItems,
  loadState,
  saveState
}
