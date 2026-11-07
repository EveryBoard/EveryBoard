import { Comparable } from '../Comparable';
import { Set } from '../Set';

export function expectEquality<T extends Comparable>(expected: Set<T>, actual: Set<T>): void {
    const missingInExpected: string | undefined = expected.getMissingElementFrom(actual)
        .map((element: T) => element?.toString())
        .getOrElse('');
    const unexpectedInActual: string | undefined = actual.getMissingElementFrom(expected)
        .map((element: T) => element?.toString())
        .getOrElse('');
    const context: string = `expected: ${ expected.toString() }` +
        `\nto be: ${ actual.toString() }` +
        `\nMissing in expected: ${ missingInExpected }` +
        `\nUnexpected in actual: ${ unexpectedInActual }`;
    expect(actual.equals(expected)).withContext(context).toBeTrue();
}
