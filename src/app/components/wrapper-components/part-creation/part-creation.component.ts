import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirstPlayer, IFirstPlayer, Joiner, IPartType, PartStatus, PartType } from '../../../domain/Joiner';
import { Router } from '@angular/router';
import { GameService } from '../../../services/GameService';
import { JoinerService } from '../../../services/JoinerService';
import { ChatService } from '../../../services/ChatService';
import { display, Utils } from 'src/app/utils/utils';
import { assert } from 'src/app/utils/assert';
import { MGPMap } from 'src/app/utils/MGPMap';
import { UserService } from 'src/app/services/UserService';
import { User, UserDocument } from 'src/app/domain/User';
import { FirebaseCollectionObserver } from 'src/app/dao/FirebaseCollectionObserver';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { AuthenticationService } from 'src/app/services/AuthenticationService';
import { MinimalUser } from 'src/app/domain/MinimalUser';

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

    public partType: typeof PartType = PartType;

    @Input() partId: string;
    @Input() userName: string;

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
    public candidates: MinimalUser[] = [];

    // Subscription
    private readonly candidateSubscription: MGPMap<MinimalUser, () => void> = new MGPMap();
    private creatorSubscription: (() => void) | null = null;
    private readonly ngUnsubscribe: Subject<void> = new Subject<void>();

    public configFormGroup: FormGroup;

    public allDocDeleted: boolean = false;

    public constructor(private readonly router: Router,
                       private readonly gameService: GameService,
                       private readonly joinerService: JoinerService,
                       private readonly chatService: ChatService,
                       private readonly userService: UserService,
                       private readonly formBuilder: FormBuilder,
                       private readonly messageDisplayer: MessageDisplayer,
                       private readonly connectedUserService: AuthenticationService)
    {
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent constructed for ' + this.userName);
    }
    public async ngOnInit(): Promise<void> {
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.ngOnInit for ' + this.userName);

        this.checkInputs();
        this.createForms();
        const user: MinimalUser = this.connectedUserService.user.get().toMinimalUser();
        const joinResult: MGPValidation = await this.joinerService.joinGame(this.partId, user);
        if (joinResult.isFailure()) {
            // We will be redirected by the GameWrapper
            return;
        }
        this.gameExists = true;
        this.subscribeToJoinerDoc();
        this.subscribeToFormElements();

        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.ngOnInit asynchronouseries finisheds');
        return;
    }
    private checkInputs() {
        assert(this.connectedUserService.user.get().username.get() !== '',
               'PartCreationComponent should not be created with an empty userName');
        assert(this.partId != null && this.partId !== '',
               'PartCreationComponent should not be created with an empty partId');
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
    private subscribeToJoinerDoc(): void {
        this.joinerService.subscribeToChanges(this.partId,
                                              async(joiner: MGPOptional<Joiner>) => {
                                                  await this.onCurrentJoinerUpdate(joiner);
                                              });
        this.joinerService.subscribeToCandidates(this.partId,
                                                 async(candidates: MinimalUser[]) => {
                                                     await this.onCandidatesUpdate(candidates);
                                                 });
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
        this.viewInfo.userIsCreator = this.userName === joiner.creator.name;
        this.viewInfo.userIsChosenOpponent = this.userName === joiner.chosenPlayer;
        this.viewInfo.userIsObserver =
                this.viewInfo.userIsChosenOpponent === false && this.viewInfo.userIsCreator === false;
        this.viewInfo.creatorIsModifyingConfig = joiner.partStatus !== PartStatus.CONFIG_PROPOSED.value;
        this.viewInfo.showCustomTime = this.getForm('partType').value === 'CUSTOM';

        this.viewInfo.creator = joiner.creator.name;
        this.viewInfo.candidates = this.candidates.map((candidate: MinimalUser) => candidate.name);
        if (this.userName === joiner.creator.name) {
            this.setDataForCreator(joiner);
        } else {
            this.viewInfo.maximalMoveDuration = joiner.maximalMoveDuration;
            this.viewInfo.totalPartDuration = joiner.totalPartDuration;
            this.viewInfo.partType = joiner.partType;
            this.viewInfo.chosenOpponent = joiner.chosenPlayer ?? undefined;
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
        this.viewInfo.maximalMoveDuration = this.viewInfo.maximalMoveDuration ?? joiner.maximalMoveDuration;
        this.viewInfo.totalPartDuration = this.viewInfo.totalPartDuration ?? joiner.totalPartDuration;
        let opponent: string | undefined = this.viewInfo.chosenOpponent;
        if (opponent) {
            if (this.candidates.some((user: MinimalUser) => user.name === opponent)) {
                opponent = ''; // chosenOppoent left
            }
        } else {
            opponent = joiner.chosenPlayer ?? '';
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
    public async selectOpponent(player: string): Promise<void> {
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.setChosenPlayer(' + player + ')');
        return this.joinerService.setChosenPlayer(player);
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

        await this.chatService.deleteChat(this.partId);
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.cancelGameCreation: chat deleted');

        await this.joinerService.deleteJoiner();
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.cancelGameCreation: chat and joiner deleted');

        await this.gameService.deletePart(this.partId);
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.cancelGameCreation: chat, joiner, and part deleted');

        return;
    }
    private onCurrentJoinerUpdate(joiner: MGPOptional<Joiner>) {
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
    private onCandidatesUpdate(candidates: MinimalUser[]): void {
        this.candidates = candidates;
        this.observeNeededPlayers();
        this.updateViewInfo();
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
        if (this.userName === joiner.creator.name) {
            this.observeCandidates();
        } else {
            this.observeCreator();
        }
    }
    private observeCreator(): void {
        const joiner: Joiner = Utils.getNonNullable(this.currentJoiner);
        if (this.creatorSubscription != null) {
            // We are already observing the creator
            return;
        }
        const callback: (modifiedUsers: UserDocument[]) => void = async(modifiedUsers: UserDocument[]) => {
            await this.destroyDocIfCreatorOffline(modifiedUsers);
        };
        const observer: FirebaseCollectionObserver<User> = new FirebaseCollectionObserver(callback, callback, callback);
        this.creatorSubscription = this.userService.observeUser(joiner.creator.id, observer);
    }
    private async destroyDocIfCreatorOffline(modifiedUsers: UserDocument[]): Promise<void> {
        const joiner: Joiner = Utils.getNonNullable(this.currentJoiner);
        for (const user of modifiedUsers) {
            assert(user.data.username === joiner.creator.name, 'found non creator while observing creator!');
            if (user.data.state === 'offline' &&
                this.allDocDeleted === false &&
                joiner.partStatus !== PartStatus.PART_STARTED.value)
            {
                await this.cancelGameCreation();
            }
        }
    }
    private observeCandidates(): void {
        const joiner: Joiner = Utils.getNonNullable(this.currentJoiner);
        display(PartCreationComponent.VERBOSE, { PartCreation_observeCandidates: joiner });
        const onDocumentCreated: (foundUser: UserDocument[]) => void = async(foundUsers: UserDocument[]) => {
            for (const userDoc of foundUsers) {
                if (userDoc.data.state === 'offline') {
                    const user: MinimalUser = { id: userDoc.id, name: Utils.getNonNullable(userDoc.data.username) };
                    await this.removeUserFromLobby(user);
                    ErrorLoggerService.logError('PartCreationComponent', 'user is already offline', user);
                }
            }
        };
        const onDocumentModified: (modifiedUsers: UserDocument[]) => void = async(modifiedUsers: UserDocument[]) => {
            for (const userDoc of modifiedUsers) {
                if (userDoc.data.state === 'offline') {
                    const user: MinimalUser = { id: userDoc.id, name: Utils.getNonNullable(userDoc.data.username) };
                    await this.removeUserFromLobby(user);
                }
            }
        };
        const onDocumentDeleted: (deletedUsers: UserDocument[]) => void = async(deletedUsers: UserDocument[]) => {
            // This should not happen in practice, but if it does we can safely remove the user from the lobby
            for (const userDoc of deletedUsers) {
                const user: MinimalUser = { id: userDoc.id, name: Utils.getNonNullable(userDoc.data.username) };
                ErrorLoggerService.logError('PartCreationComponent', 'user was deleted', user);
            }
        };
        const callback: FirebaseCollectionObserver<User> =
            new FirebaseCollectionObserver(onDocumentCreated, onDocumentModified, onDocumentDeleted);
        for (const candidate of this.candidates) {
            if (this.candidateSubscription.get(candidate).isAbsent()) {
                const subscription: () => void = this.userService.observeUser(candidate.id, callback);
                this.candidateSubscription.set(candidate, subscription);
            }
        }
        for (const oldCandidate of this.candidateSubscription.listKeys()) {
            // Unsubscribe old candidates
            if (oldCandidate.name !== joiner.chosenPlayer) {
                if (this.candidates.includes(oldCandidate) === false) {
                    this.unsubscribeFrom(oldCandidate);
                }
            }
        }
    }
    private async removeUserFromLobby(user: MinimalUser): Promise<void> {
        const joiner: Joiner = Utils.getNonNullable(this.currentJoiner);
        if (user.name === joiner.chosenPlayer) {
            // The chosen player has been removed, the user will have to review the config
            this.messageDisplayer.infoMessage($localize`${user.name} left the game, please pick another opponent.`);
            await this.joinerService.reviewConfigAndRemoveChosenPlayer();
        }
        return this.joinerService.removeCandidate(user);
    }
    private unsubscribeFrom(user: MinimalUser): void {
        const subscription: () => void = this.candidateSubscription.delete(user);
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

        if (this.gameExists) {
            this.joinerService.unsubscribe();
        }
        for (const candidateName of this.candidateSubscription.listKeys()) {
            this.unsubscribeFrom(candidateName);
        }
        if (this.gameStarted === false) {
            if (this.currentJoiner === null) {
                display(PartCreationComponent.VERBOSE,
                        'PartCreationComponent.ngOnDestroy: there is no part here');
                return;
            } else if (this.userName === this.currentJoiner.creator.name && this.allDocDeleted === false) {
                display(PartCreationComponent.VERBOSE,
                        'PartCreationComponent.ngOnDestroy: you(creator) about to cancel creation.');
                await this.cancelGameCreation();
            } else if (this.allDocDeleted === false) {
                display(PartCreationComponent.VERBOSE,
                        'PartCreationComponent.ngOnDestroy: you(joiner) about to cancel game joining');
                const user: MinimalUser = this.connectedUserService.user.get().toMinimalUser();
                await this.joinerService.cancelJoining(user);
            }
        }
        return;
    }
}
