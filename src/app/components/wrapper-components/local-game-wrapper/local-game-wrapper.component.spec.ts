/* eslint-disable max-lines-per-function */
import { DebugElement } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';

import { Player, PlayerOrNone } from '@everyboard/games';
import { PlayerNumberMap } from '@everyboard/games';
import { AIDepthLimitOptions, AIOptions, AbstractAI } from '@everyboard/games';
import { MinimaxConfig } from '@everyboard/games';
import { GameNode } from '@everyboard/games';
import { IterativeDeepeningMinimax } from '@everyboard/games';
import { MCTS } from '@everyboard/games';
import { Minimax } from '@everyboard/games';
import { GameStatus } from '@everyboard/games';
import { ArrayUtils, JSONValue, MGPFallible, MGPOptional, MGPValidation, Utils } from '@everyboard/lib';

import { UserMocks } from '../../../domain/UserMocks.spec';
import { GipfComponent } from '../../../games/gipf/gipf.component';
import { P4Heuristic } from '../../../games/p4/P4Heuristic';
import { P4Move } from '../../../games/p4/P4Move';
import { P4OrderedMoveGenerator } from '../../../games/p4/P4OrderedMoveGenerator';
import { P4Config, P4Rules } from '../../../games/p4/P4Rules';
import { P4State } from '../../../games/p4/P4State';
import { P4Component } from '../../../games/p4/p4.component';
import { AuthUser } from '../../../services/ConnectedUserService';
import { ErrorLoggerService } from '../../../services/ErrorLoggerService';
import { ConnectedUserServiceMock } from '../../../services/tests/ConnectedUserService.spec';
import { ErrorLoggerServiceMock } from '../../../services/tests/ErrorLoggerServiceMock.spec';
import { ComponentTestUtils, expectValidRouting } from '../../../utils/tests/TestUtils.spec';
import { AbstractGameComponent } from '../../game-components/game-component/GameComponent';
import { NotFoundComponent } from '../../normal-component/not-found/not-found.component';
import { GameWrapperMessages } from '../GameWrapper';

import { LocalGameWrapperComponent } from './local-game-wrapper.component';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;

describe('LocalGameWrapperComponent for non-existing game', () => {

    it('should redirect to /notFound', fakeAsync(async() => {
        // Given a game wrapper for a game that does not exist
        const testUtils: ComponentTestUtils<AbstractGameComponent> = await ComponentTestUtils.basic('invalid-game', true);
        ConnectedUserServiceMock.setUser(AuthUser.NOT_CONNECTED);
        testUtils.prepareFixture(LocalGameWrapperComponent);
        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.resolveTo();

        // When loading the wrapper
        testUtils.detectChanges();
        tick(1); // Need to tick at least for 1ms due to ngAfterViewInit's setTimeout

        // Then it goes to /notFound with the expected error message and displays a toast
        const expectedRoute: string[] = ['/notFound', GameWrapperMessages.NO_MATCHING_GAME('invalid-game')];
        await expectValidRouting(router, expectedRoute, NotFoundComponent, { skipLocationChange: true });
    }));

});

describe('LocalGameWrapperComponent (game without config)', () => {

    let testUtils: ComponentTestUtils<GipfComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<GipfComponent>('Gipf', true);
        ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
        TestBed.inject(ErrorLoggerService);
    }));

    it('should start game immediately when no configuration is needed', fakeAsync(async() => {
        // Given any game needing no config, like Gipf
        // When displaying them
        // Then game component should be created
        testUtils.expectElementToExist('#board');
        // And the config not
        testUtils.expectElementNotToExist('#rulesConfigComponent');
    }));
});


describe('LocalGameWrapperComponent (game phase)', () => {

    let testUtils: ComponentTestUtils<P4Component>;

    function chooseAIOrHuman(player: Player, strategy: 'human' | 'minimax' | 'iterative-deepening' | 'mcts'): void {
        const dropDownName: string = player === Player.ZERO ? '#player-select-0' : '#player-select-1';
        const selectAI: HTMLSelectElement = testUtils.findElement(dropDownName).nativeElement;
        selectAI.value = strategy;
        selectAI.dispatchEvent(new Event('change'));
        testUtils.detectChanges();
        tick(0);
    }

    function chooseFirstAILevel(player: Player): void {
        const profileSelector: string = `#ai-profile-select-${player.getValue()}`;
        const profileElements: DebugElement[] = testUtils.findElements(profileSelector);
        if (profileElements.length === 1) {
            const selectProfile: HTMLSelectElement = profileElements[0].nativeElement;
            selectProfile.value = selectProfile.options[1].value;
            selectProfile.dispatchEvent(new Event('change'));
            testUtils.detectChanges();
            tick(0);
        }
        const dropDownName: string = `#ai-option-select-${player.getValue()}`;
        const selectLevel: HTMLSelectElement = testUtils.findElement(dropDownName).nativeElement;
        // We select the first available level in a way that works for any level name.
        // Element 0 of the option = 'Pick the level', element 1 = first actual level
        selectLevel.value = selectLevel.options[1].value;
        selectLevel.dispatchEvent(new Event('change'));
        testUtils.detectChanges();
        tick(0);
    }

    function selectAIPlayer(player: Player): void {
        chooseAIOrHuman(player, 'minimax');
        chooseFirstAILevel(player);
    }

    function expectTurnToBe(turn: number): void {
        testUtils.expectTextToBe('#infos > .subtitle', 'Turn n°' + (turn+1));
    }

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<P4Component>('P4');
        ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
        TestBed.inject(ErrorLoggerService);
    }));

    it('should create the component at turn 0', () => {
        expect(testUtils.getGameComponent()).toBeTruthy();
        const state: P4State = testUtils.getGameComponent().getState();
        expect(state.turn).toBe(0);
    });

    it('should have game included after view init', () => {
        let p4Tag: DebugElement = testUtils.findElement('app-p4');

        p4Tag = testUtils.findElement('app-p4');
        expect(p4Tag).withContext('app-p4 tag should be present after view init').toBeTruthy();

        expect(testUtils.getWrapper().gameComponent)
            .withContext('gameComponent should be present once component view init').toBeTruthy();
    });

    it('connected user should be able to play', fakeAsync(async() => {
        // Given the initial board
        // When doing a move
        await testUtils.expectMoveSuccess('#click-4-0', P4Move.of(4));
        // Then the turn should be incremented
        expectTurnToBe(1);
    }));

    it('should be interactive by default', fakeAsync(async() => {
        // Given a game
        // When displaying it
        // Then it is interactive
        expect(testUtils.getGameComponent().isInteractive()).toBeTrue();
    }));

    it('should show draw', fakeAsync(async() => {
        const board: PlayerOrNone[][] = [
            [O, O, O, _, O, O, O],
            [X, X, X, O, X, X, X],
            [O, O, O, X, O, O, O],
            [X, X, X, O, X, X, X],
            [O, O, O, X, O, O, O],
            [X, X, X, O, X, X, X],
        ];
        const state: P4State = new P4State(board, 41);
        await testUtils.setupState(state);

        await testUtils.expectMoveSuccess('#click-3-0', P4Move.of(3));
        testUtils.expectElementToExist('#draw');
    }));

    it('should not allow clicks after the end of the game', fakeAsync(async() => {
        // Given a game about to end
        const board: PlayerOrNone[][] = [
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [X, _, _, _, _, _, _],
            [X, O, _, _, _, _, _],
            [X, O, O, O, _, _, _],
        ];
        const state: P4State = new P4State(board, 41);
        await testUtils.setupState(state);
        // When finishing the game
        await testUtils.expectMoveSuccess('#click-0-0', P4Move.of(0));
        // Then it should not be possible to click again
        await testUtils.expectClickFailure('#click-3-0', GameWrapperMessages.GAME_HAS_ENDED());
    }));

    it('should show score if needed', fakeAsync(async() => {
        testUtils.getGameComponent().scores = MGPOptional.empty();
        testUtils.expectElementNotToExist('#score-0');
        testUtils.expectElementNotToExist('#score-1');

        testUtils.getGameComponent().scores = MGPOptional.of(PlayerNumberMap.of(0, 0));
        testUtils.forceChangeDetection();

        testUtils.expectElementToExist('#score-0');
        testUtils.expectElementToExist('#score-1');
    }));

    describe('restarting games', () => {
        it('should allow to restart game during the play', fakeAsync(async() => {
            // Given the board at any moment
            const advancedState: P4State = new P4State([
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [X, _, _, _, _, _, _],
                [O, _, _, _, _, _, _],
            ], 2);
            await testUtils.setupState(advancedState);
            let state: P4State = testUtils.getGameComponent().getState();
            expect(state.turn).toBe(2);

            // When clicking on restart button
            await testUtils.expectInterfaceClickSuccess('#restart-button');

            // Then it should go back to first turn
            state = testUtils.getGameComponent().getState();
            expect(state.turn).toBe(0);
        }));

        it('should allow to restart game at the end', fakeAsync(async() => {
            // Given a part just finished by draw
            const board: PlayerOrNone[][] = [
                [O, O, O, _, O, O, O],
                [X, X, X, O, X, X, X],
                [O, O, O, X, O, O, O],
                [X, X, X, O, X, X, X],
                [O, O, O, X, O, O, O],
                [X, X, X, O, X, X, X],
            ];
            const state: P4State = new P4State(board, 41);
            await testUtils.setupState(state);
            await testUtils.expectMoveSuccess('#click-3-0', P4Move.of(3));

            // When restarting the game
            await testUtils.expectInterfaceClickSuccess('#restart-button');
            tick(0);

            // Then the draw indication should be removed and we should be back at turn 0
            expectTurnToBe(0);
            testUtils.expectElementNotToExist('#draw');
        }));

        it('should call cancelMoveAttempt and hideLastMove', fakeAsync(async() => {
            // Given the board at any moment
            const advancedState: P4State = new P4State([
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [X, _, _, _, _, _, _],
                [O, _, _, _, _, _, _],
            ], 2);
            await testUtils.setupState(advancedState);
            const state: P4State = testUtils.getGameComponent().getState();
            expect(state.turn).toBe(2);

            // When restarting the game
            spyOn(testUtils.getGameComponent(), 'hideLastMove').and.callThrough();
            spyOn(testUtils.getGameComponent(), 'cancelMoveAttempt').and.callThrough();
            await testUtils.expectInterfaceClickSuccess('#restart-button');

            // Then it should go back to first turn
            expect(testUtils.getGameComponent().hideLastMove).toHaveBeenCalledOnceWith();
            expect(testUtils.getGameComponent().cancelMoveAttempt).toHaveBeenCalledOnceWith();
        }));

    });

    describe('Using AI', () => {

        it('should disable interactivity when AI is selected without level', fakeAsync(async() => {
            // Given a game which is initially interactive, with a background showing it
            expect(testUtils.getGameComponent().isInteractive()).toBeTrue();
            testUtils.expectElementToHaveClass('#board-highlight', 'player0-bg');

            // When selecting only the AI without the depth for the current player
            testUtils.selectChildElementOfDropDown('#player-select-0', 'player-0-ai-minimax');

            // Then the game should not be interactive anymore
            expect(testUtils.getGameComponent().isInteractive())
                .withContext('Interactivity should be false')
                .toBeFalse();
            // nor should it show the current player background
            testUtils.expectElementNotToHaveClass('#board-highlight', 'player0-bg');
        }));

        it('should show profile when non-human player is selected', fakeAsync(async() => {
            // Given a board where human are playing human
            testUtils.expectElementNotToExist('#ai-option-select-0');

            // When selecting an AI for player ZERO
            const aiName: string = '#player-select-0';
            testUtils.selectChildElementOfDropDown(aiName, 'player-0-ai-minimax');

            // Then AI name should be diplayed and the level selectable
            const selectedAI: HTMLSelectElement = testUtils.findElement(aiName).nativeElement;
            const chosenAiName: string = selectedAI.options[selectedAI.selectedIndex].label;
            expect(chosenAiName).toBe('Minimax');
            testUtils.expectElementToExist('#ai-profile-select-0');
            testUtils.expectElementNotToExist('#ai-option-select-0');
        }));

        it('should skip profile selection for MCTS when there is a single config', fakeAsync(async() => {
            // Given a board where humans are playing humans and only one MCTS profile exists
            const component: P4Component = testUtils.getGameComponent();
            component.aiConfig = {
                ...component.aiConfig,
                mcts: [component.aiConfig.mcts[0]],
            };
            testUtils.expectElementNotToExist('#ai-profile-select-0');
            testUtils.expectElementNotToExist('#ai-option-select-0');

            // When selecting MCTS for Player.ZERO
            testUtils.selectChildElementOfDropDown('#player-select-0', 'player-0-ai-mcts');

            // Then the config is selected implicitly and only the time bound is shown
            testUtils.expectElementNotToExist('#ai-profile-select-0');
            testUtils.expectElementToExist('#ai-option-select-0');
        }));

        it('should require profile selection for MCTS when multiple configs exist', fakeAsync(async() => {
            // Given a local wrapper with several MCTS profiles
            const wrapper: LocalGameWrapperComponent = testUtils.getWrapper() as LocalGameWrapperComponent;
            wrapper.playerSelection[0] = 'mcts';
            spyOn(wrapper as unknown as { getMCTSConfigs: () => unknown[] }, 'getMCTSConfigs').and.returnValue([
                { id: 'first', name: 'First' },
                { id: 'second', name: 'Second' },
            ]);

            // When checking if an AI profile must be selected
            const mustSelect: boolean = wrapper.mustSelectAIProfile(0);

            // Then the wrapper should require an explicit profile choice
            expect(mustSelect).toBeTrue();
        }));

        it('should reset AI profile to none when no profile is available', fakeAsync(async() => {
            // Given a local wrapper whose selected strategy has no available profile
            const wrapper: LocalGameWrapperComponent = testUtils.getWrapper() as LocalGameWrapperComponent;
            wrapper.playerSelection[0] = 'mcts';
            wrapper.aiProfiles[0] = 'some-profile';
            spyOn(wrapper, 'availableAIProfiles').and.returnValue([]);

            // When the player selection is applied
            await wrapper.updatePlayer(Player.ZERO);

            // Then the old profile should fall back to no profile
            expect(wrapper.aiProfiles[0]).toBe('none');
        }));

        it('should allow iterative deepening selection for minimax configs', fakeAsync(async() => {
            // Given a board where humans are playing humans
            testUtils.expectElementNotToExist('#ai-profile-select-0');
            testUtils.expectElementNotToExist('#ai-option-select-0');

            // When selecting iterative deepening for player ZERO
            testUtils.selectChildElementOfDropDown('#player-select-0', 'player-0-ai-iterative-deepening');
            testUtils.selectChildElementOfDropDown('#ai-profile-select-0', 'player-0-profile-alignment');

            // Then the available bound is time-based
            const selectedOption: HTMLSelectElement = testUtils.findElement('#ai-option-select-0').nativeElement;
            expect(selectedOption.options[1].label).toBe('1 seconds');
        }));

        it('should resolve the selected minimax player', fakeAsync(async() => {
            // Given a local wrapper
            const wrapper: LocalGameWrapperComponent = testUtils.getWrapper() as LocalGameWrapperComponent;

            // When selecting a minimax
            testUtils.selectChildElementOfDropDown('#player-select-0', 'player-0-ai-minimax');
            testUtils.selectChildElementOfDropDown('#ai-profile-select-0', 'player-0-profile-alignment');
            testUtils.selectChildElementOfDropDown('#ai-option-select-0', 'player-0-option-Level 1');

            // Then it should have selected the corresponding minimax AI
            const playingAI: MGPOptional<{ ai: AbstractAI; options: AIOptions }> = wrapper['getPlayingAI']();
            expect(playingAI.get().ai).toEqual(jasmine.any(Minimax));
            expect(playingAI.get().options).toEqual(jasmine.objectContaining({ name: 'Level 1', maxDepth: 1 }));
        }));

        it('should resolve the selected iterative deepening minimax player', fakeAsync(async() => {
            // Given a local wrapper
            const wrapper: LocalGameWrapperComponent = testUtils.getWrapper() as LocalGameWrapperComponent;
            spyOn(wrapper, 'proposeAIToPlay').and.resolveTo();

            // When selecting an iterative deepening minimax
            testUtils.selectChildElementOfDropDown('#player-select-0', 'player-0-ai-iterative-deepening');
            testUtils.selectChildElementOfDropDown('#ai-profile-select-0', 'player-0-profile-alignment');
            testUtils.selectChildElementOfDropDown('#ai-option-select-0', 'player-0-option-1 seconds');

            // Then it should have selected the corresponding iterative deepening minimax AI
            const playingAI: MGPOptional<{ ai: AbstractAI; options: AIOptions }> = wrapper['getPlayingAI']();
            expect(playingAI.get().ai).toEqual(jasmine.any(IterativeDeepeningMinimax));
            expect(playingAI.get().options).toEqual(jasmine.objectContaining({ name: '1 seconds', maxSeconds: 1 }));
        }));

        it('should resolve the selected MCTS player', fakeAsync(async() => {
            // Given a local wrapper
            const wrapper: LocalGameWrapperComponent = testUtils.getWrapper() as LocalGameWrapperComponent;
            spyOn(wrapper, 'proposeAIToPlay').and.resolveTo();

            // When selecting a MCTS
            testUtils.selectChildElementOfDropDown('#player-select-0', 'player-0-ai-mcts');
            chooseFirstAILevel(Player.ZERO);

            // Then it should have selected the corresponding MCTS
            const playingAI: MGPOptional<{ ai: AbstractAI; options: AIOptions }> = wrapper['getPlayingAI']();
            expect(playingAI.get().ai).toEqual(jasmine.any(MCTS));
            expect(playingAI.get().options).toEqual(jasmine.objectContaining({ name: '1 seconds', maxSeconds: 1 }));
        }));

        it('should hide AI configuration when selecting a human player', fakeAsync(async() => {
            // Given a configured minimax player
            testUtils.selectChildElementOfDropDown('#player-select-0', 'player-0-ai-minimax');
            testUtils.selectChildElementOfDropDown('#ai-profile-select-0', 'player-0-profile-alignment');
            testUtils.expectElementToExist('#ai-option-select-0');

            // When selecting a human
            testUtils.selectChildElementOfDropDown('#player-select-0', 'player-0-human');

            // Then no AI configuration is displayed
            testUtils.expectElementNotToExist('#ai-profile-select-0');
            testUtils.expectElementNotToExist('#ai-option-select-0');
        }));

        it('should have no AI profiles or options for a human player', fakeAsync(async() => {
            // Given a human player
            const wrapper: LocalGameWrapperComponent = testUtils.getWrapper() as LocalGameWrapperComponent;

            // Then the public template APIs provide no AI configuration
            expect(wrapper.availableAIProfiles(Player.ZERO.getValue())).toEqual([]);
            expect(wrapper.availableAIOptions(Player.ZERO.getValue())).toEqual([]);
        }));

        it('should name human player as Human', fakeAsync(async() => {
            // Given a wrapper
            const wrapper: LocalGameWrapperComponent = testUtils.getWrapper() as LocalGameWrapperComponent;

            // When setting player zero as human
            testUtils.selectChildElementOfDropDown('#player-select-0', 'player-0-human');

            // Then human players should be named explicitly
            expect(wrapper['getPlayerName'](0)).toBe('Human');
        }));

        it('should name minimax player by their profile', fakeAsync(async() => {
            // Given a wrapper
            const wrapper: LocalGameWrapperComponent = testUtils.getWrapper() as LocalGameWrapperComponent;

            // When setting player zero as minimax
            testUtils.selectChildElementOfDropDown('#player-select-0', 'player-0-ai-minimax');
            testUtils.selectChildElementOfDropDown('#ai-profile-select-0', 'player-0-profile-alignment');

            // Then human players should be named explicitly
            expect(wrapper['getPlayerName'](0)).toBe('Alignment');
        }));

        it('should preserve profile hash functions when creating minimaxes', fakeAsync(async() => {
            // Given P4's profile, which defines a custom hash for transposition tables
            const wrapper: LocalGameWrapperComponent = testUtils.getWrapper() as LocalGameWrapperComponent;
            const config: MinimaxConfig<P4Move, P4State, P4Config> =
                wrapper['getMinimaxConfig']('alignment').get() as MinimaxConfig<P4Move, P4State, P4Config>;
            const minimax: Minimax<P4Move, P4State, P4Config, unknown> =
                wrapper['createMinimax'](config) as Minimax<P4Move, P4State, P4Config, unknown>;
            const state: P4State = P4Rules.get().getInitialState(P4Rules.get().getDefaultRulesConfig());

            // When hashing a state through the generic minimax created from the profile
            const hash: string = minimax['hash'](state);

            // Then it should use the profile-provided hash
            expect(hash).toBe('__________________________________________');

            // And it should preserve player ownership in occupied cells
            const occupiedState: P4State = new P4State([
                [O, X, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
            ], 2);
            expect(minimax['hash'](occupiedState)).toBe('01________________________________________');
        }));

        it('should show level when non-human player is selected, and propose AI to play', fakeAsync(async() => {
            // Given any board

            // When selecting player zero as AI and letting it play
            const component: LocalGameWrapperComponent = testUtils.getWrapper() as LocalGameWrapperComponent;
            chooseAIOrHuman(Player.ZERO, 'minimax');
            spyOn(component, 'proposeAIToPlay').and.callThrough();
            chooseFirstAILevel(Player.ZERO);
            tick(LocalGameWrapperComponent.AI_TIMEOUT);

            // Then proposeAIToPlay should have been called, so that IA play
            expect(component.proposeAIToPlay).toHaveBeenCalledTimes(3);
            // Once per AI selector change, once after the AI move and check who is next
        }));

        it('should rotate the board when selecting AI as player zero', fakeAsync(async() => {
            // Given a board of a reversible component
            testUtils.getGameComponent().hasAsymmetricBoard = true;

            // When chosing the AI as player zero
            selectAIPlayer(Player.ZERO);

            // Then the board should have been rotated so that player one, the human, stays below
            const rotation: string = testUtils.getGameComponent().rotation;
            expect(rotation).toBe('rotate(180)');
            tick(LocalGameWrapperComponent.AI_TIMEOUT);
        }));

        it('should de-rotate the board when selecting human as player zero again', fakeAsync(async() => {
            // Given a board of a reversible component, where AI is player zero
            testUtils.getGameComponent().hasAsymmetricBoard = true;
            selectAIPlayer(Player.ZERO);
            tick(LocalGameWrapperComponent.AI_TIMEOUT);

            // When chosing the human as player zero again
            chooseAIOrHuman(Player.ZERO, 'human');

            // Then the board should have been rotated so that player zero is below again
            const rotation: string = testUtils.getGameComponent().rotation;
            expect(rotation).toBe('rotate(0)');
        }));

        it('should not let a previously selected AI play after changing it to human', fakeAsync(async() => {
            // Given an AI whose move has been scheduled
            selectAIPlayer(Player.ZERO);

            // When changing that player to human before the AI timeout expires
            chooseAIOrHuman(Player.ZERO, 'human');
            tick(LocalGameWrapperComponent.AI_TIMEOUT);

            // Then the stale AI callback should not advance the displayed turn
            expectTurnToBe(0);
        }));

        it('should propose AI to play when restarting game', fakeAsync(async() => {
            const wrapper: LocalGameWrapperComponent = testUtils.getWrapper() as LocalGameWrapperComponent;
            wrapper.players[0] = MGPOptional.of('minimax');
            wrapper.playerSelection[0] = 'minimax';
            wrapper.aiProfiles[0] = 'alignment';
            wrapper.aiOptions[0] = 'Level 1';

            const proposeAIToPlay: jasmine.Spy = spyOn(wrapper, 'proposeAIToPlay').and.callThrough();

            await testUtils.expectInterfaceClickSuccess('#restart-button');
            tick(0);

            expect(proposeAIToPlay).toHaveBeenCalledTimes(1);
            tick(LocalGameWrapperComponent.AI_TIMEOUT);
        }));

        it('should propose AI 2 to play when selecting her just before her turn', fakeAsync(async() => {
            // Given wrapper on which a first move have been done
            await testUtils.expectMoveSuccess('#click-4-0', P4Move.of(4));
            // When clicking on AI then its level
            testUtils.selectChildElementOfDropDown('#player-select-1', 'player-1-ai-minimax');
            const localGameWrapper: LocalGameWrapperComponent = testUtils.getWrapper() as LocalGameWrapperComponent;
            spyOn(localGameWrapper, 'proposeAIToPlay').and.callThrough();
            const gameComponent: AbstractGameComponent = testUtils.getGameComponent();
            spyOn(gameComponent, 'hideLastMove').and.callThrough();
            expect(gameComponent.getState().turn)
                .withContext('after we did one move')
                .toEqual(1);
            testUtils.selectChildElementOfDropDown('#ai-profile-select-1', 'player-1-profile-alignment');
            testUtils.selectChildElementOfDropDown('#ai-option-select-1', 'player-1-option-Level 1');
            tick(LocalGameWrapperComponent.AI_TIMEOUT);

            // Then it should have proposed AI to play
            expect(localGameWrapper.proposeAIToPlay).toHaveBeenCalledTimes(3);
            // And hideLastMove should have been called once per pending AI proposal
            expect(gameComponent.hideLastMove).toHaveBeenCalledTimes(3);
            expect(gameComponent.getState().turn)
                .withContext('after AI did her move')
                .toEqual(2);
        }));

        it('AI proposing illegal move should log error and show it to the user', fakeAsync(async() => {
            spyOn(Utils, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
            // Given a board and a buggy AI (that performs an illegal move)
            const localGameWrapper: LocalGameWrapperComponent = testUtils.getWrapper() as LocalGameWrapperComponent;
            spyOn(testUtils.getGameComponent().rules, 'choose').and.returnValue(MGPFallible.failure('illegal'));
            const minimax: Minimax<P4Move, P4State, P4Config> =
                new Minimax($localize`Minimax`,
                            P4Rules.get(),
                            new P4Heuristic(),
                            new P4OrderedMoveGenerator());
            spyOn(minimax, 'chooseNextMove').and.returnValue(P4Move.of(0));

            // When it is the turn of the bugged AI
            const aiOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
            const message: string = 'The AI chose an illegal move! This is an unexpected situation that we logged, we will try to solve this as soon as possible. In the meantime, consider that you won!';
            const result: MGPValidation = await testUtils.expectToDisplayCriticalMessage(message, async() => {
                return localGameWrapper.doAIMove(minimax, aiOptions);
            });

            // Then it should fail and an error should be logged
            expect(result.isFailure()).toBeTrue();
            const errorMessage: string = 'AI chose illegal move';
            const errorData: JSONValue = { game: 'P4', name: 'Minimax', move: 'P4Move(0)', reason: 'illegal' };
            expect(Utils.logError).toHaveBeenCalledWith('LocalGameWrapper', errorMessage, errorData);
        }));

        it('should not do an AI move when the game is finished', fakeAsync(async() => {
            const localGameWrapper: LocalGameWrapperComponent = testUtils.getWrapper() as LocalGameWrapperComponent;
            spyOn(localGameWrapper, 'doAIMove').and.callThrough();

            // Given a game which is finished
            spyOn(testUtils.getGameComponent().rules, 'getGameStatus').and.returnValue(GameStatus.ZERO_WON);

            // When selecting an AI for the current player
            testUtils.selectChildElementOfDropDown('#player-select-0', 'player-0-ai-minimax');
            testUtils.selectChildElementOfDropDown('#ai-profile-select-0', 'player-0-profile-alignment');
            testUtils.selectChildElementOfDropDown('#ai-option-select-0', 'player-0-option-Level 1');

            // Then it should not try to play
            expect(localGameWrapper.doAIMove).not.toHaveBeenCalled();
        }));

        it('should reject human move if it tries to play when it is not its turn', fakeAsync(async() => {
            // Given a game against an AI
            const wrapper: LocalGameWrapperComponent = testUtils.getWrapper() as LocalGameWrapperComponent;
            wrapper.players[0] = MGPOptional.of('minimax');
            wrapper.playerSelection[0] = 'minimax';
            wrapper.aiProfiles[0] = 'alignment';
            wrapper.aiOptions[0] = 'Level 1';

            // When trying to click
            // Then it should fail
            await testUtils.expectClickFailure('#click-3-0', GameWrapperMessages.NOT_YOUR_TURN());
        }));

        it('should display AI info when parameter is set to true', fakeAsync(async() => {
            // Given a component where we want to show the AI metrics in the middle of a part
            localStorage.setItem('displayAIInfo', 'true');
            await testUtils.expectMoveSuccess('#click-4-0', P4Move.of(4));

            // When displaying it
            testUtils.detectChanges();

            // Then the AI metrics are shown
            testUtils.expectElementToExist('#ai-info');
            localStorage.clear();
        }));

    });

    describe('winner indicator', () => {

        const preVictoryBoard: PlayerOrNone[][] = [
            [O, O, O, _, _, O, O],
            [X, X, O, _, O, X, X],
            [O, O, X, _, X, X, O],
            [X, X, X, O, O, X, X],
            [O, O, X, O, X, O, O],
            [X, X, O, O, X, X, X],
        ];
        it(`should display 'Player <N> won' when human vs human victory`, fakeAsync(async() => {
            // Given a Human-vs-human board where victory is imminent
            const state: P4State = new P4State(preVictoryBoard, 40);
            await testUtils.setupState(state);

            // When player zero does the winning move
            await testUtils.expectMoveSuccess('#click-3-0', P4Move.of(3));

            // Then 'Player 0 won' should be displayed
            const winnerTag: string = testUtils.findElement('#winner').nativeElement.innerHTML;
            expect(winnerTag).toBe('Player 1 won');
        }));

        it(`should display 'You Lost' when human lose against AI`, fakeAsync(async() => {
            // Given a board where victory is imminent for AI
            const board: PlayerOrNone[][] = [
                [O, O, O, _, _, O, O],
                [X, X, O, _, O, X, X],
                [O, O, X, _, X, X, O],
                [X, X, X, O, O, X, X],
                [O, O, X, O, X, O, O],
                [X, X, O, O, X, X, X],
            ];
            const state: P4State = new P4State(board, 37);
            await testUtils.setupState(state);
            await testUtils.expectMoveSuccess('#click-4-0', P4Move.of(4));

            // When selecting AI, and AI then doing winning move
            selectAIPlayer(Player.ZERO);
            tick(LocalGameWrapperComponent.AI_TIMEOUT);

            // Then 'You lost' should be displayed
            const winnerTag: string = testUtils.findElement('#winner').nativeElement.innerHTML;
            expect(winnerTag).toBe('You lost');
        }));

        it(`should display 'You won' when human wins against AI`, fakeAsync(async() => {
            // Given a board where victory is imminent for human (against AI)
            const state: P4State = new P4State(preVictoryBoard, 39);
            await testUtils.setupState(state);
            selectAIPlayer(Player.ZERO);

            // When user does the winning move
            await testUtils.expectMoveSuccess('#click-3-0', P4Move.of(3));

            // Then 'You won' should be displayed
            const winnerTag: string = testUtils.findElement('#winner').nativeElement.innerHTML;
            expect(winnerTag).toBe('You won');
        }));

        it(`should display '<AI name> (Player <N>) Win' when AI fight AI`, fakeAsync(async() => {
            // Given a board where victory is imminent for AI zero
            const board: PlayerOrNone[][] = [
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, O, _, _, _],
                [_, _, _, O, _, _, _],
                [_, _, X, X, X, _, _],
            ];
            const state: P4State = new P4State(board, 40);
            await testUtils.setupState(state);
            selectAIPlayer(Player.ZERO);
            tick(LocalGameWrapperComponent.AI_TIMEOUT);

            // When AI zero does the winning move
            selectAIPlayer(Player.ONE);
            tick(LocalGameWrapperComponent.AI_TIMEOUT);

            // Then 'AI (Player 0) won' should be displayed
            const winnerTag: string = testUtils.findElement('#winner').nativeElement.innerHTML;
            expect(winnerTag).toBe('Alignment (Player 2) won');
        }));

    });

    describe('onCancelMove', () => {
        it('should showLastMove when there is one', fakeAsync(async() => {
            // Given a component with a last move
            const component: P4Component = testUtils.getGameComponent();
            await testUtils.expectMoveSuccess('#click-4-0', P4Move.of(4));
            spyOn(component, 'showLastMove').and.callThrough();

            // When calling onCancelMove
            await testUtils.getWrapper().onCancelMove();

            // Then showLastMove should have been called
            expect(component.showLastMove).toHaveBeenCalledOnceWith(P4Move.of(4));
        }));

        it('should not showLastMove when there is none', fakeAsync(async() => {
            // Given a component with a last move
            const component: P4Component = testUtils.getGameComponent();
            spyOn(component, 'showLastMove').and.callThrough();

            // When calling onCancelMove
            await testUtils.getWrapper().onCancelMove();

            // Then showLastMove should not have been called
            expect(component.showLastMove).not.toHaveBeenCalled();
        }));

    });

    describe('Take Back', () => {
        it('should take back one turn when human move has been made', fakeAsync(async() => {
            // Given a board with a move already done
            const state: P4State = testUtils.getGameComponent().getState();
            expect(state.turn).toBe(0);

            await testUtils.expectMoveSuccess('#click-4-0', P4Move.of(4));
            expectTurnToBe(1);

            // When taking back
            spyOn(testUtils.getGameComponent(), 'updateBoard').and.callThrough();
            await testUtils.expectInterfaceClickSuccess('#take-back');

            // Then we should be back on turn 0 and board should have been updated
            expectTurnToBe(0);
            expect(testUtils.getGameComponent().updateBoard).toHaveBeenCalledTimes(1);
        }));

        it('should take back two turns when playing against AI', fakeAsync(async() => {
            // Given a game component on which you play against IA, at turn N+2, and it's human turn
            await testUtils.expectMoveSuccess('#click-3-0', P4Move.of(3));
            await testUtils.expectMoveSuccess('#click-3-0', P4Move.of(3));
            selectAIPlayer(Player.ONE);
            expectTurnToBe(2);

            // When user take back
            await testUtils.expectInterfaceClickSuccess('#take-back');

            // Then it should take back to user turn, hence back to turn N
            expectTurnToBe(0);
        }));

        it('should not allow to take back when only AI move has been made', fakeAsync(async() => {
            // Given a board with the first move made by AI
            selectAIPlayer(Player.ZERO);
            tick(LocalGameWrapperComponent.AI_TIMEOUT);
            expectTurnToBe(1);

            // When searching for takeBack button
            // Then it should not be visible
            testUtils.expectElementNotToExist('#take-back');
        }));

        it('should not allow to take back when no move has been made', fakeAsync(async() => {
            // Given a board with no move done

            // When searching for takeBack button
            // Then it should not be visible
            testUtils.expectElementNotToExist('#take-back');
        }));

        it('should cancelMoveAttempt when taking back', fakeAsync(async() => {
            // Given a board where a move could be in construction
            await testUtils.expectMoveSuccess('#click-4-0', P4Move.of(4));

            // When calling take back
            const component: P4Component = testUtils.getGameComponent();
            spyOn(component, 'cancelMoveAttempt').and.callThrough();
            await testUtils.expectInterfaceClickSuccess('#take-back');

            // Then gameComponent.cancelMoveAttempt should have been called
            // And hence the potentially move in construction undone from the board
            expect(component.cancelMoveAttempt).toHaveBeenCalledOnceWith();
        }));

        it('should not allow to take back when AI vs. AI', fakeAsync(async() => {
            // Given a board on which AI plays against AI
            selectAIPlayer(Player.ZERO);
            expect(testUtils.getGameComponent().getState().turn).toBe(0);
            testUtils.expectElementNotToExist('#take-back');
            tick( LocalGameWrapperComponent.AI_TIMEOUT);
            expect(testUtils.getGameComponent().getState().turn).toBe(1);
            testUtils.expectElementNotToExist('#take-back');

            // When searching for takeBack button
            // Then it should not be visible
            selectAIPlayer(Player.ONE);
            tick(LocalGameWrapperComponent.AI_TIMEOUT);
            expect(testUtils.getGameComponent().getState().turn).toBe(2);
            testUtils.expectElementNotToExist('#take-back');
            // deactivate AI to stop timeout generation
            tick(40 * LocalGameWrapperComponent.AI_TIMEOUT);
        }));

    });

    describe('view', () => {

        it('should highlight board in player 0 color when it is player 0 turn', () => {
            // Given a game which is initially interactive
            expect(testUtils.getGameComponent().isInteractive()).toBeTrue();

            // Then the game should have background for player 0
            testUtils.expectElementToHaveClass('#board-highlight', 'player0-bg');
        });

        it('should highlight board in player 1 color when it is player 1 turn', fakeAsync(async() => {
            // Given a game which is initially interactive and it is Player.ONE's turn
            expect(testUtils.getGameComponent().isInteractive()).toBeTrue();
            await testUtils.expectMoveSuccess('#click-4-0', P4Move.of(4));

            // Then the game should have background for player 1
            testUtils.expectElementToHaveClass('#board-highlight', 'player1-bg');
        }));

    });

    describe('game tree visualisation', () => {
        beforeEach(() => {
            GameNode.ID = 0; // To start counting at 0 for each test
        });

        it('should show game tree from current node when clicking on the corresponding button', fakeAsync(async() => {
            spyOn(window, 'open').and.returnValue(null);
            // Given the component with AI infos enabled and at least one turn played
            localStorage.setItem('displayAIInfo', 'true');
            await testUtils.expectMoveSuccess('#click-4-0', P4Move.of(4));
            // When clicking on "view tree from current node"
            await testUtils.clickElement('#viewTreeFromCurrentNode');
            // Then it should open an external URL
            const dot: string = `digraph G {
    node_0 [label="#1: 0 - ", style=filled, fillcolor="white"];
}`;
            const expectedURL: string = 'https://dreampuf.github.io/GraphvizOnline/#' + encodeURI(dot);
            expect(window.open).toHaveBeenCalledOnceWith(expectedURL);
        }));

        it('should show MCTS info when playing against MCTS', fakeAsync(async() => {
            // We need to mock time because MCTS relies on Date.now increasing
            let time: number = Date.now();
            function increaseAndReturnTime(): number {
                time += 10; // increase time by 10ms each time
                return time;
            }
            spyOn(Date, 'now').and.callFake(increaseAndReturnTime);
            // We need to mock randomness because MCTS relies on randomness
            function getFirstElement<T>(array: T[]): T {
                return array[0];
            }
            spyOn(ArrayUtils, 'getRandomElement').and.callFake(getFirstElement);
            spyOn(window, 'open').and.returnValue(null);
            // Given the component with AI infos enabled and MCTS played
            localStorage.setItem('displayAIInfo', 'true');
            chooseAIOrHuman(Player.ZERO, 'mcts');
            chooseFirstAILevel(Player.ZERO);
            tick(LocalGameWrapperComponent.AI_TIMEOUT);
            // When clicking on "view tree from current node"
            await testUtils.clickElement('#viewTreeFromCurrentNode');
            // Then it should open an external URL
            const dot: string = `digraph G {
    node_0 [label="#1: 0 - 1/1 = 100%", style=filled, fillcolor="white"];
}`;
            const expectedURL: string = 'https://dreampuf.github.io/GraphvizOnline/#' + encodeURI(dot);
            expect(window.open).toHaveBeenCalledOnceWith(expectedURL);
        }));

        it('should show game tree from previous node when clicking on the corresponding button', fakeAsync(async() => {
            spyOn(window, 'open').and.returnValue(null);
            // Given the component with AI infos enabled and at least one turn played
            localStorage.setItem('displayAIInfo', 'true');
            await testUtils.expectMoveSuccess('#click-4-0', P4Move.of(4));
            await testUtils.expectMoveSuccess('#click-4-0', P4Move.of(4));
            // When clicking on "view tree from previous node"
            await testUtils.clickElement('#viewTreeFromPreviousNode');
            // Then it should open an external URL
            const dot: string = `digraph G {
    node_0 [label="#1: 0 - ", style=filled, fillcolor="white"];
}`;
            const expectedURL: string = 'https://dreampuf.github.io/GraphvizOnline/#' + encodeURI(dot);
            expect(window.open).toHaveBeenCalledOnceWith(expectedURL);
        }));

        afterEach(() => {
            localStorage.removeItem('displayAIInfo');
        });
    });
});
