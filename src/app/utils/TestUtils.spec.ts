import { CUSTOM_ELEMENTS_SCHEMA, DebugElement, Type } from '@angular/core';
import { ComponentFixture, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AbstractGameComponent } from '../components/game-components/abstract-game-component/AbstractGameComponent';
import { LocalGameWrapperComponent }
    from 'src/app/components/wrapper-components/local-game-wrapper/local-game-wrapper.component';
import { GamePartSlice } from '../jscaip/GamePartSlice';
import { LegalityStatus } from '../jscaip/LegalityStatus';
import { Move } from '../jscaip/Move';
import { MGPValidation } from './mgp-validation/MGPValidation';
import { Observable, of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { AppModule } from '../app.module';
import { ActivatedRoute } from '@angular/router';
import { JoueursDAO } from '../dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from '../dao/joueurs/JoueursDAOMock';
import { AuthenticationService, AuthUser } from '../services/authentication/AuthenticationService';
import { MGPNode } from '../jscaip/mgp-node/MGPNode';
import { GameWrapper } from '../components/wrapper-components/GameWrapper';

class ActivatedRouteMock {
    public readonly snapshot: any;
    public constructor(game: string) {
        this.snapshot = {
            paramMap: {
                get: (str: string) => {
                    return game;
                },
            },
        };
    }
}
export class AuthenticationServiceMock {
    public static USER: AuthUser = AuthenticationService.NOT_CONNECTED;

    public getJoueurObs(): Observable<AuthUser> {
        return of(AuthenticationServiceMock.USER);
    }
    public getAuthenticatedUser(): AuthUser {
        return AuthenticationServiceMock.USER;
    }
}

export class ComponentTestUtils<T extends AbstractGameComponent<Move, GamePartSlice, LegalityStatus>> {
    public fixture: ComponentFixture<GameWrapper>;
    public debugElement: DebugElement;
    public wrapper: GameWrapper;

    public activatedRouteStub: ActivatedRouteMock;

    private gameComponent: AbstractGameComponent<Move, GamePartSlice, LegalityStatus>;
    private canUserPlaySpy: jasmine.Spy;
    private cancelMoveSpy: jasmine.Spy;
    private chooseMoveSpy: jasmine.Spy;
    private onLegalUserMoveSpy: jasmine.Spy;

    public constructor(game: string, wrapperKind: Type<GameWrapper> = LocalGameWrapperComponent) {
        this.activatedRouteStub = new ActivatedRouteMock(game);
        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
                AppModule,
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: ActivatedRoute, useValue: this.activatedRouteStub },
                { provide: JoueursDAO, useClass: JoueursDAOMock },
                { provide: AuthenticationService, useClass: AuthenticationServiceMock },
            ],
        }).compileComponents();
        this.fixture = TestBed.createComponent(wrapperKind);
        this.wrapper = this.fixture.debugElement.componentInstance;
        this.fixture.detectChanges();
        this.debugElement = this.fixture.debugElement;
        tick(1);
        this.gameComponent = this.wrapper.gameComponent;
        this.cancelMoveSpy = spyOn(this.gameComponent, 'cancelMove').and.callThrough();
        this.chooseMoveSpy = spyOn(this.gameComponent, 'chooseMove').and.callThrough();
        this.onLegalUserMoveSpy = spyOn(this.wrapper, 'onLegalUserMove').and.callThrough();
        this.canUserPlaySpy = spyOn(this.gameComponent, 'canUserPlay').and.callThrough();
    }
    public setupSlice(slice: GamePartSlice, previousSlice?: GamePartSlice, previousMove?: Move): void
    {
        if (previousSlice !== undefined) {
            this.gameComponent.rules.node =
                new MGPNode(new MGPNode(null, null, previousSlice, 0), previousMove, slice, 0);
        } else {
            this.gameComponent.rules.node = new MGPNode(null, previousMove || null, slice, 0);
        }
        this.gameComponent.updateBoard();
        this.fixture.detectChanges();
    }
    public getComponent(): T {
        return (this.gameComponent as unknown) as T;
    }
    public async expectClickSuccess(elementName: string): Promise<void> {
        const element: DebugElement = this.findElement(elementName);
        expect(element).toBeTruthy('Element "' + elementName + '" don\'t exists.');
        element.triggerEventHandler('click', null);
        await this.fixture.whenStable();
        this.fixture.detectChanges();
        expect(this.canUserPlaySpy).toHaveBeenCalledOnceWith(elementName);
        this.canUserPlaySpy.calls.reset();
        expect(this.cancelMoveSpy).not.toHaveBeenCalled();
        expect(this.chooseMoveSpy).not.toHaveBeenCalled();
        expect(this.onLegalUserMoveSpy).not.toHaveBeenCalled();
    }
    public async expectClickFailure(elementName: string, reason: string): Promise<void> {
        const element: DebugElement = this.findElement(elementName);
        expect(element).toBeTruthy('Element "' + elementName + '" don\'t exists.');
        if (element == null) {
            return;
        } else {
            element.triggerEventHandler('click', null);
            await this.fixture.whenStable();
            this.fixture.detectChanges();
            expect(this.canUserPlaySpy).toHaveBeenCalledOnceWith(elementName);
            this.canUserPlaySpy.calls.reset();
            expect(this.chooseMoveSpy).not.toHaveBeenCalled();
            expect(this.cancelMoveSpy).toHaveBeenCalledOnceWith(reason);
            this.cancelMoveSpy.calls.reset();
        }
    }
    public async expectClickForbidden(elementName: string): Promise<void> {
        const element: DebugElement = this.findElement(elementName);
        expect(element).toBeTruthy('Element "' + elementName + '" don\'t exists.');
        if (element == null) {
            return;
        } else {
            const clickValidity: MGPValidation = this.gameComponent.canUserPlay(elementName);
            expect(clickValidity.isSuccess()).toBeFalse();
            this.canUserPlaySpy.calls.reset();
            element.triggerEventHandler('click', null);
            await this.fixture.whenStable();
            this.fixture.detectChanges();
            expect(this.canUserPlaySpy).toHaveBeenCalledOnceWith(elementName);
            this.canUserPlaySpy.calls.reset();
            expect(this.chooseMoveSpy).not.toHaveBeenCalled();
            expect(this.cancelMoveSpy).toHaveBeenCalledOnceWith(clickValidity.reason);
        }
    }
    public async expectMoveSuccess(elementName: string,
                                   move: Move,
                                   slice?: GamePartSlice,
                                   scoreZero?: number,
                                   scoreOne?: number)
    : Promise<void>
    {
        const element: DebugElement = this.findElement(elementName);
        expect(element).toBeTruthy('Element "' + elementName + '" don\'t exists.');
        if (element == null) {
            return;
        } else {
            const moveSlice: GamePartSlice = slice || this.gameComponent.rules.node.gamePartSlice;
            element.triggerEventHandler('click', null);
            await this.fixture.whenStable();
            this.fixture.detectChanges();
            expect(this.canUserPlaySpy).toHaveBeenCalledOnceWith(elementName);
            this.canUserPlaySpy.calls.reset();
            expect(this.chooseMoveSpy).toHaveBeenCalledOnceWith(
                move, moveSlice, this.getScore(scoreZero), this.getScore(scoreOne));
            this.chooseMoveSpy.calls.reset();
            expect(this.onLegalUserMoveSpy).toHaveBeenCalledOnceWith(
                move, this.getScore(scoreZero), this.getScore(scoreOne));
            this.onLegalUserMoveSpy.calls.reset();
        }
    }
    private getScore(score?: number): number {
        if (score === undefined) {
            return null;
        } else {
            return score;
        }
    }
    public async expectMoveFailure(elementName: string,
                                   reason: string,
                                   move: Move,
                                   slice?: GamePartSlice,
                                   scoreZero?: number,
                                   scoreOne?: number)
    : Promise<void>
    {
        const element: DebugElement = this.findElement(elementName);
        expect(element).toBeTruthy('Element "' + elementName + '" don\'t exists.');
        if (element == null) {
            return;
        } else {
            const moveSlice: GamePartSlice = slice || this.gameComponent.rules.node.gamePartSlice;
            element.triggerEventHandler('click', null);
            await this.fixture.whenStable();
            this.fixture.detectChanges();
            expect(this.canUserPlaySpy).toHaveBeenCalledOnceWith(elementName);
            this.canUserPlaySpy.calls.reset();
            expect(this.chooseMoveSpy).toHaveBeenCalledOnceWith(
                move, moveSlice, this.getScore(scoreZero), this.getScore(scoreOne));
            this.chooseMoveSpy.calls.reset();
            expect(this.cancelMoveSpy).toHaveBeenCalledOnceWith(reason);
            this.cancelMoveSpy.calls.reset();
            expect(this.onLegalUserMoveSpy).not.toHaveBeenCalled();
        }
    }
    public async clickElement(elementName: string): Promise<boolean> {
        const element: DebugElement = this.findElement(elementName);
        if (element == null) {
            return null;
        } else {
            element.triggerEventHandler('click', null);
            await this.fixture.whenStable();
            this.fixture.detectChanges();
            return true;
        }
    }
    public expectElementNotToExist(elementName: string): void {
        const element: DebugElement = this.findElement(elementName);
        expect(element).toBeNull();
    }
    public expectElementToExist(elementName: string): DebugElement {
        const element: DebugElement = this.findElement(elementName);
        expect(element).toBeTruthy(elementName + ' was expected to exist');
        return element;
    }
    public expectElementToHaveClasses(elementName: string, classes: string[]): void {
        const classesSorted: string[] = [...classes].sort();
        const element: DebugElement = this.findElement(elementName);
        expect(element).toBeTruthy(elementName + ' was expected to exist');
        const elementClasses: string[] = element.children[0].attributes.class.split(' ').sort();
        expect(elementClasses).toEqual(classesSorted);
    }
    public findElement(elementName: string): DebugElement {
        return this.debugElement.query(By.css(elementName));
    }
}
