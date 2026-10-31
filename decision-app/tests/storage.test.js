const test = require('node:test')
const assert = require('node:assert/strict')
const { THEMES, getTheme } = require('../src/utils/themes')

const {
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
} = require('../src/utils/storage')

function createMemoryStorage(seed = {}) {
  const values = new Map(Object.entries(seed))

  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null
    },
    setItem(key, value) {
      values.set(key, value)
    },
    removeItem(key) {
      values.delete(key)
    }
  }
}

test('normalizeItems trims blank lines and removes duplicates', () => {
  assert.deepEqual(
    normalizeItems(' 面条 \n\n火锅\n面条\n  烤肉  '),
    ['面条', '火锅', '烤肉']
  )
})

test('default menu contains 160 unique non-empty dish names', () => {
  assert.equal(DEFAULT_ITEMS.length, 160)
  assert.equal(new Set(DEFAULT_ITEMS).size, 160)
  assert.ok(DEFAULT_ITEMS.every(item => (
    typeof item === 'string'
    && item.length > 0
    && item === item.trim()
  )))
})

test('default menu excludes seafood but keeps fish-fragrant dishes', () => {
  const seafoodPattern = /鱼|虾|蟹|扇贝|花甲|鱿鱼|海带|紫菜/

  assert.ok(DEFAULT_ITEMS.includes('鱼香肉丝'))
  assert.ok(DEFAULT_ITEMS.includes('鱼香茄子'))
  assert.ok(DEFAULT_ITEMS.every(item => (
    !seafoodPattern.test(item.replace('鱼香', ''))
  )))
})

test('syncListWithDefaultItems replaces items and clears history', () => {
  const original = {
    id: 'food',
    name: '我的晚餐',
    isBuiltIn: true,
    items: ['旧选项一', '旧选项二'],
    history: ['旧选项一'],
    createdAt: 100,
    updatedAt: 150
  }

  const synced = syncListWithDefaultItems(original, 200)

  assert.deepEqual(synced, {
    ...original,
    items: DEFAULT_ITEMS,
    history: [],
    updatedAt: 200
  })
  assert.notEqual(synced, original)
  assert.notEqual(synced.items, DEFAULT_ITEMS)
  assert.deepEqual(original.items, ['旧选项一', '旧选项二'])
  assert.deepEqual(original.history, ['旧选项一'])
})

test('default lists are built in while newly created lists are not', () => {
  const defaultState = createDefaultState(100, ['A', 'B'])
  const customList = createList('周末去哪', ['公园', '书店'], 200)

  assert.equal(defaultState.lists[0].isBuiltIn, true)
  assert.equal(customList.isBuiltIn, false)
})

test('validateListDraft rejects duplicate names and fewer than two items', () => {
  const lists = [{ id: 'food', name: '今天吃什么' }]

  assert.equal(
    validateListDraft(
      { name: '今天吃什么', itemsText: 'A\nB' },
      lists,
      'other'
    ).ok,
    false
  )
  assert.equal(
    validateListDraft(
      { name: '周末去哪', itemsText: '只有一个' },
      lists,
      ''
    ).ok,
    false
  )
})

test('validateListDraft accepts a cleaned valid draft', () => {
  const result = validateListDraft(
    { name: '  周末去哪  ', itemsText: ' 公园\n书店\n公园 ' },
    [{ id: 'food', name: '今天吃什么' }],
    ''
  )

  assert.deepEqual(result, {
    ok: true,
    name: '周末去哪',
    items: ['公园', '书店']
  })
})

test('validateListDraft enforces name and item count limits', () => {
  const maxName = '清'.repeat(50)
  const longName = '清'.repeat(51)
  const maxItems = Array.from(
    { length: 500 },
    (_, index) => `选项 ${index + 1}`
  ).join('\n')
  const tooManyItems = Array.from(
    { length: 501 },
    (_, index) => `选项 ${index + 1}`
  ).join('\n')

  assert.equal(MAX_LIST_NAME_LENGTH, 50)
  assert.equal(MAX_LIST_ITEMS, 500)

  const validAtLimits = validateListDraft(
    { name: maxName, itemsText: maxItems },
    [],
    ''
  )

  assert.equal(validAtLimits.ok, true)
  assert.equal(validAtLimits.name.length, 50)
  assert.equal(validAtLimits.items.length, 500)

  assert.deepEqual(
    validateListDraft(
      { name: longName, itemsText: 'A\nB' },
      [],
      ''
    ),
    { ok: false, field: 'name', message: '清单名称最多 50 个字符' }
  )
  assert.deepEqual(
    validateListDraft(
      { name: '超长清单', itemsText: tooManyItems },
      [],
      ''
    ),
    { ok: false, field: 'items', message: '每份清单最多 500 个选项' }
  )
})

test('validateListDraft compares names after trimming and folding case', () => {
  const result = validateListDraft(
    { name: '  weekend  ', itemsText: 'A\nB' },
    [{ id: 'existing', name: 'Weekend' }],
    'new'
  )

  assert.deepEqual(result, {
    ok: false,
    field: 'name',
    message: '已经有同名清单了'
  })
})

test('loadState migrates the legacy menu', () => {
  const storage = createMemoryStorage({
    [LEGACY_STORAGE_KEY]: JSON.stringify(['面条', '米饭', '面条'])
  })
  const state = loadState(storage, 100)

  assert.equal(state.version, 2)
  assert.equal(state.lists[0].name, '今天吃什么')
  assert.equal(state.lists[0].isBuiltIn, false)
  assert.deepEqual(state.lists[0].items, ['面条', '米饭'])
  assert.ok(storage.getItem(STORAGE_KEY))
})

test('loadState repairs missing built-in markers without overriding explicit values', () => {
  const storage = createMemoryStorage({
    [STORAGE_KEY]: JSON.stringify({
      version: 2,
      activeListId: 'default',
      lists: [
        {
          id: 'default',
          name: '今天吃什么',
          items: ['面条', '米饭']
        },
        {
          id: 'custom',
          name: '今天吃什么也行',
          isBuiltIn: false,
          items: ['火锅', '烤肉']
        }
      ]
    })
  })

  const state = loadState(storage, 100)

  assert.equal(state.lists[0].isBuiltIn, true)
  assert.equal(state.lists[1].isBuiltIn, false)
})

test('loadState keeps an explicit non-built-in marker on the default name', () => {
  const storage = createMemoryStorage({
    [STORAGE_KEY]: JSON.stringify({
      version: 2,
      activeListId: 'custom',
      lists: [{
        id: 'custom',
        name: '今天吃什么',
        isBuiltIn: false,
        items: ['面条', '米饭']
      }]
    })
  })

  const state = loadState(storage, 100)

  assert.equal(state.lists[0].isBuiltIn, false)
})

test('built-in marker survives renaming, syncing and persistence', () => {
  const storage = createMemoryStorage()
  const state = createDefaultState(100, ['A', 'B'])
  const renamed = {
    ...state.lists[0],
    name: '我的晚餐'
  }

  state.lists[0] = syncListWithDefaultItems(renamed, 200)
  saveState(storage, state)

  const reloaded = loadState(storage, 300)
  assert.equal(reloaded.lists[0].name, '我的晚餐')
  assert.equal(reloaded.lists[0].isBuiltIn, true)
})

test('loadState keeps valid lists from a partially damaged v2 payload', () => {
  const storage = createMemoryStorage({
    [STORAGE_KEY]: JSON.stringify({
      version: 2,
      activeListId: 'valid',
      lists: [
        {
          id: 'valid',
          name: '周末去哪',
          items: ['公园', '书店'],
          history: ['公园']
        },
        { id: 'invalid', name: '', items: [] }
      ]
    })
  })
  const state = loadState(storage, 100)

  assert.equal(state.lists.length, 1)
  assert.equal(state.activeListId, 'valid')
})

test('loadState keeps a list at the new name and item limits', () => {
  const items = Array.from(
    { length: 500 },
    (_, index) => `选项 ${index + 1}`
  )
  const storage = createMemoryStorage({
    [STORAGE_KEY]: JSON.stringify({
      version: 2,
      activeListId: 'large',
      lists: [{ id: 'large', name: '清'.repeat(50), items }]
    })
  })

  const state = loadState(storage, 100)

  assert.equal(state.activeListId, 'large')
  assert.equal(state.lists[0].name.length, 50)
  assert.equal(state.lists[0].items.length, 500)
})

test('loadState removes duplicate ids and names and repairs the active list', () => {
  const storage = createMemoryStorage({
    [STORAGE_KEY]: JSON.stringify({
      version: 2,
      activeListId: 'missing',
      lists: [
        { id: 'first', name: '周末去哪', items: ['公园', '书店'] },
        { id: 'first', name: '晚饭吃啥', items: ['面条', '米饭'] },
        { id: 'third', name: ' 周末去哪 ', items: ['爬山', '看海'] },
        { id: 'fourth', name: '买什么', items: ['咖啡', '茶'] }
      ]
    })
  })
  const state = loadState(storage, 100)

  assert.deepEqual(
    state.lists.map(list => list.id),
    ['first', 'fourth']
  )
  assert.equal(state.activeListId, 'first')
})

test('loadState falls back safely when JSON is malformed', () => {
  const storage = createMemoryStorage({ [STORAGE_KEY]: '{bad json' })
  const state = loadState(storage, 100)

  assert.equal(state.version, 2)
  assert.ok(state.lists[0].items.length >= 2)
})

test('saveState persists at most six history entries per list', () => {
  const storage = createMemoryStorage()
  const state = createDefaultState(100, ['A', 'B'])
  state.lists[0].history = ['A', 'B', 'A', 'B', 'A', 'B', 'A']

  saveState(storage, state)

  const saved = JSON.parse(storage.getItem(STORAGE_KEY))
  assert.equal(saved.lists[0].history.length, MAX_HISTORY)
})

test('saveState rejects states without a valid list', () => {
  const storage = createMemoryStorage()

  assert.throws(
    () => saveState(storage, {
      version: 2,
      activeListId: 'invalid',
      lists: [{ id: 'invalid', name: '坏数据', items: ['只有一项'] }]
    }),
    /INVALID_STATE/
  )
  assert.equal(storage.getItem(STORAGE_KEY), null)
})

test('new custom lists use the general theme even with a food-like name', () => {
  assert.equal(createList('今天吃什么', ['A', 'B'], 100).theme, 'general')
  assert.equal(createDefaultState(100).lists[0].theme, 'food')
  assert.equal(createList('周末去哪', ['A', 'B'], 100, false, 'travel').theme, 'travel')
})

test('themes migrate from built-in markers without guessing custom list names', () => {
  const storage = createMemoryStorage({
    [STORAGE_KEY]: JSON.stringify({
      version: 2,
      activeListId: 'built-in',
      lists: [
        { id: 'built-in', name: '我的菜单', isBuiltIn: true, items: ['A', 'B'] },
        { id: 'custom', name: '今天吃什么', isBuiltIn: false, items: ['C', 'D'] },
        { id: 'travel', name: '周末去哪', items: ['E', 'F'] }
      ]
    })
  })

  assert.deepEqual(loadState(storage, 100).lists.map(list => list.theme), [
    'food', 'general', 'general'
  ])
  assert.equal(JSON.parse(storage.getItem(STORAGE_KEY)).lists[0].theme, 'food')

  const legacyStorage = createMemoryStorage({
    [LEGACY_STORAGE_KEY]: JSON.stringify(['A', 'B'])
  })
  assert.equal(loadState(legacyStorage, 100).lists[0].theme, 'general')
})

test('each explicit theme survives storage round trips and default item sync', () => {
  const storage = createMemoryStorage()
  const lists = THEMES.map((theme, index) => (
    createList(`清单 ${index}`, ['A', 'B'], 100 + index, false, theme.id)
  ))
  const state = { version: 2, activeListId: lists[0].id, lists }
  saveState(storage, state)

  const reloaded = loadState(storage, 200)
  assert.deepEqual(reloaded.lists.map(list => list.theme), THEMES.map(theme => theme.id))
  assert.equal(syncListWithDefaultItems(reloaded.lists[2], 300).theme, 'travel')
})

test('unknown theme values safely fall back without discarding the list', () => {
  const storage = createMemoryStorage()
  const state = createDefaultState(100, ['A', 'B'])
  state.lists[0].theme = 'unknown'
  saveState(storage, state)

  assert.equal(loadState(storage, 200).lists[0].theme, 'general')
  assert.equal(createList('自定义', ['A', 'B'], 100, false, null).theme, 'general')
  assert.equal(getTheme('__proto__').id, 'general')
})

test('draft validation normalizes explicit themes and leaves old callers unchanged', () => {
  const valid = { name: '周末去哪', itemsText: '公园\n书店' }
  assert.equal(validateListDraft({ ...valid, theme: 'travel' }).theme, 'travel')
  assert.equal(validateListDraft({ ...valid, theme: 'unknown' }).theme, 'general')
  assert.equal(Object.prototype.hasOwnProperty.call(validateListDraft(valid), 'theme'), false)
})
