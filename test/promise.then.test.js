const {then} = require('../esm/')

test('Works the same as a normal then.', () => {
    expect.assertions(1)

    return then(x => x + 1, Promise.resolve(1))
        .then(x => expect(x).toBe(2))
})
