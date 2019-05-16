const {map, reduce, curry, compose} = require('@cullylarson/f')

export const then = curry((f, p) => p.then(f))
export const pCatch = curry((f, p) => p.catch(f))

// If an array, will assume an array of promises and return a single promise
// that resolves to all of the results of the promises (e.g. Promise.all)
// If an object, will assume each value is one or more promises. Will return
// a single promise that resolves to the object with values as resolved values
// (the values will no longer be promises). In this case the order of keys
// will not be preserved.
export const pAll = ps => {
    if(Array.isArray(ps)) return Promise.all(ps)

    return compose(
        reduce((accP, p, k) => {
            return Promise.all([accP, p])
                .then(([acc, x]) => {
                    return {
                        ...acc,
                        [k]: x,
                    }
                })
        }, Promise.resolve({})),
        map(x => {
            return Array.isArray(x)
                ? Promise.all(x)
                : x
        })
    )(ps)
}

// only allows a function to be run a certain number of times at once. if
// that number is reached, will queue the other function calls and wait
// until a spot opens up.
//
// f must return a Promise.
export const nConcurrent = (n, f) => {
    let numRunning = 0
    let queue = []

    const runOne = ({args, resolve, reject}) => {
        numRunning++

        return f.apply(null, args)
            .then(result => {
                numRunning--

                if(queue.length) {
                    runOne(queue.pop())
                }

                resolve(result)
            })
            .catch(err => {
                if(queue.length) {
                    runOne(queue.pop())
                }

                reject(err)
            })
    }

    return (...args) => {
        return new Promise((resolve, reject) => {
            if(numRunning >= n) {
                queue.push({args, resolve, reject})
            }
            else {
                runOne({args, resolve, reject})
            }
        })
    }
}

export const retry = (n, f) => (...args) => f(...args)
    .catch(x => {
        // done trying
        if(n - 1 <= 0) throw x
        // try again
        else return retry(n - 1, f)(...args)
    })

export const memoizePUntil = (shouldInvalidateCache, f) => {
    let cache = {}

    const getFresh = (key, args) => {
        if(cache.hasOwnProperty(key)) delete cache[key]

        cache[key] = f(...args)
        return cache[key]
    }

    return (...args) => {
        const key = Array.prototype.slice.call(args)

        if(cache.hasOwnProperty(key)) {
            return cache[key]
                .then(x => {
                    return shouldInvalidateCache(x)
                        ? getFresh(key, args)
                        : cache[key]
                })
        }
        else {
            return getFresh(key, args)
        }
    }
}
