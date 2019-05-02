const {nConcurrent} = require('../esm/')

test('One call is run', () => {
    expect.assertions(1)
    let codeReached = false

    const f = nConcurrent(2, () => {
        codeReached = true
        return Promise.resolve()
    })

    f()

    return f()
        .then(() => {
            expect(codeReached).toBe(true)
        })
})

test('Two calls is run', () => {
    expect.assertions(1)
    let numReached = 0

    const f = nConcurrent(2, () => {
        numReached++
        return Promise.resolve()
    })

    return Promise.all([f(), f()])
        .then(() => {
            expect(numReached).toBe(2)
        })
})

test('A third call waits for others', () => {
    let numRun = 0

    const f = nConcurrent(2, () => {
        numRun++

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve()
            }, 20)
        })
    })

    f()
    f()
    f()

    expect(numRun).toBe(2)
})

test('Many calls to wait for others', () => {
    let numRun = 0

    const f = nConcurrent(2, () => {
        numRun++

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve()
            }, 20)
        })
    })

    f()
    f()
    f()
    f()
    f()

    expect(numRun).toBe(2)
})

test('Many calls to wait for others and then are run themselves', () => {
    return new Promise((resolve, reject) => {
        expect.assertions(3)

        let baseTimeout = 50
        let numRun = 0

        const f = nConcurrent(2, () => {
            numRun++

            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve()
                }, baseTimeout)
            })
        })

        f()
        f()
        f()
        f()
        f()

        expect(numRun).toBe(2)

        setTimeout(() => {
            expect(numRun).toBe(4)
        }, baseTimeout + baseTimeout / 2)

        setTimeout(() => {
            expect(numRun).toBe(5)
            resolve()
        }, (2 * baseTimeout) + baseTimeout / 2)
    })
})

test('Can catch exceptions', () => {
    expect.assertions(1)
    let codeReached = false

    const f = nConcurrent(2, () => {
        return Promise.resolve()
            .then(() => {
                throw Error('err')
            })
    })

    f().catch(x => false)
    f().catch(x => false)
    f().catch(x => false)
    f().catch(x => false)
    f().catch(x => false)

    return f()
        .catch(x => {
            codeReached = true
        })
        .then(() => {
            expect(codeReached).toBe(true)
        })
})
