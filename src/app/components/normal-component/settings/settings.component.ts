import { Component } from '@angular/core';
import { ThemeService } from 'src/app/services/ThemeService';
import { UserSettingsService } from 'src/app/services/UserSettingsService';

type SettingOption = { value: string, name: string }

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
})
export class SettingsComponent {
    public readonly availableLanguages: SettingOption[] = [
        { value: 'fr', name: 'Français' },
        { value: 'en', name: 'English' },
    ]
    public readonly availableThemes: SettingOption[] = [
        { value: 'light', name: $localize`Light` },
        { value: 'dark', name: $localize`Dark` },
    ]

    public currentTheme: string;
    public currentLanguage: string;

    public constructor(private userSettingsService: UserSettingsService,
                       themeService: ThemeService) {
        this.currentTheme = themeService.getTheme();
        this.currentLanguage = this.userSettingsService.getLanguage();
    }
    public changeLanguage(event: Event): void {
        const target: HTMLSelectElement = event.target as HTMLSelectElement;
        this.userSettingsService.changeLanguage(target.value);
        this.reload();
    }
    public changeTheme(event: Event): void {
        const target: HTMLSelectElement = event.target as HTMLSelectElement;
        this.userSettingsService.changeTheme(target.value);
        this.reload();
    }
    private reload(): void {
        // Reload app to apply changes
        window.open(window.location.href, '_self');
    }
}
