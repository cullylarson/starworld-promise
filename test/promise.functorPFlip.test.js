import {functorPFlip} from '../esm/'
import {Left, Right} from 'sanctuary-either'

test('Gets the promise out.', () => {
    functorPFlip(Right(Promise.resolve('asdf')))
        .then(x => {
            expect(x).toEqual(Right('asdf'))
        })
})

test('Doesn\'t get promise out of a left.', () => {
    const l = Left(Promise.resolve('asdf'))
    functorPFlip(l)
        .then(x => {
            expect(x).toEqual(l)
        })
})
