import Phaser from 'phaser';
import { Enemy } from './enemy';
export class GameScene extends Phaser.Scene {
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
  private enemies!: Phaser.Physics.Arcade.Group;
  private isGameOver: boolean = false;

  private isJoystickActive: boolean = false;
  private isJumping: boolean = false;
  private readonly JOYSTICK_RADIUS = 30;
  private readonly MAX_SPEED = 4;
  private readonly MIN_SPEED = 2;
  private readonly JUMP_FORCE = -300;

  constructor() {
    super({ key: 'GameScene' });
    this.tokensBeingCollected = new Set();
  }


  preload(): void {
    this.load.image('background', 'assets/menu/background.jpg');
    this.load.image('dog-idle', 'assets/dante/dantequit.png');
    this.load.image('dog-walk', 'assets/dante/dantewalk.png');
    this.load.image('dog-jump', 'assets/dante/dantejump.png');

    this.load.image('tiles', 'assets/tiles/tiles.png');
    this.load.image('token', 'assets/tiles/token.png');
    this.load.image('enemy', 'assets/enemy/enemy.png');
    this.load.image('enemy1', 'assets/enemy/enemy1.png');
    this.load.tilemapTiledJSON('map', 'assets/levels/level.json');
  }

  create(): void {
    const uiLayer = this.add.container(0, 0);
    uiLayer.setScrollFactor(0);
    this.textInicializer();


    const background = this.add.image(0, 0, 'background')
    .setOrigin(0, 0)
    .setDepth(-1)
    .setScrollFactor(0);
    
    const scale = this.cameras.main.height / background.height;

    background.setScale(scale);
    background.x = 0;
    background.y = 0;

    const map = this.make.tilemap({ key: 'map'});

    this.tokens = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });
    this.deathY = map.heightInPixels + 100;

    const tileset = map.addTilesetImage('tiles', 'tiles');
    const layer = map.createLayer('toplayer', tileset!, 0, 33);
    const layer1 = map.createLayer('water', tileset!, 0, 33);
    const layer2 = map.createLayer('finish', tileset!, 0, 33);

    this.waterStyles(layer1);

    const tokensLayer = map.getObjectLayer('tokens');
    layer!.setCollisionByExclusion([-1]); // Esto hace que todos los tiles excepto el vacío (-1) sean sólidos
    layer2!.setCollisionByExclusion([-1]);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.world.setBoundsCollision(true, true, true, false); // left, right, top, bottom

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
    this.physics.add.collider(this.dog, layer2!, undefined, undefined, this);

    this.createAnimations();
    this.tokensCreate(tokensLayer);
    this.createEnemies(map);

    this.physics.add.collider(this.enemies, layer!);

    this.physics.add.collider(
      this.dog,
      this.enemies,
      this.handleEnemyCollision as unknown as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

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

  private waterStyles(layer1:any){
    
    if (layer1) {
      // Color base más claro y brillante
      layer1.setTint(0x66ccff);

      // Efecto de olas con alpha
      this.tweens.add({
        targets: layer1,
        alpha: { start: 0.9, to: 1 },
        duration: 1500,
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1
      });

      // Efecto de "olas" moviendo ligeramente el layer
      this.tweens.add({
        targets: layer1,
        y: '+=2',
        duration: 2000,
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1
      });

      // Efecto de brillo cambiando el tinte
      let isFirstTint = true;
      this.tweens.add({
        targets: layer1,
        duration: 3000,
        repeat: -1,
        onRepeat: () => {
          // Alterna entre dos tonos más claros de azul
          if (isFirstTint) {
            layer1.setTint(0x99ddff); // Azul más claro
          } else {
            layer1.setTint(0x99ddff); // Azul medio claro
          }
          isFirstTint = !isFirstTint;
        }
      });

      // Efecto adicional de movimiento horizontal suave
      this.tweens.add({
        targets: layer1,
        x: '+=1',
        duration: 3000,
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1
      });
    }



  }
  private handleEnemyCollision(dog: Phaser.GameObjects.GameObject | Phaser.Tilemaps.Tile, enemy: Phaser.GameObjects.GameObject | Phaser.Tilemaps.Tile): void {
    if (this.isGameOver) return;

    const dogBody = this.dog.body as Phaser.Physics.Arcade.Body;
    const enemySprite = enemy as Phaser.Physics.Arcade.Sprite;
    const dogBottom = this.dog.y + this.dog.displayHeight / 2;
    const dogCenter = this.dog.y;
    const enemyTop = enemySprite.y - enemySprite.displayHeight / 2;
    const isAboveEnemy = dogCenter < enemyTop;

    if (isAboveEnemy) {
      enemySprite.destroy();
      dogBody.setVelocityY(this.JUMP_FORCE * 0.7);
      this.cameras.main.shake(200, 0.01);
    } else {
      this.gameOver();
    }
  }


  private createEnemies(map: Phaser.Tilemaps.Tilemap): void {
    const enemiesLayer = map.getObjectLayer('enemies');
    this.enemies = this.physics.add.group({
      runChildUpdate: true
    });

    if (enemiesLayer && enemiesLayer.objects) {
      enemiesLayer.objects.forEach(enemyObj => {
        if (enemyObj.x !== undefined && enemyObj.y !== undefined) {
          // Crear el enemigo directamente
          const enemy = new Enemy(this, enemyObj.x, enemyObj.y);

          // Añadirlo al grupo
          this.enemies.add(enemy);
        }
      });
    }
  }

  private tokensCreate(tokensLayer: any) {
    if (tokensLayer && tokensLayer.objects) {
      tokensLayer.objects.forEach((obj: { x: number | undefined; y: number | undefined; }) => {
        if (obj.x !== undefined && obj.y !== undefined) {
          const token = this.physics.add.sprite(obj.x, obj.y, 'token');

          // Configurar el token para colisiones
          token.setOrigin(0, 0);
          token.setSize(token.width, token.height);
          token.setImmovable(true);
          token.setDisplaySize(32, 32);
          // Añadir al grupo de tokens
          this.tokens.add(token);
        }
      });

      // Verificar que el perro existe antes de configurar colisiones
      if (this.dog) {

        // Asegurarse de que el perro tiene física
        this.physics.world.enable(this.dog);

        // Configurar el tamaño de colisión del perro si es necesario
        this.dog.setSize(this.dog.width * 0.8, this.dog.height * 0.8);

        this.physics.add.overlap(
          this.dog,
          this.tokens,
          (_obj1, _obj2) => {
            const token = _obj2 as Phaser.Physics.Arcade.Sprite;

            if (this.tokensBeingCollected.has(token)) {
              return;
            }
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
                this.scoreText.setText('Puntos: ' + this.score);

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
      'Fase \nCompletada!',
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
    this.scoreText = this.add.text(16, 16, 'Puntos: 0', {
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

    const dogBody = this.dog.body as Phaser.Physics.Arcade.Body;

    // Habilitar colisiones con los límites del mundo
    dogBody.setCollideWorldBounds(true);
    // Movimiento horizontal
    if (this.isJoystickActive) {
      const distanceX = this.stick.x - this.baseCenter.x;
      const maxDistance = this.JOYSTICK_RADIUS;

      let speed = Phaser.Math.Linear(
        this.MIN_SPEED,
        this.MAX_SPEED,
        Math.abs(distanceX) / maxDistance
      );

      if (Math.abs(distanceX) > 5) {
        // Usar setVelocityX en lugar de modificar directamente x
        if (distanceX < 0) {
          dogBody.setVelocityX(-speed * 50); // Multiplicamos por 100 para hacer el movimiento más fluido
          this.dog.setFlipX(true);
        } else {
          dogBody.setVelocityX(speed * 50);
          this.dog.setFlipX(false);
        }

        // Solo cambiar la animación si no está saltando
        if (!this.isJumping) {
          this.dog.play('walk', true);
        }
      } else {
        dogBody.setVelocityX(0);
      }
    } else {
      // Si no hay joystick activo, detener el movimiento horizontal
      dogBody.setVelocityX(0);
    }

    // Actualizar estado de salto y animaciones
    if (dogBody.touching.down || dogBody.blocked.down) {
      if (this.isJumping) {
        this.isJumping = false;
        if (this.isJoystickActive && Math.abs(this.stick.x - this.baseCenter.x) > 5) {
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

    this.time.delayedCall(1000, () => {
      this.scene.restart();
    });
  }
}