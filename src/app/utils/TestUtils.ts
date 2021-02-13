import { DebugElement } from "@angular/core";
import { ComponentFixture } from "@angular/core/testing";
import { By } from '@angular/platform-browser';
import { AbstractGameComponent } from "../components/game-components/AbstractGameComponent";
import { LocalGameWrapperComponent } from "../components/game-components/local-game-wrapper/local-game-wrapper.component";
import { GamePartSlice } from "../jscaip/GamePartSlice";
import { LegalityStatus } from "../jscaip/LegalityStatus";
import { Move } from "../jscaip/Move";

export interface MoveExpectations {

    move: Move,

    slice: GamePartSlice,

    scoreZero: number,

    scoreOne: number,
}
export interface TestElements {

    fixture: ComponentFixture<LocalGameWrapperComponent>,

    debugElement: DebugElement,

    gameComponent: AbstractGameComponent<Move, GamePartSlice, LegalityStatus>,

    cancelSpy: jasmine.Spy,

    chooseMoveSpy: jasmine.Spy,
}
export const expectClickSuccess: (elementName: string, testElements: TestElements) => Promise<void> =
    async(elementName: string, testElements: TestElements) => {
        const element: DebugElement = testElements.debugElement.query(By.css(elementName));
        expect(element).toBeTruthy('Element "' + elementName + '"don\'t exists.')
        if (element == null) {
            return;
        } else {
            element.triggerEventHandler('click', null);
            await testElements.fixture.whenStable();
            testElements.fixture.detectChanges();
            expect(testElements.cancelSpy).not.toHaveBeenCalled();
            expect(testElements.chooseMoveSpy).not.toHaveBeenCalled();
        }
    };
export const expectClickFail: (elementName: string, testElements: TestElements, reason: string) => Promise<void> =
    async(elementName: string, testElements: TestElements, reason: string) => {
        const element: DebugElement = testElements.debugElement.query(By.css(elementName));
        expect(element).toBeTruthy('Element "' + elementName + '"don\'t exists.')
        if (element == null) {
            return;
        } else {
            element.triggerEventHandler('click', null);
            await testElements.fixture.whenStable();
            testElements.fixture.detectChanges();
            expect(testElements.chooseMoveSpy).not.toHaveBeenCalled();
            expect(testElements.cancelSpy).toHaveBeenCalledOnceWith(reason);
        }
    };
export const expectMoveSubmission: (elementName: string, testElements: TestElements, expectations: MoveExpectations) => Promise<void> =
    async(elementName: string, testElements: TestElements, expectations: MoveExpectations) => {
        const element: DebugElement = testElements.debugElement.query(By.css(elementName));
        expect(element).toBeTruthy('Element "' + elementName + '"don\'t exists.')
        if (element == null) {
            return;
        } else {
            element.triggerEventHandler('click', null);
            await testElements.fixture.whenStable();
            testElements.fixture.detectChanges();
            const { move, slice, scoreZero, scoreOne} = { ...expectations };
            expect(testElements.chooseMoveSpy).toHaveBeenCalledOnceWith(move, slice, scoreZero, scoreOne);
        }
    };
