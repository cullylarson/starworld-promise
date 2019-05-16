const {compose} = require('@cullylarson/f')
const {Left, Right} = require('sanctuary-either')
const {then, thenMap, pCatch} = require('../esm')

test('Left promise is not mapped over', () => {
    let codeReached = false

    return thenMap(_ => {
        codeReached = true
    }, Promise.resolve(Left()))
        .then(() => {
            expect(codeReached).toBe(false)
        })
})

test('Right promise is mapped over', () => {
    return thenMap(x => {
        expect(x).toBe('asdf')
    }, Promise.resolve(Right('asdf')))
})

test('Right of a promise should resolve the promise', () => {
    return compose(
        thenMap(x => {
            expect(x).toBe('foo')
        }),
        thenMap(_ => Promise.resolve('foo'))
    )(Promise.resolve(Right('asdf')))
})

test('Does not execute on rejection', () => {
    let codeReached = false

    return thenMap(_ => {
        codeReached = true
    }, Promise.reject(Right()))
        .catch(() => {
            expect(codeReached).toBe(false)
        })
})

test('Does not execute on exception', () => {
    let codeReached = false

    return compose(
        pCatch(_ => {
            expect(codeReached).toBe(false)
        }),
        thenMap(_ => {
            codeReached = true
        }),
        then(_ => {
            throw new Error()
        })
    )(Promise.resolve(Right('asdf')))
})

test('Exceptions thrown in thenMap can be caught', () => {
    const theError = new Error('asdf')

    return thenMap(_ => {
        throw theError
    }, Promise.resolve(Right()))
        .catch(err => {
            expect(err).toBe(theError)
        })
})
