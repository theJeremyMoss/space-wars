import Phaser from 'phaser';
import Player from '../entities/Player';
import EnemyGrid from '../entities/EnemyGrid';
import DeathStar from '../entities/DeathStar';
import Powerup, { PowerupType } from '../entities/Powerup';
import AudioSystem from '../systems/AudioSystem';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        // Systems
        this.audio = new AudioSystem();

        // Background (Starfield)
        this.createStarfield();

        // Entities
        this.player = new Player(this, this.scale.width / 2, this.scale.height - 100);
        this.deathStar = new DeathStar(this, this.scale.width / 2, 150);
        this.enemyGrid = new EnemyGrid(this);

        // Groups
        this.bullets = this.physics.add.group();
        this.enemyBullets = this.physics.add.group();
        this.powerups = this.physics.add.group();

        // Collisions
        this.physics.add.overlap(this.bullets, this.enemyGrid.enemies, this.handleBulletEnemyCollision, null, this);
        this.physics.add.overlap(this.bullets, this.deathStar, this.handleBulletBossCollision, null, this);
        this.physics.add.overlap(this.enemyBullets, this.player, this.handleBulletPlayerCollision, null, this);
        // Collision for diving enemies hitting player
        this.physics.add.overlap(this.enemyGrid.enemies, this.player, this.handleEnemyPlayerCollision, null, this);
        // Powerup collision
        this.physics.add.overlap(this.player, this.powerups, this.handlePowerupCollision, null, this);

        // State
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.nextBossScore = 2000;
        this.bossBattleActive = false;
        this.lastPowerupScore = 0;
        this.nextPowerupEnemy = null;

        // Input for firing
        this.input.keyboard.on('keydown-SPACE', () => this.fireBullet());
    }

    update(time, delta) {
        this.player.update(time, delta);
        this.enemyGrid.update(time, delta);

        // Check if we should mark the next enemy for powerup
        if (!this.nextPowerupEnemy && this.score - this.lastPowerupScore >= 1400) {
            const enemies = this.enemyGrid.enemies.getChildren().filter(e => e.active && !e.isDiving);
            if (enemies.length > 0) {
                this.nextPowerupEnemy = Phaser.Utils.Array.GetRandom(enemies);
                this.nextPowerupEnemy.setTint(0xffaa00); // Orange tint
            }
        }

        // Starfield scroll
        this.stars.children.iterate(star => {
            star.y += star.speed;
            if (star.y > this.scale.height) {
                star.y = 0;
                star.x = Phaser.Math.Between(0, this.scale.width);
            }
        });

        // Boss Trigger
        if (!this.bossBattleActive && this.score >= this.nextBossScore && !this.deathStar.isDefeated) {
            this.startBossBattle();
        }

        // CRITICAL: Force deathstar to stay visible if it has less than 3 hits
        if (this.deathStar && !this.deathStar.isDefeated) {
            const hitCount = this.deathStar.hitCount || 0;
            if (hitCount < 3) {
                // Check if deathstar is in the scene's display list
                const inDisplayList = this.children.exists(this.deathStar);
                if (!inDisplayList) {
                    this.add.existing(this.deathStar);
                }
                
                // Force it to stay visible and active every frame
                if (!this.deathStar.visible) {
                    this.deathStar.setVisible(true);
                }
                if (!this.deathStar.active) {
                    this.deathStar.active = true;
                }
                // Force alpha to 1.0 if strobe made it too low
                if (this.deathStar.alpha < 0.5) {
                    this.deathStar.setAlpha(1.0);
                }
                // Check scale - might be set to 0
                if (this.deathStar.scaleX < 0.1 || this.deathStar.scaleY < 0.1) {
                    this.deathStar.setScale(0.25);
                }
                // Check position - make sure it's on screen
                if (this.deathStar.x < -100 || this.deathStar.x > this.scale.width + 100 ||
                    this.deathStar.y < -100 || this.deathStar.y > this.scale.height + 100) {
                    this.deathStar.setPosition(this.scale.width / 2, 150);
                }
                // Force depth to ensure it's rendered
                this.deathStar.setDepth(100);
                
                // Try to restore body if it was lost
                if (!this.deathStar.body && this.physics) {
                    this.physics.add.existing(this.deathStar);
                    const centerHitboxRadius = 18;
                    this.deathStar.body.setSize(centerHitboxRadius * 2, centerHitboxRadius * 2);
                    this.deathStar.body.setOffset(
                        (this.deathStar.width - centerHitboxRadius * 2) / 2,
                        this.deathStar.height * 0.15
                    );
                    this.deathStar.body.enable = true;
                    this.deathStar.setImmovable(true);
                }
            }
        }

        // Cleanup bullets
        this.bullets.children.iterate(b => {
            if (b && b.y < -50) b.destroy();
        });
    }

    createStarfield() {
        this.stars = this.add.group();
        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(0, this.scale.width);
            const y = Phaser.Math.Between(0, this.scale.height);
            const star = this.add.circle(x, y, Phaser.Math.FloatBetween(0.5, 2), 0xffffff);
            star.alpha = Phaser.Math.FloatBetween(0.1, 0.5);
            star.speed = Phaser.Math.FloatBetween(0.5, 3);
            this.stars.add(star);
        }
    }

    fireBullet() {
        if (!this.player.active) return;

        const now = this.time.now;
        if (now > this.player.lastFired + this.player.fireRate) {
            const x = this.player.x;
            const y = this.player.y - 30;

            if (this.player.weaponType === 'dual') {
                this.bullets.create(x - 10, y, 'bullet').setVelocityY(-600);
                this.bullets.create(x + 10, y, 'bullet').setVelocityY(-600);
            } else if (this.player.weaponType === 'spread') {
                this.bullets.create(x, y, 'bullet').setVelocityY(-600);
                this.bullets.create(x, y, 'bullet').setVelocityY(-600).setVelocityX(-100);
                this.bullets.create(x, y, 'bullet').setVelocityY(-600).setVelocityX(100);
            } else {
                this.bullets.create(x, y, 'bullet').setVelocityY(-600);
            }

            this.player.lastFired = now;
            this.audio.playShootSound();
        }
    }

    handleBulletEnemyCollision(bullet, enemy) {
        if (!bullet.active || !enemy.active) return;

        bullet.destroy();

        // Explosion
        this.createExplosion(enemy.x, enemy.y);
        this.audio.playExplosionSound();

        // Score
        const points = enemy.type === 'enemy1' ? 50 : 100;
        this.addScore(points);

        // Check if this enemy drops powerup
        const willDropPowerup = enemy === this.nextPowerupEnemy;

        // Respawn logic
        const spawnX = enemy.origSpawnX;
        const spawnY = enemy.spawnY;
        const type = enemy.type;

        enemy.destroy();

        // Spawn powerup after enemy destruction
        if (willDropPowerup) {
            this.lastPowerupScore = this.score;
            this.nextPowerupEnemy = null;
            const type = Phaser.Utils.Array.GetRandom([PowerupType.DUAL, PowerupType.SPREAD, PowerupType.SHIELD]);
            const powerup = new Powerup(this, enemy.x, enemy.y, type);
            this.powerups.add(powerup);
        }

        // Respawn after delay
        this.time.delayedCall(5000, () => {
            this.enemyGrid.respawnEnemy(type, spawnX, spawnY);
        });
    }

    handleBulletBossCollision(bullet, boss) {
        // Use scene reference to ensure we're working with the right object
        const deathStar = this.deathStar;
        
        // Store body reference immediately before any operations
        const bodyRef = deathStar?.body;
        const bodyEnabled = bodyRef?.enable;
        
        // Basic safety checks
        if (!bullet || !bullet.active) return;
        if (!deathStar) return;
        
        // Force deathstar to be active and visible BEFORE any other checks
        if (!deathStar.active) {
            deathStar.active = true;
        }
        if (!deathStar.visible) {
            deathStar.setVisible(true);
        }
        
        if (deathStar.isDefeated) return;
        
        // Initialize hitCount if it doesn't exist
        if (typeof deathStar.hitCount === 'undefined') {
            deathStar.hitCount = 0;
        }
        
        // Only process if vulnerable (body enabled)
        if (!bodyRef || !bodyEnabled) {
            bullet.destroy();
            return;
        }
        
        // Check center hit - bullet must be near deathstar center
        const centerX = deathStar.x;
        const centerY = deathStar.y;
        const bulletX = bullet.x;
        const bulletY = bullet.y;
        
        // Use display dimensions (scaled)
        const halfWidth = deathStar.displayWidth / 2;
        const halfHeight = deathStar.displayHeight / 2;
        
        // Check if bullet is within deathstar bounds
        const horizontalDistance = Math.abs(bulletX - centerX);
        const verticalDistance = Math.abs(bulletY - centerY);
        
        // Center area: within 30px of center horizontally, within top 60px vertically
        const isCenterHit = horizontalDistance < 30 && verticalDistance < 60;
        const isAnyHit = horizontalDistance < halfWidth && verticalDistance < halfHeight;
        
        if (!isAnyHit) {
            bullet.destroy();
            return;
        }
        
        if (!isCenterHit) {
            bullet.destroy();
            return;
        }
        
        // Cooldown check
        const now = this.time.now;
        if (!deathStar.lastHitTime) deathStar.lastHitTime = 0;
        const timeSinceLastHit = now - deathStar.lastHitTime;
        if (timeSinceLastHit < 200) {
            bullet.destroy();
            return;
        }
        deathStar.lastHitTime = now;
        
        // Destroy bullet AFTER all checks pass
        bullet.destroy();
        
        // Increment hit count
        const currentHitCount = deathStar.hitCount || 0;
        deathStar.hitCount = currentHitCount + 1;
        
        // Stop strobe tweens that might be making it invisible
        if (deathStar.alphaStrobeTween) {
            deathStar.alphaStrobeTween.stop();
        }
        
        // Force deathstar to stay visible and active
        deathStar.active = true;
        deathStar.setVisible(true);
        deathStar.setAlpha(1.0);
        deathStar.isDefeated = false;
        deathStar.setDepth(100);
        
        // Ensure it's in the display list
        if (!this.children.exists(deathStar)) {
            this.add.existing(deathStar);
        }
        
        // Try to keep body enabled if it exists
        if (bodyRef) {
            bodyRef.enable = true;
        } else if (deathStar.body) {
            deathStar.body.enable = true;
        }
        
        // Visual feedback - flash red
        deathStar.setTint(0xff0000);
        const hitCountAtTimeOfCall = deathStar.hitCount;
        this.time.delayedCall(100, () => {
            const ds = this.deathStar;
            if (ds && ds.active && !ds.isDefeated && hitCountAtTimeOfCall < 3) {
                ds.setTint(0xffaaaa);
                ds.setVisible(true);
                ds.active = true;
            }
        });
        
        // Particle effect for hits 1 and 2
        if (deathStar.hitCount < 3) {
            try {
                const particleX = deathStar.x;
                const particleY = deathStar.y;
                
                const emitter = this.add.particles(particleX, particleY, 'spark', {
                    speed: { min: 150, max: 300 },
                    scale: { start: 2.5, end: 0 },
                    blendMode: 'ADD',
                    lifespan: 1000,
                    quantity: 30,
                    tint: [0xff6600, 0xff8800, 0xffff00],
                    emitting: false,
                    alpha: { start: 1, end: 0 },
                    gravityY: 0,
                    frequency: -1
                });
                
                emitter.setDepth(200);
                emitter.explode(30);
                
                this.time.delayedCall(1200, () => {
                    if (emitter && emitter.active) {
                        emitter.destroy();
                    }
                });
                
                this.audio.playExplosionSound();
            } catch (error) {
                // Silently handle particle errors
            }
        }
        
        // On 3rd hit, trigger explosion
        if (deathStar.hitCount === 3) {
            this.time.delayedCall(50, () => {
                this.handleDeathStarExplosion();
            });
        }
    }

    handleDeathStarExplosion() {
        const boss = this.deathStar;
        
        // Double-check that we have exactly 3 hits before exploding
        if (boss.hitCount !== 3) {
            return;
        }
        
        // Explode the deathstar
        boss.explode();
        this.bossBattleActive = false;
        this.addScore(5000);
        
        // Create massive explosion
        this.createMassiveExplosion(boss.x, boss.y);
        this.audio.playExplosionSound();
        
        // Destroy all enemies
        this.destroyAllEnemies();
        
        // Advance to next level
        this.advanceLevel();
        
        // Reset deathstar after delay for next level
        this.time.delayedCall(10000, () => {
            boss.reset();
            this.nextBossScore += 2000;
        });
    }

    destroyAllEnemies() {
        if (!this.enemyGrid) return;
        
        // Destroy all active enemies with explosion effects
        this.enemyGrid.enemies.getChildren().forEach(enemy => {
            if (enemy.active) {
                // Create explosion for each enemy
                this.createExplosion(enemy.x, enemy.y);
                enemy.destroy();
            }
        });

        // Destroy all enemy bullets
        this.enemyBullets.getChildren().forEach(bullet => {
            if (bullet.active) {
                bullet.destroy();
            }
        });

        // Clear powerups
        this.powerups.getChildren().forEach(powerup => {
            if (powerup.active) {
                powerup.destroy();
            }
        });

        // Reset powerup tracking
        this.nextPowerupEnemy = null;
        this.lastPowerupScore = this.score;
    }

    advanceLevel() {
        this.level++;
        this.events.emit('levelChange', this.level);

        if (!this.enemyGrid) return;

        // Increase difficulty
        // Faster enemy movement (reduce move interval)
        this.enemyGrid.moveInterval = Math.max(200, this.enemyGrid.moveInterval - 50);
        
        // More frequent dives is handled in EnemyGrid.update() based on this.level
        
        // Recreate enemy grid for new level
        this.time.delayedCall(2000, () => {
            // Clear any remaining enemies
            this.enemyGrid.enemies.clear(true, true);
            
            // Reset grid movement state
            this.enemyGrid.currentOffset = 0;
            this.enemyGrid.direction = 1;
            
            // Create new grid
            this.enemyGrid.createGrid();
        });
    }

    handleBulletPlayerCollision(player, bullet) {
        // TODO: Implement player damage
        bullet.destroy();
        this.playerHit();
    }

    handleEnemyPlayerCollision(player, enemy) {
        enemy.destroy();
        this.playerHit();
    }

    handlePowerupCollision(player, powerup) {
        if (!powerup.active) return;

        if (powerup.type === PowerupType.SHIELD) {
            // Shield logic (invulnerability for 5s)
            player.isInvulnerable = true;
            player.setTint(0x0000ff);
            this.time.delayedCall(5000, () => {
                player.isInvulnerable = false;
                player.clearTint();
            });
        } else {
            player.upgradeWeapon(powerup.type);
        }

        powerup.destroy();
        // Powerup sound?
    }

    playerHit() {
        if (this.player.isInvulnerable) return;

        this.lives--;
        this.events.emit('livesChange', this.lives);
        this.createExplosion(this.player.x, this.player.y);
        this.audio.playExplosionSound();

        if (this.lives <= 0) {
            this.gameOver();
        } else {
            // Respawn / Invulnerability
            this.player.isInvulnerable = true;
            this.tweens.add({
                targets: this.player,
                alpha: 0.5,
                duration: 200,
                yoyo: true,
                repeat: 5,
                onComplete: () => {
                    this.player.isInvulnerable = false;
                    this.player.alpha = 1;
                }
            });
        }
    }

    startBossBattle() {
        this.bossBattleActive = true;
        this.deathStar.makeVulnerable();

        // Timer to end vulnerability
        this.vulnerabilityTimer = this.time.delayedCall(10000, () => {
            if (this.deathStar.active && !this.deathStar.isDefeated) {
                this.deathStar.makeInvulnerable(); // This will reset hitCount
                this.bossBattleActive = false;
                // Retry later - increase threshold for next attempt
                this.nextBossScore += 1000; // Try again sooner
            }
        });
    }

    addScore(points) {
        this.score += points;
        this.events.emit('scoreChange', this.score);
    }

    createExplosion(x, y) {
        const emitter = this.add.particles(x, y, 'spark', {
            speed: { min: 50, max: 200 },
            scale: { start: 1.5, end: 0 },
            blendMode: 'ADD',
            lifespan: 800,
            quantity: 20,
            emitting: false
        });
        emitter.explode(20);
        this.time.delayedCall(1000, () => emitter.destroy());
    }

    createMassiveExplosion(x, y) {
        this.cameras.main.shake(1000, 0.05);
        // Big particles
        const emitter = this.add.particles(x, y, 'spark', {
            speed: { min: 200, max: 600 },
            scale: { start: 4, end: 0 },
            blendMode: 'ADD',
            lifespan: 2000,
            quantity: 200,
            tint: [0xff0000, 0xff8800, 0xffff00],
            emitting: false
        });
        emitter.explode(200);
        this.time.delayedCall(2000, () => emitter.destroy());
    }

    gameOver() {
        this.scene.pause();
        this.add.text(this.scale.width / 2, this.scale.height / 2, 'GAME OVER', {
            fontSize: '64px',
            fontFamily: 'IBM Plex Mono',
            color: '#ff0000'
        }).setOrigin(0.5);

        this.add.text(this.scale.width / 2, this.scale.height / 2 + 60, 'Click to Restart', {
            fontSize: '24px',
            fontFamily: 'IBM Plex Mono',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {
            this.scene.restart();
        });
    }
}
