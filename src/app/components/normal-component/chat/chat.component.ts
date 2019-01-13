import {Component, Input, OnInit} from '@angular/core';
import {ChatService} from '../../../services/ChatService';
import {IMessage} from '../../../domain/imessage';

@Component({
	selector: 'app-chat',
	templateUrl: './chat.component.html',
	styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

	@Input() chatId: string;
	@Input() userName: string;

	chat: IMessage[];

	constructor(private chatService: ChatService) {
		if (this.chatId == null || this.chatId === '') {
			console.log('Chat Id is null, keep your attempt, it suck');
		} else if (this.userName == null || this.userName === '') {
			console.log('ChatCompo : get yourself a userName yoy twat');
		} else {
			this.chatService.startObserving(this.chatId, chat => this.chat = chat.chat.messages);
		}
	}

	ngOnInit() {

	}

}
