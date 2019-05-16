import {then} from '../esm/'
import {pipe} from '@cullylarson/f'

test('Works the same as a normal then.', () => {
    return then(x => x + 1, Promise.resolve(1))
        .then(x => expect(x).toBe(2))
})

test('Doesn\'t propagate rejected promises causing them to be unhandled.', () => {
    expect.assertions(1)

    const error = Error('blah')

    return pipe(
        then(x => {
            throw error
        }),
        then(x => x + 1),
        then(x => expect(x).toBe('Should never reach this line.'))
    )(Promise.resolve(3))
        .catch(err => expect(err).toBe(error))
})
