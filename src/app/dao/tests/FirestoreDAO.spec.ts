/* eslint-disable max-lines-per-function */
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MGPOptional } from '@everyboard/lib';

import { setupEmulators } from '../../utils/tests/TestUtils.spec';
import { FirestoreDocument, FirestoreDAO } from '../FirestoreDAO';

type Foo = {
    value: string,
    otherValue: number,
}

@Injectable({
    providedIn: 'root',
})
class FooDAO extends FirestoreDAO<Foo> {

    public constructor() {
        super('foo');
    }
}

describe('FirestoreDAO', () => {

    let fooDAO: FooDAO;

    beforeEach(async() => {
        await setupEmulators();
        fooDAO = TestBed.inject(FooDAO);
    });
    it('should not read an object that does not exist', async() => {
        await expectAsync(fooDAO.read('idonotexist')).toBeResolvedTo(MGPOptional.empty());
    });
    it('should be able to read back objects that exist', async() => {
        const id: string = await fooDAO.create({ value: 'this is my value', otherValue: 42 });
        const stored: Foo = (await fooDAO.read(id)).get();
        expect(stored.value).toBe('this is my value');
        expect(stored.otherValue).toBe(42);
    });
    it('should support partial updates', async() => {
        const id: string = await fooDAO.create({ value: 'foo', otherValue: 1 });
        await fooDAO.update(id, { otherValue: 2 });
        const stored: Foo = (await fooDAO.read(id)).get();
        expect(stored.value).toBe('foo');
        expect(stored.otherValue).toBe(2);
    });
    it('should remove an object upon deletion', async() => {
        const id: string = await fooDAO.create({ value: 'foo', otherValue: 1 });
        await fooDAO.delete(id);
        await expectAsync(fooDAO.exists(id)).toBeResolvedTo(false);
    });
    it('should update an object upon set', async() => {
        const id: string = await fooDAO.create({ value: 'foo', otherValue: 1 });
        await fooDAO.set(id, { value: 'bar', otherValue: 2 });
        const stored: Foo = (await fooDAO.read(id)).get();
        expect(stored.value).toBe('bar');
        expect(stored.otherValue).toBe(2);
    });
    describe('subscribeToChanges', () => {
        it('should return an observable that can be used to see changes in objects', async() => {
            const id: string = await fooDAO.create({ value: 'foo', otherValue: 1 });
            const allChangesSeenPromise: Promise<boolean> = new Promise((resolve: (value: boolean) => void) => {
                fooDAO.subscribeToChanges(id, (foo: MGPOptional<Foo>) => {
                    if (foo.isPresent() && foo.get().value === 'bar' && foo.get().otherValue === 2) {
                        resolve(true);
                    }
                });
            });
            await fooDAO.update(id, { otherValue: 2 });
            await fooDAO.update(id, { value: 'bar' });
            await expectAsync(allChangesSeenPromise).toBeResolvedTo(true);
        });
    });
    describe('findWhere', () => {
        it('should return the matching documents', async() => {
            // Given a DB with some documents
            await fooDAO.create({ value: 'foo', otherValue: 1 });
            await fooDAO.create({ value: 'foo', otherValue: 2 });

            // When calling findWhere
            const docs: FirestoreDocument<Foo>[] = await fooDAO.findWhere([['otherValue', '==', 1]]);

            // Then it should return the matching documents only
            expect(docs.length).toBe(1);
            expect(docs[0].data).toEqual({ value: 'foo', otherValue: 1 });
        });
    });

});
