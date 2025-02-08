// game.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import Phaser from 'phaser';

class GameScene extends Phaser.Scene {
  private dog!: Phaser.GameObjects.Sprite;
  private base!: Phaser.GameObjects.Arc;
  private stick!: Phaser.GameObjects.Arc;
  private jumpButton!: Phaser.GameObjects.Arc;
  private jumpButtonText!: Phaser.GameObjects.Text;
  private baseCenter: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
  private isJoystickActive: boolean = false;
  private isJumping: boolean = false;

  private readonly JOYSTICK_RADIUS = 50;
  private readonly MAX_SPEED = 8;
  private readonly MIN_SPEED = 2;
  private readonly JUMP_FORCE = -300;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload(): void {
    this.load.image('dog-idle', 'assets/spritesheets/dante/dantequit.png');
    this.load.image('dog-walk', 'assets/spritesheets/dante/dantewalk.png');
    this.load.image('dog-jump', 'assets/spritesheets/dante/dantejump.png'); // Nuevo sprite de salto
  }

  create(): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFFFFFF);
    graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

    this.dog = this.add.sprite(400, 300, 'dog-idle');
    this.dog.displayWidth = 40;
    this.dog.displayHeight = 40;
    
    this.physics.add.existing(this.dog);
    const dogBody = this.dog.body as Phaser.Physics.Arcade.Body;
    dogBody.setCollideWorldBounds(true);

    // Animaciones
    this.anims.create({
      key: 'walk',
      frames: [
        { key: 'dog-idle' },
        { key: 'dog-walk' }
      ],
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'jump',
      frames: [
        { key: 'dog-jump' }
      ],
      frameRate: 1,
      repeat: 0
    });

    this.createJoystick();
    this.createJumpButton();

    // Eventos del joystick
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.x < this.cameras.main.width / 2) {
        this.isJoystickActive = true;
        this.baseCenter.x = pointer.x;
        this.baseCenter.y = pointer.y;
        this.base.setPosition(pointer.x, pointer.y);
        this.stick.setPosition(pointer.x, pointer.y);
        this.base.setAlpha(0.7);
        this.stick.setAlpha(0.7);
      }
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isJoystickActive) {
        const distance = Phaser.Math.Distance.Between(
          this.baseCenter.x, 
          this.baseCenter.y, 
          pointer.x, 
          pointer.y
        );
        
        if (distance <= this.JOYSTICK_RADIUS) {
          this.stick.setPosition(pointer.x, pointer.y);
        } else {
          const angle = Phaser.Math.Angle.Between(
            this.baseCenter.x, 
            this.baseCenter.y, 
            pointer.x, 
            pointer.y
          );
          
          this.stick.setPosition(
            this.baseCenter.x + Math.cos(angle) * this.JOYSTICK_RADIUS,
            this.baseCenter.y + Math.sin(angle) * this.JOYSTICK_RADIUS
          );
        }

        if (!this.isJumping && Math.abs(this.stick.x - this.baseCenter.x) > 10) {
          if (this.stick.x < this.baseCenter.x) {
            this.dog.setFlipX(true);
            this.dog.play('walk', true);
          } else {
            this.dog.setFlipX(false);
            this.dog.play('walk', true);
          }
        }
      }
    });

    this.input.on('pointerup', () => {
      this.isJoystickActive = false;
      this.base.setAlpha(0);
      this.stick.setAlpha(0);
      if (!this.isJumping) {
        this.dog.stop();
        this.dog.setTexture('dog-idle');
      }
    });
  }

  private createJoystick(): void {
    this.base = this.add.arc(0, 0, this.JOYSTICK_RADIUS, 0, 360, false, 0x000000, 0);
    this.base.setStrokeStyle(3, 0x888888);
    this.base.setAlpha(0);
    
    this.stick = this.add.arc(0, 0, this.JOYSTICK_RADIUS/2, 0, 360, false, 0x000000, 0);
    this.stick.setStrokeStyle(3, 0x888888);
    this.stick.setAlpha(0);
  }

  private createJumpButton(): void {
    const buttonX = this.cameras.main.width - 100;
    const buttonY = this.cameras.main.height - 100;

    this.jumpButton = this.add.arc(buttonX, buttonY, 40, 0, 360, false, 0x000000, 0.2);
    this.jumpButton.setStrokeStyle(3, 0x888888);
    
    this.jumpButtonText = this.add.text(buttonX, buttonY, 'A', {
      fontSize: '32px',
      color: '#000000'
    }).setOrigin(0.5);

    this.jumpButton.setInteractive();

    this.jumpButton.on('pointerdown', () => {
      if (this.canJump()) {
        const dogBody = this.dog.body as Phaser.Physics.Arcade.Body;
        dogBody.setVelocityY(this.JUMP_FORCE);
        this.isJumping = true;
        this.dog.play('jump', true); // Reproducir animación de salto
        this.jumpButton.setFillStyle(0x000000, 0.4);
      }
    });

    this.jumpButton.on('pointerup', () => {
      this.jumpButton.setFillStyle(0x000000, 0.2);
    });

    this.jumpButton.on('pointerout', () => {
      this.jumpButton.setFillStyle(0x000000, 0.2);
    });
  }

  private canJump(): boolean {
    const dogBody = this.dog.body as Phaser.Physics.Arcade.Body;
    return dogBody.touching.down || dogBody.blocked.down;
  }

  override update(): void {
    if (this.isJoystickActive) {
      const distanceX = this.stick.x - this.baseCenter.x;
      const maxDistance = this.JOYSTICK_RADIUS;
      
      let speed = Phaser.Math.Linear(
        this.MIN_SPEED,
        this.MAX_SPEED,
        Math.abs(distanceX) / maxDistance
      );
      
      if (Math.abs(distanceX) > 5) {
        if (distanceX < 0) {
          this.dog.x -= speed;
        } else {
          this.dog.x += speed;
        }
      }
    }

    // Actualizar estado de salto y animaciones
    const dogBody = this.dog.body as Phaser.Physics.Arcade.Body;
    if (dogBody.touching.down || dogBody.blocked.down) {
      if (this.isJumping) {
        this.isJumping = false;
        if (this.isJoystickActive && Math.abs(this.stick.x - this.baseCenter.x) > 10) {
          this.dog.play('walk', true);
        } else {
          this.dog.setTexture('dog-idle');
        }
      }
    }
  }
}

@Component({
  selector: 'app-game',
  standalone: true,
  template: `<div id="game"></div>`,
  styles: [`
    #game {
      width: 100vw;
      height: 100vh;
      margin: 0;
      padding: 0;
      touch-action: none;
      background-color: #000;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `]
})
export class GameComponent implements OnInit, OnDestroy {
  private game!: Phaser.Game;

  ngOnInit() {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#FFFFFF',
      scene: GameScene,
      parent: 'game',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: {
            y: 300,
            x: 0
          },
          debug: false
        }
      }
    };

    this.game = new Phaser.Game(config);
  }

  ngOnDestroy() {
    if (this.game) {
      this.game.destroy(true);
    }
  }
}