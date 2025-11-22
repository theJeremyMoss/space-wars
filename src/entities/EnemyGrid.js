import Phaser from 'phaser';
import Enemy from './Enemy';

export default class EnemyGrid {
    constructor(scene) {
        this.scene = scene;
        this.rows = 4;
        this.cols = 8;
        this.enemies = scene.physics.add.group({ runChildUpdate: true });

        // Movement state
        this.direction = 1; // 1 = right, -1 = left
        this.moveTimer = 0;
        this.moveInterval = 500;
        this.stepDistance = 10;
        this.edgePadding = 50;
        this.currentOffset = 0; // Track total horizontal movement

        this.createGrid();
    }

    createGrid() {
        const startX = (this.scene.scale.width - (this.cols * 60)) / 2;
        const startY = 300;

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const type = row < 2 ? 'enemy2' : 'enemy1';
                const x = startX + col * 60;
                const y = startY + row * 50;

                const enemy = new Enemy(this.scene, x, y, type);
                this.enemies.add(enemy);

                // Store grid info
                enemy.gridPos = { row, col };
            }
        }
    }

    update(time, delta) {
        // Step movement
        this.moveTimer += delta;
        if (this.moveTimer >= this.moveInterval) {
            this.moveTimer = 0;
            this.step();
        }

        // Random diving - difficulty increases with level
        const diveChance = this.scene.level ? 0.005 + (this.scene.level - 1) * 0.002 : 0.005;
        if (Math.random() < diveChance) {
            this.triggerDive();
        }
    }

    step() {
        const enemies = this.enemies.getChildren().filter(e => !e.isDiving && !e.isReturning && e.active);
        if (enemies.length === 0) return;

        // Check edges
        let hitEdge = false;
        enemies.forEach(e => {
            if ((this.direction === 1 && e.x > this.scene.scale.width - this.edgePadding) ||
                (this.direction === -1 && e.x < this.edgePadding)) {
                hitEdge = true;
            }
        });

        if (hitEdge) {
            this.direction *= -1;
            // Move down? Or just reverse? Space invaders moves down.
            // Let's just reverse for now to keep formation stable.
        } else {
            // Move all non-diving enemies
            this.currentOffset += this.stepDistance * this.direction;
            enemies.forEach(e => {
                e.x += this.stepDistance * this.direction;
            });
        }
    }

    triggerDive() {
        const enemies = this.enemies.getChildren().filter(e => !e.isDiving && !e.isReturning && e.active);
        if (enemies.length === 0) return;

        const attacker = Phaser.Utils.Array.GetRandom(enemies);
        if (attacker && this.scene.player) {
            attacker.startDive(this.scene.player);
        }
    }

    respawnEnemy(type, x, y) {
        // Delayed respawn logic can go here or in GameScene
        // For now, GameScene handles the delay and calls this
        // Apply current grid offset to the original spawn X
        const finalX = x + this.currentOffset;
        const enemy = new Enemy(this.scene, finalX, y, type);
        this.enemies.add(enemy);
        // Store original spawn X (without offset) for future respawns
        enemy.origSpawnX = x;
        // Fly in effect?
        enemy.alpha = 0;
        this.scene.tweens.add({
            targets: enemy,
            alpha: 1,
            duration: 500
        });
    }
}
