/* eslint-disable max-lines-per-function */

import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MessageDisplayer } from '../MessageDisplayer';

describe('MessageDisplayer', () => {

    let messageDisplayer: MessageDisplayer;
    let toastSpy: jasmine.Spy;

    beforeEach(() => {
        messageDisplayer = TestBed.inject(MessageDisplayer);
        // We spy on the toast private method, hence we need <any>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        toastSpy = spyOn<any>(messageDisplayer, 'toast').and.returnValue(undefined);
    });
    function durationInMs(message: string): number {
        // The getDuration method is private, but let's use it to calculate durations here too
        return messageDisplayer['getDurationInMs'](message);
    }
    it('should display a toast for the requested duration', fakeAsync(() => {
        // Given a message to display
        const message: string = 'some message';
        // We want to make sure that toast is called only in this test
        toastSpy.and.callThrough();
        // When displaying it
        messageDisplayer.infoMessage(message);
        // Then it should toast for the given duration, not more
        // if it lasts longer, this test will fail with a remaining timer error
        tick(durationInMs(message));
    }));
    it('should display info message with is-info class', () => {
        // Given an info message
        const message: string = 'not so important, just some information';
        // When calling infoMessage
        messageDisplayer.infoMessage(message);
        // Then toast should be called
        expect(messageDisplayer['toast']).toHaveBeenCalledOnceWith(message, 'is-info', durationInMs(message));
    });
    it('shoud display in-game message with is-warning class', () => {
        // Given a message
        const message: string = 'you have to move your piece!';
        // When calling gameMessage
        messageDisplayer.gameMessage(message);
        // Then toast should be called
        expect(messageDisplayer['toast']).toHaveBeenCalledOnceWith(message, 'is-warning', durationInMs(message));
    });
    it('should display critical message with is-danger class', () => {
        // Given an info message
        const message: string = 'everything is broken...';
        // When calling criticalMessage
        messageDisplayer.criticalMessage(message);
        // Then toast should be called
        expect(messageDisplayer['toast']).toHaveBeenCalledOnceWith(message, 'is-danger', durationInMs(message));
    });
    it('should display a message for a time proportional to its length', () => {
        // Given a short and a long message
        const shortMessage: string = 'short message';
        const longMessage: string = 'This is a long message. It will take more time to be read, hence it should be displayed for longer.';
        // When calling a message method with each message
        messageDisplayer.infoMessage(shortMessage);
        messageDisplayer.infoMessage(longMessage);
        // Then the duration should be less for the short message
        const shortDuration: number = toastSpy.calls.first().args[2] as number;
        const longDuration: number = toastSpy.calls.mostRecent().args[2] as number;
        expect(shortDuration).toBeLessThan(longDuration);
    });
});
