const STORAGE_KEY = 'decision_app_state_v2'
const LEGACY_STORAGE_KEY = 'chishenme_menu'
const MAX_HISTORY = 6

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
  '水煮鱼',
  '酸菜鱼',
  '虾皮鸡蛋羹',
  '皮蛋拌豆腐',
  '清蒸大闸蟹',
  '微波番茄虾',
  '麻辣鱼',
  '宫保鸡丁',
  '家常豆腐',
  '皮蛋瘦肉粥',
  '红烧冬瓜',
  '湘式小炒五花肉',
  '剁椒鱼头',
  '红烧鱼块',
  '清蒸鲈鱼',
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
  '红烧带鱼',
  '清蒸多宝鱼',
  '糖醋鲤鱼',
  '干烧黄花鱼',
  '香辣烤鱼',
  '蒜蓉粉丝蒸扇贝',
  '油焖大虾',
  '白灼虾',
  '香辣花甲',
  '鱿鱼炒韭菜',
  '冬瓜排骨汤',
  '玉米排骨汤',
  '莲藕排骨汤',
  '海带豆腐汤',
  '紫菜蛋花汤',
  '番茄菌菇汤',
  '鲫鱼豆腐汤',
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
  '锅贴'
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

  if (name.length > 20) {
    return { ok: false, field: 'name', message: '清单名称最多 20 个字符' }
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

  if (items.length > 200) {
    return { ok: false, field: 'items', message: '每份清单最多 200 个选项' }
  }

  return { ok: true, name, items }
}

function createId(now) {
  const suffix = Math.random().toString(36).slice(2, 8)
  return `list-${now}-${suffix}`
}

function createList(name, items, now = Date.now()) {
  return {
    id: createId(now),
    name: String(name || '').trim(),
    items: normalizeItems(items),
    history: [],
    createdAt: now,
    updatedAt: now
  }
}

function createDefaultState(now = Date.now(), items = DEFAULT_ITEMS) {
  const list = createList('今天吃什么', items, now)

  return {
    version: 2,
    activeListId: list.id,
    lists: [list]
  }
}

function sanitizeList(raw, now) {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const name = typeof raw.name === 'string' ? raw.name.trim() : ''
  const items = normalizeItems(raw.items)

  if (!name || name.length > 20 || items.length < 2 || items.length > 200) {
    return null
  }

  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : createId(now),
    name,
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
      const migrated = createDefaultState(now, legacyItems)
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
  normalizeItems,
  validateListDraft,
  createList,
  createDefaultState,
  loadState,
  saveState
}
