import Phaser from 'phaser';

export default class DeathStar extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y) {
        super(scene, x, y, 'deathstar');

        this.scene = scene;
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(0.25);
        this.setImmovable(true);

        // Center hitbox - small circular hitbox at top-center (the "dot in the circle")
        // Positioned at top-center: offset to center horizontally, near top vertically
        const centerHitboxRadius = 18; // ~18px radius for the center dot
        this.body.setSize(centerHitboxRadius * 2, centerHitboxRadius * 2);
        // Offset to position hitbox at top-center of deathstar
        // Center horizontally: (width - hitboxWidth) / 2
        // Top portion: small offset from top (about 10-15% of height)
        this.body.setOffset(
            (this.width - centerHitboxRadius * 2) / 2,
            this.height * 0.15
        );
        this.body.enable = false;

        // State - use hit counter only (no health system)
        this.hitCount = 0;
        this.isDefeated = false;
        this.lastHitTime = 0;
        this.hitCooldown = 200; // ms between hits
        
        // Ensure hitCount is always initialized
        if (typeof this.hitCount === 'undefined') {
            this.hitCount = 0;
        }

        // Strobe effect tweens
        this.alphaStrobeTween = null;
        this.colorStrobeTimer = null;
        this.pulseTween = null;
        this.isStrobingColor = false;

        this.setTint(0x888888);
    }

    makeVulnerable() {
        if (this.isDefeated) return;

        this.body.enable = true; // Enable hit detection
        this.hitCount = 0; // Reset hit counter for new vulnerability window
        this.lastHitTime = 0;
        this.setTint(0xffaaaa);
        this.setAlpha(1.0);

        if (this.scene) {
            // Pulse tween (scale animation)
            this.pulseTween = this.scene.tweens.add({
                targets: this,
                scale: 0.28,
                duration: 500,
                yoyo: true,
                repeat: -1
            });

            // Alpha strobe - flash between 0.7 and 1.0 (less extreme to prevent disappearing)
            this.alphaStrobeTween = this.scene.tweens.add({
                targets: this,
                alpha: 0.7,
                duration: 200,
                yoyo: true,
                repeat: -1
            });

            // Color strobe - alternate between red and white using timer
            this.isStrobingColor = false;
            this.colorStrobeTimer = this.scene.time.addEvent({
                delay: 150,
                callback: () => {
                    // Safety check - body might be destroyed
                    if (this.active && this.body && this.body.enable) {
                        this.isStrobingColor = !this.isStrobingColor;
                        this.setTint(this.isStrobingColor ? 0xffffff : 0xffaaaa);
                    }
                },
                loop: true
            });
        }
    }

    makeInvulnerable() {
        this.body.enable = false;
        this.hitCount = 0; // Reset hit counter when becoming invulnerable
        this.setTint(0x888888);
        this.setAlpha(1.0);
        
        // Stop all tweens
        if (this.pulseTween) {
            this.pulseTween.stop();
            this.pulseTween = null;
        }
        if (this.alphaStrobeTween) {
            this.alphaStrobeTween.stop();
            this.alphaStrobeTween = null;
        }
        if (this.colorStrobeTimer) {
            this.colorStrobeTimer.remove();
            this.colorStrobeTimer = null;
        }
        
        this.setScale(0.25);
    }

    // Simplified - hit tracking is now done directly in collision handler
    // This method is kept for backwards compatibility but not used
    registerHit() {
        return false;
    }

    resetHits() {
        this.hitCount = 0;
    }

    explode() {
        // Safety check - only explode if we have 3 hits
        if (this.hitCount < 3) {
            return;
        }
        
        this.isDefeated = true;
        this.setVisible(false);
        
        // Safely disable body if it exists
        if (this.body) {
            this.body.enable = false;
        }
        
        // Stop all tweens
        if (this.pulseTween) {
            this.pulseTween.stop();
            this.pulseTween = null;
        }
        if (this.alphaStrobeTween) {
            this.alphaStrobeTween.stop();
            this.alphaStrobeTween = null;
        }
        if (this.colorStrobeTimer) {
            this.colorStrobeTimer.remove();
            this.colorStrobeTimer = null;
        }
    }

    reset() {
        this.hitCount = 0;
        this.isDefeated = false;
        this.lastHitTime = 0;
        this.setVisible(true);
        this.body.enable = false;
        this.setTint(0x888888);
        this.setAlpha(1.0);
        this.setScale(0.25);
        
        // Stop all tweens
        if (this.pulseTween) {
            this.pulseTween.stop();
            this.pulseTween = null;
        }
        if (this.alphaStrobeTween) {
            this.alphaStrobeTween.stop();
            this.alphaStrobeTween = null;
        }
        if (this.colorStrobeTimer) {
            this.colorStrobeTimer.remove();
            this.colorStrobeTimer = null;
        }
    }
}
