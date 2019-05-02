const {retry} = require('../esm/')

test('Tries once', () => {
    expect.assertions(1)

    const f = (() => {
        let numTries = 0

        return () => {
            numTries++
            return Promise.resolve(numTries)
        }
    })()

    return retry(3, f)()
        .then(x => expect(x).toBe(1))
})

test('Tries twice', () => {
    expect.assertions(1)

    const f = (() => {
        let numTries = 0

        return () => {
            numTries++

            return numTries === 1
                ? Promise.reject(new Error())
                : Promise.resolve(numTries)
        }
    })()

    return retry(3, f)()
        .then(x => expect(x).toBe(2))
})

test('Tries three times', () => {
    expect.assertions(1)

    const f = (() => {
        let numTries = 0

        return () => {
            numTries++

            return numTries < 3
                ? Promise.reject(new Error())
                : Promise.resolve(numTries)
        }
    })()

    return retry(3, f)()
        .then(x => expect(x).toBe(3))
})

test('Stops trying', () => {
    expect.assertions(1)

    const f = (() => {
        let numTries = 0

        return () => {
            numTries++

            return Promise.reject(numTries)
        }
    })()

    return retry(3, f)()
        .catch(x => expect(x).toBe(3))
})
