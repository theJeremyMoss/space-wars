import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
        this.score = 0;
        this.lives = 3;
        this.scoreText = null;
        this.livesGroup = null;
    }

    create() {
        // Score
        this.scoreText = this.add.text(20, 20, 'SCORE: 0', {
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: '24px',
            fill: '#ffffff'
        });

        // Lives
        this.livesGroup = this.add.group();
        this.updateLives(3);

        // Listen for events from GameScene
        const gameScene = this.scene.get('GameScene');
        gameScene.events.on('scoreChange', this.updateScore, this);
        gameScene.events.on('livesChange', this.updateLives, this);
    }

    updateScore(newScore) {
        this.score = newScore;
        this.scoreText.setText(`SCORE: ${this.score}`);
    }

    updateLives(newLives) {
        this.lives = newLives;
        this.livesGroup.clear(true, true);

        const unusedLives = Math.max(0, this.lives - 1);
        const startX = this.cameras.main.width - 40;

        for (let i = 0; i < unusedLives; i++) {
            const icon = this.add.image(startX - (i * 30), this.cameras.main.height - 30, 'ship');
            icon.setScale(0.2);
            this.livesGroup.add(icon);
        }
    }
}
