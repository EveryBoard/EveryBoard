import { Encoder } from '../Encoder';
import { JSONValue } from '../JSON';

export class EncoderTestUtils {
    public static expectToBeBijective<T>(encoder: Encoder<T>, value: T): void {
        console.clear()
        console.log('0 encoder', encoder)
        const encoded: JSONValue = encoder.encode(value);
        const decoded: T = encoder.decode(encoded);
        expect(decoded).withContext(`Expected decoded value (${decoded}) to be ${value}`).toEqual(value);
    }
}
