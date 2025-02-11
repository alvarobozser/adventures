export class Enemy extends Phaser.Physics.Arcade.Sprite {
    private moveSpeed: number = 100;
    private direction: number = 1;
    private moveDistance: number = 200;
    private startX: number;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        // Restamos 32 a la posición Y para compensar el tamaño del sprite
        super(scene, x, y, 'enemy');
        this.startX = x;
        
        scene.add.existing(this);
        scene.physics.add.existing(this);

        const body = this.body as Phaser.Physics.Arcade.Body;
        
        // Ajustamos el tamaño y offset del hitbox
        body.setCollideWorldBounds(true);
        body.setSize(15, 15);
        body.setOffset(4, 0); // Pequeño ajuste en X para centrar mejor
        body.setAllowGravity(true);
        body.setBounce(0);
        body.setFriction(1, 0);
        body.setImmovable(false);
        
        // Ajustamos el tamaño visual para que coincida mejor con el hitbox
        this.setDisplaySize(40, 40);
        
        this.startPatrol();
    }


    startPatrol(): void {
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setVelocityX(this.moveSpeed * this.direction);
    }

    override preUpdate(time: number, delta: number): void {
        super.preUpdate(time, delta);

        const body = this.body as Phaser.Physics.Arcade.Body;

        // Verificar si está en el suelo
        if (body.blocked.down) {
            // Verificar si necesitamos cambiar de dirección
            if (Math.abs(this.x - this.startX) > this.moveDistance) {
                this.direction *= -1;
                body.setVelocityX(this.moveSpeed * this.direction);
                this.flipX = this.direction < 0;
                this.startX = this.x;
            }

            // Si está bloqueado por una pared, cambiar dirección
            if (body.blocked.left || body.blocked.right) {
                this.direction *= -1;
                body.setVelocityX(this.moveSpeed * this.direction);
                this.flipX = this.direction < 0;
                this.startX = this.x;
            }

            // Asegurarse de que siempre tenga velocidad en el suelo
            if (body.velocity.x === 0) {
                body.setVelocityX(this.moveSpeed * this.direction);
            }
        }

        // Verificar si se ha caído del mapa
        if (this.y > 1000) { // Ajusta este valor según tu mapa
            this.destroy();
        }
    }
}