import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
// import {JwtHelperService} from '@auth0/angular-jwt';
import {Observable} from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class AuthenticationService {

	constructor(private http: HttpClient) {
	}

	url_authentication = 'http://localhost:8082/martiastrid/api/token/generate-token';

	login(username: string, password: string): Observable<void> {
		return this.http.post<any>(this.url_authentication, {username: username, password: password})
			.pipe(map((res: any) => {
				// login successful if there's a jwt token in the response
				if (res && res.token) {
					sessionStorage.setItem('currentUser', JSON.stringify({
						token: res.token
					}));
				}
			}));
	}

	logout() {
		// remove user from local storage to log user out
		sessionStorage.removeItem('currentUser');
	}

	isLoggedIn(): boolean {
		return !!(sessionStorage.getItem('currentUser'));
	}

	/* getJwtSubjet(): string {
		const stored = sessionStorage.getItem('currentUser');
		if (stored) {
			const helper = new JwtHelperService();
			return helper.decodeToken(JSON.parse(stored).token).sub;
		}
		return null;
	} */
}
