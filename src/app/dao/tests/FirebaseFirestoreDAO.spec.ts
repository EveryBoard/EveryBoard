import { TestBed } from '@angular/core/testing';
import { AngularFirestore } from '@angular/fire/firestore';
import 'firebase/firestore';
import { Injectable } from '@angular/core';
import { FirebaseFirestoreDAO } from '../FirebaseFirestoreDAO';
import { FirebaseJSONObject } from 'src/app/utils/utils';
import { FirebaseCollectionObserver } from '../FirebaseCollectionObserver';
import { setupEmulators } from 'src/app/utils/tests/TestUtils.spec';

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
        await expectAsync(dao.read('idonotexist')).toBeResolvedTo(null);
    });
    it('should be able to read back objects that exist', async() => {
        const id: string = await dao.create({ value: 'this is my value', otherValue: 42 });
        const stored: Foo = await dao.read(id);
        expect(stored.value).toBe('this is my value');
        expect(stored.otherValue).toBe(42);
    });
    it('should support partial updates', async() => {
        const id: string = await dao.create({ value: 'foo', otherValue: 1 });
        await dao.update(id, { otherValue: 2 });
        const stored: Foo = await dao.read(id);
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
        const stored: Foo = await dao.read(id);
        expect(stored.value).toBe('bar');
        expect(stored.otherValue).toBe(2);
    });
    describe('getObsById', () => {
        it('should return an observable that can be used to see changes in objects', async() => {
            const id: string = await dao.create({ value: 'foo', otherValue: 1 });
            const allChangesSeenPromise: Promise<boolean> = new Promise((resolve: (value: boolean) => void) => {
                dao.getObsById(id).subscribe((fooId: { id: string, doc: Foo }) => {
                    if (fooId.doc.value === 'bar' && fooId.doc.otherValue === 2) {
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

        let callbackFunction: (created: {doc: Foo, id: string}[]) => void;

        beforeEach(() => {
            let createdResolve: (value: Foo[]) => void;
            promise = new Promise((resolve: (value: Foo[]) => void) => {
                createdResolve = resolve;
            });
            callbackFunction = (created: {doc: Foo, id: string}[]) => {
                createdResolve(created.map((c: {doc: Foo, id: string}): Foo => c.doc));
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
        it('should not observe document creation when the condition does not hold', async() => {
            // This test is flaky: last failure on 22/10/2021
            const callback: FirebaseCollectionObserver<Foo> = new FirebaseCollectionObserver(
                callbackFunction,
                () => void { },
                () => void { },
            );
            const unsubscribe: () => void = dao.observingWhere([['value', '==', 'bar']], callback);
            await dao.create({ value: 'foo', otherValue: 1 });
            await expectAsync(promise).toBePending();
            unsubscribe();
        });
        it('should not observe document creation when the condition does not hold', async() => {
            // This test is flaky: last failure on 22/10/2021
            const callback: FirebaseCollectionObserver<Foo> = new FirebaseCollectionObserver(
                callbackFunction,
                () => void { },
                () => void { },
            );
            const unsubscribe: () => void = dao.observingWhere([['value', '==', 'foo'], ['otherValue', '==', 2]], callback);
            await dao.create({ value: 'foo', otherValue: 1 });
            await expectAsync(promise).toBePending();
            unsubscribe();
        });
        it('should observe document modification with the given condition', async() => {
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
        it('should not observe document modification when the condition does not hold', async() => {
            const callback: FirebaseCollectionObserver<Foo> = new FirebaseCollectionObserver(
                () => void { },
                callbackFunction,
                () => void { },
            );
            const unsubscribe: () => void = dao.observingWhere([['value', '==', 'bar']], callback);
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
});
