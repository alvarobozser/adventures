import { Injectable } from '@angular/core';
import * as Phaser from 'phaser';

@Injectable({
  providedIn: 'root'
})
export class PhaserService {
  phaserGame: Phaser.Game;
  config: Phaser.Types.Core.GameConfig;

  constructor() {
    this.config = {
      type: Phaser.AUTO,
      height: 600,
      width: 800,
      scene: {
        preload: this.preload,
        create: this.create,
        update: this.update
      },
      parent: 'gameContainer',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 300 },
          debug: false
        }
      }
    };
  }

  createGame() {
    this.phaserGame = new Phaser.Game(this.config);
  }

  preload() {
    // Cargar assets
  }

  create() {
    // Crear elementos del juego
  }

  update() {
    // Lógica de actualización
  }
}