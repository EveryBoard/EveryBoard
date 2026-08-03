/* eslint-disable max-lines-per-function */
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, DebugElement, importProvidersFrom, Type } from '@angular/core';
import { ComponentFixture, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule, By } from '@angular/platform-browser';
import { ActivatedRoute, NavigationExtras, provideRouter, Route, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FirebaseError } from 'firebase/app';
import { firstValueFrom, Subscription } from 'rxjs';

import { Comparable, MGPFallible, MGPOptional, MGPValidation, Utils } from '@everyboard/lib';

import { TestVars } from '../../../TestVars.spec';
import { initializeFirebase, routes } from '../../app.routes';
import { findMatchingRoute } from '../../app.routes.spec';
import { AbstractGameComponent } from '../../components/game-components/game-component/GameComponent';
import { GameInfo } from '../../components/normal-component/pick-game/pick-game.component';
import { GameWrapper } from '../../components/wrapper-components/GameWrapper';
import { LocalGameWrapperComponent } from '../../components/wrapper-components/local-game-wrapper/local-game-wrapper.component';
import { OGWCRequestManagerService } from '../../components/wrapper-components/online-game-wrapper/OGWCRequestManagerService';
import { OGWCTimeManagerService } from '../../components/wrapper-components/online-game-wrapper/OGWCTimeManagerService';
import { UserDAO } from '../../dao/UserDAO';
import { UserDAOMock } from '../../dao/tests/UserDAOMock.spec';
import { UserMocks } from '../../domain/UserMocks.spec';
import { AIDepthLimitOptions, AIOptions } from '../../jscaip/AI/AI';
import { MinimaxConfig } from '../../jscaip/AI/AIConfig';
import { createMinimaxFromConfig } from '../../jscaip/AI/AIConfigUtils';
import { GameNode, GameNodeStats } from '../../jscaip/AI/GameNode';
import { Minimax } from '../../jscaip/AI/Minimax';
import { Move } from '../../jscaip/Move';
import { Player } from '../../jscaip/Player';
import { SuperRules } from '../../jscaip/Rules';
import { ConfigDescriptionType, RulesConfig } from '../../jscaip/RulesConfigUtil';
import { GameState } from '../../jscaip/state/GameState';
import { ActiveConfigRoomsService } from '../../services/ActiveConfigRoomsService';
import { BackendService } from '../../services/BackendService';
import { ChatService } from '../../services/ChatService';
import { ConfigRoomService } from '../../services/ConfigRoomService';
import { ConnectedUserService, AuthUser } from '../../services/ConnectedUserService';
import { CurrentGameService } from '../../services/CurrentGameService';
import { ErrorLoggerService } from '../../services/ErrorLoggerService';
import { GameService } from '../../services/GameService';
import { MessageDisplayer } from '../../services/MessageDisplayer';
import { ActiveConfigRoomsServiceMock } from '../../services/tests/ActiveConfigRoomServiceMock.spec';
import { BackendServiceMock } from '../../services/tests/BackendServiceMock.spec';
import { ChatServiceMock } from '../../services/tests/ChatServiceMock.spec';
import { ConfigRoomServiceMock } from '../../services/tests/ConfigRoomServiceMock.spec';
import { ConnectedUserServiceMock } from '../../services/tests/ConnectedUserService.spec';
import { CurrentGameServiceMock } from '../../services/tests/CurrentGameServiceMock.spec';
import { ErrorLoggerServiceMock } from '../../services/tests/ErrorLoggerServiceMock.spec';
import { GameServiceMock } from '../../services/tests/GameServiceMock.spec';

@Component({
    template: '',
})
export class BlankComponent {}

export class ActivatedRouteStub {

    private route: {[key: string]: string} = {};
    private params: {[key: string]: string} = {};

    public snapshot: {
        paramMap: { get: (str: string) => string },
        queryParamMap: { get: (str: string) => string, keys: string[] },
    };
    public constructor(game?: string, id?: string) {
        this.snapshot = {
            paramMap: {
                get: (name: string): string => {
                    // Returns null in case the route does not exist.
                    // This is the same behavior than ActivatedRoute
                    return this.route[name];
                },
            },
            queryParamMap: {
                keys: [],
                get: (name: string): string => this.params[name],
            },
        };
        if (game != null) {
            this.setRoute('game', game);
        }
        if (id != null) {
            this.setRoute('id', id);
        }
    }
    public setRoute(key: string, value: string): void {
        this.route[key] = value;
    }
    public setParam(key: string, value: string): void {
        this.params[key] = value;
        this.snapshot.queryParamMap.keys.push(key);
    }
}
export class SimpleComponentTestUtils<T> {

    protected fixture: ComponentFixture<T>;
    protected component: T;

    private infoMessageSpy: jasmine.Spy;
    private criticalMessageSpy: jasmine.Spy;
    protected gameMessageSpy: jasmine.Spy;

    public static async create<U>(componentType: Type<U>,
                                  activatedRouteStub?: ActivatedRouteStub,
                                  configureTestModule: boolean = true)
    : Promise<SimpleComponentTestUtils<U>>
    {
        if (configureTestModule) {
            await ConfigureTestingModuleUtils.configureTestingModule(activatedRouteStub);
        }
        ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
        const testUtils: SimpleComponentTestUtils<U> = new SimpleComponentTestUtils<U>();
        testUtils.prepareFixture(componentType);
        testUtils.prepareMessageDisplayerSpies();
        return testUtils;
    }

    protected constructor() {}

    public prepareFixture(componentType: Type<T>): void {
        this.fixture = TestBed.createComponent(componentType);
        this.component = this.fixture.debugElement.componentInstance;
    }

    public getComponent(): T {
        return this.component;
    }

    public detectChanges(): void {
        this.fixture.detectChanges();
    }

    public destroy(): void {
        return this.fixture.destroy();
    }

    public prepareMessageDisplayerSpies(): void {
        const messageDisplayer: MessageDisplayer = TestBed.inject(MessageDisplayer);
        if (jasmine.isSpy(messageDisplayer.gameMessage)) {
            this.gameMessageSpy = messageDisplayer.gameMessage as jasmine.Spy;
        } else {
            this.gameMessageSpy = spyOn(messageDisplayer, 'gameMessage').and.callFake(this.failOn('gameMessage'));
        }
        if (jasmine.isSpy(messageDisplayer.criticalMessage)) {
            this.criticalMessageSpy = messageDisplayer.criticalMessage as jasmine.Spy;
        } else {
            this.criticalMessageSpy = spyOn(messageDisplayer, 'criticalMessage').and.callFake(this.failOn('criticalMessage'));
        }
        if (jasmine.isSpy(messageDisplayer.infoMessage)) {
            this.infoMessageSpy = messageDisplayer.infoMessage as jasmine.Spy;
        } else {
            this.infoMessageSpy = spyOn(messageDisplayer, 'infoMessage').and.callFake(this.failOn('infoMessage'));
        }
    }

    private failOn(typeOfMessage: string): (message: string) => void {
        return (message: string) => {
            fail(`MessageDisplayer: ${typeOfMessage} was called with '${message}' but no toast was expected, use expectToDisplay!`);
        };
    }

    public async expectToDisplayGameMessage<U>(message: string, fn: () => Promise<U>): Promise<U> {
        this.gameMessageSpy.and.returnValue(undefined);
        const result: U = await fn();
        expect(this.gameMessageSpy).toHaveBeenCalledOnceWith(message);
        this.gameMessageSpy.calls.reset();
        this.gameMessageSpy.and.callFake(this.failOn('gameMessage')); // Restore previous spy behavior
        return result;
    }

    public async expectToDisplayCriticalMessage<U>(message: string, fn: () => Promise<U>): Promise<U> {
        this.criticalMessageSpy.and.returnValue(undefined);
        const result: U = await fn();
        expect(this.criticalMessageSpy).toHaveBeenCalledOnceWith(message);
        this.criticalMessageSpy.calls.reset();
        this.criticalMessageSpy.and.callFake(this.failOn('criticalMessage')); // Restore previous spy behavior
        return result;
    }

    public async expectToDisplayInfoMessage<U>(message: string, fn: () => Promise<U>): Promise<U> {
        this.infoMessageSpy.and.returnValue(undefined);
        const result: U = await fn();
        expect(this.infoMessageSpy).toHaveBeenCalledOnceWith(message);
        this.infoMessageSpy.calls.reset();
        this.infoMessageSpy.and.callFake(this.failOn('infoMessage')); // Restore previous spy behavior
        return result;
    }

    public async clickElement(elementName: string, waitInMs?: number): Promise<void> {
        const element: DebugElement = this.findElement(elementName);
        element.triggerEventHandler('click', null);
        tick(0);
        if (waitInMs !== undefined) {
            tick(waitInMs);
        }
        this.detectChanges();
    }

    public forceChangeDetection(): void {
        this.fixture.debugElement.injector.get<ChangeDetectorRef>(ChangeDetectorRef).markForCheck();
        this.detectChanges();
    }

    // Find a unique element given a CSS selector
    public findElement(elementName: string): DebugElement {
        this.forceChangeDetection();
        const elements: DebugElement[] = this.fixture.debugElement.queryAll(By.css(elementName));
        if (['.', '#'].includes(elementName[0])) {
            expect(elements.length)
                .withContext(`element should exist but does not: ${elementName}`)
                .toBeGreaterThan(0);
        } else {
            expect(elements.length)
                .withContext(`element should exist but does not: ${elementName}. Note, it does neither start by '#' nor by '.'`)
                .toBeGreaterThan(0);
        }
        expect(elements.length)
            .withContext(`findElement with id as argument expects a unique result, but got ${elements.length} results instead for element '${elementName}'`)
            .toBe(1);
        return elements[0];
    }

    public findElements(elementName: string): DebugElement[] {
        return this.fixture.debugElement.queryAll(By.css(elementName));
    }

    public findElementByDirective(directive: Type<unknown>): DebugElement {
        const element: DebugElement = this.fixture.debugElement.query(By.directive(directive));
        expect(element)
            .withContext(`element with directive '${directive}' should exist`)
            .not.toBeNull();
        return element;
    }

    public expectElementToHaveClass(elementId: string, cssClass: string): void {
        const element: DebugElement = this.findElement(elementId);
        expect(element.attributes.class).withContext(`${elementId} should have a class attribute`).toBeTruthy();
        expect(element.attributes.class).withContext(`${elementId} should have a class attribute`).not.toEqual('');
        if (element.attributes.class != null && element.attributes.class !== '') {
            const elementClasses: string[] = element.attributes.class.split(' ').sort();
            expect(elementClasses).withContext(`${elementId} should contain CSS class ${cssClass}`).toContain(cssClass);
        }
    }

    public expectElementsToHaveClass(selector: string, cssClass: string): void {
        const elements: DebugElement[] = this.fixture.debugElement.queryAll(By.css(selector));
        expect(elements.length)
            .withContext('expectElementsToHaveClass expects to check multiple elements')
            .toBeGreaterThan(1);
        for (const element of elements) {
            expect(element.attributes.class).withContext(`${selector} should have a class attribute`).toBeTruthy();
            expect(element.attributes.class).withContext(`${selector} should have a class attribute`).not.toEqual('');
            if (element.attributes.class != null && element.attributes.class !== '') {
                const elementClasses: string[] = element.attributes.class.split(' ').sort();
                expect(elementClasses).withContext(`${selector} should contain CSS class ${cssClass}`).toContain(cssClass);
            }
        }
    }

    public expectElementNotToHaveClass(elementName: string, cssClass: string): void {
        const element: DebugElement = this.findElement(elementName);
        if (element.attributes.class != null) {
            const elementClasses: string[] = element.attributes.class.split(' ').sort();
            expect(elementClasses).withContext(`${elementName} should not contain CSS class ${cssClass}`).not.toContain(cssClass);
        }
    }

    public expectElementToHaveClasses(elementName: string, classes: string[]): void {
        const classesSorted: string[] = [...classes].sort();
        const element: DebugElement = this.findElement(elementName);
        expect(element).withContext(`${elementName} should exist`).toBeTruthy();
        expect(element.attributes.class).withContext(`${elementName} should have a class attribute`).toBeTruthy();
        const elementClasses: string[] = Utils.getNonNullable(element.attributes.class).split(' ').sort();
        expect(elementClasses).withContext(`For ${elementName}`).toEqual(classesSorted);
    }

    public expectElementNotToExist(elementName: string): void {
        this.forceChangeDetection();
        const isValidElementName: boolean =
            elementName.startsWith('#') || elementName.startsWith('.') || elementName.startsWith('app-');
        expect(isValidElementName).withContext(`${elementName} should be an HTML element name (id, class, or app-)`).toBeTrue();
        const element: DebugElement | null = this.fixture.debugElement.query(By.css(elementName));
        expect(element).withContext(`${elementName} should not exist`).toBeNull();
    }

    public expectElementToExist(elementName: string): void {
        this.findElement(elementName); // findElement asserts that it should exist (and be unique)
    }

    public expectElementToBeEnabled(elementName: string): void {
        const element: DebugElement = this.findElement(elementName);
        expect(element.nativeElement.disabled).withContext(`${elementName} should be enabled`).toBeFalsy();
    }

    public expectDropdownOptionToBeSelected(dropdownId: string, optionValue: string): void {
        this.expectElementToExist(dropdownId);
        const dropdown: DebugElement = this.findElement(dropdownId);
        expect(dropdown.nativeElement.value)
            .withContext(`${dropdownId} should have value ${optionValue}`)
            .toBe(optionValue);
    }

    public expectDropdownOptionNotToBeSelected(dropdownId: string, optionValue: string): void {
        this.expectElementToExist(dropdownId);
        const dropdown: DebugElement = this.findElement(dropdownId);
        expect(dropdown.nativeElement.value)
            .withContext(`${dropdownId} should not have value ${optionValue}`)
            .not.toEqual(optionValue);
    }

    public expectElementToBeDisabled(elementName: string): void {
        const element: DebugElement = this.findElement(elementName);
        expect(element.nativeElement.disabled).withContext(`${elementName} should be disabled`).toBeTruthy();
    }

    public expectTextToBe(elementName: string, expectedText: string): void {
        const element: DebugElement = this.findElement(elementName);
        expect(element.nativeNode.innerHTML).toEqual(expectedText);
    }

    public fillInput(elementName: string, value: string): void {
        const element: DebugElement = this.findElement(elementName);
        element.nativeElement.value = value;
        element.nativeElement.dispatchEvent(new Event('input'));
    }

    public selectChildElementOfDropDown(dropDownName: string, childName: string): void {
        const selectedDropDown: HTMLSelectElement = this.findElement(dropDownName).nativeElement;
        expect(selectedDropDown)
            .withContext(`dropDown ${dropDownName} does not exist`)
            .toBeDefined();
        expect(selectedDropDown.options[childName])
            .withContext(`option ${childName} of dropdown ${dropDownName} does not exist (keys are: ${Object.keys(selectedDropDown.options)})`)
            .toBeDefined();
        selectedDropDown.value = selectedDropDown.options[childName].value;
        selectedDropDown.dispatchEvent(new Event('change'));
        this.detectChanges();
        tick();
    }

    public chooseConfig(configName: string): void {
        const selectAI: HTMLSelectElement = this.findElement('#ruleSelect').nativeElement;
        const option: HTMLOptionElement | undefined = Array.from(selectAI.options)
            .find((opt: HTMLOptionElement) => opt.value === configName);
        expect(option).withContext('No config found with name "' + configName + '"').toBeDefined();
        selectAI.value = option?.value as string;
        selectAI.dispatchEvent(new Event('change'));
        this.detectChanges();
    }

    public setInput(input: string, value: unknown): void {
        this.fixture.componentRef.setInput(input, value);
    }
}

export class ComponentTestUtils<C extends AbstractGameComponent, P extends Comparable = string>
    extends SimpleComponentTestUtils<GameWrapper<P>>
{
    private gameComponent: AbstractGameComponent;

    private canUserPlaySpy: jasmine.Spy;
    private cancelMoveSpy: jasmine.Spy;
    private chooseMoveSpy: jasmine.Spy;
    private onLegalUserMoveSpy: jasmine.Spy;

    public static async forGame<Component extends AbstractGameComponent>(
        game: string,
        configureTestingModule: boolean = true)
    : Promise<ComponentTestUtils<Component>>
    {
        const gameInfos: GameInfo[] = GameInfo.getAllGames();
        const nullableGameInfo: GameInfo | undefined = gameInfos.find((info: GameInfo) => info.urlName === game);
        const optionalGameInfo: MGPOptional<GameInfo> = MGPOptional.ofNullable(nullableGameInfo);
        if (optionalGameInfo.isAbsent()) {
            throw new Error(game + ' is not a game developed on EveryBoard, check if its name is in the second param of GameInfo (in pick-game.component.ts)');
        }
        return ComponentTestUtils.forGameWithWrapper(game,
                                                     LocalGameWrapperComponent,
                                                     AuthUser.NOT_CONNECTED,
                                                     configureTestingModule);
    }

    public static async forGameWithWrapper<Component extends AbstractGameComponent, Actor extends Comparable>(
        game: string,
        wrapperKind: Type<GameWrapper<Actor>>,
        user: AuthUser = AuthUser.NOT_CONNECTED,
        configureTestingModule: boolean = true)
    : Promise<ComponentTestUtils<Component, Actor>>
    {
        const testUtils: ComponentTestUtils<Component, Actor> =
            await ComponentTestUtils.basic(game, configureTestingModule);
        ConnectedUserServiceMock.setUser(user);
        testUtils.prepareFixture(wrapperKind);
        testUtils.detectChanges();
        tick(1); // Need to be at least 1ms
        testUtils.bindGameComponent();
        testUtils.prepareSpies();
        return testUtils;
    }

    public static async basic<Component extends AbstractGameComponent, Actor extends Comparable>(
        game: string,
        configureTestingModule: boolean = true)
    : Promise<ComponentTestUtils<Component, Actor>>
    {
        const activatedRouteStub: ActivatedRouteStub = new ActivatedRouteStub(game, 'configRoomId');
        if (configureTestingModule) {
            await ConfigureTestingModuleUtils.configureTestingModuleForGame(activatedRouteStub);
        }
        const testUtils: ComponentTestUtils<Component, Actor> = new ComponentTestUtils<Component, Actor>();
        testUtils.prepareMessageDisplayerSpies();
        return testUtils;
    }

    public bindGameComponent(): void {
        expect(this.component.gameComponent).withContext('gameComponent should be bound on the wrapper').toBeDefined();
        this.gameComponent = this.component.gameComponent;
    }

    public prepareSpies(): void {
        this.cancelMoveSpy = spyOn(this.gameComponent, 'cancelMove').and.callThrough();
        this.chooseMoveSpy = spyOn(this.gameComponent, 'chooseMove').and.callThrough();
        this.onLegalUserMoveSpy = spyOn(this.component, 'onLegalUserMove').and.callThrough();
        this.canUserPlaySpy = spyOn(this.gameComponent, 'canUserPlay').and.callThrough();
    }

    public resetSpies(): void {
        this.cancelMoveSpy.calls.reset();
        this.chooseMoveSpy.calls.reset();
        this.onLegalUserMoveSpy.calls.reset();
        this.canUserPlaySpy.calls.reset();
    }

    public expectToBeCreated(): void {
        expect(this.getWrapper()).withContext('Wrapper should be created').toBeTruthy();
        expect(this.getGameComponent()).withContext('Game component should be created').toBeTruthy();
    }

    public override forceChangeDetection(): void {
        this.fixture.debugElement.injector.get<ChangeDetectorRef>(ChangeDetectorRef).markForCheck();
        this.detectChanges();
    }

    public async setupState(state: GameState,
                            params: { previousState?: GameState,
                                      previousMove?: Move,
                                      config?: RulesConfig } = {})
    : Promise<void>
    {
        const config: RulesConfig = this.getConfigFrom(params.config);
        if (Object.keys(config).length > 0) {
            // If the game is configurable, set its config
            const wrapper: LocalGameWrapperComponent = this.getWrapper() as unknown as LocalGameWrapperComponent;
            Object.entries(config)
                .map((configElement: [string, ConfigDescriptionType]) => {
                    TestBed.inject(ActivatedRouteStub).setParam(configElement[0], JSON.stringify(configElement[1]));
                });
            await wrapper.setConfigFromParams();
            this.gameComponent.config = config;
            tick(0);
        }
        this.gameComponent.node = new GameNode(
            state,
            MGPOptional.ofNullable(params.previousState).map((previousState: GameState) =>
                new GameNode(previousState)),
            MGPOptional.ofNullable(params.previousMove),
        );
        await this.gameComponent.updateBoardAndRedraw(false);
        if (params.previousMove !== undefined) {
            await this.gameComponent.showLastMove(params.previousMove);
        }
        this.forceChangeDetection();
    }

    private getConfigFrom(config?: RulesConfig): RulesConfig {
        if (config === undefined) {
            return this.gameComponent.rules.getDefaultRulesConfig();
        } else {
            return config;
        }
    }

    public getWrapper(): GameWrapper<P> {
        return this.component;
    }

    public getGameComponent(): C {
        return (this.gameComponent as unknown) as C;
    }

    /**
     * @param nameInHtml The real name (id) of the element in the XML
     * @param nameInFunction Its name inside the code
     */
    public async expectClickSuccessWithAsymmetricNaming(nameInHtml: string,
                                                        nameInFunction: string,
                                                        context?: string)
    : Promise<void>
    {
        await this.expectInterfaceClickSuccess(nameInHtml, context);
        expect(this.canUserPlaySpy).toHaveBeenCalledOnceWith(nameInFunction);
        this.canUserPlaySpy.calls.reset();
    }

    public expectTranslationYToBe(elementSelector: string, y: number): void {
        const element: DebugElement = this.findElement(elementSelector);
        const transform: SVGTransform = element.nativeElement.transform.baseVal.getItem(0);
        expect(transform.type).toBe(SVGTransform.SVG_TRANSFORM_TRANSLATE);
        // In a SVG transform, f is the y coordinate
        expect(transform.matrix.f).toBe(y);
    }

    public async expectClickSuccess(elementName: string, context?: string): Promise<void> {
        return this.expectClickSuccessWithAsymmetricNaming(elementName, elementName, context);
    }

    public async expectInterfaceClickSuccess(elementName: string, context?: string, waitInMs?: number): Promise<void> {
        if (context == null) {
            context = 'expectInterfaceClickSuccess(' + elementName + ')';
        }
        await this.clickElement(elementName, waitInMs);

        expect(this.cancelMoveSpy).withContext(context).not.toHaveBeenCalledWith();
        expect(this.chooseMoveSpy).withContext(context).not.toHaveBeenCalledWith();
        expect(this.onLegalUserMoveSpy).withContext(context).not.toHaveBeenCalledWith();
    }

    /**
     * To call when you expect the component to reject the click.
     * If you expect the code to submit the move, and the rules to reject it:
     *     then use expectMoveFailure[WithAsymmetricNaming]
     * @param nameInHtml name of the clicked element in the HTML file
     * @param nameInFunction name of the element inside the TS file
     * @param reason the toasted error message
     */
    public async expectClickFailureWithAsymmetricNaming(nameInHtml: string,
                                                        nameInFunction: string,
                                                        reason?: string)
    : Promise<void>
    {
        if (reason == null) {
            await this.clickElement(nameInHtml);
        } else {
            await this.expectToDisplayGameMessage(reason, async() => {
                await this.clickElement(nameInHtml);
            });
        }
        expect(this.canUserPlaySpy).toHaveBeenCalledOnceWith(nameInFunction);
        this.canUserPlaySpy.calls.reset();
        expect(this.chooseMoveSpy)
            .withContext('chooseMove should not be called in case of click failure. If you expect the code to submit the move, and the rules to reject it, use expectMoveFailure.')
            .not.toHaveBeenCalled();
        if (reason == null) {
            expect(this.cancelMoveSpy).toHaveBeenCalledOnceWith();
        } else {
            expect(this.cancelMoveSpy).toHaveBeenCalledOnceWith(reason);
        }
        this.cancelMoveSpy.calls.reset();
    }

    public async expectClickFailure(elementName: string, reason?: string): Promise<void> {
        return this.expectClickFailureWithAsymmetricNaming(elementName, elementName, reason);
    }

    public async expectClickForbidden(elementName: string, reason: string): Promise<void> {
        const clickValidity: MGPValidation = await this.gameComponent.canUserPlay(elementName);
        expect(clickValidity.getReason()).toBe(reason);
        this.canUserPlaySpy.calls.reset();

        await this.expectToDisplayGameMessage(reason, async() => {
            await this.clickElement(elementName);
        });
        expect(this.canUserPlaySpy).toHaveBeenCalledOnceWith(elementName);
        this.canUserPlaySpy.calls.reset();
        expect(this.chooseMoveSpy).not.toHaveBeenCalled();
        expect(this.cancelMoveSpy).toHaveBeenCalledOnceWith(reason);
        this.cancelMoveSpy.calls.reset();
    }

    public async expectMoveSuccess(elementName: string,
                                   move: Move,
                                   clickAnimationDuration?: number)
    : Promise<void>
    {
        return this.expectMoveSuccessWithAsymmetricNaming(elementName, elementName, move, clickAnimationDuration);
    }

    public async expectMoveSuccessWithAsymmetricNaming(nameInHtml: string,
                                                       nameInFunction: string,
                                                       move: Move,
                                                       clickAnimationDuration?: number)
    : Promise<void>
    {
        await this.clickElement(nameInHtml);
        if (clickAnimationDuration === undefined) {
            tick(0);
        } else {
            tick(clickAnimationDuration);
        }
        expect(this.canUserPlaySpy).toHaveBeenCalledOnceWith(nameInFunction);
        this.canUserPlaySpy.calls.reset();
        expect(this.chooseMoveSpy).toHaveBeenCalledOnceWith(move);
        this.chooseMoveSpy.calls.reset();
        expect(this.onLegalUserMoveSpy).toHaveBeenCalledOnceWith(move);
        this.onLegalUserMoveSpy.calls.reset();
    }

    public async expectMoveFailure(elementName: string, reason: string, move: Move) : Promise<void> {
        await this.expectToDisplayGameMessage(reason, async() => {
            await this.clickElement(elementName);
        });
        expect(this.canUserPlaySpy).toHaveBeenCalledOnceWith(elementName);
        this.canUserPlaySpy.calls.reset();
        expect(this.chooseMoveSpy).toHaveBeenCalledOnceWith(move);
        this.chooseMoveSpy.calls.reset();
        expect(this.cancelMoveSpy).toHaveBeenCalledOnceWith(reason);
        this.cancelMoveSpy.calls.reset();
        expect(this.onLegalUserMoveSpy).not.toHaveBeenCalled();
    }

    public expectPassToBeForbidden(): void {
        this.expectElementNotToExist('#pass-button');
    }

    public async expectPassSuccess(move: Move): Promise<void> {
        await this.clickElement('#pass-button', 0);
        expect(this.chooseMoveSpy).toHaveBeenCalledOnceWith(move);
        this.chooseMoveSpy.calls.reset();
        expect(this.onLegalUserMoveSpy).toHaveBeenCalledOnceWith(move);
        this.onLegalUserMoveSpy.calls.reset();
    }

    public choose(player: Player, aiOrHuman: 'AI' | 'human'): void {
        const dropDownName: string = player === Player.ZERO ? '#player-select-0' : '#player-select-1';
        const selectAI: HTMLSelectElement = this.findElement(dropDownName).nativeElement;
        selectAI.value = aiOrHuman === 'AI' ? selectAI.options[1].value : selectAI.options[0].value;
        selectAI.dispatchEvent(new Event('change'));
        this.detectChanges();
        tick(0);
    }

    public async choosingAILevel(player: Player): Promise<void> {
        const profileDropDownName: string = player === Player.ZERO ? '#ai-profile-select-0' : '#ai-profile-select-1';
        const profileSelect: HTMLSelectElement = this.findElement(profileDropDownName).nativeElement;
        profileSelect.value = profileSelect.options[1].value;
        profileSelect.dispatchEvent(new Event('change'));
        this.detectChanges();
        tick(0);
        const boundDropDownName: string = player === Player.ZERO ? '#ai-option-select-0' : '#ai-option-select-1';
        const selectDepth: HTMLSelectElement = this.findElement(boundDropDownName).nativeElement;
        selectDepth.value = selectDepth.options[1].value;
        selectDepth.dispatchEvent(new Event('change'));
        const aiDepth: string = selectDepth.options[selectDepth.selectedIndex].label;
        expect(aiDepth).toBe('Level 1');
        this.detectChanges();
    }

}

export class ConfigureTestingModuleUtils {

    public static async configureTestingModuleForGame(activatedRouteStub: ActivatedRouteStub): Promise<void> {
        await TestBed.configureTestingModule({
            imports: [],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                importProvidersFrom(BrowserModule, ReactiveFormsModule, FormsModule, FontAwesomeModule),
                provideRouter(routes),
                { provide: ActivatedRoute, useValue: activatedRouteStub },
                { provide: ActivatedRouteStub, useValue: activatedRouteStub },
                { provide: UserDAO, useClass: UserDAOMock },
                { provide: ConnectedUserService, useClass: ConnectedUserServiceMock },
                { provide: ErrorLoggerService, useClass: ErrorLoggerServiceMock },
                { provide: CurrentGameService, useClass: CurrentGameServiceMock },
                { provide: GameService, useClass: GameServiceMock },
                { provide: ConfigRoomService, useClass: ConfigRoomServiceMock },
                { provide: ChatService, useClass: ChatServiceMock },
                { provide: ActiveConfigRoomsService, useClass: ActiveConfigRoomsServiceMock },
                { provide: BackendService, useClass: BackendServiceMock },
                OGWCTimeManagerService,
                OGWCRequestManagerService,
            ],
        }).compileComponents();
    }

    public static async configureTestingModule(activatedRouteStub?: ActivatedRouteStub)
    : Promise<void>
    {
        await TestBed.configureTestingModule({
            imports: [],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                importProvidersFrom(BrowserModule, ReactiveFormsModule, FormsModule, FontAwesomeModule),
                provideRouter(routes),
                { provide: ActivatedRoute, useValue: activatedRouteStub },
                { provide: ActivatedRouteStub, useValue: activatedRouteStub },
                { provide: UserDAO, useClass: UserDAOMock },
                { provide: ConnectedUserService, useClass: ConnectedUserServiceMock },
                { provide: ErrorLoggerService, useClass: ErrorLoggerServiceMock },
                { provide: CurrentGameService, useClass: CurrentGameServiceMock },
                { provide: GameService, useClass: GameServiceMock },
                { provide: ConfigRoomService, useClass: ConfigRoomServiceMock },
                { provide: ChatService, useClass: ChatServiceMock },
                { provide: ActiveConfigRoomsService, useClass: ActiveConfigRoomsServiceMock },
                { provide: BackendService, useClass: BackendServiceMock },
            ],
        }).compileComponents();
    }
}

export async function setupEmulators(): Promise<unknown> {
    initializeFirebase();
    await TestBed.configureTestingModule({
        providers: [
            provideHttpClient(),
            ConnectedUserService,
        ],
    }).compileComponents();
    const http: HttpClient = TestBed.inject(HttpClient);
    // Clear the content of the firestore database in the emulator
    await firstValueFrom(http.delete('http://localhost:8080/emulator/v1/projects/my-project/databases/(default)/documents'));
    // Clear the auth data in the emulator before each test
    await firstValueFrom(http.delete('http://localhost:9099/emulator/v1/projects/my-project/accounts'));
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
 * Tests that the routes are used as expected. The router.navigate method should
 * be spied on. This function will match the route that is navigated to with
 * the declared routes of the application, and ensure that the component that is
 * routed to matches `component`. In case multiple router.navigate calls happen,
 * set otherRoutes to true.
 */
export async function expectValidRouting(router: Router,
                                         path: string[],
                                         component: Type<any>, // eslint-disable-line @typescript-eslint/no-explicit-any
                                         options?: { otherRoutes?: boolean,
                                                     skipLocationChange?: boolean,
                                                     queryParams?: Record<string, string> })
: Promise<void>
{
    expect(path[0][0]).withContext('Routings should start with /').toBe('/');
    if (!(path.length === 1 && path[0] === '/')) {
        // Unless the path is / (in which case, it must finish by /), we need to ensure the presence of /
        for (const pathPart of path) {
            expect(pathPart[pathPart.length-1]).withContext('Routing should not include superfluous / at the end').not.toBe('/');
        }
    }
    const fullPath: string = path.join('/');
    const matchingRoute: MGPOptional<Route> = findMatchingRoute(fullPath);
    expect(matchingRoute.isPresent()).withContext(`Expected route to be present for path: ${path}`).toBeTrue();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resolvedComponent: any = await matchingRoute.get().loadComponent!();
    const routedToComponent: string = getComponentClassName(resolvedComponent);
    const expectedComponent: string = getComponentClassName(component);
    expect(routedToComponent).withContext('It should route to the expected component').toEqual(expectedComponent);
    const otherRoutes: boolean = options != null && options.otherRoutes != null && options.otherRoutes;
    const args: [string[], ...NavigationExtras[]] = [path];
    const extraArgs: NavigationExtras = {};
    if (options != null && options.queryParams != null) {
        extraArgs.queryParams = options.queryParams;
    }
    if (options != null && options.skipLocationChange != null) {
        extraArgs.skipLocationChange = options.skipLocationChange;
    }
    if (Object.keys(extraArgs).length > 0) {
        args.push(extraArgs);
    }
    if (otherRoutes) {
        expect(router.navigate).toHaveBeenCalledWith(...args);
    } else {
        expect(router.navigate).toHaveBeenCalledOnceWith(...args);
    }
}

/**
 * Similar to expectValidRouting, but for checking HTML elements that provide a routerLink.
 */
export async function expectValidRoutingLink(element: DebugElement, fullPath: string, component: Type<unknown>)
  : Promise<void>
{
    expect(fullPath[0]).withContext('Routings should start with /').toBe('/');

    expect(element.attributes.routerLink).withContext('Routing links should have a routerLink').toBeDefined();
    expect(element.attributes.routerLink).toEqual(fullPath);
    const matchingRoute: MGPOptional<Route> = findMatchingRoute(fullPath);
    expect(matchingRoute.isPresent()).withContext(`Expected route to be present for path: ${fullPath}`).toBeTrue();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resolvedComponent: any = await matchingRoute.get().loadComponent!();
    const routedToComponent: string = getComponentClassName(resolvedComponent);
    const expectedComponent: string = getComponentClassName(component);
    expect(routedToComponent).withContext('It should route to the expected component').toEqual(expectedComponent);
}

/**
 * Checks that a promise resulted in a firestore 'permission-denied' error.
 * Useful to test that permissions on firestore work as expected.
 */
export async function expectPermissionToBeDenied<T>(promise: Promise<T>): Promise<void> {
    const throwIfFulfilled: () => void = () => {
        throw new Error('Expected a promise to be rejected but it was resolved');
    };
    const checkErrorCode: (actualValue: FirebaseError) => void = (actualValue: FirebaseError) => {
        expect(actualValue.code).toBe('permission-denied');
    };
    await promise.then(throwIfFulfilled, checkErrorCode);
}

/**
 * Returns a checker to verify that a subscription method has been correctly unsubscribed
 * to in case it has been subscribed first.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function prepareUnsubscribeCheck(service: any, subscribeMethod: string): () => void {

    let subscribed: boolean = false;
    let unsubscribed: boolean = false;
    const spy: jasmine.Spy = spyOn(service, subscribeMethod);
    spy.and.callFake((...args: unknown[]): Subscription | Promise<Subscription> => {
        subscribed = true;
        // We need to call the original function.
        // This is a bit hacky, but seems to be the only way:
        // we change the spy to call through, and apply the original method.
        // This is fine for subscribe methods as they are expected to be called only once.
        spy.and.callThrough();
        // The subscription method could be a promise, we need to deal with both cases
        const subscription: Subscription | Promise<Subscription> = service[subscribeMethod](...args);
        if (subscription['unsubscribe'] !== undefined) {
            // This is not a promise, we can wrap it directly
            return new Subscription(() => {
                unsubscribed = true;
                (subscription as Subscription).unsubscribe();
            });
        } else {
            // This is a promise, let's await it then wrap it
            return (subscription as Promise<Subscription>).then((sub: Subscription): Subscription => {
                return new Subscription(() => {
                    unsubscribed = true;
                    sub.unsubscribe();
                });
            });
        }
    });
    return () => {
        expect(subscribed)
            .withContext('Service should have subscribed to ' + subscribeMethod + ' method but did not')
            .toBeTrue();
        expect(unsubscribed)
            .withContext('Service should have unsubscribed to ' + subscribeMethod + ' method but did not')
            .toBeTrue();
    };
}

const regularIt: (name: string, testBody: () => void) => void = it;
const regularFit: (name: string, testBody: () => void) => void = fit;
const regularXit: (name: string, testBody: () => void) => void = xit;
export namespace SlowTest {

    // Run a slow test, only if that option is enabled
    export function it(name: string, testBody: () => void): void {
        if (TestVars.slowTests) {
            regularIt(name, testBody);
        } else {
            // Instead of doing nothing when slow tests are disabled, which would result in a potential karma error
            // ("describe without it"), we use xit
            regularXit(name, testBody);
        }
    }

    // Does a focused test (a fit), and ignores the TestVars.slowTests option
    export function fit(name: string, testBody: () => void): void {
        regularFit(name, testBody);
    }

}

export const UNIVERSAL_SELF_PLAY_PLIES: number = 24;

export type MinimaxTestOptions<R extends SuperRules<M, S, C, L>,
                               M extends Move,
                               S extends GameState,
                               O extends AIOptions,
                               C extends RulesConfig,
                               L> = {
    rules: R,
    minimax: Minimax<M, S, C, L>,
    options: O,
    config: C,
    shouldFinish: boolean
}

export type BoundedMinimaxTestOptions<R extends SuperRules<M, S, C, L>,
                                      M extends Move,
                                      S extends GameState,
                                      O extends AIDepthLimitOptions,
                                      C extends RulesConfig,
                                      L> = {
    rules: R,
    playerZeroMinimax: Minimax<M, S, C, L>,
    playerZeroOptions: O,
    playerOneMinimax?: Minimax<M, S, C, L>,
    playerOneOptions?: O,
    config: C,
    maxPlies: number,
    maxDurationMillis: number,
}

/* Run a minimax test by battling it against itself for a number of turns */
export function minimaxTest<R extends SuperRules<M, S, C, L>,
                            M extends Move,
                            S extends GameState,
                            O extends AIDepthLimitOptions,
                            C extends RulesConfig,
                            L>(options: MinimaxTestOptions<R, M, S, O, C, L>): void
{
    // Given a component where AI plays against AI
    let node: GameNode<M, S> = options.rules.getInitialNode(options.config);
    const limit: number = 10000; // Play for 10 seconds at most

    // When playing the needed number of turns
    // Then it should not throw errors
    let turn: number = 0;
    const start: number = performance.now();
    const nodesBefore: number = GameNodeStats.createdNodes;
    while (performance.now() < start + limit && options.rules.getGameStatus(node, options.config).isEndGame === false) {
        const bestMove: M = options.minimax.chooseNextMove(node, options.options, options.config);
        expect(bestMove).toBeDefined();
        const nextNode: MGPFallible<GameNode<M, S>> = options.rules.choose(node, bestMove, options.config);
        expect(nextNode.isSuccess()).withContext(`${options.minimax.name} should choose a legal move at turn ${turn}`).toBeTrue();
        node = nextNode.get();
        turn++;
    }
    const seconds: number = (performance.now() - start) / 1000;
    const nodesCreated: number = GameNodeStats.createdNodes - nodesBefore;
    console.log(`${turn / seconds} turn/s for ${options.minimax.constructor.name} with ${turn} turns in ${seconds} seconds, created ${nodesCreated} nodes, so ${nodesCreated / seconds} nodes/s`);
    // And maybe the game needs to be over
    if (options.shouldFinish) {
        expect(options.rules.getGameStatus(node, options.config).isEndGame).toBeTrue();
    }
}

export function expectToBeAbleToPlayAgainstItself<R extends SuperRules<M, S, C, L>,
                                                  M extends Move,
                                                  S extends GameState,
                                                  O extends AIDepthLimitOptions,
                                                  C extends RulesConfig,
                                                  L>(options: BoundedMinimaxTestOptions<R, M, S, O, C, L>): void {
    let node: GameNode<M, S> = options.rules.getInitialNode(options.config);
    const playerOneMinimax: Minimax<M, S, C, L> = options.playerOneMinimax ?? options.playerZeroMinimax;
    const playerOneOptions: O = options.playerOneOptions ?? options.playerZeroOptions;
    const deadline: number = performance.now() + options.maxDurationMillis;

    for (let ply: number = 0; ply < options.maxPlies && performance.now() < deadline; ply++) {
        if (options.rules.getGameStatus(node, options.config).isEndGame) {
            return;
        }
        const currentPlayer: Player = node.gameState.getCurrentPlayer();
        const minimax: Minimax<M, S, C, L> =
            currentPlayer === Player.ZERO ? options.playerZeroMinimax : playerOneMinimax;
        const aiOptions: O = currentPlayer === Player.ZERO ? options.playerZeroOptions : playerOneOptions;
        const move: M = minimax.chooseNextMove(node, aiOptions, options.config);
        expect(move).withContext(`${minimax.name} should choose a move at ply ${ply}`).toBeDefined();
        const nextNode: MGPFallible<GameNode<M, S>> = options.rules.choose(node, move, options.config);
        expect(nextNode.isSuccess()).withContext(`${minimax.name} should choose a legal move at ply ${ply}`).toBeTrue();
        node = nextNode.get();
    }
}

export function getShallowestMinimaxOptions<M extends Move,
                                            S extends GameState,
                                            C extends RulesConfig,
                                            L>(minimax: Minimax<M, S, C, L>): AIDepthLimitOptions
{
    const options: AIOptions[] = minimax.availableOptions as AIOptions[];
    const depthOptions: AIDepthLimitOptions[] = options.filter((option: AIOptions): option is AIDepthLimitOptions => {
        return 'maxDepth' in option;
    });
    Utils.assert(depthOptions.length > 0, `Minimax ${minimax.name} should expose at least one depth-limited option`);
    return depthOptions.reduce((best: AIDepthLimitOptions, option: AIDepthLimitOptions) => {
        return option.maxDepth < best.maxDepth ? option : best;
    });
}

export function createConfiguredMinimaxForTest<R extends SuperRules<M, S, C, L>,
                                               M extends Move,
                                               S extends GameState,
                                               C extends RulesConfig,
                                               L>(rules: R,
                                                  config: MinimaxConfig<M, S, C>)
: Minimax<M, S, C, L>
{
    return createMinimaxFromConfig(rules, config);
}
