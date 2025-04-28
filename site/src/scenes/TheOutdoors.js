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
        this.load.image('outdoorsGrass', 'assets/The Outdoors/Texture/TX Tileset Grass.png');
        this.load.image('outdoorsWalls', 'assets/The Outdoors/Texture/TX Tileset Wall.png');
        this.load.image('outdoorsStairs', 'assets/The Outdoors/Texture/TX Struct.png');
        this.load.image('outdoorsProps', 'assets/The Outdoors/Texture/TX Props.png');
        this.load.image('outdoorsFoliage', 'assets/The Outdoors/Texture/TX Plant.png');
        
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

        // Add the tileset images to the map
        const outdoorsGrass = map.addTilesetImage('OutdoorsGrass', 'outdoorsGrass');
        const outdoorsWalls = map.addTilesetImage('OutdoorWalls', 'outdoorsWalls');
        const outdoorsStairs = map.addTilesetImage('OutdoorsStairs', 'outdoorsStairs');
        const outdoorsProps = map.addTilesetImage('OutdoorProps', 'outdoorsProps');
        const outdoorsFoliage = map.addTilesetImage('OutdoorsFoliage', 'outdoorsFoliage');

        // Create layers from the map
        const groundLayer = map.createLayer('GrassFloor', outdoorsGrass, 0, 0);
        const wallAndStairsLayer = map.createLayer('WallAndStairs', [outdoorsWalls, outdoorsProps, outdoorsStairs], 0, 0);
        const runesLayer = map.createLayer('runic', [outdoorsProps, outdoorsFoliage], 0, 0);

        // Log layer information to check if layers are created
        console.log('Ground layer:', groundLayer);
        console.log('Wall and Stairs layer:', wallAndStairsLayer);
        console.log('Runes layer:', runesLayer);

        // Initialize the player
        this.player = new Player(this, 100, 100); // Position the player at (100, 100)

         // Scale the player
        this.player.setScale(1.5);  // Increase size by 1.5x (150%)

        // Optionally change the speed
        this.player.speed = 150;  // Set new speed for the player

         // Set camera to follow the player
        this.cameras.main.startFollow(this.player); // Make sure the camera follows the player

         // Optionally adjust the zoom
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
    }
}
