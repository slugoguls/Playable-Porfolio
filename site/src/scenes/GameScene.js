import Phaser from 'phaser';
import Player from './Player';
import DialogueBox from './DialogueBox';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
        this.recordPlayerArea = null;
        this.bookOpen = false; // Flag to restrict movement when the book is open.
    }

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
        this.load.image('interactE', 'assets/interact e.png');
        this.load.image('MinecraftBook', 'assets/MinecraftBook.png');
    }

    create() {
        // Setup control keys.
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        this.allowSkip = false;
        
        // Music setup.
        if (this.game.bgMusic) {
            this.game.bgMusic.setDetune(0);
            if (this.sound.context && this.game.bgMusic._filter) {
                const context = this.sound.context;
                const source = this.game.bgMusic.source;
                const filter = this.game.bgMusic._filter;
                try {
                    source.disconnect();
                    filter.disconnect();
                } catch (e) {
                    console.error(e);
                }
                const gainNode = context.createGain();
                gainNode.gain.setValueAtTime(0.15, context.currentTime);
                source.connect(gainNode);
                gainNode.connect(context.destination);
                this.game.bgMusic._filter = null;
                this.game.bgMusic._gainNode = gainNode;
            } else {
                this.game.bgMusic.setVolume(0.15);
            }
            if (!this.game.bgMusic.isPlaying) {
                this.game.bgMusic.play();
            }
        }
        
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
        // Bookshelf creation with interaction zone.
        const bookshelf = this.furnitureGroup.create(90 * 8, 50 * 8, 'bookshelf').setDepth(2).setScale(8);
        this.bookshelf = bookshelf;
        this.bookshelfZone = new Phaser.GameObjects.Zone(
            this, bookshelf.x - 20, bookshelf.y - 200, bookshelf.displayWidth * 1.5 - 300, bookshelf.displayHeight * 1.5
        )
            .setOrigin(0.5, 0.5)
            .setDepth(9999)
            .setVisible(false);
        this.add.existing(this.bookshelfZone);

        // Create an interaction zone for the clock.
        // We assume "clock" is already added as a furniture item.
        const clock = this.furnitureGroup.create(240 * 8, 50 * 8, 'clock').setDepth(2).setScale(8);
        this.clockZone = new Phaser.GameObjects.Zone(
            this, clock.x, clock.y - 100, clock.displayWidth , clock.displayHeight 
        )
            .setOrigin(0.5, 0.5)
            .setDepth(9999)
            .setVisible(false);
        this.add.existing(this.clockZone);

        // Create the Minecraft book image, centered on the screen.
        this.minecraftBookImage = this.add.image(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            'MinecraftBook'
        )
            .setDepth(1001)
            .setScale(1)
            .setVisible(false);

        // Create a clickable text link at the bottom center.
        this.linkText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.height - 50,
            "to read the whole thing click this",
            { font: "24px Arial", fill: "#ffffff" }
        )
            .setOrigin(0.5)
            .setVisible(false);
        this.linkText.setInteractive({ useHandCursor: true });
        this.linkText.on('pointerdown', () => {
            window.open("https://docs.google.com/document/d/18J-zAQTlTwVu0cSqZ2Em-5KGcr1tksO4cTkYtgkz-Bs/edit?tab=t.0", "_blank");
        });

        // Other furniture: lamp, record player, TV, etc.
        const lamp = this.furnitureGroup.create(55 * 8, 50 * 8, 'lamp').setDepth(2).setScale(8);
        const lamp2 = this.furnitureGroup.create(264 * 8, 50 * 8, 'lamp').setDepth(2).setScale(8);
        const sofaBack = this.furnitureGroup.create(90 * 8, 120 * 8, 'sofaBack').setDepth(2).setScale(8);
        const sofaRight = this.furnitureGroup.create(63 * 8, 100 * 8, 'sofaRight').setDepth(2).setScale(8);
        this.add.image(90 * 8, 105 * 8, 'carpet').setDepth(3).setPipeline('Light2D').setScale(8);
        // (Clock was created above.)
        this.add.image(250 * 8, 110 * 8, 'greenCarpet').setDepth(3).setPipeline('Light2D').setScale(8);
        const longTable = this.furnitureGroup.create(60 * 8, 130 * 8, 'longTable').setDepth(1).setScale(8);
        const recordPlayer = this.furnitureGroup.create(250 * 8, 100 * 8, 'recordPlayer').setDepth(2).setScale(8);

        this.recordPlayerArea = new Phaser.GameObjects.Zone(
            this, recordPlayer.x - 50, recordPlayer.y - 100, 200, 300
        )
            .setOrigin(0.5, 0.5)
            .setDepth(9999)
            .setVisible(true);
        this.add.existing(this.recordPlayerArea);

        this.interactImage = this.add.image(
            this.recordPlayerArea.x + 50, this.recordPlayerArea.y - 300, 'interactE'
        )
            .setDepth(1000)
            .setScale(7)
            .setAlpha(0);
        this.interactImage.setOrigin(0.5, 0.5);

        const TV = this.furnitureGroup.create(165 * 8, 50 * 8, 'TV').setDepth(2).setScale(8);
        const tableCloth = this.furnitureGroup.create(92 * 8, 85 * 8, 'tableCloth').setDepth(2).setScale(8);
        const smallTable = this.furnitureGroup.create(261 * 8, 135 * 8, 'smallTable').setDepth(2).setScale(8);
        const smallLamp = this.furnitureGroup.create(59 * 8, 117 * 8, 'SmallLamp').setDepth(300).setScale(8);
        const smallLamp2 = this.furnitureGroup.create(260 * 8, 121 * 8, 'SmallLamp').setDepth(300).setScale(8);
        smallLamp.body.enable = false;
        smallLamp2.body.enable = false;
        const smallLampLight = this.lights.addLight(smallLamp.x, smallLamp.y, 85 * 8)
            .setIntensity(1.5)
            .setColor(0xffe0b2);
        const smallLampLight2 = this.lights.addLight(smallLamp2.x, smallLamp2.y, 85 * 8)
            .setIntensity(1.5)
            .setColor(0xffe0b2);

        const menuOnTV = this.add.image(
            TV.x - 20, TV.y + 37, 'MenuPng'
        ).setDepth(400).setScale(0.48, 0.58).setPipeline('Light2D');

        this.dialogueBox = new DialogueBox(this);

        if (this.scene.settings.data.fromMenu) {
            console.log("🌟 Starting intro sequence from menu");
            this.player.setAlpha(1);
            this.player.setScale(8);
            this.player.setPipeline('Light2D');
            this.player.setPosition(1200, 600);
            this.player.play('idle-up');
            console.log("👤 Player setup complete");
            this.cameras.main.stopFollow();
            this.cameras.main.setZoom(18);
            this.cameras.main.centerOn(TV.x - 20, TV.y + 37);
            this.cameras.main.fadeIn(400, 0, 0, 0);
            console.log("📺 Camera zoomed into TV");
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
                                        this.player.play('looking');
                                        console.log("🎬 Preparing to play looking after jumpscare");
                                        if (this.dialogueBox && typeof this.dialogueBox.show === 'function') {
                                            console.log("🎤 Showing first dialogue...");
                                            this.dialogueBox.show(
                                                "wow you scared me, i didn't know you would be visiting. Well, now that you have, welcome to my portfolio. Use WASD to move around or arrow keys if you have never played any game."
                                            ).then(() => {
                                                console.log("🎤 Showing second dialogue...");
                                                return this.dialogueBox.show("Press SPACE to skip or end dialogues.");
                                            }).then(() => {
                                                this.allowSkip = true;
                                            }).catch(error => {
                                                console.error("Error during dialogue sequence:", error);
                                            });
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

        // Scale hitboxes.
        bookshelf.body.setSize(bookshelf.width * 8 - 20, bookshelf.height * 8 * 0.5)
            .setOffset(-155, bookshelf.height * 8 * 0.065);
        lamp.body.setSize(lamp.width * 8, lamp.height * 8 * 0.5)
            .setOffset(-30, lamp.height * 8 * 0.06);
        lamp2.body.setSize(lamp2.width * 8, lamp2.height * 8 * 0.5)
            .setOffset(-40, lamp2.height * 8 * 0.055);
        sofaBack.body.setSize(sofaBack.width * 8, sofaBack.height * 8 * 0.4)
            .setOffset(-115, sofaBack.height - 10);
        sofaRight.body.setSize(sofaRight.width * 8 * 0.65, sofaRight.height * 8 * 0.6)
            .setOffset(-100, sofaRight.height - 120);
        clock.body.setSize(clock.width * 8 * 0.5, clock.height * 8 * 0.5)
            .setOffset(-40, clock.height * 8 * 0.055);
        longTable.body.setSize(longTable.width * 8 * 0.9, longTable.height * 8 * 0.35)
            .setOffset(-60, longTable.height);
        recordPlayer.body.setSize(recordPlayer.width * 8 * 0.9, recordPlayer.height * 8 * 0.35)
            .setOffset(-100, recordPlayer.height + 15);
        TV.body.setSize(TV.width * 8 * 0.6, TV.height * 8 * 0.4)
            .setOffset(-90, TV.height);
        tableCloth.body.setSize(tableCloth.width * 8 * 0.75, tableCloth.height * 8 * 0.4)
            .setOffset(-80, tableCloth.height);
        smallTable.body.setSize(smallTable.width * 8 * 0.9, smallTable.height * 8 * 0.4)
            .setOffset(-40, smallTable.height);

        const lampLight = this.lights.addLight(lamp.x, lamp.y, 85 * 8)
            .setIntensity(1.5)
            .setColor(0xffe0b2);
        const lampLight2 = this.lights.addLight(lamp2.x, lamp2.y, 85 * 8)
            .setIntensity(1.5)
            .setColor(0xffe0b2);
        const TvLight = this.lights.addLight(TV.x, TV.y + 10 * 8, 150 * 8)
            .setIntensity(1)
            .setColor(0xffe0b2);

        this.physics.add.collider(this.player, this.furnitureGroup);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

            // Create a zone at the bottom middle of the screen
        this.bottomMiddleZone = new Phaser.GameObjects.Zone(
            this, 
            this.cameras.main.centerX + 350,  // x position at the center
            this.cameras.main.height - 200,  // y position just above the bottom
            200, // width of the zone
            50   // height of the zone
        ).setOrigin(0.5, 0.5); // Set the origin for positioning
        this.add.existing(this.bottomMiddleZone);

        // Create graphics to make the zone visible
        this.graphics = this.add.graphics({ lineStyle: { width: 2, color: 0xFF0000 } });
        this.graphics.strokeRect(
            this.bottomMiddleZone.x - this.bottomMiddleZone.width / 2,  // X position of top-left corner
            this.bottomMiddleZone.y - this.bottomMiddleZone.height / 2, // Y position of top-left corner
            this.bottomMiddleZone.width,  // Width of the zone
            this.bottomMiddleZone.height  // Height of the zone 
        );
        
    }

    update() {
        // Priority: if the book is open, show link text and check for ESC.
        if (this.bookOpen) {
            this.linkText.setVisible(true);
            if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
                this.minecraftBookImage.setVisible(false);
                this.bookOpen = false;
                this.canMove = true;
                console.log("Book closed, player movement resumed");
            }
            return;
        }
        // Hide the clickable link when the book is not open.
        this.linkText.setVisible(false);
    
        // Basic depth sorting by object's y position.
        this.furnitureGroup.getChildren().forEach(f => {
            const key = f.texture.key;
            const yPos = f.y;
            if (key === 'SmallLamp') {
                f.setDepth(10000);
            } else if (key.includes('table') || key.includes('recordPlayer') || key.includes('sofa')) {
                f.setDepth(yPos - 150);
            } else {
                f.setDepth(yPos);
            }
        });
    
        if (this.allowSkip && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            if (this.dialogueBox) {
                this.dialogueBox.hide();
                this.canMove = true;
            }
        }
    
        // If player movement is not allowed, exit early.
        if (!this.canMove) return;
    
        // Update the player movement.
        this.player.update(this.cursors, this.wasd);
    
        // Bookshelf interaction for displaying the Minecraft book.
        if (Phaser.Geom.Rectangle.Contains(this.bookshelfZone.getBounds(), this.player.x, this.player.y)) {
            this.interactImage.setPosition(this.bookshelfZone.x + 15, this.bookshelfZone.y - 10);
            this.interactImage.setAlpha(1);
    
            if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
                this.interactImage.setAlpha(0);
                this.minecraftBookImage.setVisible(true);
                this.bookOpen = true;
                this.canMove = false;
                console.log("📖 Minecraft book displayed - movement restricted. Press ESC to close.");
            }
        }
        // Clock interaction.
        else if (Phaser.Geom.Rectangle.Contains(this.clockZone.getBounds(), this.player.x, this.player.y)) {
            this.interactImage.setPosition(this.clockZone.x + 5, this.clockZone.y - 130);
            this.interactImage.setAlpha(1);
    
            if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
                this.interactImage.setAlpha(0);
                const currentTime = new Date().toLocaleTimeString();
                if (!this.clockTimeText) {
                    this.clockTimeText = this.add.text(
                        this.cameras.main.centerX,
                        50,
                        `Current Time: ${currentTime}`,
                        { font: "32px Minecraft", fill: "#ffffff" }
                    ).setOrigin(0.5);
                } else {
                    this.clockTimeText.setText(`Current Time: ${currentTime}`);
                    this.clockTimeText.setVisible(true);
                }
                console.log("Clock interaction: showing current time.");
                this.time.delayedCall(3000, () => {
                    if (this.clockTimeText) {
                        this.clockTimeText.setVisible(false);
                    }
                });
            }
        }
        // Record player interaction.
        else if (Phaser.Geom.Rectangle.Contains(this.recordPlayerArea.getBounds(), this.player.x, this.player.y)) {
            this.interactImage.setPosition(this.recordPlayerArea.x + 50, this.recordPlayerArea.y - 300);
            this.interactImage.setAlpha(1);
    
            if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
                this.interactImage.setAlpha(0);
                if (this.game.bgMusic && this.game.bgMusic.isPlaying) {
                    let newVolume;
                    if (this.game.bgMusic._gainNode) {
                        const currentGain = this.game.bgMusic._gainNode.gain.value;
                        newVolume = currentGain === 0 ? 0.4 : 0;
                        this.game.bgMusic._gainNode.gain.setValueAtTime(newVolume, this.sound.context.currentTime);
                    } else {
                        newVolume = this.game.bgMusic.volume === 0 ? 0.4 : 0;
                        this.game.bgMusic.setVolume(newVolume);
                    }
                    console.log(newVolume === 0.4 ? "🎵 Music unmuted" : "🔇 Music muted");
                }
            }
        } else {
            // Hide the interact image if not near any interactable zone.
            this.interactImage.setAlpha(0);
        }

        let zoneBounds = this.bottomMiddleZone.getBounds();
        if (
            this.player.x >= zoneBounds.x && 
            this.player.x <= zoneBounds.x + zoneBounds.width && 
            this.player.y >= zoneBounds.y && 
            this.player.y <= zoneBounds.y + zoneBounds.height
        ) {
            this.scene.start("OutdoorScene");
        }

        
    }
    
}
