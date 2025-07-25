import menuSheet from '../../assets/menuSheet.png';
import MenuMute from '../../assets/MenuMute.png';
import Start from '../../assets/Start.png';
import StartHover from '../../assets/StartHover.png';
import Setting from '../../assets/Setting.png';
import SettingsHover from '../../assets/SettingsHover.png';
import resume from '../../assets/resume.png';
import resumeHover from '../../assets/resumeHover.png';
import spacecat from '../../assets/spacecat.png';
import pinkFloyd from "../../assets/Sounds/Pink Floyd - Wish You Were Here (2011 Remastered).mp3";

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super("MenuScene");
    }

    preload() {
        // Load visual assets only
        this.load.spritesheet("menu_bg", menuSheet, {
            frameWidth: 320,
            frameHeight: 180,
            endFrame: 10
        });
        this.load.spritesheet("speaker_icon", MenuMute, {
            frameWidth: 16,
            frameHeight: 16,
            endFrame: 1,
        });
        this.load.image("start_btn", Start);
        this.load.image("start_btn_hover", StartHover);
        this.load.image("settings_btn", Setting);
        this.load.image("settings_btn_hover", SettingsHover);
        this.load.image("resume_btn", resume);
        this.load.image("resume_btn_hover", resumeHover);

        this.load.spritesheet("animated_bg", spacecat, {
            frameWidth: 64,
            frameHeight: 64,
            endFrame: 5
        });
    }

    create() {
        this.updateScene();

        this.anims.create({
            key: "bgAnimation",
            frames: this.anims.generateFrameNumbers("menu_bg", { start: 0, end: 9 }),
            frameRate: 7,
            repeat: -1
        });

        this.menuBackground = this.add.sprite(this.scale.width / 2, this.scale.height / 2, "menu_bg")
            .setDisplaySize(this.scale.width, this.scale.height)
            .setDepth(-2)
            .play("bgAnimation");

        this.anims.create({
            key: "spaceCatAnimation",
            frames: this.anims.generateFrameNumbers("animated_bg", { start: 0, end: 5 }),
            frameRate: 1,
            repeat: -1
        });

        this.bg = this.physics.add.sprite(this.scale.width / 2, this.scale.height / 2, "animated_bg")
            .setScale(5)
            .setDepth(1)
            .play("spaceCatAnimation")
            .setInteractive({ draggable: true });

        const speed = 100;
        this.bg.setVelocity(Phaser.Math.Between(-speed, speed), Phaser.Math.Between(-speed, speed));
        this.bg.setCollideWorldBounds(true);
        this.bg.setBounce(1);
        this.bg.body.onWorldBounds = true;
        this.physics.world.on("worldbounds", () => {
            this.bg.setAngularVelocity(Phaser.Math.Between(-30, 30));
        });
        this.bg.setAngularVelocity(10);

        this.input.setDraggable(this.bg);
        this.input.on("dragstart", (pointer, gameObject) => gameObject.setVelocity(0, 0));
        this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });
        this.input.on("dragend", (pointer, gameObject) => {
            const randomSpeed = 100;
            gameObject.setVelocity(Phaser.Math.Between(-randomSpeed, randomSpeed), Phaser.Math.Between(-randomSpeed, randomSpeed));
        });

        // Music setup
        this.isMuted = false;

        if (!this.game.bgMusic) {
            this.load.audio("backgroundMusic", pinkFloyd);
            this.load.once("complete", () => {
                this.game.bgMusic = this.sound.add("backgroundMusic", {
                    loop: true,
                    volume: 1
                });

                this.game.bgMusic.play();

                // 🎧 Custom Web Audio setup
                if (this.sound.context) {
                    const context = this.sound.context;
                    const source = this.game.bgMusic.source;

                    const filter = context.createBiquadFilter();
                    filter.type = "lowpass";
                    filter.frequency.setValueAtTime(500, context.currentTime); // Muffle

                    const gainNode = context.createGain();
                    gainNode.gain.setValueAtTime(1, context.currentTime); // Full volume

                    // Route audio: source -> filter -> gain -> destination
                    source.disconnect();
                    source.connect(filter);
                    filter.connect(gainNode);
                    gainNode.connect(context.destination);

                    this.game.bgMusic._filter = filter;
                    this.game.bgMusic._gainNode = gainNode;
                }
            });
            this.load.start();
        } else {
            if (!this.game.bgMusic.isPlaying) {
                this.game.bgMusic.play();
            }

            if (this.game.bgMusic._filter) {
                this.game.bgMusic._filter.frequency.setValueAtTime(500, this.sound.context.currentTime);
            }
            if (this.game.bgMusic._gainNode) {
                this.game.bgMusic._gainNode.gain.setValueAtTime(this.isMuted ? 0 : 1, this.sound.context.currentTime);
            }
        }

        // 🔊 Speaker icon
        this.speakerIcon = this.add.sprite(0, 0, "speaker_icon", 0)
            .setScale(4)
            .setDepth(2)
            .setInteractive();

        this.speakerIcon.on("pointerup", () => {
            this.isMuted = !this.isMuted;
            this.speakerIcon.setFrame(this.isMuted ? 1 : 0);

            if (this.game.bgMusic && this.game.bgMusic._gainNode) {
                this.game.bgMusic._gainNode.gain.setValueAtTime(this.isMuted ? 0 : 1, this.sound.context.currentTime);
            }
        });

        this.positionSpeakerIcon();
        this.scale.on("resize", this.updateScene, this);
    }

    positionSpeakerIcon() {
        const padding = 20;
        this.speakerIcon.setPosition(this.scale.width - padding, padding);
        this.speakerIcon.setOrigin(1, 0);
    }

    updateScene() {
        const { width, height } = this.scale;

        if (this.startButton) this.startButton.destroy();
        if (this.settingsButton) this.settingsButton.destroy();
        if (this.resumeButton) this.resumeButton.destroy();

        const scaleFactor = Math.min(width / 800, height / 600);
        const buttonScale = 3.5 * scaleFactor;
        const buttonSpacing = 110 * scaleFactor;

        const centerY = height / 2;
        const startY = centerY - buttonSpacing;
        const settingsY = centerY;
        const resumeY = centerY + buttonSpacing;

        this.startButton = this.createButton(width / 2, startY, "start_btn", "start_btn_hover", buttonScale, () => {
            this.scene.start("GameScene", { fromMenu: true });
        });
        
        this.settingsButton = this.createButton(width / 2, settingsY, "settings_btn", "settings_btn_hover", buttonScale);
        this.resumeButton = this.createButton(width / 2, resumeY, "resume_btn", "resume_btn_hover", buttonScale, () => {
        window.open("https://drive.google.com/file/d/1d1UKN9_lhizkNTnc0CRjp3MoIzmIPzO5/view?usp=sharing", "_blank");
    });

        if (this.speakerIcon) this.positionSpeakerIcon();
    }

    createButton(x, y, defaultTexture, hoverTexture, scale, onClick) {
        let button = this.add.image(x, y, defaultTexture).setScale(scale);
        button.setInteractive({ useHandCursor: true });

        button.on("pointerover", () => button.setTexture(hoverTexture));
        button.on("pointerout", () => button.setTexture(defaultTexture));

        if (onClick) button.on("pointerup", onClick);

        return button;
    }
}
