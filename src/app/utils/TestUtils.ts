import { DebugElement } from "@angular/core";
import { ComponentFixture } from "@angular/core/testing";
import { By } from '@angular/platform-browser';
import { AbstractGameComponent } from "../components/game-components/AbstractGameComponent";
import { LocalGameWrapperComponent } from "../components/game-components/local-game-wrapper/local-game-wrapper.component";
import { GamePartSlice } from "../jscaip/GamePartSlice";
import { LegalityStatus } from "../jscaip/LegalityStatus";
import { Move } from "../jscaip/Move";

export interface TestElements {

    fixture: ComponentFixture<LocalGameWrapperComponent>,

    debugElement: DebugElement,

    gameComponent: AbstractGameComponent<Move, GamePartSlice, LegalityStatus>,

    cancelSpy: jasmine.Spy
}
export const expectClickSuccess: (
    elementName: string,
    testElements: TestElements) => Promise<void> =
async(elementName: string, testElements: TestElements) => {
    const element: DebugElement = testElements.debugElement.query(By.css(elementName));
    if (element == null) {
        throw Error('Element "' + elementName + '"don\'t exists.')
    } else {
        console.log('element exist, will he success');
        testElements.cancelSpy.and.throwError('Clicking on ' + elementName + ' called cancelMove.');
        element.triggerEventHandler('click', null);
        await testElements.fixture.whenStable();
        testElements.fixture.detectChanges();
        console.log(testElements.gameComponent.cancelMove.call);
    }
}
const expectValidError: (receivedError: string, expectedError: string) => void = (receivedError: string, expectedError: string) => {
    expect(receivedError).toEqual(expectedError);
}
export const expectClickFail: (
    elementName: string,
    testElements: TestElements,
    reason: string) => Promise<void> =
async(elementName: string, testElements: TestElements, reason: string) => {
    const element: DebugElement = testElements.debugElement.query(By.css(elementName));
    if (element == null) {
        throw Error('Element "' + elementName + '"don\'t exists.')
    } else {
        console.log('element exist, will he faiiiil');
        testElements.cancelSpy.and.callFake((message: string) => expectValidError(message, reason));
        element.triggerEventHandler('click', null);
        await testElements.fixture.whenStable();
        testElements.fixture.detectChanges();
        console.log({t: testElements.cancelSpy.calls})
        throw new Error('Expected cancelMove to have been called with "' + reason + "' but it was not.");
    }
}