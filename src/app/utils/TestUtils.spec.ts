import { Component, CUSTOM_ELEMENTS_SCHEMA, DebugElement, Type } from '@angular/core';
import { ComponentFixture, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AbstractGameComponent } from '../components/game-components/abstract-game-component/AbstractGameComponent';
import { GamePartSlice } from '../jscaip/GamePartSlice';
import { LegalityStatus } from '../jscaip/LegalityStatus';
import { Move } from '../jscaip/Move';
import { MGPValidation } from './mgp-validation/MGPValidation';
import { RouterTestingModule } from '@angular/router/testing';
import { AppModule } from '../app.module';
import { ActivatedRoute } from '@angular/router';
import { JoueursDAO } from '../dao/joueurs/JoueursDAO';
import { AuthenticationService } from '../services/authentication/AuthenticationService';
import { MGPNode } from '../jscaip/mgp-node/MGPNode';
import { GameWrapper } from '../components/wrapper-components/GameWrapper';
import { Rules } from '../jscaip/Rules';
import { Player } from '../jscaip/player/Player';
import { NodeUnheritance } from '../jscaip/NodeUnheritance';
import { AuthenticationServiceMock } from '../services/authentication/AuthenticationService.spec';
import { OnlineGameWrapperComponent }
    from '../components/wrapper-components/online-game-wrapper/online-game-wrapper.component';
import { ChatDAO } from '../dao/chat/ChatDAO';
import { JoinerDAOMock } from '../dao/joiner/JoinerDAOMock.spec';
import { PartDAO } from '../dao/part/PartDAO';
import { JoinerDAO } from '../dao/joiner/JoinerDAO';
import { JoueursDAOMock } from '../dao/joueurs/JoueursDAOMock.spec';
import { ChatDAOMock } from '../dao/chat/ChatDAOMock.spec';
import { PartDAOMock } from '../dao/part/PartDAOMock.spec';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LocalGameWrapperComponent }
    from '../components/wrapper-components/local-game-wrapper/local-game-wrapper.component';

@Component({})
export class BlankComponent {}

export class ActivatedRouteStub {
    private route: {[key: string]: string} = {}
    public snapshot: { paramMap: { get: (str: string) => string } } = {
        paramMap: {
            get: (str: string) => {
                const value: string = this.route[str];
                if (value == null) {
                    throw new Error('ActivatedRouteStub: invalid route for ' + str + ', call setRoute before using!');
                }
                return value;

            },
        },
    };
    public constructor(compo?: string, id?: string) {
        if (compo != null) {
            this.setRoute('compo', compo);
        }
        if (id != null) {
            this.setRoute('id', id);
        }
    }
    public setRoute(key: string, value: string): void {
        this.route[key] = value;
    }
}

export class SimpleComponentTestUtils<T> {
    private fixture: ComponentFixture<T>;
    private component: T;
    public static async create<T>(componentType: Type<T>): Promise<SimpleComponentTestUtils<T>> {
        await TestBed.configureTestingModule({
            imports: [MatSnackBarModule, RouterTestingModule, ReactiveFormsModule],
            declarations: [componentType],
            schemas: [
                CUSTOM_ELEMENTS_SCHEMA,
            ],
            providers: [
                { provide: AuthenticationService, useClass: AuthenticationServiceMock },
                { provide: PartDAO, useClass: PartDAOMock },
                { provide: JoinerDAO, useClass: JoinerDAOMock },
                { provide: ChatDAO, useClass: ChatDAOMock },
            ],
        }).compileComponents();
        AuthenticationServiceMock.setUser(AuthenticationServiceMock.CONNECTED);
        const testUtils: SimpleComponentTestUtils<T> = new SimpleComponentTestUtils<T>();
        testUtils.fixture = TestBed.createComponent(componentType);
        testUtils.component = testUtils.fixture.componentInstance;
        return testUtils;
    }

    private constructor() {}
    public async clickElement(elementName: string): Promise<boolean> {
        const element: DebugElement = this.fixture.debugElement.query(By.css(elementName));
        if (element == null) {
            return null;
        } else {
            element.triggerEventHandler('click', null);
            await this.fixture.whenStable();
            this.fixture.detectChanges();
            return true;
        }
    }
    public getComponent(): T {
        return this.component;
    }
    public detectChanges(): void {
        this.fixture.detectChanges();
    }
    public findElement(elementName: string): DebugElement {
        return this.fixture.debugElement.query(By.css(elementName));
    }
}

type GameComponent = AbstractGameComponent<Move, GamePartSlice, LegalityStatus, NodeUnheritance>;

export class ComponentTestUtils<T extends GameComponent> {
    public fixture: ComponentFixture<GameWrapper>;
    public wrapper: GameWrapper;
    private debugElement: DebugElement;
    private gameComponent: GameComponent;

    private canUserPlaySpy: jasmine.Spy;
    private cancelMoveSpy: jasmine.Spy;
    private chooseMoveSpy: jasmine.Spy;
    private onLegalUserMoveSpy: jasmine.Spy;

    public static async forGame<T extends GameComponent>(game: string,
                                                         wrapperKind: Type<GameWrapper> = LocalGameWrapperComponent)
    : Promise<ComponentTestUtils<T>>
    {
        const testUtils: ComponentTestUtils<T> = await ComponentTestUtils.basic(game);
        AuthenticationServiceMock.setUser(AuthenticationService.NOT_CONNECTED);
        testUtils.prepareFixture(wrapperKind);
        testUtils.fixture.detectChanges();
        tick(1);
        testUtils.prepareSpies();
        return testUtils;
    }
    public static async basic<T extends GameComponent>(game: string): Promise<ComponentTestUtils<T>> {
        const activatedRouteStub: ActivatedRouteStub = new ActivatedRouteStub(game, 'joinerId');
        await TestBed.configureTestingModule({
            imports: [
                AppModule,
                RouterTestingModule.withRoutes([
                    { path: 'play', component: OnlineGameWrapperComponent },
                    { path: 'server', component: BlankComponent },
                ]),
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: ActivatedRoute, useValue: activatedRouteStub },
                { provide: JoueursDAO, useClass: JoueursDAOMock },
                { provide: AuthenticationService, useClass: AuthenticationServiceMock },
                { provide: ChatDAO, useClass: ChatDAOMock },
                { provide: JoinerDAO, useClass: JoinerDAOMock },
                { provide: PartDAO, useClass: PartDAOMock },
            ],
        }).compileComponents();
        return new ComponentTestUtils<T>(activatedRouteStub);
    }

    private constructor(private readonly activatedRouteStub: ActivatedRouteStub) {}

    public prepareFixture(wrapperKind: Type<GameWrapper>): void {
        this.fixture = TestBed.createComponent(wrapperKind);
        this.wrapper = this.fixture.debugElement.componentInstance;
        this.debugElement = this.fixture.debugElement;
    }
    public prepareSpies(): void {
        this.gameComponent = this.wrapper.gameComponent;
        this.cancelMoveSpy = spyOn(this.gameComponent, 'cancelMove').and.callThrough();
        this.chooseMoveSpy = spyOn(this.gameComponent, 'chooseMove').and.callThrough();
        this.onLegalUserMoveSpy = spyOn(this.wrapper, 'onLegalUserMove').and.callThrough();
        this.canUserPlaySpy = spyOn(this.gameComponent, 'canUserPlay').and.callThrough();
    }
    public detectChanges(): void {
        this.fixture.detectChanges();
    }
    public setRoute(id: string, value: string): void {
        this.activatedRouteStub.setRoute(id, value);
    }
    public setupSlice(slice: GamePartSlice, previousSlice?: GamePartSlice, previousMove?: Move): void {
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
        await this.expectInterfaceClickSuccess(elementName);
        expect(this.canUserPlaySpy).toHaveBeenCalledOnceWith(elementName);
        this.canUserPlaySpy.calls.reset();
    }
    public async expectInterfaceClickSuccess(elementName: string): Promise<void> {
        const element: DebugElement = this.findElement(elementName);
        expect(element).toBeTruthy('Element "' + elementName + '" don\'t exists.');
        element.triggerEventHandler('click', null);
        await this.fixture.whenStable();
        this.fixture.detectChanges();
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
    public querySelector(query: string): DebugElement {
        return this.debugElement.nativeElement.querySelector(query);
    }
}

export function expectFirstStateToBeBetterThanSecond(weakerState: GamePartSlice,
                                                     weakMove: Move,
                                                     strongerState: GamePartSlice,
                                                     strongMove: Move,
                                                     rules: Rules<Move,
                                                                   GamePartSlice,
                                                                   LegalityStatus,
                                                                   NodeUnheritance>)
                                                      : void
{
    const weakValue: number = rules.getBoardNumericValue(weakMove, weakerState);
    const strongValue: number = rules.getBoardNumericValue(strongMove, strongerState);
    expect(weakValue).toBeLessThan(strongValue);
}
export function expectStateToBePreVictory(state: GamePartSlice,
                                          previousMove: Move,
                                          player: Player,
                                          rules: Rules<Move, GamePartSlice, LegalityStatus, NodeUnheritance>)
                                          : void
{
    const value: number = rules.getBoardNumericValue(previousMove, state);
    const expectedValue: number = player.getPreVictory();
    expect(value).toBe(expectedValue);
}
