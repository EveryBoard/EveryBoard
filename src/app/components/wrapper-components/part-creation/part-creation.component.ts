import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirstPlayer, IFirstPlayer, IJoiner, IJoinerId, IPartType, PartStatus, PartType } from '../../../domain/ijoiner';
import { Router } from '@angular/router';
import { GameService } from '../../../services/GameService';
import { JoinerService } from '../../../services/JoinerService';
import { ChatService } from '../../../services/ChatService';
import { assert, display, warning } from 'src/app/utils/utils';
import { MGPMap } from 'src/app/utils/MGPMap';
import { UserService } from 'src/app/services/UserService';
import { IJoueur, IJoueurId } from 'src/app/domain/iuser';
import { FirebaseCollectionObserver } from 'src/app/dao/FirebaseCollectionObserver';
import { map } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { MessageDisplayer } from 'src/app/services/message-displayer/MessageDisplayer';

interface ComparableSubscription {
    subscription: () => void,
    equals: () => boolean,
}
@Component({
    selector: 'app-part-creation',
    templateUrl: './part-creation.component.html',
    styleUrls: ['../../../../../node_modules/bulma-slider/dist/css/bulma-slider.min.css'],
})
export class PartCreationComponent implements OnInit, OnDestroy {
    // Lifecycle:
    // 1. Creator chooses config and opponent
    // 2. Creator click on "proposing the config"
    // 3a. Chosen opponent accepts the config -> part starts
    // 3b. Creator clicks on "modifying config"" -> back to 1, with the current config and opponent

    // PageCreationComponent is always a child of OnlineGame component (one to one)
    // they need common data so that the parent calculates/retrieves the data then share it
    // with the part creation component

    public static VERBOSE: boolean = false;

    @Input() partId: NonNullable<string>;
    @Input() userName: NonNullable<string>;

    @Output('gameStartNotification') gameStartNotification: EventEmitter<IJoiner> = new EventEmitter<IJoiner>();
    public gameStarted: boolean = false;
    // notify that the game has started, a thing evaluated with the joiner doc game status

    public currentJoiner: IJoiner = null;
    public joinerObs: Observable<IJoiner>;
    public canEditConfigObs: Observable<boolean>;
    public canProposeConfigObs: Observable<boolean>;
    public canReviewConfigObs: Observable<boolean>;
    public userIsCreatorObs: Observable<boolean>;
    public userIsChosenPlayerObs: Observable<boolean>;
    public userIsObserverObs: Observable<boolean>;
    public userIsModifyingConfigObs: Observable<boolean>;
    public showCustomTimeObs: Observable<boolean>;

    // Subscription
    private candidateSubscription: MGPMap<string, ComparableSubscription> = new MGPMap();
    private creatorSubscription: () => void = null;

    public configFormGroup: FormGroup;

    public constructor(public router: Router,
                       public gameService: GameService,
                       public joinerService: JoinerService,
                       public chatService: ChatService,
                       public userService: UserService,
                       public formBuilder: FormBuilder,
                       public messageDisplayer: MessageDisplayer) {
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent constructed for ' + this.userName);
    }
    public async ngOnInit(): Promise<void> {
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.ngOnInit for ' + this.userName);

        this.checkInputs();
        this.createForms();
        const gameExists: boolean = await this.joinerService.joinGame(this.partId, this.userName);
        if (gameExists === false) {
            // We will be redirected by the GameWrapper
            return Promise.resolve();
        }
        // TODO: use pipe(share())
        this.joinerObs = this.joinerService.observe(this.partId).pipe(map((id: IJoinerId): IJoiner => {
            return id.doc;
        }));
        this.canReviewConfigObs = this.joinerObs.pipe(map((joiner: IJoiner): boolean => {
            return joiner.partStatus === PartStatus.CONFIG_PROPOSED.value;
        }));
        this.canEditConfigObs = this.joinerObs.pipe(map((joiner: IJoiner): boolean => {
            return joiner.partStatus !== PartStatus.CONFIG_PROPOSED.value;
        }));
        const chosenOpponentForm: AbstractControl = this.configFormGroup.get('chosenOpponent');
        this.canProposeConfigObs = combineLatest([
            this.joinerObs,
            chosenOpponentForm.valueChanges,
        ]).pipe(map(([joiner, opponent]: [IJoiner, string]): boolean => {
            if (joiner.partStatus === PartStatus.CONFIG_PROPOSED.value) {
                return false;
            }
            if (opponent === '') {
                return false;
            }
            return true;
        }));
        this.userIsCreatorObs = this.joinerObs.pipe(map((joiner: IJoiner): boolean => {
            return this.userName === joiner.creator;
        }));
        this.userIsChosenPlayerObs = this.joinerObs.pipe(map((joiner: IJoiner): boolean => {
            return this.userName === joiner.chosenPlayer;
        }));
        this.userIsObserverObs = combineLatest([
            this.userIsCreatorObs,
            this.userIsChosenPlayerObs,
        ]).pipe(map(([isCreator, isChosen]: [boolean, boolean]): boolean => {
            return isChosen === false && isCreator === false;
        }));
        this.userIsModifyingConfigObs = this.joinerObs.pipe(map((joiner: IJoiner): boolean => {
            return joiner.partStatus !== PartStatus.CONFIG_PROPOSED.value;
        }));
        this.showCustomTimeObs = this.configFormGroup.get('partType').valueChanges.pipe(map((value: string): boolean => {
            return value === 'CUSTOM';
        }));
        this.joinerService.startObserving(this.partId, (iJoinerId: IJoinerId) => this.onCurrentJoinerUpdate(iJoinerId));
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.ngOnInit asynchronouseries finisheds');
        return Promise.resolve();
    }
    private checkInputs() {
        assert(this.userName != null && this.userName !== '' && this.userName !== 'undefined' && this.userName !== 'null',
               // TODO: what if my username is 'null'?
               'PartCreationComponent should not be created with an empty userName');
        assert(this.partId != null && this.partId !== '' && this.partId !== 'undefined' && this.partId !== 'null',
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
    public selectFirstPlayer(firstPlayer: IFirstPlayer): Promise<void> {
        this.configFormGroup.get('firstPlayer').setValue(firstPlayer);
        return this.joinerService.setFirstPlayer(firstPlayer);
    }
    public selectPartType(partType: IPartType): Promise<void> {
        this.configFormGroup.get('partType').setValue(partType);
        switch (partType) {
            case 'STANDARD':
                this.configFormGroup.get('maximalMoveDuration').setValue(PartType.NORMAL_MOVE_DURATION);
                this.configFormGroup.get('totalPartDuration').setValue(PartType.NORMAL_PART_DURATION);
                return this.joinerService.setPartType(partType,
                                                      PartType.NORMAL_MOVE_DURATION,
                                                      PartType.NORMAL_PART_DURATION);
            case 'BLITZ':
                this.configFormGroup.get('maximalMoveDuration').setValue(PartType.BLITZ_MOVE_DURATION);
                this.configFormGroup.get('totalPartDuration').setValue(PartType.BLITZ_PART_DURATION);
                return this.joinerService.setPartType(partType,
                                                      PartType.BLITZ_MOVE_DURATION,
                                                      PartType.BLITZ_PART_DURATION);
            case 'CUSTOM':
                this.configFormGroup.get('partType').setValue('CUSTOM');
                return this.joinerService.setPartType(partType,
                                                      this.configFormGroup.get('maximalMoveDuration').value,
                                                      this.configFormGroup.get('totalPartDuration').value);
        }
    }
    public selectOpponent(player: string): void {
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.setChosenPlayer(' + player + ')');
        this.joinerService.setChosenPlayer(player);
    }
    public async reviewConfig(): Promise<void> {
        return this.joinerService.reviewConfig();
    }

    public async proposeConfig(): Promise<void> {
        const chosenPlayer: string = this.configFormGroup.get('chosenOpponent').value;
        const partType: string = this.configFormGroup.get('partType').value;
        const maxMoveDur: number = this.configFormGroup.get('maximalMoveDuration').value;
        const firstPlayer: string = this.configFormGroup.get('firstPlayer').value;
        const totalPartDuration: number = this.configFormGroup.get('totalPartDuration').value;
        return this.joinerService.proposeConfig(chosenPlayer,
                                                PartType.of(partType),
                                                maxMoveDur,
                                                FirstPlayer.of(firstPlayer),
                                                totalPartDuration);
    }
    public async cancelAndLeave(): Promise<void> {
        await this.cancelGameCreation();
        this.messageDisplayer.infoMessage('Partie annulée');
        await this.router.navigate(['server']);
    }
    private async cancelGameCreation(): Promise<void> {
        // callable only by the creator
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.cancelGameCreation');

        await this.gameService.deletePart(this.partId);
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.cancelGameCreation: game deleted');

        await this.joinerService.deleteJoiner();
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.cancelGameCreation: game and joiner deleted');

        await this.chatService.deleteChat(this.partId);
        display(PartCreationComponent.VERBOSE,
                'PartCreationComponent.cancelGameCreation: game and joiner and chat deleted');

        return Promise.resolve();
    }
    private onCurrentJoinerUpdate(iJoinerId: IJoinerId) {
        display(PartCreationComponent.VERBOSE,
                { PartCreationComponent_onCurrentJoinerUpdate: {
                    before: JSON.stringify(this.currentJoiner),
                    then: JSON.stringify(iJoinerId) } });
        if (this.isGameCanceled(iJoinerId)) {
            display(PartCreationComponent.VERBOSE,
                    'PartCreationComponent.onCurrentJoinerUpdate: LAST UPDATE : the game is cancelled');
            return this.onGameCancelled();
        } else {
            this.updateJoiner(iJoinerId.doc);
            if (this.isGameStarted(iJoinerId.doc)) {
                display(PartCreationComponent.VERBOSE, 'PartCreationComponent.onCurrentJoinerUpdate: the game has started');
                this.onGameStarted(iJoinerId.doc);
            }
        }
    }
    private isGameCanceled(joinerId: IJoinerId): boolean {
        return (joinerId == null) || (joinerId.doc == null);
    }
    private onGameCancelled() {
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.onGameCancelled');
        this.router.navigate(['/server']);
    }
    private isGameStarted(joiner: IJoiner): boolean {
        return joiner && (joiner.partStatus === PartStatus.PART_STARTED.value);
    }
    private onGameStarted(joiner: IJoiner) {
        display(PartCreationComponent.VERBOSE, { partCreationComponent_onGameStarted: { joiner } });

        this.gameStartNotification.emit(joiner);
        this.gameStarted = true;
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.onGameStarted finished');
    }
    private updateJoiner(joiner: IJoiner): void {
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.updateJoiner');

        if (this.userName === joiner.creator) {
            this.observeCandidates(joiner);
        } else if (this.currentJoiner == null || this.currentJoiner.creator == null) {
            this.observeCreator(joiner);
        }
        this.currentJoiner = joiner;

        // Needed for when the creator leaves and joins back: he needs the current config
        this.updateFormWithJoiner(joiner);
    }
    private updateFormWithJoiner(joiner: IJoiner): void {
        if (joiner.firstPlayer != null) {
            this.configFormGroup.get('firstPlayer').setValue(joiner.firstPlayer);
        }
        if (joiner.maximalMoveDuration != null) {
            this.configFormGroup.get('maximalMoveDuration').setValue(joiner.maximalMoveDuration);
        }
        if (joiner.totalPartDuration != null) {
            this.configFormGroup.get('totalPartDuration').setValue(joiner.totalPartDuration);
        }
        if (joiner.partType != null) {
            this.configFormGroup.get('partType').setValue(joiner.partType);
        }
        if (joiner.chosenPlayer != null) {
            this.configFormGroup.get('chosenOpponent').setValue(joiner.chosenPlayer);
        }
    }
    private observeCreator(joiner: IJoiner): void {
        if (this.creatorSubscription != null) {
            // We are already observing the creator
            return;
        }
        const onDocumentCreated: (foundUser: IJoueurId[]) => void = (foundUsers: IJoueurId[]) => {
            for (const user of foundUsers) {
                if (user.doc.pseudo === joiner.creator && user.doc.state === 'offline') {
                    // TODO: this should not happen but it does!
                    warning('callback: what the hell ' + user.doc.pseudo + ' is already offline!');
                }
            }
        };
        const onDocumentModified: (modifiedUsers: IJoueurId[]) => void = (modifiedUsers: IJoueurId[]) => {
            for (const user of modifiedUsers) {
                if (user.doc.pseudo === joiner.creator && user.doc.state === 'offline') {
                    this.cancelAndLeave();
                }
            }
        };
        const onDocumentDeleted: (deletedUsers: IJoueurId[]) => void = (deletedUsers: IJoueurId[]) => {
            // This should not happen in practice, but if it does we can safely remove the joiner
            warning('OnlineGameWrapper: Opnponents were deleted, what sorcery is this: ' +
                    JSON.stringify(deletedUsers));
            for (const user of deletedUsers) {
                if (user.doc.pseudo === joiner.creator) {
                    this.cancelAndLeave();
                }
            }
        };
        const callback: FirebaseCollectionObserver<IJoueur> =
            new FirebaseCollectionObserver(onDocumentCreated,
                                           onDocumentModified,
                                           onDocumentDeleted);

        this.creatorSubscription = this.userService.observeUserByPseudo(joiner.creator, callback);
    }
    private observeCandidates(joiner: IJoiner): void {
        display(PartCreationComponent.VERBOSE, { PartCreation_observeCandidates: JSON.stringify(joiner) });
        const onDocumentCreated: (foundUser: IJoueurId[]) => void = (foundUsers: IJoueurId[]) => {
            for (const user of foundUsers) {
                if (user.doc.state === 'offline') {
                    // TODO: this should not happen but it does!
                    // Removing the user from the lobby hampers part creation when it happens
                    warning('callback: what the hell ' + user.doc.pseudo + ' is already offline!');
                    // this.removeUserFromLobby(user.doc.pseudo);
                }
            }
        };
        const onDocumentModified: (modifiedUsers: IJoueurId[]) => void = (modifiedUsers: IJoueurId[]) => {
            for (const user of modifiedUsers) {
                if (user.doc.state === 'offline') {
                    this.removeUserFromLobby(user.doc.pseudo);
                }
            }
        };
        const onDocumentDeleted: (deletedUsers: IJoueurId[]) => void = (deletedUsers: IJoueurId[]) => {
            // This should not happen in practice, but if it does we can safely remove the user from the lobby
            warning('OnlineGameWrapper: Opnponents were deleted, what sorcery is this: ' +
                    JSON.stringify(deletedUsers));
            for (const user of deletedUsers) {
                this.removeUserFromLobby(user.doc.pseudo);
            }
        };
        const callback: FirebaseCollectionObserver<IJoueur> =
            new FirebaseCollectionObserver(onDocumentCreated,
                                           onDocumentModified,
                                           onDocumentDeleted);
        for (const candidateName of joiner.candidates) {
            if (this.candidateSubscription.get(candidateName).isAbsent()) {
                // Subscribe to every new candidate
                const comparableSubscription: ComparableSubscription = {
                    subscription: this.userService.observeUserByPseudo(candidateName, callback),
                    equals: () => {
                        throw new Error('ObservableSubscription should not be used');
                    },
                };
                this.candidateSubscription.set(candidateName, comparableSubscription);
            }
        }
        for (const oldCandidate of this.candidateSubscription.listKeys()) {
            // Unsubscribe old candidates
            if (oldCandidate.toString() !== joiner.chosenPlayer) {
                if (joiner.candidates.includes(oldCandidate.toString()) === false) {
                    this.unsubscribeFrom(oldCandidate.toString());
                }
            }
        }
    }
    private removeUserFromLobby(userPseudo: string): Promise<void> {
        const index: number = this.currentJoiner.candidates.indexOf(userPseudo);
        assert(index !== -1, 'PartCreationComponent.removeUserFromLobby trying to remove a user that is not in the lobby!');
        const beforeUser: string[] = this.currentJoiner.candidates.slice(0, index);
        const afterUser: string[] = this.currentJoiner.candidates.slice(index, -1);
        const candidates: string[] = beforeUser.concat(afterUser);
        if (userPseudo === this.currentJoiner.chosenPlayer) {
            // The chosen player has been removed, the user will have to review the config
            this.messageDisplayer.infoMessage(`${userPseudo} a quitté la partie, veuillez choisir un autre adversaire`);
            return this.joinerService.reviewConfigRemoveChosenPlayerAndUpdateCandidates(candidates);
        } else {
            this.joinerService.updateCandidates(candidates);
        }
    }
    private unsubscribeFrom(userPseudo: string): void {
        this.candidateSubscription.get(userPseudo).get().subscription();
    }
    public acceptConfig(): Promise<void> {
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.acceptConfig');
        // called by the joiner
        // triggers the redirection that will be applied for every subscribed user
        return this.gameService.acceptConfig(this.partId, this.currentJoiner);
    }
    public async ngOnDestroy(): Promise<void> {
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.ngOnDestroy');

        for (const candidateName of this.candidateSubscription.listKeys()) {
            this.unsubscribeFrom(candidateName);
        }
        if (this.gameStarted) {
            display(PartCreationComponent.VERBOSE,
                    'PartCreationComponent.ngOnDestroy game started, stop observing joiner');
            this.joinerService.stopObserving();
        } else {
            if (this.currentJoiner === null) {
                display(PartCreationComponent.VERBOSE,
                        'PartCreationComponent.ngOnDestroy: there is no part here');
                return;
            } else if (this.userName === this.currentJoiner.creator) {
                display(PartCreationComponent.VERBOSE,
                        'PartCreationComponent.ngOnDestroy: you(creator) about to cancel creation.');
                await this.cancelGameCreation();
            } else {
                display(PartCreationComponent.VERBOSE,
                        'PartCreationComponent.ngOnDestroy: you(joiner) about to cancel game joining');
                await this.joinerService.cancelJoining(this.userName);
            }
            this.joinerService.stopObserving();
            display(PartCreationComponent.VERBOSE, 'PartCreationComponent.ngOnDestroy: you stopped observing joiner');
        }
        return Promise.resolve();
    }
}
