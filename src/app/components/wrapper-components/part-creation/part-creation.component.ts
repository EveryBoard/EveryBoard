import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IJoiner, IJoinerId } from '../../../domain/ijoiner';
import { Router } from '@angular/router';
import { GameService } from '../../../services/GameService';
import { JoinerService } from '../../../services/JoinerService';
import { ChatService } from '../../../services/ChatService';
import { display } from 'src/app/utils/utils';
import { MGPMap } from 'src/app/utils/MGPMap';
import { UserService } from 'src/app/services/UserService';
import { IJoueur, IJoueurId } from 'src/app/domain/iuser';
import { FirebaseCollectionObserver } from 'src/app/dao/FirebaseCollectionObserver';

interface ComparableSubscription {
    subscription: () => void,
    equals: () => boolean,
}
@Component({
    selector: 'app-part-creation',
    templateUrl: './part-creation.component.html',
    styleUrls: ['./part-creation.component.css'],
})
export class PartCreationComponent implements OnInit, OnDestroy {
    /* First  : choosing an opponent
     * Second : proposing the rules
     * Third  : waiting opponent to agree
     * Fourth : starting
     *
     * PageCreationComponent are always child components of OnlineGames component (one to one)
     * they need common data so mother calculate/retrieve then share them with her child
     */

    public static VERBOSE: boolean = false;

    @Input() partId: string;
    @Input() userName: string;

    @Output('gameStartNotification') gameStartNotification: EventEmitter<IJoiner> = new EventEmitter<IJoiner>();
    public gameStarted: boolean = false;
    // notify that the game has started, a thing evaluated with the joiner doc game status

    public currentJoiner: IJoiner = null;

    public userIsCreator: boolean;

    public userIsChosenPlayer: boolean;

    public acceptingDisabled: boolean = true;
    public proposingDisabled: boolean = true;
    public proposalSent: boolean = false;

    // Game Configuration Values
    // timeout = 60;
    public firstPlayer: string = 'CREATOR';
    public maximalMoveDuration: number = 30;

    // Subscription
    private candidateSubscription: MGPMap<string, ComparableSubscription> = new MGPMap();

    public opponentFormGroup: FormGroup;
    public configFormGroup: FormGroup;

    public constructor(public router: Router,
                       public gameService: GameService,
                       public joinerService: JoinerService,
                       public chatService: ChatService,
                       public userService: UserService,
                       public formBuilder: FormBuilder) {
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent constructed for ' + this.userName);
    }
    public async ngOnInit(): Promise<void> {
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.ngOnInit for ' + this.userName);

        this.checkEntry();
        this.createForms();
        try {
            await this.joinerService.joinGame(this.partId, this.userName);
        } catch (error) {
            // ABORT JoinerObserving and page construction, OnlineGameWrapperComponent will soon enough redirect
            return;
        }
        this.joinerService.startObserving(this.partId, (iJoinerId: IJoinerId) =>
            this.onCurrentJoinerUpdate(iJoinerId));
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.ngOnInit asynchronouseries finisheds');
        return Promise.resolve();
    }
    private checkEntry() {
        if (this.userName == null ||
            this.userName === '' ||
            this.userName === 'undefined' ||
            this.userName === 'null')
        {
            // TODO: ces vérifications doivent être faite par le composant mère, et une seule fois ??
            throw new Error('PartCreationComponent should not be created with an empty userName');
        }
        if (this.partId == null ||
            this.partId === '' ||
            this.partId === 'undefined' ||
            this.partId === 'null') {
            throw new Error('PartCreationComponent should not be created with an empty partId');
        }
    }
    private createForms() {
        this.opponentFormGroup = this.formBuilder.group({
            chosenOpponent: ['', Validators.required],
        });
        this.configFormGroup = this.formBuilder.group({
            firstPlayer: ['CREATOR', Validators.required],
            maximalMoveDuration: [10, Validators.required],
            totalPartDuration: [60, Validators.required],
        });
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
        }
        if (this.isGameStarted(iJoinerId)) {
            display(PartCreationComponent.VERBOSE, 'PartCreationComponent.onCurrentJoinerUpdate: the game has started');
            this.onGameStarted(iJoinerId);
        }
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.onCurrentJoinerUpdate: normal joiner update');
        // here game is nor cancelled nor started, no reason to redirect anything
        this.updateJoiner(iJoinerId.doc);
    }
    private isGameCanceled(iJoinerId: IJoinerId): boolean {
        return (iJoinerId == null) || (iJoinerId.doc == null);
    }
    private onGameCancelled() {
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.onGameCancelled');
        this.router.navigate(['/server']);
    }
    private isGameStarted(iJoinerId: IJoinerId): boolean {
        return iJoinerId && iJoinerId.doc && (iJoinerId.doc.partStatus === 3);
    }
    private onGameStarted(iJoinerId: IJoinerId) {
        display(PartCreationComponent.VERBOSE, { partCreationComponent_onGameStarted: { iJoinerId } });

        this.gameStartNotification.emit(iJoinerId.doc);
        this.gameStarted = true;
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.onGameStarted finished');
    }
    private updateJoiner(joiner: IJoiner): void {
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.updateJoiner');

        // Update the form depending on which state we're on now
        this.userIsCreator = (this.userName === joiner.creator);
        this.userIsChosenPlayer = (this.userName === joiner.chosenPlayer);
        this.proposalSent = joiner.partStatus > 1;
        if (this.userIsCreator) {
            this.observeCandidates(joiner);
            this.proposingDisabled = (joiner.partStatus !== 1);
        } else {
            this.maximalMoveDuration = joiner.maximalMoveDuration;
            this.firstPlayer = joiner.firstPlayer;
            this.acceptingDisabled = (joiner.partStatus !== 2);
        }
        this.currentJoiner = joiner;
    }
    private observeCandidates(joiner: IJoiner): void {
        display(PartCreationComponent.VERBOSE, { PartCreation_observeCandidates: JSON.stringify(joiner) });
        const onDocumentCreated: (foundUser: IJoueurId[]) => void = (foundUser: IJoueurId[]) => {
            if (foundUser[0].doc.state === 'offline') {
                console.log('callback: what the hell ' + foundUser[0].doc.pseudo + ' is already offline!');
                this.removeUserFromLobby(foundUser[0].doc.pseudo);
            }
        };
        const onDocumentModified: (modifiedUsers: IJoueurId[]) => void = (modifiedUsers: IJoueurId[]) => {
            if (modifiedUsers[0].doc.state === 'offline') {
                this.removeUserFromLobby(modifiedUsers[0].doc.pseudo);
            }
        };
        const onDocumentDeleted: (deletedUsers: IJoueurId[]) => void = (deletedUsers: IJoueurId[]) => {
            throw new Error('OnlineGameWrapper: Opponent was deleted, what sorcery is this: ' +
                            JSON.stringify(deletedUsers));
        };
        const callback: FirebaseCollectionObserver<IJoueur> =
            new FirebaseCollectionObserver(onDocumentCreated,
                                           onDocumentModified,
                                           onDocumentDeleted);
        for (const candidateName of joiner.candidatesNames) {
            if (this.candidateSubscription.get(candidateName).isAbsent()) {
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
            if (oldCandidate.toString() !== joiner.chosenPlayer) {
                if (joiner.candidatesNames.includes(oldCandidate.toString()) === false) {
                    this.unsubscribeFrom(oldCandidate.toString());
                }
            }
        }
    }
    private removeUserFromLobby(userPseudo: string): Promise<void> {
        if (userPseudo === this.currentJoiner.chosenPlayer) {
            return this.joinerService.unselectChosenPlayer(this.currentJoiner.candidatesNames,
                                                           this.currentJoiner.chosenPlayer,
                                                           false);
        } else {
            const index: number = this.currentJoiner.candidatesNames.indexOf(userPseudo);
            if (index !== -1) {
                const beforeUser: string[] = this.currentJoiner.candidatesNames.slice(0, index);
                const afterUser: string[] = this.currentJoiner.candidatesNames.slice(index, -1);
                const candidatesNames: string[] = beforeUser.concat(afterUser);
                this.joinerService.updateCandidatesNames(candidatesNames);
            }
        }
    }
    private unsubscribeFrom(userPseudo: string): void {
        this.candidateSubscription.get(userPseudo).get().subscription();
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
    public cancelAndLeave(): void {
        console.log('I CANCEL AND LEAVE'); // TODO: Toast this
        this.router.navigate(['/server']);
    }
    public unselectChosenPlayer(): void {
        this.joinerService.unselectChosenPlayer(this.currentJoiner.candidatesNames,
                                                this.currentJoiner.chosenPlayer,
                                                true);
    }
    public setChosenPlayer(pseudo: string): Promise<void> {
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.setChosenPlayer(' + pseudo + ')');

        return this.joinerService.setChosenPlayer(pseudo);
    }
    public proposeConfig(): Promise<void> {
        // called by the creator

        // send the proposal to opponent
        // status become 2 (waiting joiner confirmation)
        const maxMoveDur: number = this.configFormGroup.get('maximalMoveDuration').value;
        const firstPlayer: string = this.configFormGroup.get('firstPlayer').value;
        const totalPartDuration: number = this.configFormGroup.get('totalPartDuration').value;
        return this.joinerService.proposeConfig(maxMoveDur, firstPlayer, totalPartDuration);
    }
    public acceptConfig(): Promise<void> {
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.acceptConfig');
        // called by the joiner

        // trigger the beginning redirection that will be called on every subscribed user
        // status become 3 (game started)
        return this.gameService.acceptConfig(this.partId, this.currentJoiner);
    }
    public async ngOnDestroy(): Promise<void> {
        display(PartCreationComponent.VERBOSE, 'PartCreationComponent.ngOnDestroy');

        for (const candidateName of this.candidateSubscription.listKeys()) {
            this.candidateSubscription.get(candidateName).get().subscription();
        }
        if (this.gameStarted) {
            display(PartCreationComponent.VERBOSE,
                    'PartCreationComponent.ngOnDestroy game started, stop observing joiner');
            this.joinerService.stopObserving();
        } else {
            if (this.userIsCreator) {
                display(PartCreationComponent.VERBOSE,
                        'PartCreationComponent.ngOnDestroy: you(creator) about to cancel creation.');
                await this.cancelGameCreation();
            } else {
                if (this.currentJoiner === null) {
                    display(PartCreationComponent.VERBOSE,
                            'PartCreationComponent.ngOnDestroy: there is no part here');
                    return;
                } else {
                    display(PartCreationComponent.VERBOSE,
                            'PartCreationComponent.ngOnDestroy: you(joiner) about to cancel game joining');
                    await this.joinerService.cancelJoining(this.userName);
                }
            }
            this.joinerService.stopObserving();
            display(PartCreationComponent.VERBOSE, 'PartCreationComponent.ngOnDestroy: you stopped observing joiner');
        }
        return Promise.resolve();
    }
}
