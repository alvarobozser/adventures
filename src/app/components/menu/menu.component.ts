import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { play, settings, trophy } from 'ionicons/icons';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [IonContent, IonButton, IonIcon, CommonModule],
  styles: [`
    .game-menu {
    width: 100vw;
    height: 100vh;
    background: url('/assets/backmenu.webp') no-repeat center/cover;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: clamp(15px, 3vh, 30px);
    overflow: hidden;
    padding: clamp(10px, 2vw, 20px);
    box-sizing: border-box;
    }

    @keyframes jumpInfinite {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-15px); }
    }
    .menu-button {
      width: clamp(200px, 30vw, 280px);
      height: clamp(50px, 8vh, 70px);
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin: 12px;
      position: relative;
      overflow: hidden;
      transition: all 0.2s;
      border-radius:30px;
    }

    .menu-button::before {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      right: 2px;
      height: 50%;
      background: linear-gradient(rgba(255,255,255,0.2), transparent);
      border-radius: 8px 8px 0 0;
    }

    .menu-button ion-icon {
      font-size: clamp(20px, 3vw, 24px);
      margin-right: 10px;
      filter: drop-shadow(2px 2px 0 rgba(0,0,0,0.3));
    }

    @media (orientation: landscape) and (max-height: 500px) {
    .menu-title {
      font-size: clamp(1.5rem, 4vh, 3rem);
    }
    
    .menu-button {
      height: clamp(30px, 12vh, 60px);
    }

    }
  `],
  template: `
    <ion-content>
      <div class="game-menu">
        <img src="/assets/ttile.webp" alt="" height="250px" width="250px">
        <ion-button class="menu-button" (click)="startGame()">
          <ion-icon slot="start" name="play"></ion-icon>Comenzar
        </ion-button>
      </div>
    </ion-content>
  `
})
export class MenuComponent {
  constructor(private router: Router) {
    addIcons({ play, settings, trophy });
  }

  startGame() {
    this.router.navigate(['/select']);
  }
}