import Phaser from 'phaser';
import Player from './Player';
import DialogueBox from './DialogueBox';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
    }


    //ramdev
    preload() {
        this.load.spritesheet('varun', 'assets/char/siteguy-Sheet.png', {
            frameWidth: 48,
            frameHeight: 64,
        });
        this.load.image('dialogueBg', 'assets/dialoguebox.png');
        this.load.image('indoortiles', 'assets/sitetiles.png');
        this.load.tilemapTiledJSON('House', 'assets/indoor_TilesSet/indoorTiles.tmj');

        this.load.image('bookshelf', 'assets/indoorFur/bookshelf.png');
        this.load.image('carpet', 'assets/indoorFur/Carpet.png');
        this.load.image('lamp', 'assets/indoorFur/Lamp.png');
        this.load.image('sofaBack', 'assets/indoorFur/SofaBack.png');
        this.load.image('sofaRight', 'assets/indoorFur/SofaRight.png');
        this.load.image('clock', 'assets/indoorFur/Clock.png');
        this.load.image('greenCarpet', 'assets/indoorFur/GreenCarpet.png');
        this.load.image('longTable', 'assets/indoorFur/LongTable.png');
        this.load.image('recordPlayer', 'assets/indoorFur/RecordPlayer.png');
        this.load.image('TV', 'assets/indoorFur/TableNoCloth.png');
        this.load.image('tableCloth', 'assets/indoorFur/TableCloth.png');
        this.load.image('smallTable', 'assets/indoorFur/smallTable.png');
        this.load.image('SmallLamp', 'assets/indoorFur/SmallLamp.png');
        this.load.image('MenuPng', 'assets/MenuForAnim.png');
    }

    create() {
        this.canMove = false;
        this.lights.enable();
        this.lights.setAmbientColor(0x2c2c2c);
    
        const map = this.make.tilemap({ key: 'House' });
        const tilesetIndoors = map.addTilesetImage('indoortiles', 'indoortiles');
    
        const floorLayer = map.createLayer('floor', tilesetIndoors).setDepth(0).setScale(8);
        const wallLayer = map.createLayer('wall', tilesetIndoors).setDepth(0).setScale(8);
        const roofLayer = map.createLayer('roof', tilesetIndoors).setDepth(100000).setScale(8);
    
        wallLayer.setCollisionByProperty({ collides: true });
        roofLayer.setCollisionByProperty({ collides: true });
    
        floorLayer.setPipeline('Light2D');
        wallLayer.setPipeline('Light2D');
        roofLayer.setPipeline('Light2D');
    
        this.cameras.main.setBounds(0, 0, map.widthInPixels * 8, map.heightInPixels * 8);
        this.cameras.main.setZoom(1);
    
        this.player = new Player(this, 1000, 800);
        this.player.setScale(8);
        this.player.setDepth(9999);
    
        this.physics.add.collider(this.player, wallLayer);
        this.physics.add.collider(this.player, roofLayer);
    
        this.furnitureGroup = this.physics.add.staticGroup();
        const bookshelf = this.furnitureGroup.create(90 * 8, 50 * 8, 'bookshelf').setDepth(2).setScale(8);
        const lamp = this.furnitureGroup.create(55 * 8, 50 * 8, 'lamp').setDepth(2).setScale(8);
        const lamp2 = this.furnitureGroup.create(264 * 8, 50 * 8, 'lamp').setDepth(2).setScale(8);
        const sofaBack = this.furnitureGroup.create(90 * 8, 120 * 8, 'sofaBack').setDepth(2).setScale(8);
        const sofaRight = this.furnitureGroup.create(63 * 8, 100 * 8, 'sofaRight').setDepth(2).setScale(8);
        this.add.image(90 * 8, 105 * 8, 'carpet').setDepth(3).setPipeline('Light2D').setScale(8);
        const clock = this.furnitureGroup.create(240 * 8, 50 * 8, 'clock').setDepth(2).setScale(8);
        this.add.image(250 * 8, 110 * 8, 'greenCarpet').setDepth(3).setPipeline('Light2D').setScale(8);
        const longTable = this.furnitureGroup.create(60 * 8, 130 * 8, 'longTable').setDepth(1).setScale(8);
        const recordPlayer = this.furnitureGroup.create(250 * 8, 100 * 8, 'recordPlayer').setDepth(2).setScale(8);
        const TV = this.furnitureGroup.create(165 * 8, 50 * 8, 'TV').setDepth(2).setScale(8);
        const tableCloth = this.furnitureGroup.create(92 * 8, 85 * 8, 'tableCloth').setDepth(2).setScale(8);
        
        const smallTable = this.furnitureGroup.create(261 * 8, 135 * 8, 'smallTable').setDepth(2).setScale(8);
        const smallLamp = this.furnitureGroup.create(59 * 8, 117 * 8, 'SmallLamp').setDepth(300).setScale(8);
        const smallLamp2 = this.furnitureGroup.create(260 * 8, 121 * 8, 'SmallLamp').setDepth(300).setScale(8);
        smallLamp.body.enable = false;
        smallLamp2.body.enable = false;

        const smallLampLight = this.lights.addLight(smallLamp.x, smallLamp.y, 85 * 8).setIntensity(1.5).setColor(0xffe0b2);
        const smallLampLight2 = this.lights.addLight(smallLamp2.x, smallLamp2.y, 85 * 8).setIntensity(1.5).setColor(0xffe0b2);

        const menuOnTV = this.add.image(TV.x -20, TV.y + 37, 'MenuPng').setDepth(400).setScale(0.48, 0.58).setPipeline('Light2D');

        this.dialogueBox = new DialogueBox(this);



        if (this.scene.settings.data.fromMenu) {
            console.log("🌟 Starting intro sequence from menu");
        
            // Player setup
            this.player.setAlpha(1);
            this.player.setScale(8);
            this.player.setPipeline('Light2D');
            this.player.setPosition(1200, 600);
            this.player.play('idle-up');
            console.log("👤 Player setup complete");
        
            // Camera setup
            this.cameras.main.stopFollow();
            this.cameras.main.setZoom(18);
            this.cameras.main.centerOn(TV.x - 20, TV.y + 37);
            this.cameras.main.fadeIn(400, 0, 0, 0);
            console.log("📺 Camera zoomed into TV");
        
            // Delay for zoom out
            this.time.delayedCall(500, () => {
                console.log("⏱ Zoom out starting...");
                this.tweens.add({
                    targets: this.cameras.main,
                    zoom: 1,
                    duration: 2000,
                    ease: 'Sine.easeInOut',
                    onUpdate: () => {
                        this.cameras.main.centerOn(TV.x - 20, TV.y + 37);
                    },
                    onComplete: () => {
                        console.log("📷 Zoom complete, starting follow");
                        this.cameras.main.startFollow(this.player, true);
        
                        // Play animations sequentially
                        this.player.play('idle-up');
                        console.log("🎬 Playing idle-up");
        
                        this.time.delayedCall(1000, () => {
                            this.player.play('idle-down');
                            console.log("🎬 Playing idle-down");
        
                            this.time.delayedCall(1000, () => {
                                this.player.play('looking');
                                console.log("🎬 Playing looking");
        
                                this.time.delayedCall(1000, () => {
                                    this.player.play('jumpscare');
                                    console.log("🎬 Preparing to play jumpscare");
        
                                    this.time.delayedCall(500, () => {
                                        // Ensure this is a valid promise
                                        this.player.play('looking');
                                        console.log("🎬 Preparing to play looking after jumpscare");
        
                                        // Check if dialogueBox and show method are valid
                                        if (this.dialogueBox && typeof this.dialogueBox.show === 'function') {
                                            console.log("🎤 Showing dialogue...");
                                            // Ensure show returns a promise
                                            const dialoguePromise = this.dialogueBox.show(
                                                "wow you scared me, i didn't know you would be visiting. Well, now that you have, welcome to my portfolio. Use WASD to move around or arrow keys if you have never played any game."
                                            );
        
                                            if (dialoguePromise && typeof dialoguePromise.then === 'function') {
                                                dialoguePromise.then(() => {
                                                    this.dialogueBox.hide();
                                                    this.canMove = true;
                                                }).catch(error => {
                                                    console.error("Error during dialogue promise:", error);
                                                });
                                            } else {
                                                console.warn("show() did not return a promise.");
                                            }
                                        } else {
                                            console.warn("dialogueBox.show is not a valid function.");
                                        }
                                    });
                                });
                            });
                        });
                    }
                });
            });
        } else {
            console.log("🚪 Entered scene without coming from menu");
            this.cameras.main.startFollow(this.player, true);
        }
        
        
        
    
        this.furnitureGroup.getChildren().forEach(f => {
            f.setTint(0xffffff);
            f.setPipeline('Light2D');
        });
    
        // Scale hitboxes by 8
        bookshelf.body.setSize(bookshelf.width * 8 - 20, bookshelf.height * 8 * 0.5).setOffset(-155, bookshelf.height * 8 * 0.065);
        lamp.body.setSize(lamp.width * 8, lamp.height * 8 * 0.5).setOffset(-30, lamp.height * 8 * 0.06);
        lamp2.body.setSize(lamp2.width * 8, lamp2.height * 8 * 0.5).setOffset(-40, lamp2.height * 8 * 0.055);
        sofaBack.body.setSize(sofaBack.width * 8, sofaBack.height * 8 * 0.4).setOffset(-115, sofaBack.height-10);
        sofaRight.body.setSize(sofaRight.width * 8 * 0.65, sofaRight.height * 8 * 0.6).setOffset(-100, sofaRight.height - 120);
        clock.body.setSize(clock.width * 8 * 0.5, clock.height * 8 * 0.5).setOffset(-40, clock.height * 8 * 0.055);
        longTable.body.setSize(longTable.width * 8 * 0.9, longTable.height * 8 * 0.35).setOffset(-60 , longTable.height);
        recordPlayer.body.setSize(recordPlayer.width * 8 * 0.9, recordPlayer.height * 8 * 0.35).setOffset(-100, recordPlayer.height + 15);
        TV.body.setSize(TV.width * 8 * 0.6, TV.height * 8 * 0.4).setOffset(-90, TV.height);
        tableCloth.body.setSize(tableCloth.width * 8 * 0.75, tableCloth.height * 8 * 0.4).setOffset(-80, tableCloth.height);
        smallTable.body.setSize(smallTable.width * 8 * 0.9, smallTable.height * 8 * 0.4).setOffset(-40, smallTable.height);

        const lampLight = this.lights.addLight(lamp.x, lamp.y, 85 * 8).setIntensity(1.5).setColor(0xffe0b2);
        const lampLight2 = this.lights.addLight(lamp2.x, lamp2.y, 85 * 8).setIntensity(1.5).setColor(0xffe0b2);
        const TvLight = this.lights.addLight(TV.x, TV.y + 10 * 8, 150 * 8).setIntensity(1).setColor(0xffe0b2);
    
        this.physics.add.collider(this.player, this.furnitureGroup);
    
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });
    }

    update() {
      
   
        // Basic depth sorting using the object's y value:
        this.furnitureGroup.getChildren().forEach(f => {
            const key = f.texture.key;
            const yPos = f.y; // Using the object's y position as-is.
            if (key === 'SmallLamp') {
                f.setDepth(10000); // Force SmallLamp above everything.
            } else if (key.includes('table') || key.includes('recordPlayer') || key.includes('sofa')) {
                f.setDepth(yPos - 150);
            } else {
                f.setDepth(yPos);
            }
        });

        if (!this.canMove) {
            return;  // Prevent player movement during the intro sequence
        }
          // Let the player handle its own update.
          this.player.update(this.cursors, this.wasd);
    }
}