import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AbstractGameComponent } from '../components/wrapper-components/AbstractGameComponent';
import { LocalGameWrapperComponent }
    from 'src/app/components/wrapper-components/local-game-wrapper/local-game-wrapper.component';
import { GamePartSlice } from '../jscaip/GamePartSlice';
import { LegalityStatus } from '../jscaip/LegalityStatus';
import { Move } from '../jscaip/Move';
import { DidacticialGameWrapperComponent } from '../components/wrapper-components/didacticial-game-wrapper/didacticial-game-wrapper.component';
import { MGPValidation } from './mgp-validation/MGPValidation';

export interface MoveExpectations {

    move: Move,

    slice: GamePartSlice,

    scoreZero: number,

    scoreOne: number,
}
export interface TestElements {

    fixture: ComponentFixture<LocalGameWrapperComponent | DidacticialGameWrapperComponent>,

    debugElement: DebugElement,

    gameComponent: AbstractGameComponent<Move, GamePartSlice, LegalityStatus>,

    canUserPlaySpy: jasmine.Spy,

    cancelMoveSpy: jasmine.Spy,

    chooseMoveSpy: jasmine.Spy,

    onValidUserMoveSpy: jasmine.Spy,
}
export const expectClickSuccess: (elementName: string, testElements: TestElements) => Promise<void> =
async(elementName: string, testElements: TestElements) => {
    const element: DebugElement = testElements.debugElement.query(By.css(elementName));
    expect(element).toBeTruthy('Element "' + elementName + '" don\'t exists.');
    if (element == null) {
        return;
    } else {
        element.triggerEventHandler('click', null);
        await testElements.fixture.whenStable();
        testElements.fixture.detectChanges();
        expect(testElements.canUserPlaySpy).toHaveBeenCalledOnceWith(elementName);
        testElements.canUserPlaySpy.calls.reset();
        expect(testElements.cancelMoveSpy).not.toHaveBeenCalled();
        expect(testElements.chooseMoveSpy).not.toHaveBeenCalled();
        expect(testElements.onValidUserMoveSpy).not.toHaveBeenCalled();
    }
};
export const expectClickFail: (elementName: string, testElements: TestElements, reason: string) => Promise<void> =
async(elementName: string, testElements: TestElements, reason: string) => {
    const element: DebugElement = testElements.debugElement.query(By.css(elementName));
    expect(element).toBeTruthy('Element "' + elementName + '" don\'t exists.');
    if (element == null) {
        return;
    } else {
        element.triggerEventHandler('click', null);
        await testElements.fixture.whenStable();
        testElements.fixture.detectChanges();
        expect(testElements.canUserPlaySpy).toHaveBeenCalledOnceWith(elementName);
        testElements.canUserPlaySpy.calls.reset();
        expect(testElements.chooseMoveSpy).not.toHaveBeenCalled();
        expect(testElements.cancelMoveSpy).toHaveBeenCalledOnceWith(reason);
        testElements.cancelMoveSpy.calls.reset();
    }
};
export const expectClickForbidden: (elementName: string, testElements: TestElements) => Promise<void> =
async(elementName: string, testElements: TestElements) => {
    const element: DebugElement = testElements.debugElement.query(By.css(elementName));
    expect(element).toBeTruthy('Element "' + elementName + '" don\'t exists.');
    if (element == null) {
        return;
    } else {
        const clickValidity: MGPValidation = testElements.gameComponent.canUserPlay(elementName);
        expect(clickValidity.isSuccess()).toBeFalse();
        testElements.canUserPlaySpy.calls.reset();
        element.triggerEventHandler('click', null);
        await testElements.fixture.whenStable();
        testElements.fixture.detectChanges();
        expect(testElements.canUserPlaySpy).toHaveBeenCalledOnceWith(elementName);
        testElements.canUserPlaySpy.calls.reset();
        expect(testElements.chooseMoveSpy).not.toHaveBeenCalled();
        expect(testElements.cancelMoveSpy).toHaveBeenCalledOnceWith(clickValidity.reason);
    }
};
export const expectMoveSuccess: (elementName: string, testElements: TestElements, expectations: MoveExpectations) => Promise<void> =
async(elementName: string, testElements: TestElements, expectations: MoveExpectations) => {
    const element: DebugElement = testElements.debugElement.query(By.css(elementName));
    expect(element).toBeTruthy('Element "' + elementName + '" don\'t exists.');
    if (element == null) {
        return;
    } else {
        element.triggerEventHandler('click', null);
        await testElements.fixture.whenStable();
        testElements.fixture.detectChanges();
        const { move, slice, scoreZero, scoreOne } = { ...expectations };
        expect(testElements.canUserPlaySpy).toHaveBeenCalledOnceWith(elementName);
        testElements.canUserPlaySpy.calls.reset();
        expect(testElements.chooseMoveSpy).toHaveBeenCalledOnceWith(move, slice, scoreZero, scoreOne);
        testElements.chooseMoveSpy.calls.reset();
        expect(testElements.onValidUserMoveSpy).toHaveBeenCalledOnceWith(move, scoreZero, scoreOne);
        testElements.onValidUserMoveSpy.calls.reset();
    }
};
export const expectMoveFailure: (elementName: string, testElements: TestElements, expectations: MoveExpectations, reason: string) => Promise<void> =
async(elementName: string, testElements: TestElements, expectations: MoveExpectations, reason: string) => {
    const element: DebugElement = testElements.debugElement.query(By.css(elementName));
    expect(element).toBeTruthy('Element "' + elementName + '" don\'t exists.');
    if (element == null) {
        return;
    } else {
        element.triggerEventHandler('click', null);
        await testElements.fixture.whenStable();
        testElements.fixture.detectChanges();
        const { move, slice, scoreZero, scoreOne } = { ...expectations };
        expect(testElements.canUserPlaySpy).toHaveBeenCalledOnceWith(elementName);
        testElements.canUserPlaySpy.calls.reset();
        expect(testElements.chooseMoveSpy).toHaveBeenCalledOnceWith(move, slice, scoreZero, scoreOne);
        testElements.chooseMoveSpy.calls.reset();
        expect(testElements.cancelMoveSpy).toHaveBeenCalledOnceWith(reason);
        testElements.cancelMoveSpy.calls.reset();
        expect(testElements.onValidUserMoveSpy).not.toHaveBeenCalled();
    }
};
export const clickElement: (elementName: string, testElements: TestElements) => Promise<boolean> =
async(elementName: string, testElements: TestElements) => {
    const element: DebugElement = testElements.debugElement.query(By.css(elementName));
    if (element == null) {
        return null;
    } else {
        element.triggerEventHandler('click', null);
        await testElements.fixture.whenStable();
        testElements.fixture.detectChanges();
        return true;
    }
};
