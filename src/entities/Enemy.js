import Phaser from 'phaser';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type) {
        super(scene, x, y, type);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(0.35);
        this.spawnX = x;
        this.spawnY = y;
        this.origSpawnX = x; // Immutable spawn point
        this.type = type;

        // State
        this.isDiving = false;
        this.isReturning = false;
        this.formationIndex = { row: 0, col: 0 };
    }

    startDive(target) {
        if (this.isDiving || this.isReturning) return;

        this.isDiving = true;
        // Simple dive logic: move towards player
        // In a real Galaga, they fly in curves (Bezier).
        // For now, let's just accelerate towards player.

        this.scene.physics.moveToObject(this, target, 300);
    }

    resetToFormation() {
        this.isDiving = false;
        this.isReturning = false;
        this.setVelocity(0, 0);
        this.x = this.spawnX;
        this.y = this.spawnY;
        this.setRotation(0);
    }
}
