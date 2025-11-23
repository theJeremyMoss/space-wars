import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Load assets - use relative paths that work with both dev and production
        const baseUrl = import.meta.env.BASE_URL;
        this.load.image('ship', `${baseUrl}assets/player.png`);
        this.load.image('deathstar', `${baseUrl}assets/deathstar.png`);
        this.load.image('enemy1', `${baseUrl}assets/enemy1.png`);
        this.load.image('enemy2', `${baseUrl}assets/enemy2.png`);

        // Generate textures that were previously generated in create()
        // We can do this in create() of this scene or GameScene
    }

    create() {
        // Create procedural textures
        this.createTextures();

        // Start the game
        this.scene.start('GameScene');
        this.scene.start('UIScene');
    }

    createTextures() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });

        // Spark
        g.fillStyle(0xffffff, 1);
        g.fillRect(0, 0, 4, 4);
        g.generateTexture('spark', 4, 4);

        // Bullet (Cyan)
        g.clear();
        g.fillStyle(0x00ffff, 1);
        g.fillCircle(4, 4, 4);
        g.generateTexture('bullet', 8, 8);

        // Enemy Bullet (Red)
        g.clear();
        g.fillStyle(0xff0000, 1);
        g.fillCircle(4, 4, 4);
        g.generateTexture('enemyBullet', 8, 8);

        // Shockwave
        g.clear();
        g.lineStyle(2, 0xffffff);
        g.strokeCircle(10, 10, 10);
        g.generateTexture('shockwave', 20, 20);

        // Powerups
        // Dual (Green box with II)
        g.clear();
        g.fillStyle(0x00ff00, 1);
        g.fillRect(0, 0, 20, 20);
        g.fillStyle(0x000000, 1);
        g.fillRect(5, 5, 3, 10);
        g.fillRect(12, 5, 3, 10);
        g.generateTexture('powerup_dual', 20, 20);

        // Spread (Yellow box with V)
        g.clear();
        g.fillStyle(0xffff00, 1);
        g.fillRect(0, 0, 20, 20);
        g.fillStyle(0x000000, 1);
        g.beginPath();
        g.moveTo(5, 5);
        g.lineTo(10, 15);
        g.lineTo(15, 5);
        g.strokePath();
        g.generateTexture('powerup_spread', 20, 20);

        // Shield (Blue box with O)
        g.clear();
        g.fillStyle(0x0000ff, 1);
        g.fillRect(0, 0, 20, 20);
        g.lineStyle(2, 0xffffff);
        g.strokeCircle(10, 10, 6);
        g.generateTexture('powerup_shield', 20, 20);

        g.destroy();
    }
}
