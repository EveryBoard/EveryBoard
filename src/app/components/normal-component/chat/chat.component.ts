import { Component, Input, OnDestroy, ElementRef, ViewChild, OnInit, AfterViewChecked } from '@angular/core';
import { ChatService } from '../../../services/ChatService';
import { Message, MessageDocument } from '../../../domain/Message';
import { AuthenticationService } from 'src/app/services/AuthenticationService';
import { display } from 'src/app/utils/utils';
import { assert } from 'src/app/utils/assert';
import { faReply, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FirebaseCollectionObserver } from 'src/app/dao/FirebaseCollectionObserver';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
})
export class ChatComponent implements OnInit, AfterViewChecked, OnDestroy {
    public static VERBOSE: boolean = false;

    @Input() public chatId!: string;
    @Input() public turn?: number;
    public userMessage: string = '';

    public connected: boolean = false;
    public chat: Message[] = [];
    public readMessages: number = 0;
    public unreadMessagesText: string = '';
    public showUnreadMessagesButton: boolean = false;
    public visible: boolean = true;

    public faReply: IconDefinition = faReply;

    private isNearBottom: boolean = true;
    private notYetScrolled: boolean = true;

    @ViewChild('chatDiv') chatDiv: ElementRef<HTMLElement>;

    constructor(private readonly chatService: ChatService,
                private readonly authenticationService: AuthenticationService) {
        display(ChatComponent.VERBOSE, 'ChatComponent constructor');
    }
    public ngOnInit(): void {
        display(ChatComponent.VERBOSE, `ChatComponent.ngOnInit for chat ${this.chatId}`);

        assert(this.chatId != null && this.chatId !== '', 'No chat to join mentionned');
        this.loadChatContent();
    }
    public ngAfterViewChecked(): void {
        this.scrollToBottomIfNeeded();
    }
    public loadChatContent(): void {
        const callback: FirebaseCollectionObserver<Message> =
            new FirebaseCollectionObserver<Message>(
                (messages: MessageDocument[]) => {
                    this.updateMessages(messages.map((doc: MessageDocument) => doc.data));
                },
                () => {
                    // We don't care about modified messages
                },
                () => {
                    // We don't care about deleted messages
                });
        this.chatService.startObserving(this.chatId, callback);
    }
    public updateMessages(newMessages: Message[]): void {
        this.chat = this.chat.concat(newMessages);
        const nbMessages: number = this.chat.length;
        if (this.visible === true && this.isNearBottom === true) {
            this.readMessages = nbMessages;
            this.updateUnreadMessagesText(0);
            this.scrollToBottom();
        } else {
            this.updateUnreadMessagesText(nbMessages - this.readMessages);
        }
    }
    private updateUnreadMessagesText(unreadMessages: number): void {
        if (this.visible && this.isNearBottom === false) {
            this.showUnreadMessagesButton = true;
        } else {
            this.showUnreadMessagesButton = false;
        }

        console.log('unread messages: ' + unreadMessages)
        if (unreadMessages === 0) {
            this.unreadMessagesText = $localize`no new message`;
            this.showUnreadMessagesButton = false;
        } else if (unreadMessages === 1) {
            this.unreadMessagesText = $localize`1 new message`;
        } else {
            this.unreadMessagesText = $localize`${unreadMessages} new messages`;
        }
    }
    private scrollToBottomIfNeeded(): void {
        if (this.visible) {
            if (this.isNearBottom || this.notYetScrolled) {
                this.scrollToBottom();
            }
        }
    }
    public updateCurrentScrollPosition(): void {
        const threshold: number = 10;
        const position: number = this.chatDiv.nativeElement.scrollTop + this.chatDiv.nativeElement.offsetHeight;
        const height: number = this.chatDiv.nativeElement.scrollHeight;
        this.isNearBottom = position > height - threshold;
    }
    public scrollToBottom(): void {
        if (this.chatDiv == null) {
            return;
        }
        this.updateUnreadMessagesText(0);
        this.scrollTo(this.chatDiv.nativeElement.scrollHeight);
        this.notYetScrolled = false;
    }
    public scrollTo(position: number): void {
        this.chatDiv.nativeElement.scroll({
            top: position,
            left: 0,
            behavior: 'smooth',
        });
    }
    public async sendMessage(): Promise<void> {
        console.log('sending message')
        const content: string = this.userMessage;
        this.userMessage = ''; // clears it first to seem more responsive
        console.log('calling sendMessage')
        console.log('uid' + this.authenticationService.uid);
        console.log('username' + this.authenticationService.user.get().username.get());
        await this.chatService.sendMessage(this.authenticationService.uid.get(),
                                           this.authenticationService.user.get().username.get(),
                                           content, this.turn);
        console.log('done')
    }
    public ngOnDestroy(): void {
        if (this.chatService.isObserving()) {
            this.chatService.stopObserving();
        }
    }
    public switchChatVisibility(): void {
        console.log('switching visibility')
        if (this.visible === true) {
            console.log('was visible')
            this.visible = false;
        } else {
            console.log('was not visible')
            this.visible = true;
            this.updateUnreadMessagesText(0);
            this.scrollToBottom();
            this.readMessages = this.chat.length;
        }
    }
}
