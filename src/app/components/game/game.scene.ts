// game.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import Phaser from 'phaser';
import { addIcons } from 'ionicons';
import { play } from 'ionicons/icons';

class GameScene extends Phaser.Scene {
  private dog!: Phaser.GameObjects.Sprite;
  private base!: Phaser.GameObjects.Arc;
  private stick!: Phaser.GameObjects.Arc;
  private jumpButton!: Phaser.GameObjects.Arc;
  private jumpButtonText!: Phaser.GameObjects.Text;
  private baseCenter: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
  private tokens!: Phaser.Physics.Arcade.Group;
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private tokensBeingCollected!: Set<Phaser.Physics.Arcade.Sprite>;
  private deathY: number = 0;

  private isJoystickActive: boolean = false;
  private isJumping: boolean = false;
  private readonly JOYSTICK_RADIUS = 30;
  private readonly MAX_SPEED = 5;
  private readonly MIN_SPEED = 2;
  private readonly JUMP_FORCE = -200;

  constructor() {
    super({ key: 'GameScene' });
    this.tokensBeingCollected = new Set();
  }

  preload(): void {
    this.load.image('background', 'assets/background.jpg');
    this.load.image('dog-idle', 'assets/spritesheets/dante/dantequit.png');
    this.load.image('dog-walk', 'assets/spritesheets/dante/dantewalk.png');
    this.load.image('dog-jump', 'assets/spritesheets/dante/dantejump.png');

    this.load.image('tiles', 'assets/tiles.png');
    this.load.image('token', 'assets/token.png');
    this.load.tilemapTiledJSON('map', 'assets/level.json');
  }

  create(): void {
    const uiLayer = this.add.container(0, 0);
    uiLayer.setScrollFactor(0);
    this.textInicializer();


    const background = this.add.image(0, 0, 'background')
      .setOrigin(0, 0)
      .setDepth(-1)
      .setScrollFactor(0); // El fondo no se moverá con la cámara

    // Asegurar que el background cubra toda la pantalla
    const scaleX = this.cameras.main.width / background.width;
    const scaleY = this.cameras.main.height / background.height;
    const scale = Math.max(scaleX, scaleY);
    background.setScale(scale);

    const map = this.make.tilemap({ key: 'map', tileWidth: 32, tileHeight: 32 });

    this.tokens = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });
    this.deathY = map.heightInPixels + 100;

    const tileset = map.addTilesetImage('tiles', 'tiles');
    const layer = map.createLayer('toplayer', tileset!, 0, 33);
    const tokensLayer = map.getObjectLayer('tokens');
    layer!.setCollisionByExclusion([-1]); // Esto hace que todos los tiles excepto el vacío (-1) sean sólidos

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    background.setDisplaySize(map.widthInPixels, map.heightInPixels);

    const graphics = this.add.graphics();
    graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

    this.dog = this.add.sprite(70, 300, 'dog-idle');
    this.dog.displayWidth = 40;
    this.dog.displayHeight = 40;

    this.physics.add.existing(this.dog);
    const dogBody = this.dog.body as Phaser.Physics.Arcade.Body;

    dogBody.setSize(64, 64); // Ajusta estos valores según necesites
    dogBody.setOffset(5, 5);

    dogBody.setBounce(0); // Sin rebote
    dogBody.setFriction(1, 0); // Fricción horizontal, vertical

    // Añadir el collider y hacerlo más restrictivo
    this.physics.add.collider(this.dog, layer!, undefined, undefined, this);

    this.createAnimations();
    this.tokensCreate(tokensLayer);


    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.dog, true, 0.08, 0.08); // Los números son el lerp (suavizado)
    this.cameras.main.setDeadzone(100, 100);

    this.createJoystick();
    this.createJumpButton();
    this.joystickEvent();

    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      this.cameras.main.setViewport(0, 0, gameSize.width, gameSize.height);
    });

  }


  private tokensCreate(tokensLayer: any) {
    if (tokensLayer && tokensLayer.objects) {
      tokensLayer.objects.forEach((obj: { x: number | undefined; y: number | undefined; }) => {
        if (obj.x !== undefined && obj.y !== undefined) {
          const token = this.physics.add.sprite(obj.x, obj.y, 'token');

          // Configurar el token para colisiones
          token.setOrigin(0, 0);
          token.setSize(token.width, token.height);
          token.setOffset(0, 0);
          token.setImmovable(true);

          // Añadir al grupo de tokens
          this.tokens.add(token);

          console.log('Token creado en:', obj.x, obj.y);
        }
      });

      // Verificar que el perro existe antes de configurar colisiones
      if (this.dog) {
        console.log('Configurando overlap para el perro en:', this.dog.x, this.dog.y);

        // Asegurarse de que el perro tiene física
        this.physics.world.enable(this.dog);

        // Configurar el tamaño de colisión del perro si es necesario
        this.dog.setSize(this.dog.width * 0.8, this.dog.height * 0.8);

        this.physics.add.overlap(
          this.dog,
          this.tokens,
          (_obj1, _obj2) => {
            console.log('¡Colisión detectada!');
            const token = _obj2 as Phaser.Physics.Arcade.Sprite;

            if (this.tokensBeingCollected.has(token)) {
              return;
            }

            console.log('¡Colisión detectada!');

            // Añadir el token al conjunto de tokens siendo recolectados
            this.tokensBeingCollected.add(token);

            // Desactivar la física inmediatamente
            token.body!.enable = false;

            // Reproducir animación de recolección
            this.tweens.add({
              targets: token,
              scale: 0,
              alpha: 0,
              duration: 200,
              ease: 'Power1',
              onComplete: () => {
                token.disableBody(true, true);
                this.score += 1;
                this.scoreText.setText('hotDogs: ' + this.score);
                console.log('Puntuación actualizada:', this.score);

                if (this.tokens.countActive() === 0) {
                  this.onAllTokensCollected();
                }
              }
            });
          }
        );
      } else {
        console.warn('¡El perro no está inicializado!');
      }
    }
  }

  private joystickEvent() {
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

  private onAllTokensCollected(): void {
    const completedText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      'Level \nComplete!',
      {
        fontSize: '64px',
        fontFamily: 'Comic Sans MS',
        align: 'center',
        color: '#FFD700',
        stroke: '#D40000',
        strokeThickness: 8, // Más grueso para resaltar el borde
        shadow: { color: '#000000', fill: true, offsetX: 3, offsetY: 3, blur: 4 }
      }
    );

    completedText.setOrigin(0.5);
    completedText.setScrollFactor(0);
    completedText.setDepth(100);

    // Animación de entrada con rebote
    completedText.setScale(0);
    this.tweens.add({
      targets: completedText,
      scale: 1,
      duration: 800,
      ease: 'Bounce.Out',
      onComplete: () => {
        // Efecto de parpadeo más suave
        this.tweens.add({
          targets: completedText,
          alpha: 0.6,
          yoyo: true,
          repeat: -1,
          duration: 300, // Más lento para que no moleste
          ease: 'Sine.easeInOut'
        });

        // Movimiento sutil de subida y bajada
        this.tweens.add({
          targets: completedText,
          y: completedText.y - 5,
          yoyo: true,
          repeat: -1,
          duration: 1000,
          ease: 'Sine.easeInOut'
        });
      }
    });
  }

  private createAnimations() {
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
  }

  private textInicializer() {
    this.scoreText = this.add.text(16, 16, 'hotDogs: 0', {
      fontSize: '32px',
      fontFamily: 'Comic Sans MS', // Cambia por "Press Start 2P" si tienes una fuente más arcade
      color: '#FFD700', // Amarillo dorado estilo Mario
      stroke: '#D40000', // Contorno rojo intenso
      strokeThickness: 8, // Más grueso para destacar mejor
      shadow: { color: '#000000', fill: true, offsetX: 3, offsetY: 3, blur: 3 }
    }).setScrollFactor(0).setDepth(100);

    // Animación de brillo/pulso sutil
    this.tweens.add({
      targets: this.scoreText,
      alpha: 0.8,
      yoyo: true,
      repeat: -1,
      duration: 800,
      ease: 'Sine.easeInOut'
    });
    this.scoreText.setPosition(60, 10);
    this.scoreText.setScrollFactor(0); // Fijar a la pantalla
    this.scoreText.setDepth(100); // Asegurar que está por encima de otros elementos
  }


  private createJoystick(): void {
    const uiLayer = this.add.container(0, 0);
    uiLayer.setScrollFactor(0);
   
    this.base = this.add.arc(0, 0, this.JOYSTICK_RADIUS, 0, 360, false, 0x808080, 0.7);
    this.base.setStrokeStyle(3, 0x4d4d4d);
    this.base.setAlpha(0);
    
    this.stick = this.add.arc(0, 0, this.JOYSTICK_RADIUS / 2, 0, 360, false, 0x666666, 0.8); 
    this.stick.setStrokeStyle(3, 0x4d4d4d);
    this.stick.setAlpha(0);
    uiLayer.add(this.base)
   }

  private createJumpButton(): void {
    // Crear un contenedor para el botón que estará fijo a la cámara
    const buttonX = this.cameras.main.displayWidth * 0.85; // 85% del ancho
    const buttonY = this.cameras.main.displayHeight * 0.8; // 80% del alto

    // Crear el botón
    this.jumpButton = this.add.arc(buttonX, buttonY, 40, 0, 360, false, 0x000000, 0.2);
    this.jumpButton.setStrokeStyle(3, 0x888888);

    // Crear el texto del botón
    this.jumpButtonText = this.add.text(buttonX, buttonY, 'A', {
      fontSize: '32px',
      color: '#000000'
    }).setOrigin(0.5);

    // Configurar el botón y el texto para que se mantengan fijos en la pantalla
    this.jumpButton.setScrollFactor(0);
    this.jumpButtonText.setScrollFactor(0);

    // Hacer el botón interactivo
    this.jumpButton.setInteractive();

    // Eventos del botón
    this.jumpButton.on('pointerdown', () => {
      if (this.canJump()) {
        const dogBody = this.dog.body as Phaser.Physics.Arcade.Body;
        dogBody.setVelocityY(this.JUMP_FORCE);
        this.isJumping = true;
        this.dog.play('jump', true);
        this.jumpButton.setFillStyle(0x000000, 0.4);
      }
    });

    this.jumpButton.on('pointerup', () => {
      this.jumpButton.setFillStyle(0x000000, 0.2);
    });

    this.jumpButton.on('pointerout', () => {
      this.jumpButton.setFillStyle(0x000000, 0.2);
    });

    // Añadir un evento de resize para mantener el botón en la posición correcta
    this.scale.on('resize', this.updateJumpButtonPosition, this);
  }

  // Método para actualizar la posición del botón cuando la ventana cambia de tamaño
  private updateJumpButtonPosition(): void {
    const buttonX = this.cameras.main.width - 100;
    const buttonY = this.cameras.main.height - 100;

    this.jumpButton.setPosition(buttonX, buttonY);
    this.jumpButtonText.setPosition(buttonX, buttonY);
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

    if (this.dog.y > this.cameras.main.height + 100) {
      this.gameOver();
    }
  }

  private gameOver(): void {
    const gameOverText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      'GAME OVER',
      {
        fontSize: '64px',
        fontFamily: 'Comic Sans MS',
        color: '#FF0000',
        stroke: '#000000',
        strokeThickness: 6
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(100);
  
    this.time.delayedCall(2000, () => {
      this.scene.restart();
    });
  }
}

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [IonButton, IonIcon, CommonModule],
  template: `
    <ion-button (click)="goBack()" class="back-button">
        <ion-icon name="play" style="transform: scaleX(-1);"></ion-icon>
        </ion-button>
    <div id="game"></div>
  `,
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

    .back-button {
        position: absolute;
        left: 10px; 
        top: 10px;  
        z-index: 10; 
    }
  `]
})
export class GameComponent implements OnInit, OnDestroy {
  private game!: Phaser.Game;
  constructor(private navCtrl: NavController){
    addIcons({ play });
  }
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
            y: 600,
            x: 0
          },
          debug: false
        }
      },
      pixelArt: true,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth,
        height: window.innerHeight,
        parent: 'game',
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