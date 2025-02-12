import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import Phaser from 'phaser';
import { addIcons } from 'ionicons';
import { play } from 'ionicons/icons';
import { GameScene } from './game/game.scene';

@Component({
    selector: 'app-game',
    standalone: true,
    imports: [IonButton, IonIcon, CommonModule],
    styles: [`
      :host {
        display: block;
        width: 100vw;
        height: 100vh;
        margin: 0;
        padding: 0;
        position: fixed;
        top: 0;
        left: 0;
        overflow: hidden;
      }
  
      #game {
        width: 100vw;
        height: 100vh;
        margin: 0;
        padding: 0;
        touch-action: none;
        background-color: #000;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
      }
  
      .back-button {
        position: fixed;
        left: 10px; 
        top: env(safe-area-inset-top, 10px);  
        z-index: 10; 
      }
  
      ::ng-deep canvas {
        width: 100vw !important;
        height: 100vh !important;
        margin: 0 !important;
        padding: 0 !important;
      }
    `],
    template: `
    <ion-button (click)="goBack()" class="back-button">
      <ion-icon name="play" style="transform: scaleX(-1);"></ion-icon>
    </ion-button>
    <div id="game"></div>
  `,
  })
  export class GameComponent implements OnInit, OnDestroy {
    private game!: Phaser.Game;
    constructor(private navCtrl: NavController) {
      addIcons({ play });
    }
    ngOnInit() {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        backgroundColor: '#000000',
        scene: GameScene,
        parent: 'game',
        physics: {
          default: 'arcade',
          arcade: {
            gravity: {
              y: 600,
              x: 0
            },
            debug: false
          }
        },
        pixelArt: true,
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          width: window.innerWidth,
          height: window.innerHeight,
          parent: 'game',
          expandParent: true,
          min: {
            width: 0,
            height: 0
          },
          max: {
            width: 9999,
            height: 9999
          }
        }
      };
  
      this.game = new Phaser.Game(config);
    }
  
    goBack() {
      this.navCtrl.back();
    }
  
    ngOnDestroy() {
      if (this.game) {
        this.game.destroy(true);
      }
    }
  }