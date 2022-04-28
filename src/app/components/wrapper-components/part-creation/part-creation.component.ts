import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirstPlayer, IFirstPlayer, Joiner, IPartType, PartStatus, PartType, MinimalUser, IPartStatus } from '../../../domain/Joiner';
import { Router } from '@angular/router';
import { GameService } from '../../../services/GameService';
import { JoinerService } from '../../../services/JoinerService';
import { ChatService } from '../../../services/ChatService';
import { display, Utils } from 'src/app/utils/utils';
import { assert } from 'src/app/utils/assert';
import { MGPMap } from 'src/app/utils/MGPMap';
import { UserService } from 'src/app/services/UserService';
import { User } from 'src/app/domain/User';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { ConnectedUserService, AuthUser } from 'src/app/services/ConnectedUserService';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { MGPValidation } from 'src/app/utils/MGPValidation';

interface PartCreationViewInfo {
    userIsCreator: boolean;
    showCustomTime?: boolean;
    canEditConfig?: boolean;
    canProposeConfig?: boolean;
    canReviewConfig?: boolean;

    userIsChosenOpponent: boolean;
    creatorIsModifyingConfig?: boolean;
    userIsObserver: boolean;

    creator?: string;
    firstPlayer: IFirstPlayer;
    firstPlayerClasses: { [key: string]: string[] },
    partType: IPartType;
    partTypeClasses: { [key: string]: string[] },
    partTypeName?: string,
    maximalMoveDuration?: number;
    totalPartDuration?: number;
    candidates: string[];
    chosenOpponent?: string;
    candidateClasses: { [key: string]: string[] },
}
@Component({
    selector: 'app-part-creation',
    templateUrl: './part-creation.component.html',
})
export class PartCreationComponent implements OnInit, OnDestroy {
    /*
     * Lifecycle:
     * 1. Creator chooses config and opponent
     * 2. Creator click on "proposing the config"
     * 3a. Chosen opponent accepts the config -> part starts
     * 3b. Creator clicks on "modifying config" -> back to 1, with the current config and opponent
     *
     * PageCreationComponent is always a child of OnlineGame component (one to one)
     * they need common data so that the parent calculates/retrieves the data then share it
     * with the part creation component
     */
    public static VERBOSE: boolean = false;

    public static TOKEN_INTERVAL: number = 5 * 1000;

    public static TOKEN_TIMEOUT: number = PartCreationComponent.TOKEN_INTERVAL * 2;

    public static readonly FAILED_BECAUSE: () => string = () => $localize`failed joining because :`;

    public partType: typeof PartType = PartType;

    @Input() partId: string;

    // notify that the game has started, a thing evaluated with the joiner doc game status
    @Output('gameStartNotification') gameStartNotification: EventEmitter<Joiner> = new EventEmitter<Joiner>();
    public gameStarted: boolean = false;

    private gameExists: boolean = false;

    public viewInfo: PartCreationViewInfo = {
        userIsCreator: false,
        userIsChosenOpponent: false,
        userIsObserver: false,
        partType: 'STANDARD',
        partTypeClasses: { 'STANDARD': ['is-selected', 'is-primary'], 'BLITZ': [], 'CUSTOM': [] },
        firstPlayer: 'RANDOM',
        firstPlayerClasses: { 'CREATOR': [], 'RANDOM': ['is-selected', 'is-primary'], 'CHOSEN_PLAYER': [] },
        candidateClasses: {},
        candidates: [],
    };
    public currentJoiner: Joiner | null = null;

    public authUser: AuthUser;

    // Subscription
    private readonly userSubscriptions: MGPMap<string, () => void> = new MGPMap();
    private readonly userTimeouts: MGPMap<string, number> = new MGPMap();
    private readonly ngUnsubscribe: Subject<void> = new Subject<void>();

    public configFormGroup: FormGroup;

    public allDocDeleted: boolean = false;

    private ownTokenInterval: MGPOptional<number> = MGPOptional.empty();

    public constructor(public readonly router: Router,
                       public readonly connectedUserService: ConnectedUserService,
                       public readonly gameService: GameService,
                       public readonly joinerService: JoinerService,
                       public readonly chatService: ChatService,
                       public readonly userService: UserService,
                       public readonly formBuilder: FormBuilder,
                       public readonly messageDisplayer: MessageDisplayer)
    {
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent constructed');
    }
    public async ngOnInit(): Promise<void> {
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.ngOnInit for ' + this.connectedUserService.user.get().username.get());

        this.checkInputs();
        this.createForms();
        const authMinimalUser: MinimalUser = this.connectedUserService.user.get().toMinimalUser();
        const joinResult: MGPValidation = await this.joinerService.joinGame(this.partId, authMinimalUser);
        if (joinResult.isFailure()) {
            const reason: string = joinResult.getReason();
            this.messageDisplayer.criticalMessage(PartCreationComponent.FAILED_BECAUSE() + reason);
            return;
        }
        await this.updateUserDocWithObservedPart();
        await this.startSendingPresenceTokens();
        this.gameExists = true;
        this.connectedUserService.getUserObs().subscribe((authUser: AuthUser) => {
            this.authUser = authUser;
        });
        this.subscribeToJoinerDoc();
        this.subscribeToFormElements();

        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.ngOnInit asynchronouseries finisheds');
        return;
    }
    private checkInputs() {
        assert(this.connectedUserService.user.get().username.get() !== '', 'PartCreationComponent should not be created with an empty userName');
        assert(this.partId !== '', 'PartCreationComponent should not be created with an empty partId');
    }
    private createForms() {
        this.configFormGroup = this.formBuilder.group({
            firstPlayer: [FirstPlayer.RANDOM.value, Validators.required],
            maximalMoveDuration: [PartType.NORMAL_MOVE_DURATION, Validators.required],
            partType: ['STANDARD', Validators.required],
            totalPartDuration: [PartType.NORMAL_PART_DURATION, Validators.required],
            chosenOpponent: ['', Validators.required],
        });
    }
    private updateUserDocWithObservedPart(): Promise<void> {
        display(PartCreationComponent.VERBOSE, `updateUserDocWithObservedPart of '` + this.partId + `'`);
        return this.connectedUserService.updateObservedPart(this.partId);
    }
    private subscribeToJoinerDoc(): void {
        const callback: (joiner: MGPOptional<Joiner>) => void = async(joiner: MGPOptional<Joiner>) => {
            await this.onCurrentJoinerUpdate(joiner);
        };
        this.joinerService.subscribeToChanges(this.partId, callback);
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
                const partStatus: IPartStatus = Utils.getNonNullable(this.currentJoiner).partStatus;
                this.viewInfo.canProposeConfig = partStatus !== PartStatus.CONFIG_PROPOSED.value && opponent !== '';
            });
        this.getForm('partType').valueChanges
            .pipe(takeUntil(this.ngUnsubscribe)).subscribe((partType: IPartType) => {
                this.viewInfo.partTypeClasses[this.viewInfo.partType] = [];
                this.viewInfo.partTypeClasses[partType] = ['is-primary', 'is-selected'];
                this.viewInfo.partType = partType;
                this.viewInfo.showCustomTime = partType === 'CUSTOM';
            });
        this.getForm('maximalMoveDuration').valueChanges
            .pipe(takeUntil(this.ngUnsubscribe)).subscribe((maximalMoveDuration: number) => {
                this.viewInfo.maximalMoveDuration = maximalMoveDuration;
            });
        this.getForm('totalPartDuration').valueChanges
            .pipe(takeUntil(this.ngUnsubscribe)).subscribe((totalPartDuration: number) => {
                this.viewInfo.totalPartDuration = totalPartDuration;
            });
        this.getForm('firstPlayer').valueChanges
            .pipe(takeUntil(this.ngUnsubscribe)).subscribe((firstPlayer: IFirstPlayer) => {
                this.viewInfo.firstPlayerClasses[this.viewInfo.firstPlayer] = [];
                this.viewInfo.firstPlayerClasses[firstPlayer] = ['is-primary', 'is-selected'];
                this.viewInfo.firstPlayer = firstPlayer;
            });
    }
    private updateViewInfo(): void {
        const joiner: Joiner = Utils.getNonNullable(this.currentJoiner);

        this.viewInfo.canReviewConfig = joiner.partStatus === PartStatus.CONFIG_PROPOSED.value;
        this.viewInfo.canEditConfig = joiner.partStatus !== PartStatus.CONFIG_PROPOSED.value;
        this.viewInfo.userIsCreator = this.authUser.userId === joiner.creator.id;
        this.viewInfo.userIsChosenOpponent = this.authUser.userId === joiner.chosenPlayer?.id;
        this.viewInfo.userIsObserver =
                this.viewInfo.userIsChosenOpponent === false && this.viewInfo.userIsCreator === false;
        this.viewInfo.creatorIsModifyingConfig = joiner.partStatus !== PartStatus.CONFIG_PROPOSED.value;
        this.viewInfo.showCustomTime = this.getForm('partType').value === 'CUSTOM';

        this.viewInfo.creator = joiner.creator.name;
        this.viewInfo.candidates = joiner.candidates.map((minimalUser: MinimalUser) => minimalUser.name);
        if (this.authUser.userId === joiner.creator.id) {
            this.setDataForCreator(joiner);
        } else {
            this.viewInfo.maximalMoveDuration = joiner.maximalMoveDuration;
            this.viewInfo.totalPartDuration = joiner.totalPartDuration;
            this.viewInfo.partType = joiner.partType;
            this.viewInfo.chosenOpponent = joiner.chosenPlayer == null ? undefined : joiner.chosenPlayer.name;
            this.viewInfo.firstPlayer = joiner.firstPlayer;
        }
        switch (joiner.partType) {
            case 'CUSTOM':
                this.viewInfo.partTypeName = $localize`custom`;
                break;
            case 'BLITZ':
                this.viewInfo.partTypeName = $localize`blitz`;
                break;
            case 'STANDARD':
                this.viewInfo.partTypeName = $localize`standard`;
                break;
        }
    }
    private setDataForCreator(joiner: Joiner): void {
        this.viewInfo.maximalMoveDuration = this.viewInfo.maximalMoveDuration || joiner.maximalMoveDuration;
        this.viewInfo.totalPartDuration = this.viewInfo.totalPartDuration || joiner.totalPartDuration;
        let opponent: string | undefined = this.viewInfo.chosenOpponent;
        if (opponent == null || opponent === '') {
            opponent = joiner.chosenPlayer?.name || '';
        } else {
            const chosenOppoentIsInCandidateList: boolean = joiner.candidates.some((minimalUser: MinimalUser) => {
                return minimalUser.name === opponent;
            });
            if (chosenOppoentIsInCandidateList === false) {
                opponent = ''; // chosenOppoent left
            }
        }
        this.getForm('chosenOpponent').setValue(opponent);
    }
    public selectFirstPlayer(firstPlayer: IFirstPlayer): void {
        this.getForm('firstPlayer').setValue(firstPlayer);
    }
    public selectPartType(partType: IPartType): void {
        if (partType === 'STANDARD') {
            this.getForm('maximalMoveDuration').setValue(PartType.NORMAL_MOVE_DURATION);
            this.getForm('totalPartDuration').setValue(PartType.NORMAL_PART_DURATION);
        } else if (partType === 'BLITZ') {
            this.getForm('maximalMoveDuration').setValue(PartType.BLITZ_MOVE_DURATION);
            this.getForm('totalPartDuration').setValue(PartType.BLITZ_PART_DURATION);
        }
        this.getForm('partType').setValue(partType);
    }
    public async selectOpponent(opponentName: string): Promise<void> {
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.setChosenPlayer(' + opponentName + ')');
        const opponent: MinimalUser = this.getUserFromName(opponentName);
        return this.joinerService.setChosenPlayer(opponent);
    }
    private getUserFromName(username: string): MinimalUser {
        const candidates: MinimalUser[] = Utils.getNonNullable(this.currentJoiner?.candidates);
        const user: MinimalUser | undefined = candidates.find((c: MinimalUser) => c.name === username);
        return Utils.getNonNullable(user);
    }
    private getUserFromId(userId: string): MinimalUser {
        const candidates: MinimalUser[] = Utils.getNonNullable(this.currentJoiner?.candidates);
        const user: MinimalUser | undefined = candidates.find((c: MinimalUser) => c.id === userId);
        return Utils.getNonNullable(user);
    }
    public async changeConfig(): Promise<void> {
        return this.joinerService.reviewConfig();
    }
    public async proposeConfig(): Promise<void> {
        const chosenPlayerName: string = this.getForm('chosenOpponent').value;
        const partType: string = this.getForm('partType').value;
        const maxMoveDur: number = this.getForm('maximalMoveDuration').value;
        const firstPlayer: string = this.getForm('firstPlayer').value;
        const totalPartDuration: number = this.getForm('totalPartDuration').value;
        const chosenPlayer: MinimalUser = this.getUserFromName(chosenPlayerName);
        return this.joinerService.proposeConfig(chosenPlayer,
                                                PartType.of(partType),
                                                maxMoveDur,
                                                FirstPlayer.of(firstPlayer),
                                                totalPartDuration);
    }
    public async cancelGameCreation(): Promise<void> {
        this.allDocDeleted = true;
        await this.connectedUserService.removeObservedPart();
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.cancelGameCreation');

        await this.gameService.deletePart(this.partId);
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.cancelGameCreation: game deleted');

        await this.joinerService.deleteJoiner();
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.cancelGameCreation: game and joiner deleted');

        await this.chatService.deleteChat(this.partId);
        display(PartCreationComponent.VERBOSE,
                'PartCreationComponent.cancelGameCreation: game and joiner and chat deleted');
        return;
    }
    private async onCurrentJoinerUpdate(joiner: MGPOptional<Joiner>) {
        display(PartCreationComponent.VERBOSE,
                { PartCreationComponent_onCurrentJoinerUpdate: {
                    before: JSON.stringify(this.currentJoiner),
                    then: JSON.stringify(joiner) } });
        if (joiner.isAbsent()) {
            display(PartCreationComponent.VERBOSE, 'PartCreationComponent.onCurrentJoinerUpdate: LAST UPDATE : the game is cancelled');
            return this.onGameCancelled();
        } else {
            this.currentJoiner = joiner.get();
            this.observeNeededPlayers();
            this.updateViewInfo();
            if (this.isGameStarted()) {
                display(PartCreationComponent.VERBOSE, 'PartCreationComponent.onCurrentJoinerUpdate: the game has started');
                this.onGameStarted();
            }
        }
    }
    private async onGameCancelled() {
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.onGameCancelled');
        this.messageDisplayer.infoMessage($localize`The game has been canceled!`);
        await this.router.navigate(['/lobby']);
    }
    private isGameStarted(): boolean {
        const joiner: Joiner = Utils.getNonNullable(this.currentJoiner);
        return joiner.partStatus === PartStatus.PART_STARTED.value;
    }
    private onGameStarted() {
        const joiner: Joiner = Utils.getNonNullable(this.currentJoiner);
        display(PartCreationComponent.VERBOSE, { partCreationComponent_onGameStarted: { joiner } });

        this.gameStartNotification.emit(joiner);
        this.gameStarted = true;
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.onGameStarted finished');
    }
    private observeNeededPlayers(): void {
        const joiner: Joiner = Utils.getNonNullable(this.currentJoiner);
        display(PartCreationComponent.VERBOSE, { PartCreationComponent_updateJoiner: { joiner } });
        if (this.authUser.userId === joiner.creator.id) {
            this.observeCandidates();
        } else {
            this.observeCreator();
        }
    }
    private observeCreator(): void {
        const joiner: Joiner = Utils.getNonNullable(this.currentJoiner);
        this.observeUserIfNotDone(joiner.creator.id);
    }
    private async destroyDocIfPartDidNotStart(): Promise<void> {
        const joiner: Joiner = Utils.getNonNullable(this.currentJoiner);
        const partStatusStarted: boolean = joiner.partStatus === PartStatus.PART_STARTED.value ||
                                           joiner.partStatus === PartStatus.PART_FINISHED.value;
        assert(partStatusStarted === false, 'Should not try to cancelGameCreation when part started!');
        assert(this.allDocDeleted === false, 'Should not delete doc twice');
        await this.cancelGameCreation();
    }
    /**
     * Set the user doc subscription, which will set timeout for user (then resetting it while present)
     */
    private observeUserIfNotDone(userId: string): void {
        // subscribe to user
        const onUserUpdate: (userOptional: MGPOptional<User>) => void = async(userOptional: MGPOptional<User>) => {
            await this.onUserUpdate(userOptional, userId);
        };
        if (this.userSubscriptions.get(userId).isAbsent()) {
            const userSubscription: () => void = this.userService.observeUser(userId, onUserUpdate);
            this.userSubscriptions.set(userId, userSubscription);
        }
    }
    /**
     * 1. Check if user doc has been deleted (if so, act as a normal departure, except for one log)
     * 2. set (first call) or reset (on the nexts) user timeouts, since it has proved its presence
     */
    public async onUserUpdate(userOptional: MGPOptional<User>, userId: string): Promise<void> {
        if (userOptional.isAbsent()) {
            ErrorLoggerService.logError('PartCreationComponent', 'found no user while observing ' + userId + ' !');
            await this.onUserDisparition(userId);
            return;
        }
        const oldTimeout: MGPOptional<number> = this.userTimeouts.get(userId);
        if (oldTimeout.isPresent()) {
            window.clearTimeout(oldTimeout.get());
            this.userTimeouts.delete(userId);
        }
        const newTimeout: number = window.setTimeout(async() => {
            await this.onUserDisparition(userId);
        }, PartCreationComponent.TOKEN_TIMEOUT);
        this.userTimeouts.set(userId, newTimeout);
    }
    private async onUserDisparition(userId: string): Promise<void> {
        if (userId === this.currentJoiner?.creator.id) {
            return this.destroyDocIfPartDidNotStart();
        } else if (userId === this.currentJoiner?.chosenPlayer?.id) {
            // TODOTODO check that chosenPlayer is emptied also
            return this.removeCandidateFromLobby(userId);
        } else {
            const candidates: MinimalUser[] = Utils.getNonNullable(this.currentJoiner?.candidates);
            const userIsCandidate: boolean = candidates.some((u: MinimalUser) => u.id === userId);
            assert(userIsCandidate, 'should not be observing a user that is not creator/oppoent/candidate');
            return this.removeCandidateFromLobby(userId);
        }
    }
    private observeCandidates(): void {
        const joiner: Joiner = Utils.getNonNullable(this.currentJoiner);
        display(PartCreationComponent.VERBOSE, { PartCreation_observeCandidates: joiner });
        for (const candidate of joiner.candidates) {
            this.observeUserIfNotDone(candidate.id);
        }
        for (const userSubscriptionKey of this.userSubscriptions.listKeys()) {
            // Unsubscribe old candidates
            if (joiner.candidates.some((m: MinimalUser) => m.id === userSubscriptionKey) === false) {
                this.stopObservingUser(userSubscriptionKey);
            }
        }
    }
    public async startSendingPresenceTokens(): Promise<void> {
        await this.connectedUserService.sendPresenceToken();
        this.ownTokenInterval = MGPOptional.of(window.setInterval(() => {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.connectedUserService.sendPresenceToken();
        }, PartCreationComponent.TOKEN_INTERVAL));
    }
    public stopSendingPresenceTokensAndObservingUsersIfNeeded(): void {
        if (this.ownTokenInterval.isPresent()) {
            window.clearInterval(this.ownTokenInterval.get());
            this.ownTokenInterval = MGPOptional.empty();
        }
        for (const userId of this.userSubscriptions.listKeys()) {
            this.stopObservingUser(userId);
        }
    }
    private removeCandidateFromLobby(userId: string): Promise<void> {
        const joiner: Joiner = Utils.getNonNullable(this.currentJoiner);
        const index: number = joiner.candidates.findIndex((minimalUser: MinimalUser) => minimalUser.id === userId);
        // The user must be in the lobby, otherwise we would have unsubscribed from its updates
        assert(index !== -1, 'PartCreationComponent: attempting to remove a user not in the lobby');
        const candidates: MinimalUser[] = joiner.candidates.filter((m: MinimalUser) => m.id !== userId);
        // The chosen player has been removed, the user will have to review the config
        const user: MinimalUser = this.getUserFromId(userId);
        this.messageDisplayer.infoMessage($localize`${user.name} left the game, please pick another opponent.`);
        if (joiner.chosenPlayer?.id === userId) {
            return this.joinerService.reviewConfigAndRemoveChosenPlayerAndUpdateCandidates(candidates);
        } else {
            return this.joinerService.updateCandidates(candidates);
        }
    }
    public stopObservingUser(userId: string): void {
        const timeoutSubscription: number = this.userTimeouts.get(userId).get();
        this.userTimeouts.delete(userId);
        window.clearTimeout(timeoutSubscription);

        const userSubscription: () => void = this.userSubscriptions.get(userId).get();
        this.userSubscriptions.delete(userId);
        userSubscription();
    }
    public async acceptConfig(): Promise<void> {
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.acceptConfig');
        // called by the joiner
        // triggers the redirection that will be applied for every subscribed user
        return this.gameService.acceptConfig(this.partId, Utils.getNonNullable(this.currentJoiner));
    }
    public async ngOnDestroy(): Promise<void> {
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.ngOnDestroy');

        // This will unsubscribe from all observables
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();

        this.stopSendingPresenceTokensAndObservingUsersIfNeeded();
        if (this.gameExists) {
            this.joinerService.unsubscribe();
        }
        if (this.gameStarted === true) {
            // Avoid canceling game creation if part started but user leave
            return;
        }
        if (this.currentJoiner === null) {
            display(PartCreationComponent.VERBOSE,
                    'PartCreationComponent.ngOnDestroy: there is no part here');
            return;
        } else if (this.authUser.userId === this.currentJoiner.creator.id) {
            display(PartCreationComponent.VERBOSE,
                    'PartCreationComponent.ngOnDestroy: you(creator) about to cancel creation.');
            await this.cancelGameCreation();
        } else if (this.allDocDeleted === false) {
            display(PartCreationComponent.VERBOSE,
                    'PartCreationComponent.ngOnDestroy: you(joiner) about to cancel game joining');
            await this.connectedUserService.removeObservedPart();
            await this.joinerService.cancelJoining(this.authUser.toMinimalUser());
        }
        return;
    }
}
