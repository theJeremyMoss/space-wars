import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'ship');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(0.35);
        this.setCollideWorldBounds(true);
        this.setDrag(3000);
        this.setMaxVelocity(400);

        // Input
        this.cursors = scene.input.keyboard.createCursorKeys();

        // State
        this.lastFired = 0;
        this.fireRate = 150;
        this.isInvulnerable = false;
        this.weaponType = 'normal'; // normal, dual, spread
        this.weaponTimer = 0;
    }

    update(time, delta) {
        if (!this.active) return;

        // Movement
        if (this.cursors.left.isDown) {
            this.setAccelerationX(-3000);
        } else if (this.cursors.right.isDown) {
            this.setAccelerationX(3000);
        } else {
            this.setAccelerationX(0);
        }

        // Firing handled by Scene or here? 
        // Let's expose a method to check fire input
        if (this.weaponTimer > 0) {
            this.weaponTimer -= delta;
            if (this.weaponTimer <= 0) {
                this.weaponType = 'normal';
            }
        }
    }

    upgradeWeapon(type) {
        this.weaponType = type;
        this.weaponTimer = 10000; // 10 seconds duration
    }

    isFiring() {
        return this.cursors.space.isDown;
    }
}
