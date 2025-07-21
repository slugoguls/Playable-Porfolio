import Phaser from 'phaser';
import Player from './Player';

export default class OutdoorScene extends Phaser.Scene {
    constructor() {
        super("OutdoorScene");
    }

    preload() {
        this.load.tilemapTiledJSON('outdoorsMap', 'assets/The Outdoors/TheOutdoors.tmj');

        this.load.image('outdoorsGrass', 'assets/The Outdoors/houses/mch/exterior.png');
        this.load.image('outdoorsWalls', 'assets/The Outdoors/Texture/TX Tileset Wall.png');
        this.load.image('outdoorsStairs', 'assets/The Outdoors/Texture/TX Struct.png');
        this.load.image('outdoorsProps', 'assets/The Outdoors/Texture/TX Props.png');
        this.load.image('outdoorsFoliage', 'assets/The Outdoors/Texture/TX Plant.png');
        this.load.image('MCHouse', 'assets/The Outdoors/houses/MChouse.png');
        this.load.image('ArtGal', 'assets/The Outdoors/houses/ArtGallery.png');

        this.load.spritesheet('smokeanim', 'assets/The Outdoors/houses/smokeanim.png', {
            frameWidth: 48,
            frameHeight: 48
        });

        this.load.spritesheet('ProjectStation', 'assets/The Outdoors/houses/ProjectStation.png', {
            frameWidth: 160,
            frameHeight: 176
        });

        this.load.spritesheet('varun', 'assets/char/siteguy-Sheet.png', {
            frameWidth: 48,
            frameHeight: 64
        });
    }

    create() {
        const targetWidth = 640;
        const targetHeight = 360;

        const map = this.make.tilemap({ key: 'outdoorsMap' });

        this.anims.create({
            key: 'Station',
            frames: this.anims.generateFrameNumbers('ProjectStation', { start: 0, end: 3 }),
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: 'smoke',
            frames: this.anims.generateFrameNumbers('smokeanim', { start: 0, end: 5 }),
            frameRate: 6,
            repeat: -1
        });

        this.smoke = this.add.sprite(375, 228, 'smokeanim')
            .setScale(1.5)
            .play('smoke')
            .setDepth(3);

        this.Station = this.physics.add.staticSprite(175, 90, 'ProjectStation')
            .setScale(1.5)
            .play('Station')
            .setDepth(3);
        this.Station.body.setSize(220, 90);
        this.Station.body.setOffset(-30, 128);

        const outdoorsGrass = map.addTilesetImage('OutdoorsGrass', 'outdoorsGrass');
        const outdoorsWalls = map.addTilesetImage('OutdoorWalls', 'outdoorsWalls');
        const outdoorsStairs = map.addTilesetImage('OutdoorsStairs', 'outdoorsStairs');
        const outdoorsProps = map.addTilesetImage('OutdoorProps', 'outdoorsProps');
        const outdoorsFoliage = map.addTilesetImage('OutdoorsFoliage', 'outdoorsFoliage');
        this.lolhouse = this.physics.add.staticImage(455, 340, 'MCHouse')
            .setScale(2)
            .setVisible(true);
        this.lolhouse.body.setSize(240, 120);
        this.lolhouse.body.setOffset(-40, 70);
        this.smoke.setScale(this.lolhouse.scaleX, this.lolhouse.scaleY);

        this.artgal = this.physics.add.staticImage(155, 600, 'ArtGal')
            .setScale(1.2, 1.5)
            .setVisible(true);
        this.artgal.body.setSize(270, 90); // Adjust these numbers based on actual size
        this.artgal.body.setOffset(-8, 90); // Adjust the offset if needed
        
        // Left Pillar Collision Box
        this.artgalPillarLeft = this.physics.add.staticImage(87, 655, null)
            .setSize(35, 80)
            .setVisible(false);
        this.artgalPillarLeft.body.setOffset(0, 0); // No sprite, position set below

        // Right Pillar Collision Box
        this.artgalPillarRight = this.physics.add.staticImage(221, 655, null)
            .setSize(35, 80)
            .setVisible(false);
        this.artgalPillarRight.body.setOffset(0, 0);


        const groundLayer = map.createLayer('GrassFloor', outdoorsGrass, 0, 0);
        const wallAndStairsLayer = map.createLayer(
            'WallAndStairs',
            [outdoorsWalls, outdoorsProps, outdoorsStairs, outdoorsGrass],
            0, 0
        );

        this.player = new Player(this, 400, 600);
        this.player.setScale(1.5);
        this.player.speed = 150;

        wallAndStairsLayer.setCollisionByProperty({ collides: true });
        this.physics.add.collider(this.player, wallAndStairsLayer);
        this.physics.add.collider(this.player, this.lolhouse);
        this.physics.add.collider(this.player, this.Station);
        this.physics.add.collider(this.player, this.artgal);
        this.physics.add.collider(this.player, this.artgalPillarLeft);
        this.physics.add.collider(this.player, this.artgalPillarRight);

        this.cameras.main.startFollow(this.player);
        const zoomFactor = Math.min(window.innerWidth / targetWidth, window.innerHeight / targetHeight);
        this.cameras.main.setZoom(zoomFactor);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    }

    update() {
        const cursors = this.input.keyboard.createCursorKeys();
        const wasd = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };

        if (this.player) {
            this.player.update(cursors, wasd);
        }

        this.sortDepths([this.player, this.lolhouse, this.Station, this.artgal]);
    }

    sortDepths(objects) {
        objects.sort((a, b) => (a.y + a.displayHeight / 2) - (b.y + b.displayHeight / 2));
        objects.forEach((obj, index) => obj.setDepth(index));
    }
}
