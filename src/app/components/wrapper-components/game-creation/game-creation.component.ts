import { NgIf, NgFor, NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, Signal, inject, viewChild, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MGPOptional, Utils } from '@everyboard/lib';

import { FirstPlayer, ConfigRoom, GameType, GameDuration, Status } from '../../../domain/ConfigRoom';
import { MinimalUser } from '../../../domain/MinimalUser';
import { AbstractNode, GameNode } from '../../../jscaip/AI/GameNode';
import { RulesConfig } from '../../../jscaip/RulesConfigUtil';
import { GameState } from '../../../jscaip/state/GameState';
import { HumanDurationPipe } from '../../../pipes-and-directives/human-duration.pipe';
import { ConfigRoomService } from '../../../services/ConfigRoomService';
import { AuthUser, ConnectedUserService } from '../../../services/ConnectedUserService';
import { MessageDisplayer } from '../../../services/MessageDisplayer';
import { Debug } from '../../../utils/Debug';
import { Localized } from '../../../utils/LocaleUtils';
import { BaseWrapperComponent } from '../BaseWrapperComponent';
import { DemoNodeInfo, DemoCardWrapperComponent } from '../demo-card-wrapper/demo-card-wrapper.component';
import { RulesConfigDescription } from '../rules-configuration/RulesConfigDescription';
import { RulesConfigurationComponent } from '../rules-configuration/rules-configuration.component';

export class GameCreationComponentMessages {

    public static readonly GAME_DOES_NOT_EXIST_OR_UNKNOWN: Localized = () => $localize`The game you tried to join does not exist. Its config room may have existed in the past, but its creator left before the game actually started.`;
}

type GameCreationViewInfo = {
    userIsCreator: boolean;
    showCustomTime?: boolean;
    canEditConfig?: boolean;
    canProposeConfig?: boolean;
    canReviewConfig?: boolean;

    userIsChosenOpponent: boolean;
    creatorIsModifyingConfig?: boolean;
    userIsObserver: boolean;

    creator?: string;
    firstPlayer: FirstPlayer;
    firstPlayerClasses: { [key: string]: string[] },
    gameType: GameType;
    gameTypeClasses: { [key: string]: string[] },
    gameTypeName?: string,
    moveDuration?: number;
    gameDuration?: number;
    candidates: string[];
    chosenOpponent?: string;
    candidateClasses: { [key: string]: string[] },
}
@Component({
    selector: 'app-game-creation',
    templateUrl: './game-creation.component.html',
    imports: [NgIf, ReactiveFormsModule, NgFor, NgClass, RulesConfigurationComponent,
        DemoCardWrapperComponent, HumanDurationPipe],
})
@Debug.log
export class GameCreationComponent extends BaseWrapperComponent implements OnInit, OnDestroy {

    private readonly router: Router = inject(Router);
    private readonly connectedUserService: ConnectedUserService = inject(ConnectedUserService);
    private readonly configRoomService: ConfigRoomService = inject(ConfigRoomService);
    private readonly formBuilder: FormBuilder = inject(FormBuilder);
    private readonly messageDisplayer: MessageDisplayer = inject(MessageDisplayer);
    private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

    /*
     * Lifecycle:
     * 1. Creator chooses config and opponent
     * 2. Creator click on "proposing the config"
     * 3a. Chosen opponent accepts the config -> game starts
     * 3b. Creator clicks on "modifying config" -> back to 1, with the current config and opponent
     *
     * PageCreationComponent is always a child of OnlineGame component (one to one)
     * they need common data so that the parent calculates/retrieves the data then share it
     * with the game creation component
     */
    public GameType: typeof GameType = GameType;
    public GameDuration: typeof GameDuration = GameDuration;
    public FirstPlayer: typeof FirstPlayer = FirstPlayer;

    public readonly gameId: InputSignal<string> = input.required<string>();

    public readonly rulesConfigDescription: InputSignal<MGPOptional<RulesConfigDescription<RulesConfig>>> =
        input.required<MGPOptional<RulesConfigDescription<RulesConfig>>>();

    // notify that the game has started, a thing evaluated with the configRoom doc game status
    public readonly gameStartNotification: OutputEmitterRef<ConfigRoom> = output<ConfigRoom>();

    public readonly rulesConfigurationComponent: Signal<RulesConfigurationComponent | undefined> =
        viewChild(RulesConfigurationComponent);

    public gameStarted: boolean = false;

    public viewInfo: GameCreationViewInfo = {
        userIsCreator: false,
        userIsChosenOpponent: false,
        userIsObserver: false,
        gameType: GameType.STANDARD,
        gameTypeClasses: { 'Standard': ['is-selected', 'is-primary'], 'Blitz': [], 'Custom': [] },
        firstPlayer: FirstPlayer.RANDOM,
        firstPlayerClasses: { 'Creator': [], 'Random': ['is-selected', 'is-primary'], 'ChosenOpponent': [] },
        candidateClasses: {},
        candidates: [],
    };
    public currentConfigRoom: ConfigRoom | null = null;
    public candidates: MinimalUser[] = [];

    // Subscription
    private readonly ngUnsubscribe: Subject<void> = new Subject<void>();

    private configRoomSubscription: Subscription = new Subscription();

    private navigateThereAfterGameCanceled: string[] = ['/lobby'];

    public configFormGroup: FormGroup;

    public allDocDeleted: boolean = false;

    // Provided by RulesConfigurationComponent
    protected rulesConfig: MGPOptional<RulesConfig> = MGPOptional.empty();

    public configDemo: DemoNodeInfo | undefined = undefined;

    public async ngOnInit(): Promise<void> {
        this.checkInputs();
        this.createForms();
        await this.joinAndSubscribeToConfigRoom();
        this.subscribeToFormElements();
    }

    private checkInputs(): void {
        const user: MGPOptional<AuthUser> = this.connectedUserService.user;
        Utils.assert(user.isPresent(), 'GameCreationComponent should not be called without connected user');
        Utils.assert(user.get() !== AuthUser.NOT_CONNECTED, 'GameCreationComponent should not be created with an empty userName');
        Utils.assert(this.gameId() !== '', 'GameCreationComponent should not be created with an empty gameId');
    }

    private createForms(): void {
        this.configFormGroup = this.formBuilder.group({
            firstPlayer: [FirstPlayer.RANDOM, Validators.required],
            moveDuration: [GameDuration.STANDARD_MOVE_DURATION, Validators.required],
            gameDuration: [GameDuration.STANDARD_GAME_DURATION, Validators.required],
            gameType: [GameType.STANDARD, Validators.required],
            chosenOpponent: ['', Validators.required],
        });
    }

    private async joinAndSubscribeToConfigRoom(): Promise<void> {
        this.configRoomSubscription = await this.configRoomService.join(
            this.gameId(),
            (configRoom: ConfigRoom): Promise<void> => this.onConfigRoomUpdate(configRoom),
            (): Promise<void> => this.onGameCancelled(),
            (candidate: MinimalUser): void => this.onCandidateJoined(candidate),
            (candidate: MinimalUser): void => this.onCandidateLeft(candidate),
            (error: string): void => void this.onError(error),
        );
    }

    private async onError(error: string): Promise<void> {
        switch (error) {
            case 'already-subscribed':
                this.messageDisplayer.criticalMessage($localize`You already have another tab open.`);
                await this.router.navigate(['/']);
                break;
            case 'unknown-game':
            case 'game-does-not-exist':
                const message: string = GameCreationComponentMessages.GAME_DOES_NOT_EXIST_OR_UNKNOWN();
                await this.router.navigate(['/notFound', message], { skipLocationChange: true } );
                break;
            default:
                this.messageDisplayer.criticalMessage($localize`Unexpected error from backend: ${error}`);
                await this.router.navigate(['/']);
                break;
        }
    }

    private async onGameCancelled(): Promise<void> {
        this.messageDisplayer.infoMessage($localize`The game has been cancelled.`);
        await this.router.navigate(['/']);
    }

    private getForm(name: string): AbstractControl {
        return Utils.getNonNullable(this.configFormGroup.get(name));
    }

    private subscribeToFormElements(): void {
        this.getForm('chosenOpponent').valueChanges
            .pipe(takeUntil(this.ngUnsubscribe)).subscribe((opponent: string) => {
                if (this.viewInfo.chosenOpponent !== undefined) {
                    this.viewInfo.candidateClasses[this.viewInfo.chosenOpponent] = [];
                }
                this.viewInfo.candidateClasses[opponent] = ['is-selected'];
                this.viewInfo.chosenOpponent = opponent;
                const status: Status = Utils.getNonNullable(this.currentConfigRoom).status;
                const configProposed: boolean = status === Status.CONFIG_PROPOSED;
                this.viewInfo.canProposeConfig = configProposed === false && opponent !== '';
                if (this.rulesConfigurationComponent() != null) {
                    this.rulesConfigurationComponent()!.setEditable(configProposed === false);
                }
            });
        this.getForm('gameType').valueChanges
            .pipe(takeUntil(this.ngUnsubscribe)).subscribe((gameType: GameType) => {
                this.viewInfo.gameTypeClasses[this.viewInfo.gameType] = [];
                this.viewInfo.gameTypeClasses[gameType] = ['is-primary', 'is-selected'];
                this.viewInfo.gameType = gameType;
                this.viewInfo.showCustomTime = gameType === GameType.CUSTOM;
            });
        this.getForm('moveDuration').valueChanges
            .pipe(takeUntil(this.ngUnsubscribe)).subscribe((moveDuration: number) => {
                this.viewInfo.moveDuration = moveDuration;
            });
        this.getForm('gameDuration').valueChanges
            .pipe(takeUntil(this.ngUnsubscribe)).subscribe((gameDuration: number) => {
                this.viewInfo.gameDuration = gameDuration;
            });
        this.getForm('firstPlayer').valueChanges
            .pipe(takeUntil(this.ngUnsubscribe)).subscribe((firstPlayer: FirstPlayer) => {
                this.viewInfo.firstPlayerClasses[this.viewInfo.firstPlayer] = [];
                this.viewInfo.firstPlayerClasses[firstPlayer] = ['is-primary', 'is-selected'];
                this.viewInfo.firstPlayer = firstPlayer;
            });
    }

    private updateViewInfo(configRoom: ConfigRoom): void {
        const authUser: AuthUser = this.connectedUserService.user.get();

        this.viewInfo.canReviewConfig = configRoom.status === Status.CONFIG_PROPOSED;
        this.viewInfo.canEditConfig = configRoom.status !== Status.CONFIG_PROPOSED;
        this.viewInfo.userIsCreator = this.userIsCreator(configRoom);
        this.viewInfo.userIsChosenOpponent = authUser.id === configRoom.chosenOpponent?.id;
        this.viewInfo.userIsObserver =
                this.viewInfo.userIsChosenOpponent === false && this.viewInfo.userIsCreator === false;
        this.viewInfo.creatorIsModifyingConfig = configRoom.status !== Status.CONFIG_PROPOSED;
        this.viewInfo.showCustomTime = this.getForm('gameType').value === GameType.CUSTOM;

        this.viewInfo.creator = configRoom.creator.name;
        this.viewInfo.candidates = this.candidates.map((candidate: MinimalUser) => candidate.name);
        if (this.userIsCreator(configRoom)) {
            this.setDataForCreator(configRoom);
        } else {
            this.viewInfo.moveDuration = configRoom.moveDuration;
            this.viewInfo.gameDuration = configRoom.gameDuration;
            this.viewInfo.gameType = configRoom.gameType;
            this.viewInfo.chosenOpponent = configRoom.chosenOpponent?.name;
            this.viewInfo.firstPlayer = configRoom.firstPlayer;
        }
        switch (configRoom.gameType) {
            case GameType.CUSTOM:
                this.viewInfo.gameTypeName = $localize`custom`;
                break;
            case GameType.BLITZ:
                this.viewInfo.gameTypeName = $localize`blitz`;
                break;
            case GameType.STANDARD:
                this.viewInfo.gameTypeName = $localize`standard`;
                break;
        }
        this.cdr.detectChanges();
    }

    private setDataForCreator(configRoom: ConfigRoom): void {
        this.viewInfo.moveDuration = this.viewInfo.moveDuration ?? configRoom.moveDuration;
        this.viewInfo.gameDuration = this.viewInfo.gameDuration ?? configRoom.gameDuration;
        let opponent: string | undefined = this.viewInfo.chosenOpponent;
        if (opponent == null || opponent === '') {
            opponent = configRoom.chosenOpponent?.name ?? '';
        } else {
            const chosenOpponentIsCandidate: boolean = this.candidates.some((minimalUser: MinimalUser) => {
                return minimalUser.name === opponent;
            });
            if (chosenOpponentIsCandidate === false) {
                opponent = ''; // chosenOpponent left
            }
        }
        this.getForm('chosenOpponent').setValue(opponent);
    }

    public selectFirstPlayer(firstPlayer: FirstPlayer): void {
        this.getForm('firstPlayer').setValue(firstPlayer);
    }

    public selectGameType(gameType: GameType): void {
        if (gameType === GameType.STANDARD) {
            this.getForm('moveDuration').setValue(GameDuration.STANDARD_MOVE_DURATION);
            this.getForm('gameDuration').setValue(GameDuration.STANDARD_GAME_DURATION);
        } else if (gameType === GameType.BLITZ) {
            this.getForm('moveDuration').setValue(GameDuration.BLITZ_MOVE_DURATION);
            this.getForm('gameDuration').setValue(GameDuration.BLITZ_GAME_DURATION);
        }
        this.getForm('gameType').setValue(gameType);
    }

    public async selectOpponent(opponentName: string): Promise<void> {
        const opponent: MinimalUser = this.getUserFromName(opponentName);
        return this.configRoomService.selectOpponent(opponent);
    }

    private getUserFromName(username: string): MinimalUser {
        const user: MinimalUser | undefined = this.candidates.find((c: MinimalUser) => c.name === username);
        return Utils.getNonNullable(user);
    }

    public async changeConfig(): Promise<void> {
        return this.configRoomService.reviewConfig();
    }

    public async proposeConfig(): Promise<void> {
        const gameType: string = this.getForm('gameType').value;
        const moveDuration: number = this.getForm('moveDuration').value;
        const firstPlayer: string = this.getForm('firstPlayer').value;
        const gameDuration: number = this.getForm('gameDuration').value;
        return this.configRoomService.proposeConfig({
            gameType: gameType as GameType,
            firstPlayer: firstPlayer as FirstPlayer,
            moveDuration,
            gameDuration,
            rulesConfig: this.rulesConfig.getOrElse({}),
        });
    }

    public async cancelGameCreation(): Promise<void> {
        this.allDocDeleted = true;
        return this.onGameCanceled();
    }

    private async onConfigRoomUpdate(configRoom: ConfigRoom): Promise<void> {
        const oldConfigRoom: ConfigRoom | null = this.currentConfigRoom;
        this.currentConfigRoom = configRoom;
        if (configRoom.rulesConfig !== null) {
            // Not null means that there was already a rule config saved in the config room
            this.onRulesConfigUpdate(MGPOptional.of(configRoom.rulesConfig));
        }
        if (this.chosenOpponentJustLeft(oldConfigRoom, configRoom) &&
            this.userIsCreator(configRoom))
        {
            const userName: string = Utils.getNonNullable(oldConfigRoom?.chosenOpponent).name;
            this.messageDisplayer.infoMessage($localize`${userName} left the game, please pick another opponent.`);
        }
        this.updateViewInfo(configRoom);
        if (this.isGameStarted(configRoom)) {
            Debug.display('GameCreationComponent', 'onCurrentConfigRoomUpdate', 'the game has started');
            this.onGameStarted();
        }
    }

    private onCandidateJoined(candidate: MinimalUser): void {
        this.candidates.push(candidate);
        this.updateViewInfo(Utils.getNonNullable(this.currentConfigRoom));
    }

    private onCandidateLeft(candidate: MinimalUser): void {
        this.candidates = this.candidates.filter((c: MinimalUser) => c.id !== candidate.id);
        this.updateViewInfo(Utils.getNonNullable(this.currentConfigRoom));
    }

    private chosenOpponentJustLeft(oldConfigRoom: ConfigRoom | null, newConfigRoom: ConfigRoom): boolean {
        if (oldConfigRoom == null) {
            return false;
        } else {
            const thereWasAChosenOpponent: boolean = oldConfigRoom.chosenOpponent != null;
            const thereIsNoLongerChosenOpponent: boolean = newConfigRoom.chosenOpponent == null;
            return thereWasAChosenOpponent && thereIsNoLongerChosenOpponent;
        }
    }

    private async onGameCanceled(): Promise<void> {
        this.messageDisplayer.infoMessage($localize`The game has been canceled!`);
        await this.router.navigate(this.navigateThereAfterGameCanceled);
    }

    private isGameStarted(configRoom: ConfigRoom | null): boolean {
        Utils.assert(configRoom != null, 'configRoom should not be null (isGameStarted)');
        const status: Status = Utils.getNonNullable(configRoom).status;
        return status === Status.STARTED || status === Status.FINISHED;
    }

    private onGameStarted(): void {
        const configRoom: ConfigRoom = Utils.getNonNullable(this.currentConfigRoom);

        this.gameStartNotification.emit(configRoom);
        this.gameStarted = true;
    }

    private userIsCreator(configRoom: ConfigRoom): boolean {
        const currentUserId: string = this.connectedUserService.user.get().id;
        return currentUserId === configRoom.creator.id;
    }

    public acceptConfig(): Promise<void> {
        // called by the configRoom
        // triggers the redirection that will be applied for every subscribed user
        return this.configRoomService.acceptConfig();
    }

    // Only public because of tests
    public onRulesConfigUpdate(rulesConfig: MGPOptional<RulesConfig>): void {
        this.rulesConfig = rulesConfig;
        if (this.rulesConfig.isPresent()) {
            this.setConfigDemo(this.rulesConfig.get());
        }
    }

    private setConfigDemo(config: RulesConfig): void {
        const stateProvider: MGPOptional<(config: MGPOptional<RulesConfig>) => GameState> = this.getStateProvider();
        if (stateProvider.isPresent()) {
            const state: GameState = stateProvider.get()(MGPOptional.of(config));
            const node: AbstractNode = new GameNode(state);
            this.configDemo = {
                click: MGPOptional.empty(),
                name: this.getGameUrlName(),
                title: this.getGameUrlName(),
                node,
            };
            this.cdr.detectChanges();
        }
    }

    public getConfigDemo(): DemoNodeInfo | undefined {
        return this.configDemo;
    }

    public async ngOnDestroy(): Promise<void> {
        // This will unsubscribe from all observables
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();

        // Unsubscribe from the config room and candidates
        // This will cause the backend to deal with game/config-room destruction if needed
        this.configRoomSubscription.unsubscribe();
    }

    public async goToLobby(): Promise<void> {
        await this.cancelGameCreation(); // game cancelation will go to /lobby
    }

    public async playLocally(): Promise<void> {
        const urlName: string = this.getGameUrlName();
        this.navigateThereAfterGameCanceled = ['/local', urlName, 'config'];
        await this.cancelGameCreation();
    }

    public getRulesConfigToDisplay(): RulesConfig | undefined {
        return this.currentConfigRoom?.rulesConfig;
    }

}
