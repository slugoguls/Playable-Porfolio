import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'varun');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.body.setSize(17, 9);
        this.body.setOffset(15, 49);

        this.createAnimations(scene);

        this.lastDirection = 'up';
    }

    createAnimations(scene) {
        const anims = scene.anims;

        anims.create({
            key: 'looking',
            frames: [{ key: 'varun', frame: 0 }],
            frameRate: 1,
            repeat: -1
        });

        anims.create({
            key: 'jumpscare',
            frames: anims.generateFrameNumbers('varun', { start: 4, end: 6 }),
            frameRate: 3,
            repeat: 0 
        });

        anims.create({
            key: 'idle-down',
            frames: anims.generateFrameNumbers('varun', { start: 8, end: 10 }),
            frameRate: 3,
            repeat: -1
        });

        anims.create({
            key: 'walk-down',
            frames: anims.generateFrameNumbers('varun', { start: 12, end: 15 }),
            frameRate: 6,
            repeat: -1
        });

        anims.create({
            key: 'walk-left',
            frames: anims.generateFrameNumbers('varun', { start: 24, end: 27 }),
            frameRate: 6,
            repeat: -1
        });

        anims.create({
            key: 'walk-right',
            frames: anims.generateFrameNumbers('varun', { start: 20, end: 23 }),
            frameRate: 6,
            repeat: -1
        });

        anims.create({
            key: 'walk-up',
            frames: anims.generateFrameNumbers('varun', { start: 32, end: 35 }),
            frameRate: 6,
            repeat: -1
        });

        anims.create({
            key: 'idle-up',
            frames: anims.generateFrameNumbers('varun', { start: 36, end: 38 }),
            frameRate: 3,
            repeat: -1
        });

        anims.create({
            key: 'idle-left',
            frames: anims.generateFrameNumbers('varun', { start: 28, end: 30 }),
            frameRate: 3,
            repeat: -1
        });

        anims.create({
            key: 'idle-right',
            frames: anims.generateFrameNumbers('varun', { start: 16, end: 18 }),
            frameRate: 3,
            repeat: -1
        });
    }

    update(cursors, wasd) {
        const speed = 450;
        const { left, right, up, down } = cursors;
        const { left: a, right: d, up: w, down: s } = wasd;

        this.setVelocity(0);

        // Horizontal Movement
        if (left.isDown || a.isDown) {
            this.setVelocityX(-speed);
            this.anims.play('walk-left', true);
            this.lastDirection = 'left';
        } else if (right.isDown || d.isDown) {
            this.setVelocityX(speed);
            this.anims.play('walk-right', true);
            this.lastDirection = 'right';
        }

        // Vertical Movement
        if (up.isDown || w.isDown) {
            this.setVelocityY(-speed);
            if (this.body.velocity.x === 0) {
                this.anims.play('walk-up', true);
            }
            this.lastDirection = 'up';
        } else if (down.isDown || s.isDown) {
            this.setVelocityY(speed);
            if (this.body.velocity.x === 0) {
                this.anims.play('walk-down', true);
            }
            this.lastDirection = 'down';
        }



        // Idle Animations (when no movement)
        if (this.body.velocity.x === 0 && this.body.velocity.y === 0) {
            this.anims.play(`idle-${this.lastDirection}`, true);
        }

        // Set depth based on position for sorting
        this.setDepth(this.y);
    }
}
