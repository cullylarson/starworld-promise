const {map, reduce, curry, compose} = require('@cullylarson/f')

// if promise resolve to itself, it's a promise
export const isPromise = x => Promise.resolve(x) === x

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

const doesMap = x => {
    let mapped = false
    map(() => { mapped = true }, x)
    return mapped
}

// Takes a functor containing a promise `p` and returns a promise resolving to the functor containing the resolution of `p `. The
// functor must conform to fantasy-land specs.
//
// functorPFlip :: Functor(Promise(x)) -> Promise(Functor(x))
export const functorPFlip = x => {
    // doesn't map so mapping will do nothing, so just resolve
    if(!doesMap(x)) return Promise.resolve(x)

    return new Promise((resolve, reject) => {
        map(p => p
            .then(x.constructor['fantasy-land/of'])
            .then(resolve)
            .catch(reject), x)
    })
}

// Takes a function and a promise resolving to a functor and maps the provided function over the functor. If the function itself
// returns a promise `p`, then the return promise will resolve to the functor containing the resolved value of `p` (rather than
// resolving to a functor containing a promise).
//
// In the case of a functor containing a promise, this is the same as doing: then(functorPFlip(map(f)))
//
// thenMap :: Function -> Functor(Promise(x)|x) -> Promise(Functor(x))
export const thenMap = curry((f, p) => {
    return new Promise((resolve, reject) => {
        p
            .then(functor => {
                // if it doesn't map, just resolve (this would happen in the case of e.g. a Left)
                if(!doesMap(functor)) {
                    resolve(functor)
                }
                else {
                    compose(
                        map(x => {
                            if(isPromise(x)) {
                                x
                                    .then(y => resolve(functor.constructor['fantasy-land/of'](y)))
                                    .catch(reject)
                            }
                            else {
                                resolve(functor.constructor['fantasy-land/of'](x))
                            }
                        }),
                        map(f)
                    )(functor)
                }
            })
            .catch(reject)
    })
})
