import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirstPlayer, IFirstPlayer, Joiner, IPartType, PartStatus, PartType, MinimalUser } from '../../../domain/Joiner';
import { Router } from '@angular/router';
import { GameService } from '../../../services/GameService';
import { JoinerService } from '../../../services/JoinerService';
import { ChatService } from '../../../services/ChatService';
import { assert, display, Utils } from 'src/app/utils/utils';
import { MGPMap } from 'src/app/utils/MGPMap';
import { UserService } from 'src/app/services/UserService';
import { User } from 'src/app/domain/User';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { AuthUser } from 'src/app/services/AuthenticationService';
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
    public static VERBOSE: boolean = true;

    public static TOKEN_INTERVAL: number = 5 * 1000;

    public partType: typeof PartType = PartType;

    @Input() partId: string;
    @Input() authUser: AuthUser;

    @Output('gameStartNotification') gameStartNotification: EventEmitter<Joiner> = new EventEmitter<Joiner>();
    public gameStarted: boolean = false;
    // notify that the game has started, a thing evaluated with the joiner doc game status

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
    }
    public currentJoiner: Joiner | null = null;

    // Subscription
    private readonly usersSubscriptions: MGPMap<string, () => void> = new MGPMap();
    private readonly usersTimeouts: MGPMap<string, number> = new MGPMap();
    private readonly ngUnsubscribe: Subject<void> = new Subject<void>();

    public configFormGroup: FormGroup;

    public allDocDeleted: boolean = false;

    private selfTokenInterval: MGPOptional<number> = MGPOptional.empty();

    public constructor(public router: Router,
                       public gameService: GameService,
                       public joinerService: JoinerService,
                       public chatService: ChatService,
                       public userService: UserService,
                       public formBuilder: FormBuilder,
                       public messageDisplayer: MessageDisplayer)
    {
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent constructed');
    }
    public async ngOnInit(): Promise<void> {
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.ngOnInit for ' + this.authUser.username.get());

        this.checkInputs();
        this.createForms();
        const authMinimalUser: MinimalUser = { id: this.authUser.userId, name: this.authUser.username.get() };
        const joinResult: MGPValidation = await this.joinerService.joinGame(this.partId, authMinimalUser);
        if (joinResult.isFailure()) {
            // We will be redirected by the GameWrapper
            return;
        }
        await this.notifyUserDocOfPartObservation();
        this.subscribeToJoinerDoc();
        this.subscribeToFormElements();

        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.ngOnInit asynchronouseries INTERVAL finisheds');
        return;
    }
    private checkInputs() {
        assert(this.authUser.username.get() !== '', 'PartCreationComponent should not be created with an empty userName');
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
    private notifyUserDocOfPartObservation(): Promise<void> {
        console.log(`notifyUserDocOfPartObservation of '` + this.partId + `'`);
        return this.userService.updateObservedPart(this.partId);
    }
    private subscribeToJoinerDoc(): void {
        this.joinerService
            .observe(this.partId)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(async(joiner: MGPOptional<Joiner>) => {
                await this.onCurrentJoinerUpdate(joiner);
            });
        console.log('subscribe To Joiner Doc is done');
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
                this.viewInfo.canProposeConfig =
                    Utils.getNonNullable(this.currentJoiner).partStatus !== PartStatus.CONFIG_PROPOSED.value &&
                    opponent !== '';
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
        this.viewInfo.userIsChosenOpponent = this.authUser.username.get() === joiner.chosenPlayer;
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
            this.viewInfo.chosenOpponent = joiner.chosenPlayer || undefined;
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
        if (opponent) {
            if (joiner.candidates.some((minimalUser: MinimalUser) => minimalUser.name === opponent) === false) {
                opponent = ''; // chosenOppoent left
            }
        } else {
            opponent = joiner.chosenPlayer || '';
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
    public async selectOpponent(opponentUsername: string): Promise<void> {
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.setChosenPlayer(' + opponentUsername + ')');
        return this.joinerService.setChosenPlayer(opponentUsername);
    }
    public async changeConfig(): Promise<void> {
        return this.joinerService.reviewConfig();
    }
    public async proposeConfig(): Promise<void> {
        const chosenPlayer: string = this.getForm('chosenOpponent').value;
        const partType: string = this.getForm('partType').value;
        const maxMoveDur: number = this.getForm('maximalMoveDuration').value;
        const firstPlayer: string = this.getForm('firstPlayer').value;
        const totalPartDuration: number = this.getForm('totalPartDuration').value;
        return this.joinerService.proposeConfig(chosenPlayer,
                                                PartType.of(partType),
                                                maxMoveDur,
                                                FirstPlayer.of(firstPlayer),
                                                totalPartDuration);
    }
    public async cancelGameCreation(): Promise<void> {
        this.allDocDeleted = true;
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
            if (this.viewInfo.userIsChosenOpponent) {
                await this.startSendingPresenceTokensIfNotDone();
            } else {
                this.stopSendingPresenceTokensIfNeeded();
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
        const callback: () => void = async() => {
            await this.destroyDocIfPartDidNotStart();
        };
        this.observeUser(joiner.creator.id, callback);

    }
    private async destroyDocIfPartDidNotStart(): Promise<void> {
        const joiner: Joiner = Utils.getNonNullable(this.currentJoiner);
        const partStatusStarted: boolean = joiner.partStatus === PartStatus.PART_STARTED.value ||
                                           joiner.partStatus === PartStatus.PART_FINISHED.value;
        if (this.allDocDeleted === false &&
            partStatusStarted === false)
        {
            await this.cancelGameCreation();
        }
    }
    private observeUser(userId: string, onMissedHeartbeats: () => void): void {
        console.log('PartCreation.observeUser(' + userId + ', onMissedHeartbeats)');
        // subscribe to user
        const onUserUpdate: (user: MGPOptional<User>) => void = (userOptional: MGPOptional<User>) => {
            assert(userOptional.isPresent(), 'found no user while observing ' + userId + ' !'); // TODOTODO note that THIS happens when there is user deletion
            const oldTimeout: MGPOptional<number> = this.usersTimeouts.get(userId);
            if (oldTimeout.isPresent()) {
                console.log('CLEARING TIMEOUT ' + oldTimeout.get() + ' FOR ' + userId + ' (restart)')
                window.clearTimeout(oldTimeout.get());
                this.usersTimeouts.delete(userId);
            } else {
                console.log('PartCreation.observeUser.onUserUpdate: setting timeout for first time')
            }
            console.log('TIMEOUT [RE]SETTED FOR ' + userId)
            const newTimeout: number = window.setTimeout(() => {
                console.log('PartCreation.observeUser.onUserUpdate.TIMEOUT CALLED: user ' + userId + ' timeouted !')
                onMissedHeartbeats();
                // unsubscribe to the user since he is off
                this.unsubscribeFrom(userId);
            }, 2 * PartCreationComponent.TOKEN_INTERVAL);
            this.usersTimeouts.set(userId, newTimeout);
        };
        // TODOTODO: search by id please
        if (this.usersSubscriptions.get(userId).isAbsent()) {
            const userSubscription: () => void = this.userService.observeUser(userId, onUserUpdate);
            this.usersSubscriptions.set(userId, userSubscription);
        }
    }
    private observeCandidates(): void {

        const joiner: Joiner = Utils.getNonNullable(this.currentJoiner);
        display(PartCreationComponent.VERBOSE, { PartCreation_observeCandidates: joiner });
        for (const candidate of joiner.candidates) {
            if (this.usersSubscriptions.get(candidate.id).isAbsent()) {
                const onCandidateMissedHeartbeats: () => void = async() => {
                    await this.removeUserFromLobby(Utils.getNonNullable(candidate.id));
                };
                this.observeUser(candidate.id, onCandidateMissedHeartbeats);
            }
        }
        for (const oldCandidate of this.usersSubscriptions.listKeys()) {
            // Unsubscribe old candidates
            if (oldCandidate !== joiner.chosenPlayer) {
                if (joiner.candidates.some((minimalUser: MinimalUser) => minimalUser.id === oldCandidate) === false) {
                    this.unsubscribeFrom(oldCandidate);
                }
            }
        }
    }
    public async startSendingPresenceTokensIfNotDone(): Promise<void> {
        if (this.selfTokenInterval.isAbsent()) {
            await this.userService.sendPresenceToken();
            console.log('FIRST sendPresenceToken DONE AND SETTING INTERVAL ON YOURSELF')
            this.selfTokenInterval = MGPOptional.of(window.setInterval(async() => {
                console.log('INTERVAL TIME sendPresenceToken FOR YOURSELF')
                // seslint-disable-next-line @typescript-eslint/no-floating-promises
                await this.userService.sendPresenceToken();
            }, PartCreationComponent.TOKEN_INTERVAL));
        }
    }
    public stopSendingPresenceTokensIfNeeded(): void {
        console.log('PartCreation.stopSendingPresenceTokensIfNeeded')
        if (this.selfTokenInterval.isPresent()) {
            console.log('CLEARING TIME INTERVAL FOR YOURSELF');
            window.clearInterval(this.selfTokenInterval.get());
            this.selfTokenInterval = MGPOptional.empty();
        } else {
            console.log('no token to stop sending')
        }
    }
    private removeUserFromLobby(userId: string): Promise<void> {
        console.log('PartCreation.removeUserFromLobby')
        const joiner: Joiner = Utils.getNonNullable(this.currentJoiner);
        const index: number = joiner.candidates.findIndex((minimalUser: MinimalUser) => minimalUser.id === userId);
        // The user must be in the lobby, otherwise we would have unsubscribed from its updates
        assert(index !== -1, 'PartCreationComponent: attempting to remove a user not in the lobby');
        const beforeUser: MinimalUser[] = joiner.candidates.slice(0, index);
        const afterUser: MinimalUser[] = joiner.candidates.slice(index + 1);
        const candidates: MinimalUser[] = beforeUser.concat(afterUser);
        assert(userId === joiner.chosenPlayer, 'Should only remove chosenUser from creation room, since candidate should are not polled and should remove themselves');
        // The chosen player has been removed, the user will have to review the config
        this.messageDisplayer.infoMessage($localize`${userId} left the game, please pick another opponent.`);
        return this.joinerService.reviewConfigRemoveChosenPlayerAndUpdateCandidates(candidates);
    }
    public unsubscribeFrom(userId: string): void {
        const subscription: () => void = this.usersSubscriptions.get(userId).get();
        const timeoutSub: MGPOptional<number> = this.usersTimeouts.get(userId);
        if (timeoutSub.isPresent()) {
            console.log('CLEARING TIMEOUT FOR ' + userId + ' (unsubscribe)')
            window.clearTimeout(timeoutSub.get());
            this.usersTimeouts.delete(userId);
        } else {
            console.log('no timeout to clear !!!!!!!!!!!!!!!!!!!')
        }
        subscription();
    }
    public acceptConfig(): Promise<void> {
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

        this.stopSendingPresenceTokensIfNeeded();
        for (const userId of this.usersSubscriptions.listKeys()) {
            this.unsubscribeFrom(userId);
        }
        if (this.gameStarted === false) {
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
                await this.joinerService.cancelJoining(this.authUser.username.get());
            }
        }
        return;
    }
}
