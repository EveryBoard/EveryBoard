import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ChatService } from '../../../services/ChatService';
import { IMessage } from '../../../domain/imessage';
import { AuthenticationService, AuthUser } from 'src/app/services/AuthenticationService';
import { IChatId } from 'src/app/domain/ichat';
import { display } from 'src/app/utils/utils';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
})
export class ChatComponent implements OnInit, OnDestroy {
    public static VERBOSE: boolean = false;

    @Input() public chatId: string;
    @Input() public turn: number;
    public userName: string;

    public chat: IMessage[];
    public userMessage: string;
    public readMessages: number = 0;
    public unreadMessages: number = 0;

    public visible: boolean = true;

    constructor(private chatService: ChatService,
                private authenticationService: AuthenticationService) {
        display(ChatComponent.VERBOSE, 'ChatComponent constructor');
    }
    public ngOnInit(): void {
        display(ChatComponent.VERBOSE, 'ChatComponent.ngOnInit');

        if (this.chatId == null || this.chatId === '') throw new Error('No chat to join mentionned');

        this.authenticationService.getJoueurObs()
            .subscribe((joueur: AuthUser) => {
                if (this.isConnectedUser(joueur)) {
                    display(ChatComponent.VERBOSE, JSON.stringify(joueur) + ' just connected');
                    this.userName = joueur.pseudo;
                    this.loadChatContent();
                } else {
                    display(ChatComponent.VERBOSE, 'No User Logged');
                    this.showDisconnectedChat();
                }
            });
    }
    public isConnectedUser(joueur: { pseudo: string; verified: boolean;}): boolean {
        return joueur && joueur.pseudo &&
               joueur.pseudo !== '' &&
               joueur.pseudo !== 'null' &&
               joueur.pseudo !== 'undefined';
    }
    public loadChatContent(): void {
        display(ChatComponent.VERBOSE, 'User \'' + this.userName + '\' logged, loading chat content');

        this.chatService.startObserving(this.chatId, (id: IChatId) => this.updateMessages(id));
    }
    public updateMessages(iChatId: IChatId): void {
        this.chat = iChatId.doc.messages;
        const nbMessages: number = this.chat.length;
        if (this.visible === false) {
            this.unreadMessages = nbMessages - this.readMessages;
        } else {
            this.readMessages = nbMessages;
            this.unreadMessages = 0;
        }
    }
    public showDisconnectedChat(): void {
        const msg: IMessage = {
            sender: 'fake',
            content: $localize`You must be logged in to see the chat.`,
            postedTime: Date.now(),
            lastTurnThen: null,
        };
        this.chat = [msg, msg, msg, msg, msg];
    }
    public sendMessage(): void {
        if (this.userName === '') {
            display(ChatComponent.VERBOSE, 'je t\'envoie un toast car t\'es pas connecté donc tu te tait!');
        }
        this.chatService.sendMessage(this.userName, this.turn, this.userMessage);
        this.userMessage = '';
    }
    public ngOnDestroy(): void {
        if (this.chatService.isObserving()) {
            this.chatService.stopObserving();
        }
    }
    public switchChatVisibility(): void {
        if (this.visible === true) {
            this.visible = false;
        } else {
            this.visible = true;
            this.unreadMessages = 0;
            this.readMessages = this.chat.length;
        }
    }
}
