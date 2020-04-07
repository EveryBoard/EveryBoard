import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ChatService } from '../../../services/chat/ChatService';
import { IMessage } from '../../../domain/imessage';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {

    static VERBOSE = false;

    @Input() chatId: string;
    @Input() turn: number;
    userName: string;

    chat: IMessage[];
    userMessage: string;

    constructor(private chatService: ChatService, private authenticationService: AuthenticationService) {
    }
    public ngOnInit() {
        if (ChatComponent.VERBOSE) {
            console.log('chat component initialisation');
        }
        this.authenticationService.getJoueurObs()
            .subscribe(joueur => {
                if (joueur) {
                    if (ChatComponent.VERBOSE) console.log(joueur + " just connected");
                    this.userName = joueur.pseudo;
                    this.loadChatContent();
                } else {
                    if (ChatComponent.VERBOSE) console.log("No User Logged");
                    this.showDisconnectedChat();
                }
            });
    }
    public loadChatContent() {
        if (this.chatId == null || this.chatId === '') throw new Error('No chat to join mentionned');

        if (ChatComponent.VERBOSE) {
            console.log('User \'' + this.userName + '\' logged, loading chat content');
        }
        this.chatService.startObserving(this.chatId, chat => this.chat = chat.chat.messages);
    }
    public showDisconnectedChat() {
        const msg: IMessage = {sender: 'fake', content: 'vous devez être connecté pour voir le chat...', postedTime: Date.now(), lastTurnThen: null};
        this.chat = [msg, msg, msg, msg, msg];
    }
    public sendMessage() {
        if (this.userName === '') {
            if (ChatComponent.VERBOSE) {
                console.log('je t\'envoie un toast car t\'es pas connecté donc tu te tait!');
            }
        }
        this.chatService.sendMessage(this.userName, this.turn, this.userMessage);
        this.userMessage = '';
    }
    public ngOnDestroy() {
        this.chatService.stopObserving();
    }
}