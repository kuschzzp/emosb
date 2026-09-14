const test = require('node:test')
const assert = require('node:assert/strict')

const {
  STORAGE_KEY,
  LEGACY_STORAGE_KEY,
  DEFAULT_ITEMS,
  MAX_HISTORY,
  normalizeItems,
  validateListDraft,
  createDefaultState,
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
    normalizeItems(' 酸菜鱼 \n\n火锅\n酸菜鱼\n  烤肉  '),
    ['酸菜鱼', '火锅', '烤肉']
  )
})

test('default menu contains 100 unique non-empty dish names', () => {
  assert.equal(DEFAULT_ITEMS.length, 100)
  assert.equal(new Set(DEFAULT_ITEMS).size, 100)
  assert.ok(DEFAULT_ITEMS.every(item => (
    typeof item === 'string'
    && item.length > 0
    && item === item.trim()
  )))
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
  const longName = '清'.repeat(21)
  const tooManyItems = Array.from(
    { length: 201 },
    (_, index) => `选项 ${index + 1}`
  ).join('\n')

  assert.deepEqual(
    validateListDraft(
      { name: longName, itemsText: 'A\nB' },
      [],
      ''
    ),
    { ok: false, field: 'name', message: '清单名称最多 20 个字符' }
  )
  assert.deepEqual(
    validateListDraft(
      { name: '超长清单', itemsText: tooManyItems },
      [],
      ''
    ),
    { ok: false, field: 'items', message: '每份清单最多 200 个选项' }
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
  assert.deepEqual(state.lists[0].items, ['面条', '米饭'])
  assert.ok(storage.getItem(STORAGE_KEY))
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
