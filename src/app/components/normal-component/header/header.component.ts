import { Component, OnInit } from '@angular/core';
import {UserNameService} from '../../../services/user-name-service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  userName: String;

  constructor(private userNameService: UserNameService) { }

  ngOnInit() {
    this.userNameService.currentMessage.subscribe( message =>
      this.userName = message);
  }

}
