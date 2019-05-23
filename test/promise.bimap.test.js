const {Left, Right} = require('sanctuary-either')
const {bimap} = require('../esm')

test('Right function is called on Right', () => {
    let wasCalled = false

    bimap(() => {}, () => {
        wasCalled = true
    }, Right())

    expect(wasCalled).toBe(true)
})

test('Right function is not called on Left', () => {
    let wasCalled = false

    bimap(() => {}, () => {
        wasCalled = true
    }, Left())

    expect(wasCalled).toBe(false)
})

test('Left function is called on Left', () => {
    let wasCalled = false

    bimap(() => {
        wasCalled = true
    }, () => {}, Left())

    expect(wasCalled).toBe(true)
})

test('Left function is not called on Right', () => {
    let wasCalled = false

    bimap(() => {}, () => {
        wasCalled = true
    }, Left())

    expect(wasCalled).toBe(false)
})
