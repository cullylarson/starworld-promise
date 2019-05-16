import {compose} from '@cullylarson/f'
import {Left, Right} from 'sanctuary-either'
import {thenChain, then, pCatch} from '../esm'

test('Left is not chained over', () => {
    let codeReached = false

    return thenChain(x => {
        codeReached = true
    }, Promise.resolve(Left()))
        .then(() => {
            expect(codeReached).toBe(false)
        })
})

test('Right is chained over', () => {
    return thenChain(x => {
        expect(x).toBe('asdf')
    }, Promise.resolve(Right('asdf')))
})

test('Result of map is contained', () => {
    return thenChain(x => Right(x + 1), Promise.resolve(Right(1)))
        .then(x => {
            expect(x.value).toBe(2)
            expect(x.constructor['fantasy-land/of']).toBe(Right)
        })
})

test('Does not execute on rejection', () => {
    let codeReached = false

    return thenChain(_ => {
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
        thenChain(_ => {
            codeReached = true
        }),
        then(_ => {
            throw new Error()
        })
    )(Promise.resolve(Right('asdf')))
})

test('Exceptions thrown in thenChain can be caught', () => {
    const theError = new Error('asdf')

    return thenChain(_ => {
        throw theError
    }, Promise.resolve(Right()))
        .catch(err => {
            expect(err).toBe(theError)
        })
})

test('Wraps in Left if a Left is returned', () => {
    return compose(
        then(x => expect(x.isLeft).toBe(true)),
        thenChain(() => Left())
    )(Promise.resolve(Right()))
})
