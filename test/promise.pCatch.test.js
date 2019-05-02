const {pCatch} = require('../esm/')

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
