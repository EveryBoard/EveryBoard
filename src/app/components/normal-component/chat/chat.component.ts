import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ChatService } from '../../../services/ChatService';
import { IMessage } from '../../../domain/imessage';
import { AuthenticationService, AuthUser } from 'src/app/services/AuthenticationService';
import { IChatId } from 'src/app/domain/ichat';
import { assert, display } from 'src/app/utils/utils';
import { MGPOptional } from 'src/app/utils/MGPOptional';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
})
export class ChatComponent implements OnInit, OnDestroy {
    public static VERBOSE: boolean = false;

    @Input() public chatId: string;
    @Input() public turn: number;
    public userMessage: string = '';
    public userName: MGPOptional<string> = MGPOptional.empty();

    public connected: boolean = false;
    public chat: IMessage[];
    public readMessages: number = 0;
    public unreadMessages: number = 0;

    public visible: boolean = true;

    constructor(private chatService: ChatService,
                private authenticationService: AuthenticationService) {
        display(ChatComponent.VERBOSE, 'ChatComponent constructor');
    }
    public ngOnInit(): void {
        display(ChatComponent.VERBOSE, 'ChatComponent.ngOnInit');

        assert(this.chatId != null && this.chatId !== '', 'No chat to join mentionned');

        this.authenticationService.getJoueurObs()
            .subscribe((joueur: AuthUser) => {
                if (this.isConnectedUser(joueur)) {
                    display(ChatComponent.VERBOSE, JSON.stringify(joueur) + ' just connected');
                    this.userName = MGPOptional.of(joueur.pseudo);
                    this.connected = true;
                    this.loadChatContent();
                } else {
                    display(ChatComponent.VERBOSE, 'No User Logged');
                    this.userName = MGPOptional.empty();
                    this.connected = false;
                }
            });
    }
    public isConnectedUser(joueur: { pseudo: string; verified: boolean;}): boolean {
        return joueur && joueur.pseudo && joueur.pseudo !== '';
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
    public async sendMessage(content: string): Promise<void> {
        assert(this.userName.isPresent(), 'disconnected user cannot send a message');
        await this.chatService.sendMessage(this.userName.get(), this.turn, content);
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
