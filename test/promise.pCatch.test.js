import {compose} from '@cullylarson/f'
import {pCatch, then} from '../esm/'

test('Works the same as a normal catch on reject.', () => {
    expect.assertions(1)

    const error = Error('foo')

    return pCatch(x => expect(x).toBe(error), Promise.reject(error))
})

test('Works the same as a normal catch on throw.', () => {
    expect.assertions(1)

    const error = Error('foo')

    return pCatch(
        x => expect(x).toBe(error),
        Promise.resolve('asdf')
            .then(x => {
                throw error
            })
    )
})

test('Continues after catch.', () => {
    const error = Error('foo')

    return compose(
        then(x => {
            expect(x).toBe('AAA')
        }),
        pCatch(x => {
            expect(x).toBe(error)
            return 'AAA'
        }),
        then(x => {
            throw error
        }),
    )(Promise.resolve('a'))
})
