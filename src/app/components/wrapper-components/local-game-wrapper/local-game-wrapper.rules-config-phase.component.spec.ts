/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { MGPOptional } from '@everyboard/lib';

import { ActivatedRouteStub, ComponentTestUtils, expectValidRouting } from 'src/app/utils/tests/TestUtils.spec';
import { UserMocks } from 'src/app/domain/UserMocks.spec';
import { ConnectedUserServiceMock } from 'src/app/services/tests/ConnectedUserService.spec';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { LocalGameConfigurationComponent } from '../local-game-configuration/local-game-configuration.component';
import { RulesConfig } from 'src/app/jscaip/RulesConfigUtil';
import { QuebecCastlesComponent } from 'src/app/games/quebec-castles/quebec-castles.component';
import { DropMode, QuebecCastlesConfig, QuebecCastlesRules } from 'src/app/games/quebec-castles/QuebecCastlesRules';
import { QuebecCastlesState } from 'src/app/games/quebec-castles/QuebecCastlesState';

describe('LocalGameWrapperComponent (rules config phase)', () => {

    let testUtils: ComponentTestUtils<QuebecCastlesComponent>;
    const defaultConfig: MGPOptional<QuebecCastlesConfig> = QuebecCastlesRules.get().getDefaultRulesConfig();

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<QuebecCastlesComponent>('QuebecCastles', true);
        ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
        TestBed.inject(ErrorLoggerService);
    }));

    it('should redirect to configuration if the provided config is invalid (due to missing elements)', fakeAsync(async() => {
        // Given a game configured with an invalid config
        const config: MGPOptional<RulesConfig> = MGPOptional.of({
            invalid: true,
        });
        const state: QuebecCastlesState = QuebecCastlesRules.get().getInitialState(defaultConfig);

        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.resolveTo();

        // When displaying it
        await testUtils.setupState(state, { config });

        // Then it should redirect to the configuration page
        const expectedRoute: string[] = ['/local', 'QuebecCastles', 'config'];
        expectValidRouting(router, expectedRoute, LocalGameConfigurationComponent);
    }));

    it('should redirect to configuration if the provided config is invalid (due to invalid value of element)', fakeAsync(async() => {
        // Given a game configured with an invalid config
        const config: MGPOptional<QuebecCastlesConfig> = MGPOptional.of<QuebecCastlesConfig>({
            ...defaultConfig.get(),
            defenders: -10,
        });
        const state: QuebecCastlesState = QuebecCastlesRules.get().getInitialState(defaultConfig);

        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.resolveTo();

        // When displaying it
        await testUtils.setupState(state, { config });

        // Then it should redirect to the configuration page
        const expectedRoute: string[] = ['/local', 'QuebecCastles', 'config'];
        expectValidRouting(router, expectedRoute, LocalGameConfigurationComponent);
    }));

    describe('should redirect to configuration if the provided config is invalid (due to invalid type of element)', () => {

        it('number as string', fakeAsync(async() => {
            // Given a game configured with an invalid config
            const config: MGPOptional<QuebecCastlesConfig> = MGPOptional.of<QuebecCastlesConfig>({
                ...defaultConfig.get(),
                defenders: 'gentil' as unknown as number, // we lie to typescript here, like the url config could do
            });
            const state: QuebecCastlesState = QuebecCastlesRules.get().getInitialState(defaultConfig);

            const router: Router = TestBed.inject(Router);
            spyOn(router, 'navigate').and.resolveTo();

            // When displaying it
            await testUtils.setupState(state, { config });

            // Then it should redirect to the configuration page
            const expectedRoute: string[] = ['/local', 'QuebecCastles', 'config'];
            expectValidRouting(router, expectedRoute, LocalGameConfigurationComponent);
        }));

        it('string as number', fakeAsync(async() => {
            // Given a game configured with an invalid config
            const config: MGPOptional<QuebecCastlesConfig> = MGPOptional.of<QuebecCastlesConfig>({
                ...defaultConfig.get(),
                dropMode: 42 as unknown as DropMode, // we lie to typescript here, like the url config could do
            });
            const state: QuebecCastlesState = QuebecCastlesRules.get().getInitialState(defaultConfig);

            const router: Router = TestBed.inject(Router);
            spyOn(router, 'navigate').and.resolveTo();

            // When displaying it
            await testUtils.setupState(state, { config });

            // Then it should redirect to the configuration page
            const expectedRoute: string[] = ['/local', 'QuebecCastles', 'config'];
            expectValidRouting(router, expectedRoute, LocalGameConfigurationComponent);
        }));

    });

    it('should redirect to configuration if the provided config is invalid (due to invalid global validator)', fakeAsync(async() => {
        // Given a game configured with an invalid config
        const config: MGPOptional<QuebecCastlesConfig> = MGPOptional.of<QuebecCastlesConfig>({
            ...defaultConfig.get(),
            defenders: 155, // too many defenders for 4 lines of defender
        });
        const state: QuebecCastlesState = QuebecCastlesRules.get().getInitialState(defaultConfig);

        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.resolveTo();

        // When displaying it
        await testUtils.setupState(state, { config });

        // Then it should redirect to the configuration page
        const expectedRoute: string[] = ['/local', 'QuebecCastles', 'config'];
        expectValidRouting(router, expectedRoute, LocalGameConfigurationComponent);
    }));

    it('should redirect to configuration if the provided config is missing elements', fakeAsync(async() => {
        // Given a game configured with a config where all provided elements are valid, but some are missing
        const config: MGPOptional<RulesConfig> = MGPOptional.of({
            width: 4,
        });
        const state: QuebecCastlesState = QuebecCastlesRules.get().getInitialState(defaultConfig);

        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.resolveTo();

        // When displaying it
        await testUtils.setupState(state, { config });

        // Then it should redirect to the configuration page
        const expectedRoute: string[] = ['/local', 'QuebecCastles', 'config'];
        expectValidRouting(router, expectedRoute, LocalGameConfigurationComponent);
    }));

    it('should redirect to configuration if the provided config is nesting JSON objects', fakeAsync(async() => {
        // Given a game configured with a config where a config element is nested JSON
        const config: MGPOptional<RulesConfig> = MGPOptional.of({
            width: 4,
            height: {
                lol: 42,
            },
        } as unknown as RulesConfig /* we are lying to typescript for the test */);
        const state: QuebecCastlesState = QuebecCastlesRules.get().getInitialState(defaultConfig);

        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.resolveTo();

        // When displaying it
        await testUtils.setupState(state, { config });

        // Then it should redirect to the configuration page
        const expectedRoute: string[] = ['/local', 'QuebecCastles', 'config'];
        expectValidRouting(router, expectedRoute, LocalGameConfigurationComponent);
    }));

    it('should redirect to configuration if the provided config is not valid JSON', fakeAsync(async() => {
        // Given a game configured with a config that is not parsable JSON
        const config: MGPOptional<RulesConfig> = MGPOptional.of({
            width: 4,
            // height will be set manually in the route
        });
        const state: QuebecCastlesState = QuebecCastlesRules.get().getInitialState(defaultConfig);
        const extraInvalidConfigElement: string = 'I\'m not Jason, not JSON :}}{';
        TestBed.inject(ActivatedRouteStub).setParam('height', extraInvalidConfigElement);

        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.resolveTo();

        // When displaying it
        await testUtils.setupState(state, { config });

        // Then it should redirect to the configuration page
        const expectedRoute: string[] = ['/local', 'QuebecCastles', 'config'];
        expectValidRouting(router, expectedRoute, LocalGameConfigurationComponent);
    }));

});
