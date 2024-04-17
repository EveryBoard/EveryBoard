import { Injectable } from '@angular/core';
import { MGPOptional } from '@everyboard/lib';
import { LocaleUtils } from '../utils/LocaleUtils';

@Injectable({
    providedIn: 'root',
})
export class UserSettingsService {

    public changeTheme(theme: string): void {
        localStorage.setItem('theme', theme);
    }
    public getTheme(): MGPOptional<string> {
        return MGPOptional.ofNullable(localStorage.getItem('theme'));
    }
    public changeLanguage(language: string): void {
        localStorage.setItem('locale', language.toLowerCase());
    }
    public getLanguage(): string {
        return LocaleUtils.getLocale();
    }
}
