import Phaser from 'phaser';
import Player from './Player';

export default class OutdoorScene extends Phaser.Scene {
    constructor() {
        super("OutdoorScene");
    }

    preload() {
        // Load the tilemap JSON and the tileset images
        this.load.tilemapTiledJSON('outdoorsMap', 'assets/The Outdoors/TheOutdoors.tmj'); // Path to your Tiled map JSON

        // Load each tileset image
        this.load.image('outdoorsGrass', 'assets/The Outdoors/houses/mch/exterior.png');
        this.load.image('outdoorsWalls', 'assets/The Outdoors/Texture/TX Tileset Wall.png');
        this.load.image('outdoorsStairs', 'assets/The Outdoors/Texture/TX Struct.png');
        this.load.image('outdoorsProps', 'assets/The Outdoors/Texture/TX Props.png');
        this.load.image('outdoorsFoliage', 'assets/The Outdoors/Texture/TX Plant.png');
        this.load.image('MCHouse', 'assets/The Outdoors/houses/MChouse.png');
        this.load.spritesheet('smokeanim', 'assets/The Outdoors/houses/smokeanim.png', {
            frameWidth: 48,
            frameHeight: 48
        });
        // Load the player sprite
        this.load.spritesheet('varun', 'assets/char/siteguy-Sheet.png', {
            frameWidth: 48,
            frameHeight: 64
        });
    }

    create() {

        const targetWidth = 640;
        const targetHeight = 360;

        // Create the tilemap
        const map = this.make.tilemap({ key: 'outdoorsMap' });

        // Log map width and height to ensure it's being loaded correctly
        console.log('Map width:', map.widthInPixels);
        console.log('Map height:', map.heightInPixels);

                // Create the smoke animation
        this.anims.create({
            key: 'smoke',
            frames: this.anims.generateFrameNumbers('smokeanim', { start: 0, end: 5 }),
            frameRate: 6,
            repeat: -1
        });

        // Add smoke sprite above the chimney (adjust position to fit your house)
        this.smoke = this.add.sprite(375, 228, 'smokeanim')
            .setScale(1.5)
            .play('smoke');

        // Optional: Set depth above house roof
        this.smoke.setDepth(3);

        // Add the tileset images to the map
        const outdoorsGrass = map.addTilesetImage('OutdoorsGrass', 'outdoorsGrass');
        const outdoorsWalls = map.addTilesetImage('OutdoorWalls', 'outdoorsWalls');
        const outdoorsStairs = map.addTilesetImage('OutdoorsStairs', 'outdoorsStairs');
        const outdoorsProps = map.addTilesetImage('OutdoorProps', 'outdoorsProps');
        const outdoorsFoliage = map.addTilesetImage('OutdoorsFoliage', 'outdoorsFoliage');

                // Add house as a physics-enabled static image
        this.lolhouse = this.physics.add.staticImage(455, 340, 'MCHouse')
        .setScale(2)
        .setVisible(true);

        // Set a custom size and offset for the collision box
        this.lolhouse.body.setSize(240, 120); // ← adjust size to match visual area
        this.lolhouse.body.setOffset(-40, 70); // ← offset to center hitbox if needed
        this.smoke.setScale(this.lolhouse.scaleX, this.lolhouse.scaleY);



        // Create layers from the map
        const groundLayer = map.createLayer('GrassFloor', outdoorsGrass, 0, 0);
        const wallAndStairsLayer = map.createLayer(
            'WallAndStairs',
            [outdoorsWalls, outdoorsProps, outdoorsStairs, outdoorsGrass],
            0, 0
        );

        // Log layer information to check if layers are created
        console.log('Ground layer:', groundLayer);
        console.log('Wall and Stairs layer:', wallAndStairsLayer);

        // Initialize the player
        this.player = new Player(this, 100, 100); // Position the player at (100, 100)

        // Scale the player
        this.player.setScale(1.5);  // Increase size by 1.5x (150%)

        // Optionally change the speed
        this.player.speed = 150;  // Set new speed for the player

        // Set up collision with walls and stairs
        wallAndStairsLayer.setCollisionByProperty({ collides: true });
        this.physics.add.collider(this.player, wallAndStairsLayer);
          // Add collision between player and the house
        this.physics.add.collider(this.player, this.lolhouse);


        // Set camera to follow the player
        this.cameras.main.startFollow(this.player);

        // Set the camera size and zoom
        const zoomFactor = Math.min(window.innerWidth / targetWidth, window.innerHeight / targetHeight);
        this.cameras.main.setZoom(zoomFactor);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    }

    update() {
        // Handle player movement (send cursors and WASD input to the Player class)
        const cursors = this.input.keyboard.createCursorKeys();
        const wasd = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };

        // Update the player with input
        if (this.player) {
            this.player.update(cursors, wasd);
        }
        // Custom depth sorting
        const roofY = this.lolhouse.y + 100; // adjust this offset to match the bottom of the roof visually
        if (this.player.y < roofY) {
            this.player.setDepth(0);         // Behind the house
            this.lolhouse.setDepth(1);       // In front of the player
        } else {
            this.player.setDepth(2);         // In front of the house
            this.lolhouse.setDepth(1);       // House stays in middle
        }
    }
}
