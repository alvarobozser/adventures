import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { MenuComponent } from './components/menu.component';
import { ScreenOrientation } from '@capacitor/screen-orientation';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, MenuComponent],
  template: `
    <ion-app>
      <app-menu></app-menu>
      <ion-router-outlet></ion-router-outlet>
    </ion-app>
  `
})
export class AppComponent { 

  constructor() {
    ScreenOrientation.lock({
      orientation: 'landscape'
    });
  }
}