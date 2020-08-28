import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {IJoiner, IJoinerId} from '../../../domain/ijoiner';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {GameService} from '../../../services/game/GameService';
import {JoinerService} from '../../../services/joiner/JoinerService';
import {ChatService} from '../../../services/chat/ChatService';

@Component({
    selector: 'app-part-creation',
    templateUrl: './part-creation.component.html',
    styleUrls: ['./part-creation.component.css']
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

    @Output("gameStartNotification") gameStartNotification: EventEmitter<IJoiner> = new EventEmitter<IJoiner>();
    public gameStarted = false; // notify that the game has started, a thing evaluated with the joiner doc game status

    public currentJoiner: IJoiner = null;

    public userIsCreator: boolean;

    public userIsChosenPlayer: boolean;

    public acceptingDisabled = true;
    public proposingDisabled = true;
    public proposalSent = false;

    // Game Configuration Values
    // timeout = 60;
    public firstPlayer = '0';
    public maximalMoveDuration = 30;

    // Subscription
    private userSub: Subscription;
    private partSub: Subscription;

    public opponentFormGroup: FormGroup;
    public configFormGroup: FormGroup;

    public constructor(public router: Router,
                       public gameService: GameService,
                       public joinerService: JoinerService,
                       public chatService: ChatService,
                       public formBuilder: FormBuilder) {
        if (PartCreationComponent.VERBOSE) {
            console.log("PartCreationComponent constructed for " + this.userName);
        }
    }
    public async ngOnInit(): Promise<void> {
        if (PartCreationComponent.VERBOSE) console.log("PartCreationComponent.ngOnInit for " + this.userName);

        this.checkEntry();
        this.createForms();
        await this.joinerService.joinGame(this.partId, this.userName);
        this.joinerService.startObserving(this.partId, (iJoinerId: IJoinerId) =>
            this.onCurrentJoinerUpdate(iJoinerId));

        if (PartCreationComponent.VERBOSE) console.log("PartCreationComponent.ngOnInit asynchronouseries finisheds");
        return Promise.resolve();
    }
    private checkEntry() {
        if (this.userName == null ||
            this.userName === '' ||
            this.userName === "undefined" ||
            this.userName === "null")
        { // TODO: ces vérifications doivent être faite par le composant mère, et une seule fois ??
            throw new Error('PartCreationComponent should not be created with an empty userName');
        }
        if (this.partId == null ||
            this.partId === '' ||
            this.partId === "undefined" ||
            this.partId === "null")
        {
            throw new Error('PartCreationComponent should not be created with an empty partId');
        }
    }
    private createForms() {
        this.opponentFormGroup = this.formBuilder.group({
            chosenOpponent: ['', Validators.required]
        });
        this.configFormGroup = this.formBuilder.group({
            firstPlayer: ['0', Validators.required],
            maximalMoveDuration: [10, Validators.required],
            totalPartDuration: [60, Validators.required]
        });
    }
    private onCurrentJoinerUpdate(iJoinerId: IJoinerId) {
        if (PartCreationComponent.VERBOSE) {
            console.log('PartCreationComponent.onCurrentJoinerUpdate');
            console.log({ before: this.currentJoiner, then: JSON.stringify(iJoinerId) });
        }
        if (this.isGameCanceled(iJoinerId)) {
            if (PartCreationComponent.VERBOSE) {
                console.log('PartCreationComponent.onCurrentJoinerUpdate: LAST UPDATE : the game is cancelled');
            }
            return this.onGameCancelled();
        }
        if (this.isGameStarted(iJoinerId)) {
            if (PartCreationComponent.VERBOSE) {
                console.log('PartCreationComponent.onCurrentJoinerUpdate: the game has started');
            }
            this.onGameStarted(iJoinerId);
        }
        if (PartCreationComponent.VERBOSE) {
            console.log('PartCreationComponent.onCurrentJoinerUpdate: normal joiner update');
        }
        // here game is nor cancelled nor started, no reason to redirect anything
        this.updateJoiner(iJoinerId);
    }
    private isGameCanceled(iJoinerId: IJoinerId): boolean {
        return (iJoinerId == null) || (iJoinerId.doc == null);
    }
    private onGameCancelled() {
        // TODO: inform that the game has been cancelled
        if (PartCreationComponent.VERBOSE) console.log("PartCreationComponent.onGameCancelled");
        this.router.navigate(['/server']);
    }
    private isGameStarted(iJoinerId: IJoinerId): boolean {
        return iJoinerId && iJoinerId.doc && (iJoinerId.doc.partStatus === 3);
    }
    private onGameStarted(iJoinerId: IJoinerId) {
        if (PartCreationComponent.VERBOSE) {
            console.log('PartCreationComponent.onGameStarted(' + JSON.stringify(iJoinerId) + ')');
        }
        this.gameStartNotification.emit(iJoinerId.doc);
        this.gameStarted = true;
        if (PartCreationComponent.VERBOSE) {
            console.log('PartCreationComponent.onGameStarted finished');
        }
    }
    private updateJoiner(iJoinerId: IJoinerId) {
        if (PartCreationComponent.VERBOSE) console.log("PartCreationComponent.updateJoiner");

        // Update the form depending on which state we're on now
        this.userIsCreator = (this.userName === iJoinerId.doc.creator);
        this.userIsChosenPlayer = (this.userName === iJoinerId.doc.chosenPlayer);
        this.proposalSent = iJoinerId.doc.partStatus > 1;
        if (this.userIsCreator) {
            this.proposingDisabled = (iJoinerId.doc.partStatus !== 1);
        } else {
            // this.timeout = iJoinerId.joiner.timeoutMinimalDuration;
            this.maximalMoveDuration = iJoinerId.doc.maximalMoveDuration;
            this.firstPlayer = iJoinerId.doc.firstPlayer;
            this.acceptingDisabled = (iJoinerId.doc.partStatus !== 2);
        }
        this.currentJoiner = iJoinerId.doc;
    }
    private async cancelGameCreation(): Promise<void> {
        // callable only by the creator
        if (PartCreationComponent.VERBOSE) console.log('PartCreationComponent.cancelGameCreation');

        await this.gameService.deletePart(this.partId)
        if (PartCreationComponent.VERBOSE) console.log('PartCreationComponent.cancelGameCreation: game deleted');

        await this.joinerService.deleteJoiner();
        if (PartCreationComponent.VERBOSE) console.log('PartCreationComponent.cancelGameCreation: game and joiner deleted');

        await this.chatService.deleteChat(this.partId);
        if (PartCreationComponent.VERBOSE) console.log('PartCreationComponent.cancelGameCreation: game and joiner and chat deleted');

        return Promise.resolve();
    }
    public cancelAndLeave() {
        console.log("I CANCEL AND LEAVE");
        this.router.navigate(['/server']);
    }
    public unselectChosenPlayer() {
        this.joinerService.unselectChosenPlayer();
    }
    public setChosenPlayer(pseudo: string): Promise<void> {
        if (PartCreationComponent.VERBOSE) console.log('PartCreationComponent.setChosenPlayer(' + pseudo + ')');

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
        if (PartCreationComponent.VERBOSE) console.log("PartCreationComponent.acceptConfig");
        // called by the joiner

        // trigger the beginning redirection that will be called on every subscribed user
        // status become 3 (game started)
        // console.log('let\'s accept config of ' + this.partId);
        // console.log('GameService observing : ');
        return this.gameService.acceptConfig(this.partId, this.currentJoiner);
    }
    public async ngOnDestroy(): Promise<void> {
        if (PartCreationComponent.VERBOSE) console.log('PartCreationComponent.ngOnDestroy');

        if (this.userSub && this.userSub.unsubscribe) {
            this.userSub.unsubscribe();
        }
        if (this.partSub && this.partSub.unsubscribe) {
            this.partSub.unsubscribe();
        }
        if (this.gameStarted) {
            if (PartCreationComponent.VERBOSE) console.log('PartCreationComponent.ngOnDestroy game started, stop observing joiner');
            this.joinerService.stopObserving();
        } else {
            if (this.userIsCreator) {
                if (PartCreationComponent.VERBOSE) console.log('PartCreationComponent.ngOnDestroy: you are the creator and you are about to cancel game creation, ' + this.userName);

                await this.cancelGameCreation();
            } else {
                if (PartCreationComponent.VERBOSE) console.log('PartCreationComponent.ngOnDestroy: you are a joiner and you are about to cancel game joining, ' + this.userName);
                await this.joinerService.cancelJoining(this.userName);
            }
            this.joinerService.stopObserving();
            if (PartCreationComponent.VERBOSE) console.log('PartCreationComponent.ngOnDestroy: you stopped observing joiner');
        }
        return Promise.resolve();
    }
}
