import {isPromise} from '../esm/'

test('Correctly identifies a promise.', () => {
    expect(isPromise(Promise.resolve(false))).toBe(true)
})

test('Returns false on non-promise.', () => {
    expect(isPromise(true)).toBe(false)
    expect(isPromise('asdf')).toBe(false)
    expect(isPromise({a: 'b'})).toBe(false)
})
