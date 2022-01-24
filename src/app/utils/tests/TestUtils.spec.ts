/* eslint-disable max-lines-per-function */
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, DebugElement, Type } from '@angular/core';
import { ComponentFixture, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { GameComponent } from '../../components/game-components/game-component/GameComponent';
import { GameState } from '../../jscaip/GameState';
import { Move } from '../../jscaip/Move';
import { MGPValidation } from '../MGPValidation';
import { AppModule } from '../../app.module';
import { UserDAO } from '../../dao/UserDAO';
import { AuthenticationService, AuthUser } from '../../services/AuthenticationService';
import { MGPNode } from '../../jscaip/MGPNode';
import { GameWrapper } from '../../components/wrapper-components/GameWrapper';
import { AuthenticationServiceMock } from '../../services/tests/AuthenticationService.spec';
import { OnlineGameWrapperComponent }
    from '../../components/wrapper-components/online-game-wrapper/online-game-wrapper.component';
import { ChatDAO } from '../../dao/ChatDAO';
import { JoinerDAOMock } from '../../dao/tests/JoinerDAOMock.spec';
import { PartDAO } from '../../dao/PartDAO';
import { JoinerDAO } from '../../dao/JoinerDAO';
import { UserDAOMock } from '../../dao/tests/UserDAOMock.spec';
import { ChatDAOMock } from '../../dao/tests/ChatDAOMock.spec';
import { PartDAOMock } from '../../dao/tests/PartDAOMock.spec';
import { LocalGameWrapperComponent }
    from '../../components/wrapper-components/local-game-wrapper/local-game-wrapper.component';
import { HumanDuration } from '../TimeUtils';
import { Rules } from 'src/app/jscaip/Rules';
import { Utils } from '../utils';
import { AutofocusDirective } from 'src/app/directives/autofocus.directive';
import { ToggleVisibilityDirective } from 'src/app/directives/toggle-visibility.directive';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AngularFireModule } from '@angular/fire';
import { USE_EMULATOR as USE_FIRESTORE_EMULATOR } from '@angular/fire/firestore';
import { USE_EMULATOR as USE_DATABASE_EMULATOR } from '@angular/fire/database';
import { USE_EMULATOR as USE_AUTH_EMULATOR } from '@angular/fire/auth';
import { USE_EMULATOR as USE_FUNCTIONS_EMULATOR } from '@angular/fire/functions';
import { environment } from 'src/environments/environment';
import { MGPOptional } from '../MGPOptional';

@Component({})
export class BlankComponent {}

export class ActivatedRouteStub {
    private route: {[key: string]: string} = {}
    public snapshot: { paramMap: { get: (str: string) => string } };
    public constructor(compo?: string, id?: string) {
        this.snapshot = {
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

    public static async create<T>(componentType: Type<T>, activatedRouteStub?: ActivatedRouteStub)
    : Promise<SimpleComponentTestUtils<T>>
    {
        await TestBed.configureTestingModule({
            imports: [
                RouterTestingModule.withRoutes([
                    { path: '**', component: BlankComponent },
                ]),
                FormsModule,
                ReactiveFormsModule,
                NoopAnimationsModule,
            ],
            declarations: [
                componentType,
                HumanDuration,
                AutofocusDirective,
                ToggleVisibilityDirective,
            ],
            schemas: [
                CUSTOM_ELEMENTS_SCHEMA,
            ],
            providers: [
                { provide: ActivatedRoute, useValue: activatedRouteStub },
                { provide: AuthenticationService, useClass: AuthenticationServiceMock },
                { provide: PartDAO, useClass: PartDAOMock },
                { provide: JoinerDAO, useClass: JoinerDAOMock },
                { provide: ChatDAO, useClass: ChatDAOMock },
                { provide: UserDAO, useClass: UserDAOMock },
            ],
        }).compileComponents();
        AuthenticationServiceMock.setUser(AuthenticationServiceMock.CONNECTED);
        const testUtils: SimpleComponentTestUtils<T> = new SimpleComponentTestUtils<T>();
        testUtils.fixture = TestBed.createComponent(componentType);
        testUtils.component = testUtils.fixture.componentInstance;
        return testUtils;
    }
    private constructor() {}

    public async clickElement(elementName: string): Promise<void> {
        const element: DebugElement = this.findElement(elementName);
        expect(element).withContext(elementName + ' should exist on the page').toBeTruthy();
        if (element == null) {
            return;
        }
        element.triggerEventHandler('click', null);
        await this.fixture.whenStable();
        this.detectChanges();
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
    public findElementByDirective(directive: Type<unknown>): DebugElement {
        return this.fixture.debugElement.query(By.directive(directive));
    }
    public destroy(): void {
        return this.fixture.destroy();
    }
    public async whenStable(): Promise<void> {
        return this.fixture.whenStable();
    }
    public expectElementToHaveClass(elementName: string, cssClass: string): void {
        const element: DebugElement = this.findElement(elementName);
        expect(element).withContext(elementName + ' should exist').toBeTruthy();
        expect(element.attributes.class).withContext(`${elementName} should have a class attribute`).not.toBeNull();
        const elementClasses: string[] = Utils.getNonNullable(element.attributes.class).split(' ').sort();
        expect(elementClasses).withContext(elementName + ' should contain class ' + cssClass).toContain(cssClass);
    }
    public expectElementNotToExist(elementName: string): void {
        const element: DebugElement = this.findElement(elementName);
        expect(element).withContext(elementName + ' should not exist').toBeNull();
    }
    public expectElementToExist(elementName: string): DebugElement {
        const element: DebugElement = this.findElement(elementName);
        expect(element).withContext(elementName + ' should exist').toBeTruthy();
        return element;
    }
    public fillInput(elementName: string, value: string): void {
        const element: DebugElement = this.findElement(elementName);
        expect(element).withContext(elementName + ' should exist in order to fill its value').toBeTruthy();
        element.nativeElement.value = value;
        element.nativeElement.dispatchEvent(new Event('input'));
    }
}
type MyGameComponent = GameComponent<Rules<Move, GameState, unknown>, Move, GameState, unknown>;

export class ComponentTestUtils<T extends MyGameComponent> {
    public fixture: ComponentFixture<GameWrapper>;
    public wrapper: GameWrapper;
    private debugElement: DebugElement;
    private gameComponent: MyGameComponent;

    private canUserPlaySpy: jasmine.Spy;
    private cancelMoveSpy: jasmine.Spy;
    private chooseMoveSpy: jasmine.Spy;
    private onLegalUserMoveSpy: jasmine.Spy;

    public static async forGame<T extends MyGameComponent>(game: string,
                                                           wrapperKind: Type<GameWrapper> = LocalGameWrapperComponent)
    : Promise<ComponentTestUtils<T>>
    {
        const testUtils: ComponentTestUtils<T> = await ComponentTestUtils.basic(game);
        AuthenticationServiceMock.setUser(AuthUser.NOT_CONNECTED);
        testUtils.prepareFixture(wrapperKind);
        testUtils.detectChanges();
        tick(1);
        testUtils.bindGameComponent();
        testUtils.prepareSpies();
        return testUtils;
    }
    public static async basic<T extends MyGameComponent>(game?: string): Promise<ComponentTestUtils<T>> {
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
                { provide: UserDAO, useClass: UserDAOMock },
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
    public bindGameComponent(): void {
        this.gameComponent = this.wrapper.gameComponent;
    }
    public prepareSpies(): void {
        this.cancelMoveSpy = spyOn(this.gameComponent, 'cancelMove').and.callThrough();
        this.chooseMoveSpy = spyOn(this.gameComponent, 'chooseMove').and.callThrough();
        this.onLegalUserMoveSpy = spyOn(this.wrapper, 'onLegalUserMove').and.callThrough();
        this.canUserPlaySpy = spyOn(this.gameComponent, 'canUserPlay').and.callThrough();
    }
    public expectToBeCreated(): void {
        expect(this.wrapper).withContext('Wrapper should be created').toBeTruthy();
        expect(this.getComponent()).withContext('Component should be created').toBeTruthy();
    }
    public detectChanges(): void {
        this.fixture.detectChanges();
    }
    public forceChangeDetection(): void {
        this.fixture.debugElement.injector.get<ChangeDetectorRef>(ChangeDetectorRef).markForCheck();
        this.detectChanges();
    }
    public setRoute(id: string, value: string): void {
        this.activatedRouteStub.setRoute(id, value);
    }
    public setupState(state: GameState,
                      previousState?: GameState,
                      previousMove?: Move)
    : void
    {
        this.gameComponent.rules.node = new MGPNode(
            state,
            MGPOptional.ofNullable(previousState).map((previousState: GameState) =>
                new MGPNode(previousState)),
            MGPOptional.ofNullable(previousMove),
        );
        this.gameComponent.updateBoard();
        this.forceChangeDetection();
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
        expect(element).withContext('Element "' + elementName + '" should exist').toBeTruthy();
        element.triggerEventHandler('click', null);
        await this.fixture.whenStable();
        this.fixture.detectChanges();
        expect(this.cancelMoveSpy).not.toHaveBeenCalled();
        expect(this.chooseMoveSpy).not.toHaveBeenCalled();
        expect(this.onLegalUserMoveSpy).not.toHaveBeenCalled();
    }
    public async expectClickFailure(elementName: string, reason: string): Promise<void> {
        const element: DebugElement = this.findElement(elementName);
        expect(element).withContext('Element "' + elementName + '" should exist').toBeTruthy();
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
            tick(3000); // needs to be >2999
        }
    }
    public async expectClickForbidden(elementName: string, reason: string): Promise<void> {
        const element: DebugElement = this.findElement(elementName);
        expect(element).withContext('Element "' + elementName + '" should exist').toBeTruthy();
        if (element == null) {
            return;
        } else {
            const clickValidity: MGPValidation = this.gameComponent.canUserPlay(elementName);
            expect(clickValidity.reason).toBe(reason);
            this.canUserPlaySpy.calls.reset();
            element.triggerEventHandler('click', null);
            await this.fixture.whenStable();
            this.fixture.detectChanges();
            expect(this.canUserPlaySpy).toHaveBeenCalledOnceWith(elementName);
            this.canUserPlaySpy.calls.reset();
            expect(this.chooseMoveSpy).not.toHaveBeenCalled();
            expect(this.cancelMoveSpy).toHaveBeenCalledOnceWith(clickValidity.reason);
            tick(3000); // needs to be > 2999
        }
    }
    public async expectMoveSuccess(elementName: string,
                                   move: Move,
                                   state?: GameState,
                                   scores?: readonly [number, number])
    : Promise<void>
    {
        const element: DebugElement = this.findElement(elementName);
        expect(element).withContext('Element "' + elementName + '" should exist').toBeTruthy();
        if (element == null) {
            return;
        } else {
            const moveState: GameState = state || this.gameComponent.rules.node.gameState;
            element.triggerEventHandler('click', null);
            await this.fixture.whenStable();
            this.fixture.detectChanges();
            expect(this.canUserPlaySpy).toHaveBeenCalledOnceWith(elementName);
            this.canUserPlaySpy.calls.reset();
            if (scores) {
                expect(this.chooseMoveSpy).toHaveBeenCalledOnceWith(move, moveState, scores);
            } else {
                expect(this.chooseMoveSpy).toHaveBeenCalledOnceWith(move, moveState);
            }
            this.chooseMoveSpy.calls.reset();
            expect(this.onLegalUserMoveSpy).toHaveBeenCalledOnceWith(move, scores);
            this.onLegalUserMoveSpy.calls.reset();
        }
    }
    public async expectMoveFailure(elementName: string,
                                   reason: string,
                                   move: Move,
                                   state?: GameState,
                                   scores?: readonly [number, number])
    : Promise<void>
    {
        const element: DebugElement = this.findElement(elementName);
        expect(element).withContext('Element "' + elementName + '" should exist').toBeTruthy();
        if (element == null) {
            return;
        } else {
            const moveState: GameState = state || this.gameComponent.rules.node.gameState;
            element.triggerEventHandler('click', null);
            await this.fixture.whenStable();
            this.fixture.detectChanges();
            expect(this.canUserPlaySpy).toHaveBeenCalledOnceWith(elementName);
            this.canUserPlaySpy.calls.reset();
            if (scores) {
                expect(this.chooseMoveSpy).toHaveBeenCalledOnceWith(move, moveState, scores);
            } else {
                expect(this.chooseMoveSpy).toHaveBeenCalledOnceWith(move, moveState);
            }
            this.chooseMoveSpy.calls.reset();
            expect(this.cancelMoveSpy).toHaveBeenCalledOnceWith(reason);
            this.cancelMoveSpy.calls.reset();
            expect(this.onLegalUserMoveSpy).not.toHaveBeenCalled();
            tick(3000); // needs to be >2999
        }
    }
    public expectPassToBeForbidden(): void {
        this.expectElementNotToExist('#passButton');
    }
    public async expectPassSuccess(move: Move, scores?: readonly [number, number]): Promise<void> {
        const passButton: DebugElement = this.findElement('#passButton');
        expect(passButton).withContext('Pass button is expected to be shown, but it is not').toBeTruthy();
        if (passButton == null) {
            return;
        } else {
            const state: GameState = this.gameComponent.rules.node.gameState;
            passButton.triggerEventHandler('click', null);
            await this.fixture.whenStable();
            this.fixture.detectChanges();
            if (scores) {
                expect(this.chooseMoveSpy).toHaveBeenCalledOnceWith(move, state, scores);
            } else {
                expect(this.chooseMoveSpy).toHaveBeenCalledOnceWith(move, state);
            }
            this.chooseMoveSpy.calls.reset();
            expect(this.onLegalUserMoveSpy).toHaveBeenCalledOnceWith(move, scores);
            this.onLegalUserMoveSpy.calls.reset();
        }
    }
    public async clickElement(elementName: string): Promise<void> {
        const element: DebugElement = this.findElement(elementName);
        expect(element).withContext(elementName + ' should exist on the page').toBeTruthy();
        if (element == null) {
            return;
        }
        element.triggerEventHandler('click', null);
        await this.fixture.whenStable();
        this.detectChanges();
    }
    public expectElementNotToExist(elementName: string): void {
        const element: DebugElement = this.findElement(elementName);
        expect(element).withContext(elementName + ' should not exist').toBeNull();
    }
    public expectElementToExist(elementName: string): DebugElement {
        const element: DebugElement = this.findElement(elementName);
        expect(element).withContext(elementName + ' should exist').toBeTruthy();
        return element;
    }
    public expectElementToHaveClass(elementName: string, cssClass: string): void {
        const element: DebugElement = this.findElement(elementName);
        expect(element).withContext(elementName + ' should exist').toBeTruthy();
        const classAttribute: string = Utils.getNonNullable(element.attributes.class);
        expect(classAttribute).withContext(elementName + ' should have a class attribute').toBeTruthy();
        const elementClasses: string[] = Utils.getNonNullable(classAttribute).split(' ').sort();
        expect(elementClasses).withContext(elementName + ' should contain ' + cssClass).toContain(cssClass);
    }
    public expectElementNotToHaveClass(elementName: string, cssClass: string): void {
        const element: DebugElement = this.findElement(elementName);
        expect(element).withContext(elementName + ' should exist').toBeTruthy();
        expect(element.attributes.class).withContext(`${elementName} should have a class attribute`).not.toBeNull();
        const elementClasses: string[] = Utils.getNonNullable(element.attributes.class).split(' ').sort();
        expect(elementClasses).withContext(elementName + ' should not contain ' + cssClass).not.toContain(cssClass);
    }
    public expectElementToHaveClasses(elementName: string, classes: string[]): void {
        const classesSorted: string[] = [...classes].sort();
        const element: DebugElement = this.findElement(elementName);
        expect(element).withContext(elementName + ' should exist').toBeTruthy();
        expect(element.attributes.class).withContext(`${elementName} should have a class attribute`).toBeTruthy();
        const elementClasses: string[] = Utils.getNonNullable(element.attributes.class).split(' ').sort();
        expect(elementClasses).toEqual(classesSorted);
    }
    public findElement(elementName: string): DebugElement {
        return this.debugElement.query(By.css(elementName));
    }
    public querySelector(query: string): DebugElement {
        return this.debugElement.nativeElement.querySelector(query);
    }
}

export class TestUtils {

    public static expectValidationSuccess(validation: MGPValidation, context?: string): void {
        const reason: string = validation.getReason();
        expect(validation.isSuccess()).withContext(context + ': ' + reason).toBeTrue();
    }
}

export async function setupEmulators(): Promise<unknown> {
    await TestBed.configureTestingModule({
        imports: [
            AngularFirestoreModule,
            HttpClientModule,
            AngularFireModule.initializeApp(environment.firebaseConfig),
        ],
        providers: [
            { provide: USE_AUTH_EMULATOR, useValue: environment.emulatorConfig.auth },
            { provide: USE_DATABASE_EMULATOR, useValue: environment.emulatorConfig.database },
            { provide: USE_FIRESTORE_EMULATOR, useValue: environment.emulatorConfig.firestore },
            { provide: USE_FUNCTIONS_EMULATOR, useValue: environment.emulatorConfig.functions },
            AuthenticationService,
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
    const http: HttpClient = TestBed.inject(HttpClient);
    // Clear the firestore data before each test
    await http.delete('http://localhost:8080/emulator/v1/projects/my-project/databases/(default)/documents').toPromise();
    // Clear the auth data before each test
    await http.delete('http://localhost:9099/emulator/v1/projects/my-project/accounts').toPromise();
    return;
}
