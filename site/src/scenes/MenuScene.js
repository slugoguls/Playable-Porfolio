export default class MenuScene extends Phaser.Scene {
    constructor() {
        super("MenuScene");
    }

    preload() {
        // Load assets from the public folder
        this.load.spritesheet("menu_bg", "/assets/menuSheet.png", {
            frameWidth: 320,
            frameHeight: 180,
            endFrame: 10
        });

        this.load.image("start_btn", "/assets/Start.png");
        this.load.image("start_btn_hover", "/assets/StartHover.png");
        this.load.image("settings_btn", "/assets/Setting.png");
        this.load.image("settings_btn_hover", "/assets/SettingsHover.png");
        this.load.image("resume_btn", "/assets/resume.png");
        this.load.image("resume_btn_hover", "/assets/resumeHover.png");

        // Floating animated sprite (space cat)
        this.load.spritesheet("animated_bg", "/assets/spacecat.png", {
            frameWidth: 64,
            frameHeight: 64,
            endFrame: 5
        });
    }

    create() {
        // Update scene for scaling on window resize
        this.updateScene();

        // Background animation setup
        this.anims.create({
            key: "bgAnimation",
            frames: this.anims.generateFrameNumbers("menu_bg", { start: 0, end: 9 }),
            frameRate: 7,
            repeat: -1
        });

        // Adding menu background and playing animation
        this.menuBackground = this.add.sprite(this.scale.width / 2, this.scale.height / 2, "menu_bg")
            .setDisplaySize(this.scale.width, this.scale.height)
            .setDepth(-2)
            .play("bgAnimation");

        // Space Cat animation setup
        this.anims.create({
            key: "spaceCatAnimation",
            frames: this.anims.generateFrameNumbers("animated_bg", { start: 0, end: 5 }),
            frameRate: 1,
            repeat: -1
        });

        // Adding space cat sprite with physics and interaction
        this.bg = this.physics.add.sprite(this.scale.width / 2, this.scale.height / 2, "animated_bg")
            .setScale(5)
            .setDepth(1)
            .play("spaceCatAnimation")
            .setInteractive({ draggable: true });

        // Physics for floating effect
        const speed = 100;
        this.bg.setVelocity(Phaser.Math.Between(-speed, speed), Phaser.Math.Between(-speed, speed));
        this.bg.setCollideWorldBounds(true);
        this.bg.setBounce(1);
        this.bg.body.onWorldBounds = true;
        this.physics.world.on("worldbounds", () => {
            this.bg.setAngularVelocity(Phaser.Math.Between(-30, 30));
        });
        this.bg.setAngularVelocity(10);

        // Make space cat draggable
        this.input.setDraggable(this.bg);

        // Dragging interaction handling
        this.input.on("dragstart", (pointer, gameObject) => {
            gameObject.setVelocity(0, 0);
        });

        this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.input.on("dragend", (pointer, gameObject) => {
            const randomSpeed = 100;
            gameObject.setVelocity(Phaser.Math.Between(-randomSpeed, randomSpeed), Phaser.Math.Between(-randomSpeed, randomSpeed));
        });

        // Listen to window resize to update scene layout
        this.scale.on("resize", this.updateScene, this);
    }

    updateScene() {
        const { width, height } = this.scale;

        // Destroy existing buttons before creating new ones
        if (this.startButton) this.startButton.destroy();
        if (this.settingsButton) this.settingsButton.destroy();
        if (this.resumeButton) this.resumeButton.destroy();

        // Scaling factor based on window size
        const scaleFactor = Math.min(width / 800, height / 600);
        const buttonScale = 3.5 * scaleFactor;
        const buttonSpacing = 110 * scaleFactor;

        const centerY = height / 2;
        const startY = centerY - buttonSpacing;
        const settingsY = centerY;
        const resumeY = centerY + buttonSpacing;

        // Create buttons with click interaction
        this.startButton = this.createButton(width / 2, startY, "start_btn", "start_btn_hover", buttonScale, () => {
            // Instantly start GameScene
            this.scene.start("GameScene", { fromMenu: true });
        });

        this.settingsButton = this.createButton(width / 2, settingsY, "settings_btn", "settings_btn_hover", buttonScale);
        this.resumeButton = this.createButton(width / 2, resumeY, "resume_btn", "resume_btn_hover", buttonScale);
    }

    createButton(x, y, defaultTexture, hoverTexture, scale, onClick) {
        let button = this.add.image(x, y, defaultTexture).setScale(scale);
        button.setInteractive({ useHandCursor: true });

        // Hover interaction
        button.on("pointerover", () => button.setTexture(hoverTexture));
        button.on("pointerout", () => button.setTexture(defaultTexture));

        // Click interaction
        if (onClick) button.on("pointerup", onClick);

        return button;
    }
}
