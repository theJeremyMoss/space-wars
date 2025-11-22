import Phaser from 'phaser';

export const PowerupType = {
    DUAL: 'dual',
    SPREAD: 'spread',
    SHIELD: 'shield'
};

export default class Powerup extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type) {
        // Use a simple circle texture generated at runtime if not exists
        const texKey = 'powerup_orb';
        if (!scene.textures.exists(texKey)) {
            const gfx = scene.make.graphics({ x: 0, y: 0, add: false });
            gfx.fillStyle(0xffffff, 1);
            gfx.fillCircle(8, 8, 8);
            gfx.generateTexture(texKey, 16, 16);
            gfx.destroy();
        }
        super(scene, x, y, texKey);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.type = type;
        // Tint based on type
        switch (type) {
            case PowerupType.DUAL:
                this.setTint(0x00ff00);
                break;
            case PowerupType.SPREAD:
                this.setTint(0xffff00);
                break;
            case PowerupType.SHIELD:
                this.setTint(0x0000ff);
                break;
        }
        this.setScale(1.5);
        this.body.setVelocityY(250); // Faster fall
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        // Keep falling
        if (this.body.velocity.y === 0) {
            this.body.setVelocityY(250);
        }
    }
}
