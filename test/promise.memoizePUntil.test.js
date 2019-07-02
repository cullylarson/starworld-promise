import {memoizePUntil} from '../esm/'

test('Single call returns expected value', () => {
    let numTries = 0

    const f = memoizePUntil(x => false, () => {
        numTries++
        return Promise.resolve(numTries)
    })

    return f()
        .then(x => expect(x).toBe(1))
})

test('Multiple calls return same value', () => {
    let numTries = 0

    const f = memoizePUntil(x => false, () => {
        numTries++
        return Promise.resolve(numTries)
    })

    return f()
        .then(x => {
            expect(x).toBe(1)
            return f()
        })
        .then(x => {
            expect(x).toBe(1)
            return f()
        })
        .then(x => {
            expect(x).toBe(1)
            return f()
        })
})

test('Multiple calls return same value until cache is invalidated', () => {
    let numTries = 0
    let cacheInvalid = false

    const f = memoizePUntil(x => cacheInvalid, () => {
        numTries++
        return Promise.resolve(numTries)
    })

    return f()
        .then(x => {
            expect(x).toBe(1)
            return f()
        })
        .then(x => {
            expect(x).toBe(1)
            cacheInvalid = true
            return f()
        })
        .then(x => {
            expect(x).toBe(2)
            cacheInvalid = false
            return f()
        })
        .then(x => {
            expect(x).toBe(2)
            return f()
        })
        .then(x => {
            expect(x).toBe(2)
            return f()
        })
})

test('The shouldInvalidateCache function resolves to the last return of the function.', () => {
    let called = false
    let finalValue = 3

    const f = memoizePUntil(x => {
        if(called) expect(x).toBe(finalValue)

        called = true

        return true // don't memoize
    }, () => {
        return called
            ? Promise.resolve(finalValue)
            : Promise.resolve(finalValue - 1)
    })

    return f()
        .then(x => {
            return f()
        })
        .then(x => {
            return f()
        })
})
