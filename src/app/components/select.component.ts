import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { play } from 'ionicons/icons';
import { NavController } from '@ionic/angular';


@Component({
  selector: 'app-select',
  standalone: true,
  imports: [IonContent, IonButton, IonIcon, CommonModule],
  styles: [`
      .game-menu {
      width: 100vw;
      height: 100vh;
      background: url('/assets/menu/backmenu.webp') no-repeat center/cover;
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
        height: clamp(40px, 12vh, 60px);
      }

      }

      .select{
          border: 5px solid black;
          border-radius: 20px;
      }

      .back-button {
        position: absolute;
        left: 10px; 
        top: 10px;  
        z-index: 10; 
      }

      .character-container {
        display: flex;
        justify-content: flex-end;  
        gap: 20px; 
        overflow-x: auto;  
        padding: 10px;
      }

      .character-container {
        display: flex;
        position: fixed;
        bottom: 20px; 
        z-index: 9999; 
        gap: 15px; 
      }

      .character-card {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #fff;
        padding: 15px;
        border-radius: 10px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        text-align: center;
        height: 200px;
        max-width: 245px;
        border: 4px solid black;
        cursor: pointer;
      }

      .character-image {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        margin-bottom: 10px;
      }

      .character-info h3 {
        font-size: 1.2em;
        font-weight: bold;
        margin-bottom: 5px;
      }

      .character-info p {
        font-size: 0.9em;
        color: #555;
        line-height: 1.4em;
      }
  `],
  template: `
    <ion-content>
      <div class="game-menu">
        <ion-button (click)="goBack()" class="back-button">
        <ion-icon name="play" style="transform: scaleX(-1);"></ion-icon>
        </ion-button>
        <img src="/assets/menu/ttile.webp" alt="" height="250px" width="250px" style="margin-bottom: 20%;">
        <div class="character-container">
        <div class="character-card" (click)="startGame()">
          <img src="/assets/dante/danteSelect.png" alt="Dante" class="character-image">
          <div class="character-info">
            <h3>Dante</h3>
            <p>Un guerrero perruno con habilidades inigualables. ¡Elige a Dante y empieza tu aventura!</p>
          </div>
        </div>
        <div class="character-card">
          <img src="/assets/menu/ttile.webp" alt="Otro Personaje" class="character-image">
          <div class="character-info">
            <h3>Otro Personaje</h3>
            <p>Una descripción breve de otro personaje.</p>
          </div>
        </div>
      </div>
      </div>
    </ion-content>
  `
})

export class SelectComponent {
  constructor(private router: Router, private navCtrl: NavController) {
    addIcons({ play });
  }

  startGame() {
    this.router.navigate(['/game']);
  }

  goBack() {
    this.navCtrl.back();
  }

}