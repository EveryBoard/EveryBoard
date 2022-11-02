import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { FirstPlayer, IFirstPlayer, ConfigRoom, IPartType, PartStatus, PartType, IPartStatus } from '../../../domain/ConfigRoom';
import { GameService } from '../../../services/GameService';
import { ConfigRoomService } from '../../../services/ConfigRoomService';
import { ChatService } from '../../../services/ChatService';
import { display, Utils } from 'src/app/utils/utils';
import { assert } from 'src/app/utils/assert';
import { UserService } from 'src/app/services/UserService';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { AuthUser, ConnectedUserService } from 'src/app/services/ConnectedUserService';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { MinimalUser } from 'src/app/domain/MinimalUser';
import { getMillisecondsDifference } from 'src/app/utils/TimeUtils';
import { FirestoreTime } from 'src/app/domain/Time';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { FocusedPart, User, UserRoleInPart } from 'src/app/domain/User';
import { Timestamp } from 'firebase/firestore';
import { Subscription } from 'rxjs';
import { ObservedPartService } from 'src/app/services/ObservedPartService';

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

    public partType: typeof PartType = PartType;

    @Input() partId: string;

    // notify that the game has started, a thing evaluated with the configRoom doc game status
    @Output() gameStartNotification: EventEmitter<ConfigRoom> = new EventEmitter<ConfigRoom>();
    public gameStarted: boolean = false;

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
    public currentConfigRoom: ConfigRoom | null = null;
    public candidates: MinimalUser[] = [];

    // Subscription
    private readonly ngUnsubscribe: Subject<void> = new Subject<void>();
    private allUserInterval: MGPOptional<number> = MGPOptional.empty();
    private ownTokenInterval: MGPOptional<number> = MGPOptional.empty();
    private lastToken: Timestamp;
    private selfSubscription: Subscription = new Subscription();

    private configRoomSubscription: Subscription = new Subscription();
    private candidatesSubscription: Subscription = new Subscription();

    public configFormGroup: FormGroup;

    public allDocDeleted: boolean = false;

    public constructor(public readonly router: Router,
                       public readonly actRoute: ActivatedRoute,
                       public readonly connectedUserService: ConnectedUserService,
                       public readonly observedPartService: ObservedPartService,
                       public readonly gameService: GameService,
                       public readonly configRoomService: ConfigRoomService,
                       public readonly chatService: ChatService,
                       public readonly userService: UserService,
                       public readonly formBuilder: FormBuilder,
                       public readonly messageDisplayer: MessageDisplayer)
    {
        display(PartCreationComponent.VERBOSE || true, 'PartCreationComponent constructed');
    }
    public async ngOnInit(): Promise<void> {
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.ngOnInit');

        this.checkInputs();
        this.createForms();
        const joinResult: MGPValidation = await this.configRoomService.joinGame(this.partId);
        if (joinResult.isFailure()) {
            const reason: string = joinResult.getReason();
            this.messageDisplayer.criticalMessage(reason);
            return;
        }
        await this.startSendingPresenceTokens();
        this.subscribeToConfigRoomDoc();
        this.subscribeToFormElements();

        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.ngOnInit asynchronouseries finisheds');
        return;
    }
    private checkInputs() {
        const user: MGPOptional<AuthUser> = this.connectedUserService.user;
        assert(user.isPresent(), 'PartCreationComponent should not be called without connected user');
        assert(user.get() !== AuthUser.NOT_CONNECTED, 'PartCreationComponent should not be created with an empty userName');
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
    private updateUserDocWithObservedPart(configRoom: ConfigRoom): Promise<void> {
        display(PartCreationComponent.VERBOSE, `updateUserDocWithObservedPart of '` + this.partId + `'`);
        const role: UserRoleInPart = this.getUserRoleInPart(configRoom);
        const observedPart: FocusedPart = {
            id: this.partId,
            opponent: this.getOpponent(),
            typeGame: Utils.getNonNullable(this.actRoute.snapshot.paramMap.get('compo')),
            role,
        };
        return this.observedPartService.updateObservedPart(observedPart);
    }
    private getUserRoleInPart(configRoom: ConfigRoom): UserRoleInPart {
        const currentUserId: string = this.connectedUserService.user.get().id;
        if (currentUserId === configRoom.creator.id) {
            return 'Creator';
        } else if (currentUserId === configRoom.chosenOpponent?.id) {
            return 'ChosenOpponent';
        } else {
            return 'Candidate';
        }
    }
    private getOpponent(): MinimalUser | null {
        let userOrUndefined: MinimalUser | null = null;
        if (this.connectedUserService.user.get().id === this.currentConfigRoom?.creator.id) {
            userOrUndefined = this.currentConfigRoom.chosenOpponent;
        } else {
            userOrUndefined = Utils.getNonNullable(this.currentConfigRoom?.creator);
        }
        return userOrUndefined;
    }
    private subscribeToConfigRoomDoc(): void {
        const configRoomCallback: (configRoom: MGPOptional<ConfigRoom>) => void =
            async(configRoom: MGPOptional<ConfigRoom>) => {
                await this.onCurrentConfigRoomUpdate(configRoom);
            };
        const candidatesCallback: (candidates: MinimalUser[]) => void = async(candidates: MinimalUser[]) => {
            await this.onCandidatesUpdate(candidates);
        };
        this.configRoomSubscription =
            this.configRoomService.subscribeToChanges(this.partId, configRoomCallback);
        this.candidatesSubscription =
            this.configRoomService.subscribeToCandidates(this.partId, candidatesCallback);
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
                const partStatus: IPartStatus = Utils.getNonNullable(this.currentConfigRoom).partStatus;
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
        const configRoom: ConfigRoom = Utils.getNonNullable(this.currentConfigRoom);
        const authUser: AuthUser = this.connectedUserService.user.get();

        this.viewInfo.canReviewConfig = configRoom.partStatus === PartStatus.CONFIG_PROPOSED.value;
        this.viewInfo.canEditConfig = configRoom.partStatus !== PartStatus.CONFIG_PROPOSED.value;
        this.viewInfo.userIsCreator = this.userIsCreator(configRoom);
        this.viewInfo.userIsChosenOpponent = authUser.id === configRoom.chosenOpponent?.id;
        this.viewInfo.userIsObserver =
                this.viewInfo.userIsChosenOpponent === false && this.viewInfo.userIsCreator === false;
        this.viewInfo.creatorIsModifyingConfig = configRoom.partStatus !== PartStatus.CONFIG_PROPOSED.value;
        this.viewInfo.showCustomTime = this.getForm('partType').value === 'CUSTOM';

        this.viewInfo.creator = configRoom.creator.name;
        this.viewInfo.candidates = this.candidates.map((candidate: MinimalUser) => candidate.name);
        if (this.userIsCreator(configRoom)) {
            this.setDataForCreator(configRoom);
        } else {
            this.viewInfo.maximalMoveDuration = configRoom.maximalMoveDuration;
            this.viewInfo.totalPartDuration = configRoom.totalPartDuration;
            this.viewInfo.partType = configRoom.partType;
            this.viewInfo.chosenOpponent = configRoom.chosenOpponent?.name;
            this.viewInfo.firstPlayer = configRoom.firstPlayer;
        }
        switch (configRoom.partType) {
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
    private setDataForCreator(configRoom: ConfigRoom): void {
        this.viewInfo.maximalMoveDuration = this.viewInfo.maximalMoveDuration ?? configRoom.maximalMoveDuration;
        this.viewInfo.totalPartDuration = this.viewInfo.totalPartDuration ?? configRoom.totalPartDuration;
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
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.setChosenOpponent(' + opponentName + ')');
        const opponent: MinimalUser = this.getUserFromName(opponentName);
        await Promise.all([
            this.observedPartService.updateObservedPart({ opponent }),
            this.configRoomService.setChosenOpponent(this.partId, opponent),
        ]);
        return;
    }
    private getUserFromName(username: string): MinimalUser {
        const user: MinimalUser | undefined = this.candidates.find((c: MinimalUser) => c.name === username);
        return Utils.getNonNullable(user);
    }
    public async changeConfig(): Promise<void> {
        return this.configRoomService.reviewConfig(this.partId);
    }
    public async proposeConfig(): Promise<void> {
        const chosenOpponentName: string = this.getForm('chosenOpponent').value;
        const partType: string = this.getForm('partType').value;
        const maxMoveDur: number = this.getForm('maximalMoveDuration').value;
        const firstPlayer: string = this.getForm('firstPlayer').value;
        const totalPartDuration: number = this.getForm('totalPartDuration').value;
        const chosenOpponent: MinimalUser = this.getUserFromName(chosenOpponentName);
        return this.configRoomService.proposeConfig(this.partId,
                                                    chosenOpponent,
                                                    PartType.of(partType),
                                                    maxMoveDur,
                                                    FirstPlayer.of(firstPlayer),
                                                    totalPartDuration);
    }
    public async cancelGameCreation(): Promise<void> {
        this.allDocDeleted = true;
        await this.observedPartService.removeObservedPart();
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.cancelGameCreation');

        await this.chatService.deleteChat(this.partId);
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.cancelGameCreation: chat deleted');

        await this.gameService.deletePart(this.partId);
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.cancelGameCreation: chat and part deleted');

        await this.configRoomService.deleteConfigRoom(this.partId, this.candidates);
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.cancelGameCreation: chat, part, and configRoom deleted');

        return;
    }
    private async onCurrentConfigRoomUpdate(configRoomOpt: MGPOptional<ConfigRoom>) {
        display(PartCreationComponent.VERBOSE,
                { PartCreationComponent_onCurrentConfigRoomUpdate: {
                    before: JSON.stringify(this.currentConfigRoom),
                    then: JSON.stringify(configRoomOpt) } });
        if (configRoomOpt.isAbsent()) {
            display(PartCreationComponent.VERBOSE, 'PartCreationComponent.onCurrentConfigRoomUpdate: LAST UPDATE : the game is cancelled');
            return this.onGameCancelled();
        } else {
            const configRoom: ConfigRoom = configRoomOpt.get();
            if (this.chosenOpponentJustLeft(configRoom) &&
                this.userIsCreator(configRoom))
            {
                const currentConfigRoom: ConfigRoom = Utils.getNonNullable(this.currentConfigRoom);
                const userName: string = Utils.getNonNullable(currentConfigRoom.chosenOpponent).name;
                this.messageDisplayer.infoMessage($localize`${userName} left the game, please pick another opponent.`);
                await this.observedPartService.updateObservedPart({ opponent: null });
            }
            let observedPartUpdated: boolean = false;
            if (this.userJustChosenAsOpponent(configRoom)) {
                await this.updateUserDocWithObservedPart(configRoom);
                observedPartUpdated = true;
            }
            this.currentConfigRoom = configRoom;
            if (this.allUserInterval.isAbsent()) { // Only do it once
                assert(observedPartUpdated === false, 'Expected observedPartUpdate to be false at first call of onCurrentConfigRoomUpdate');
                await this.updateUserDocWithObservedPart(this.currentConfigRoom);
                await this.observeNeededPlayers();
            }
            this.updateViewInfo();
            if (this.isGameStarted(this.currentConfigRoom)) {
                display(PartCreationComponent.VERBOSE, 'PartCreationComponent.onCurrentConfigRoomUpdate: the game has started');
                this.onGameStarted();
            }
        }
    }
    private async onCandidatesUpdate(candidates: MinimalUser[]): Promise<void> {
        this.candidates = candidates;
        this.updateViewInfo();
    }
    private userJustChosenAsOpponent(configRoom: ConfigRoom): boolean {
        if (this.isGameStarted(configRoom)) return false;
        const currentUserId: string = this.connectedUserService.user.get().id;
        const userWasNotChosenOpponent: boolean = this.currentConfigRoom?.chosenOpponent?.id !== currentUserId;
        const userIsChosenOpponent: boolean = configRoom.chosenOpponent?.id === currentUserId;
        return userWasNotChosenOpponent && userIsChosenOpponent;
    }
    private chosenOpponentJustLeft(newConfigRoom: ConfigRoom): boolean {
        if (this.currentConfigRoom == null) return false;
        const currentConfigRoom: ConfigRoom = this.currentConfigRoom;
        const thereWasAChosenOpponent: boolean = currentConfigRoom.chosenOpponent != null;
        const thereIsNoLongerChosenOpponent: boolean = newConfigRoom.chosenOpponent == null;
        return thereWasAChosenOpponent && thereIsNoLongerChosenOpponent;
    }
    private async onGameCancelled() {
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.onGameCancelled');
        this.messageDisplayer.infoMessage($localize`The game has been canceled!`);
        await this.router.navigate(['/lobby']);
    }
    private isGameStarted(configRoom: ConfigRoom | null): boolean {
        assert(configRoom != null, 'configRoom should not be null (isGameStarted)');
        return Utils.getNonNullable(configRoom).partStatus === PartStatus.PART_STARTED.value;
    }
    private onGameStarted() {
        const configRoom: ConfigRoom = Utils.getNonNullable(this.currentConfigRoom);
        display(PartCreationComponent.VERBOSE, { partCreationComponent_onGameStarted: { configRoom } });

        this.gameStartNotification.emit(configRoom);
        this.gameStarted = true;
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.onGameStarted finished');
    }
    private async observeNeededPlayers(): Promise<void> {
        const configRoom: ConfigRoom = Utils.getNonNullable(this.currentConfigRoom);
        display(PartCreationComponent.VERBOSE, { PartCreationComponent_observeNeededPlayers: { configRoom } });
        assert(this.allUserInterval.isAbsent(), 'Cannot observe players multiple times');
        this.allUserInterval = MGPOptional.of(window.setInterval(async() => {
            const currentTime: Timestamp = this.lastToken;
            if (this.userIsCreator(configRoom)) {
                await this.checkCandidatesTokensFreshness(currentTime);
            } else {
                await this.checkCreatorTokenFreshness(currentTime);
            }
        }, PartCreationComponent.TOKEN_INTERVAL));
    }
    private userIsCreator(configRoom: ConfigRoom): boolean {
        const currentUserId: string = this.connectedUserService.user.get().id;
        return currentUserId === configRoom.creator.id;
    }
    private async checkCreatorTokenFreshness(currentTime: Timestamp): Promise<void> {
        const configRoom: ConfigRoom = Utils.getNonNullable(this.currentConfigRoom);
        if (await this.didUserTimeout(configRoom.creator.id, currentTime)) {
            await this.destroyDocIfPartDidNotStart();
        }
    }
    private async destroyDocIfPartDidNotStart(): Promise<void> {
        const partStarted: boolean = this.isGameStarted(this.currentConfigRoom);
        assert(partStarted === false, 'Should not try to cancelGameCreation when part started!');
        assert(this.allDocDeleted === false, 'Should not delete doc twice');
        await this.cancelGameCreation();
    }
    private async checkCandidatesTokensFreshness(currentTime: Timestamp): Promise<void> {
        for (const candidate of this.candidates) {
            if (await this.didUserTimeout(candidate.id, currentTime)) {
                await this.removeCandidateFromLobby(candidate);
            }
        }
    }
    private async didUserTimeout(userId: string, currentTime: Timestamp): Promise<boolean> {
        const lastChangedOpt: MGPOptional<FirestoreTime> = await this.userService.getUserLastUpdateTime(userId);
        if (lastChangedOpt.isAbsent()) {
            const error: string = 'found no user while observing ' + userId + ' !';
            ErrorLoggerService.logError('PartCreationComponent', error);
            return true;
        }
        const lastUpdateTime: Timestamp = lastChangedOpt.get() as Timestamp;
        const diff: number = getMillisecondsDifference(lastUpdateTime, currentTime);
        return diff > PartCreationComponent.TOKEN_TIMEOUT;
    }
    private async removeCandidateFromLobby(user: MinimalUser): Promise<void> {
        const configRoom: ConfigRoom = Utils.getNonNullable(this.currentConfigRoom);
        if (user.id === configRoom.chosenOpponent?.id) {
            // The chosen player has been removed, the user will have to review the config
            // A message will be displayed once the configRoom has been update
            await this.configRoomService.reviewConfigAndRemoveChosenOpponent(this.partId);
        }
        return this.configRoomService.removeCandidate(this.partId, user);
    }
    public async startSendingPresenceTokens(): Promise<void> {
        await this.connectedUserService.sendPresenceToken();
        assert(this.ownTokenInterval.isAbsent(), 'should not start sending presence tokens twice');
        this.ownTokenInterval = MGPOptional.of(window.setInterval(() => {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.connectedUserService.sendPresenceToken();
        }, PartCreationComponent.TOKEN_INTERVAL));
        const userId: string = this.connectedUserService.user.get().id;
        this.selfSubscription = this.userService.observeUser(userId, (userOpt: MGPOptional<User>) => {
            assert(userOpt.isPresent(), 'connected user should exist');
            const user: User = userOpt.get();
            if (user.lastUpdateTime != null) {
                this.lastToken = user.lastUpdateTime as Timestamp;
            }
        });
    }
    public stopSendingPresenceTokensAndObservingUsersIfNeeded(): void {
        if (this.ownTokenInterval.isPresent()) {
            window.clearInterval(this.ownTokenInterval.get());
            this.ownTokenInterval = MGPOptional.empty();
        }
        if (this.allUserInterval.isPresent()) {
            window.clearInterval(this.allUserInterval.get());
        }
        this.selfSubscription.unsubscribe();
    }
    public acceptConfig(): Promise<void> {
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.acceptConfig');
        // called by the configRoom
        // triggers the redirection that will be applied for every subscribed user
        return this.gameService.acceptConfig(this.partId, Utils.getNonNullable(this.currentConfigRoom));
    }
    public async ngOnDestroy(): Promise<void> {
        display(PartCreationComponent.VERBOSE || true, 'PartCreationComponent.ngOnDestroy');

        // This will unsubscribe from all observables
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();

        // Unsubscribe from the config room and candidates
        this.configRoomSubscription.unsubscribe();
        this.candidatesSubscription.unsubscribe();

        this.stopSendingPresenceTokensAndObservingUsersIfNeeded();
        const authUser: AuthUser = this.connectedUserService.user.get();

        if (this.gameStarted === true) {
            // Avoid canceling game creation if part started but user leave
            return;
        }
        if (this.currentConfigRoom === null) {
            return display(PartCreationComponent.VERBOSE, 'PartCreationComponent.ngOnDestroy: there is no part here');
        } else if (this.allDocDeleted === true) {
            display(PartCreationComponent.VERBOSE, 'PartCreationComponent.ngOnDestroy: part has already been deleted');
        } else if (authUser.id === this.currentConfigRoom.creator.id) {
            display(PartCreationComponent.VERBOSE,
                    'PartCreationComponent.ngOnDestroy: you(creator) about to cancel creation.');
            await this.cancelGameCreation();
        } else {
            display(PartCreationComponent.VERBOSE,
                    'PartCreationComponent.ngOnDestroy: you are about to cancel game joining');
            await this.observedPartService.removeObservedPart();
            await this.configRoomService.cancelJoining(this.partId);
        }
    }
}
