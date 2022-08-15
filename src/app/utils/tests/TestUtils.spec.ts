/* eslint-disable max-lines-per-function */
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, DebugElement, Type } from '@angular/core';
import { ComponentFixture, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { GameState } from '../../jscaip/GameState';
import { Move } from '../../jscaip/Move';
import { MGPValidation } from '../MGPValidation';
import { AppModule, FirebaseProviders } from '../../app.module';
import { UserDAO } from '../../dao/UserDAO';
import { ConnectedUserService, AuthUser } from '../../services/ConnectedUserService';
import { MGPNode } from '../../jscaip/MGPNode';
import { GameWrapper } from '../../components/wrapper-components/GameWrapper';
import { ConnectedUserServiceMock } from '../../services/tests/ConnectedUserService.spec';
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
import { Utils } from '../utils';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MGPOptional } from '../MGPOptional';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { ErrorLoggerServiceMock } from 'src/app/services/tests/ErrorLoggerServiceMock.spec';
import { AbstractGameComponent } from 'src/app/components/game-components/game-component/GameComponent';
import { findMatchingRoute } from 'src/app/app.module.spec';
import * as Firestore from '@angular/fire/firestore';
import * as Auth from '@angular/fire/auth';
import { HumanDurationPipe } from 'src/app/pipes-and-directives/human-duration.pipe';
import { AutofocusDirective } from 'src/app/pipes-and-directives/autofocus.directive';
import { ToggleVisibilityDirective } from 'src/app/pipes-and-directives/toggle-visibility.directive';
import { FirestoreTimePipe } from 'src/app/pipes-and-directives/firestore-time.pipe';
import { UserMocks } from 'src/app/domain/UserMocks.spec';

@Component({})
export class BlankComponent {}

export class ActivatedRouteStub {
    private route: {[key: string]: string} = {};
    public snapshot: { paramMap: { get: (str: string) => string } };
    public constructor(compo?: string, id?: string) {
        this.snapshot = {
            paramMap: {
                get: (str: string) => {
                    // Returns null in case the route does not exist.
                    // This is the same behaviour than ActivatedRoute
                    return this.route[str];
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
                FirestoreTimePipe,
                HumanDurationPipe,
                AutofocusDirective,
                ToggleVisibilityDirective,
            ],
            schemas: [
                CUSTOM_ELEMENTS_SCHEMA,
            ],
            providers: [
                { provide: ActivatedRoute, useValue: activatedRouteStub },
                { provide: PartDAO, useClass: PartDAOMock },
                { provide: JoinerDAO, useClass: JoinerDAOMock },
                { provide: ChatDAO, useClass: ChatDAOMock },
                { provide: UserDAO, useClass: UserDAOMock },
                { provide: ConnectedUserService, useClass: ConnectedUserServiceMock },
                { provide: ErrorLoggerService, useClass: ErrorLoggerServiceMock },
            ],
        }).compileComponents();
        ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
        const testUtils: SimpleComponentTestUtils<T> = new SimpleComponentTestUtils<T>();
        testUtils.fixture = TestBed.createComponent(componentType);
        testUtils.component = testUtils.fixture.componentInstance;
        return testUtils;
    }
    private constructor() {}

    public async clickElement(elementName: string, awaitStability: boolean = true): Promise<void> {
        const element: DebugElement = this.findElement(elementName);
        expect(element).withContext(elementName + ' should exist on the page').toBeTruthy();
        if (element == null) {
            return;
        }
        element.triggerEventHandler('click', null);
        if (awaitStability) {
            await this.fixture.whenStable();
        }
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
        expect(element.attributes.class).withContext(`${elementName} should have a class attribute`).toBeTruthy();
        if (element.attributes.class != null && element.attributes.class !== '') {
            const elementClasses: string[] = element.attributes.class.split(' ').sort();
            expect(elementClasses).withContext(elementName + ' should contain class ' + cssClass).toContain(cssClass);
        }
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

export class ComponentTestUtils<T extends AbstractGameComponent> {
    public fixture: ComponentFixture<GameWrapper>;
    public wrapper: GameWrapper;
    private debugElement: DebugElement;
    private gameComponent: AbstractGameComponent;

    private canUserPlaySpy: jasmine.Spy;
    private cancelMoveSpy: jasmine.Spy;
    private chooseMoveSpy: jasmine.Spy;
    private onLegalUserMoveSpy: jasmine.Spy;

    public static async forGame<T extends AbstractGameComponent>(
        game: string,
        wrapperKind: Type<GameWrapper> = LocalGameWrapperComponent,
        configureTestModule: boolean = true)
    : Promise<ComponentTestUtils<T>>
    {
        const testUtils: ComponentTestUtils<T> = await ComponentTestUtils.basic(game, configureTestModule);
        ConnectedUserServiceMock.setUser(AuthUser.NOT_CONNECTED);
        testUtils.prepareFixture(wrapperKind);
        testUtils.detectChanges();
        tick(1);
        testUtils.bindGameComponent();
        testUtils.prepareSpies();
        return testUtils;
    }
    public static async basic<T extends AbstractGameComponent>(game?: string, configureTestModule: boolean = true)
    : Promise<ComponentTestUtils<T>>
    {
        const activatedRouteStub: ActivatedRouteStub = new ActivatedRouteStub(game, 'joinerId');
        if (configureTestModule) {
            await ComponentTestUtils.configureTestModule(activatedRouteStub);
        }
        return new ComponentTestUtils<T>(activatedRouteStub);
    }
    public static async configureTestModule(activatedRouteStub: ActivatedRouteStub): Promise<void> {
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
                { provide: ConnectedUserService, useClass: ConnectedUserServiceMock },
                { provide: ChatDAO, useClass: ChatDAOMock },
                { provide: JoinerDAO, useClass: JoinerDAOMock },
                { provide: PartDAO, useClass: PartDAOMock },
                { provide: ErrorLoggerService, useClass: ErrorLoggerServiceMock },
            ],
        }).compileComponents();
    }

    public constructor(private readonly activatedRouteStub: ActivatedRouteStub) {}

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
            const moveState: GameState = state ?? this.gameComponent.rules.node.gameState;
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
            const moveState: GameState = state ?? this.gameComponent.rules.node.gameState;
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
        if (element.attributes.class == null) {
            expect(false).withContext(elementName + ' should have class atrribute').toBeTrue();
        } else {
            const classAttribute: string = element.attributes.class;
            expect(classAttribute).withContext(elementName + ' should have a class attribute').toBeTruthy();
            const elementClasses: string[] = Utils.getNonNullable(classAttribute).split(' ').sort();
            expect(elementClasses).withContext(elementName + ' should contain ' + cssClass).toContain(cssClass);
        }
    }
    public expectElementNotToHaveClass(elementName: string, cssClass: string): void {
        const element: DebugElement = this.findElement(elementName);
        expect(element).withContext(elementName + ' should exist').toBeTruthy();
        if (element.attributes.class == null) {
            throw new Error(`${elementName} should have a class attribute`);
        } else {
            const elementClasses: string[] = element.attributes.class.split(' ').sort();
            expect(elementClasses).withContext(elementName + ' should not contain ' + cssClass).not.toContain(cssClass);
        }
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
            HttpClientModule,
            FirebaseProviders.app(),
            FirebaseProviders.firestore(),
            FirebaseProviders.auth(),
            FirebaseProviders.database(),
        ],
        providers: [
            ConnectedUserService,
        ],
    }).compileComponents();
    TestBed.inject(Firestore.Firestore);
    TestBed.inject(Auth.Auth);
    const http: HttpClient = TestBed.inject(HttpClient);
    // Clear the content of the firestore database in the emulator
    await http.delete('http://localhost:8080/emulator/v1/projects/my-project/databases/(default)/documents').toPromise();
    // Clear the auth data in the emulator before each test
    await http.delete('http://localhost:9099/emulator/v1/projects/my-project/accounts').toPromise();
    return;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getComponentClassName(component: Type<any>): string {
    // We need to match their string representations, as it is the only way to get the name from a Type<any>
    const matches: RegExpMatchArray | null = component.toString().match(/class ([a-zA-Z0-9]+)/);
    expect(matches).withContext(`getComponentClassName should find a match in the component string representation: ${component.toString().substring(0, 40)})`).not.toBeNull();
    return Utils.getNonNullable(matches)[1];
}

/**
 * Tests that we routes are used as expected. The router.navigate method should
 * be spyed on. This function will match the route that is navigated to with
 * the declared routes of the application, and ensure that the component that is
 * routed to matches `component`. In case multiple router.navigate calls happen,
 * set otherRoutes to true.
 */
export function expectValidRouting(router: Router,
                                   path: string[],
                                   component: Type<any>, // eslint-disable-line @typescript-eslint/no-explicit-any
                                   options?: { otherRoutes?: boolean, skipLocationChange?: boolean})
: void
{
    expect(path[0][0]).withContext('Routings should start with /').toBe('/');
    for (const pathPart of path) {
        expect(pathPart[pathPart.length-1]).withContext('Routing should not include superfluous / at the end').not.toBe('/');
    }
    const fullPath: string = path.join('/');
    const matchingRoute: MGPOptional<Route> = findMatchingRoute(fullPath);
    expect(matchingRoute.isPresent()).withContext(`Expected route to be present for path: ${path}`).toBeTrue();
    const routedToComponent: string = getComponentClassName(Utils.getNonNullable(matchingRoute.get().component));
    const expectedComponent: string = getComponentClassName(component);
    expect(routedToComponent).withContext('It should route to the expected component').toEqual(expectedComponent);
    const otherRoutes: boolean = options != null && options.otherRoutes != null && options.otherRoutes;
    const skipLocationChange: boolean =
        options != null && options.skipLocationChange != null && options.skipLocationChange;
    if (otherRoutes) {
        if (skipLocationChange) {
            expect(router.navigate).toHaveBeenCalledWith(path, { skipLocationChange: true });
        } else {
            expect(router.navigate).toHaveBeenCalledWith(path);
        }
    } else {
        if (skipLocationChange) {
            expect(router.navigate).toHaveBeenCalledOnceWith(path, { skipLocationChange: true });
        } else {
            expect(router.navigate).toHaveBeenCalledOnceWith(path);
        }
    }
}

/**
 * Similar to expectValidRouting, but for checking HTML elements that provide a routerLink.
 */
export function expectValidRoutingLink(element: DebugElement, fullPath: string, component: Type<unknown>): void {
    expect(fullPath[0]).withContext('Routings should start with /').toBe('/');

    expect(element.attributes.routerLink).withContext('Routing links should have a routerLink').toBeDefined();
    expect(element.attributes.routerLink).toEqual(fullPath);
    const matchingRoute: MGPOptional<Route> = findMatchingRoute(fullPath);
    expect(matchingRoute.isPresent()).withContext(`Expected route to be present for path: ${fullPath}`).toBeTrue();
    const routedToComponent: string = getComponentClassName(Utils.getNonNullable(matchingRoute.get().component));
    const expectedComponent: string = getComponentClassName(component);
    expect(routedToComponent).withContext('It should route to the expected component').toEqual(expectedComponent);
}
