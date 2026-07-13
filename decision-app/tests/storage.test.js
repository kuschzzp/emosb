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
