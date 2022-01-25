/* eslint-disable max-lines-per-function */
import { TestBed } from '@angular/core/testing';
import { AngularFirestore } from '@angular/fire/firestore';
import 'firebase/firestore';
import { Injectable } from '@angular/core';
import { FirebaseFirestoreDAO } from '../FirebaseFirestoreDAO';
import { FirebaseJSONObject } from 'src/app/utils/utils';
import { FirebaseCollectionObserver } from '../FirebaseCollectionObserver';
import { setupEmulators } from 'src/app/utils/tests/TestUtils.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';

interface Foo extends FirebaseJSONObject {
    value: string,
    otherValue: number,
}

@Injectable({
    providedIn: 'root',
})
class FooDAO extends FirebaseFirestoreDAO<Foo> {
    constructor(protected afs: AngularFirestore) {
        super('foo', afs);
    }
}

describe('FirebaseFirestoreDAO', () => {
    let dao: FooDAO;
    beforeEach(async() => {
        await setupEmulators();
        dao = TestBed.inject(FooDAO);
    });
    it('should not read an object that does not exist', async() => {
        await expectAsync(dao.read('idonotexist')).toBeResolvedTo(MGPOptional.empty());
    });
    it('should be able to read back objects that exist', async() => {
        const id: string = await dao.create({ value: 'this is my value', otherValue: 42 });
        const stored: Foo = (await dao.read(id)).get();
        expect(stored.value).toBe('this is my value');
        expect(stored.otherValue).toBe(42);
    });
    it('should support partial updates', async() => {
        const id: string = await dao.create({ value: 'foo', otherValue: 1 });
        await dao.update(id, { otherValue: 2 });
        const stored: Foo = (await dao.read(id)).get();
        expect(stored.value).toBe('foo');
        expect(stored.otherValue).toBe(2);
    });
    it('should remove an object upon deletion', async() => {
        const id: string = await dao.create({ value: 'foo', otherValue: 1 });
        await dao.delete(id);
        await expectAsync(dao.exists(id)).toBeResolvedTo(false);
    });
    it('should update an object upon set', async() => {
        const id: string = await dao.create({ value: 'foo', otherValue: 1 });
        await dao.set(id, { value: 'bar', otherValue: 2 });
        const stored: Foo = (await dao.read(id)).get();
        expect(stored.value).toBe('bar');
        expect(stored.otherValue).toBe(2);
    });
    describe('getObsById', () => {
        it('should return an observable that can be used to see changes in objects', async() => {
            const id: string = await dao.create({ value: 'foo', otherValue: 1 });
            const allChangesSeenPromise: Promise<boolean> = new Promise((resolve: (value: boolean) => void) => {
                dao.getObsById(id).subscribe((foo: MGPOptional<Foo>) => {
                    if (foo.isPresent() && foo.get().value === 'bar' && foo.get().otherValue === 2) {
                        resolve(true);
                    }
                });
            });
            await dao.update(id, { otherValue: 2 });
            await dao.update(id, { value: 'bar' });
            await expectAsync(allChangesSeenPromise).toBeResolvedTo(true);
        });
    });
    describe('observingWhere', () => {

        let promise: Promise<Foo[]>; // This promise will be resolved when the callback function is called

        let callbackFunction: (created: {data: Foo, id: string}[]) => void;
        let callbackFunctionLog: (created: {data: Foo, id: string}[]) => void;

        beforeEach(() => {
            let createdResolve: (value: Foo[]) => void;
            promise = new Promise((resolve: (value: Foo[]) => void) => {
                createdResolve = resolve;
            });
            callbackFunction = (created: {data: Foo, id: string}[]) => {
                createdResolve(created.map((c: {data: Foo, id: string}): Foo => c.data));
            };
            callbackFunctionLog = (created: {data: Foo, id: string}[]) => {
                for (const doc of created) {
                    console.log(doc);
                }
                createdResolve(created.map((c: {data: Foo, id: string}): Foo => c.data));
            };
        });
        it('should observe document creation with the given condition', async() => {
            const callback: FirebaseCollectionObserver<Foo> = new FirebaseCollectionObserver(
                callbackFunction,
                () => void { },
                () => void { },
            );
            const unsubscribe: () => void = dao.observingWhere([['value', '==', 'foo']], callback);
            await dao.create({ value: 'foo', otherValue: 1 });
            await expectAsync(promise).toBeResolvedTo([{ value: 'foo', otherValue: 1 }]);
            unsubscribe();
        });
        it('should observe document creation according to multiple conditions', async() => {
            const callback: FirebaseCollectionObserver<Foo> = new FirebaseCollectionObserver(
                callbackFunction,
                () => void { },
                () => void { },
            );
            const unsubscribe: () => void = dao.observingWhere([['value', '==', 'foo'], ['otherValue', '==', 1]], callback);
            await dao.create({ value: 'foo', otherValue: 1 });
            await expectAsync(promise).toBeResolvedTo([{ value: 'foo', otherValue: 1 }]);
            unsubscribe();
        });
        it('should not observe document creation when the condition does not hold (simple)', async() => {
            // This test is flaky: it fails from time to time. Check the output log when it fails.
            const callback: FirebaseCollectionObserver<Foo> = new FirebaseCollectionObserver(
                callbackFunctionLog,
                () => void { },
                () => void { },
            );
            const unsubscribe: () => void = dao.observingWhere([['value', '==', 'baz']], callback);
            await dao.create({ value: 'foo', otherValue: 1 });
            await expectAsync(promise).toBePending();
            unsubscribe();
        });
        it('should not observe document creation when the condition does not hold (complexe)', async() => {
            // This test is flaky: it fails from time to time. Check the output log when it fails.
            const callback: FirebaseCollectionObserver<Foo> = new FirebaseCollectionObserver(
                callbackFunctionLog,
                () => void { },
                () => void { },
            );
            const unsubscribe: () => void = dao.observingWhere([['value', '==', 'baz'], ['otherValue', '==', 2]], callback);
            await dao.create({ value: 'foo', otherValue: 1 });
            await expectAsync(promise).toBePending();
            unsubscribe();
        });
        it('should observe document update with the given condition', async() => {
            const callback: FirebaseCollectionObserver<Foo> = new FirebaseCollectionObserver(
                () => void { },
                callbackFunction,
                () => void { },
            );
            const unsubscribe: () => void = dao.observingWhere([['value', '==', 'foo']], callback);
            const id: string = await dao.create({ value: 'foo', otherValue: 1 });
            await dao.update(id, { otherValue: 42 });
            await expectAsync(promise).toBeResolvedTo([{ value: 'foo', otherValue: 42 }]);
            unsubscribe();
        });
        it('should not observe document update when the condition does not hold', async() => {
            const callback: FirebaseCollectionObserver<Foo> = new FirebaseCollectionObserver(
                () => void { },
                callbackFunction,
                () => void { },
            );
            const unsubscribe: () => void = dao.observingWhere([['value', '==', 'baz']], callback);
            const id: string = await dao.create({ value: 'foo', otherValue: 1 });
            await dao.update(id, { otherValue: 42 });
            await expectAsync(promise).toBePending();
            unsubscribe();
        });
        it('should observe document deletions with the given condition', async() => {
            const callback: FirebaseCollectionObserver<Foo> = new FirebaseCollectionObserver(
                () => void { },
                () => void { },
                callbackFunction,
            );
            const unsubscribe: () => void = dao.observingWhere([['value', '==', 'foo']], callback);
            const id: string = await dao.create({ value: 'foo', otherValue: 1 });
            await dao.delete(id);
            await expectAsync(promise).toBeResolvedTo([{ value: 'foo', otherValue: 1 }]);
            unsubscribe();
        });
        it('should not observe document deletions when the condition does not hold', async() => {
            const callback: FirebaseCollectionObserver<Foo> = new FirebaseCollectionObserver(
                () => void { },
                callbackFunction,
                () => void { },
            );
            const unsubscribe: () => void = dao.observingWhere([['value', '==', 'foo']], callback);
            const id: string = await dao.create({ value: 'foo', otherValue: 1 });
            await dao.delete(id);
            await expectAsync(promise).toBePending();
            unsubscribe();
        });
    });
    describe('findWhere', () => {
        it('should return the matching documents', async() => {
            // Given a DB with some documents
            await dao.create({ value: 'foo', otherValue: 1 });
            await dao.create({ value: 'foo', otherValue: 2 });

            // When calling findWhere
            const docs: Foo[] = await dao.findWhere([['otherValue', '==', 1]]);

            // Then it should return the matching documents only
            expect(docs.length).toBe(1);
            expect(docs[0]).toEqual({ value: 'foo', otherValue: 1 });
        });
    });
});
