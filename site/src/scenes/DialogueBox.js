export default class DialogueBox {
    constructor(scene, width = 1000, height = 400) {
        this.scene = scene;

        // Position the container
        const x = (scene.scale.width - width) / 2;
        const y = scene.scale.height - height - 40;

        this.container = scene.add.container(x, y).setScrollFactor(0);

        // Background image with correct origin
        this.bg = scene.add.image(0, 0, 'dialogueBg')
            .setOrigin(0)
            .setDisplaySize(width, height)
            .setScrollFactor(0);

        // Position text inside the dialogue box (relative to the box's top-left corner)
        this.text = scene.add.text(0, 0, '', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#ffffff',
            wordWrap: { width: width - 100 }
        });

        // Offset the text inside the box
        this.text.setPosition(45, 200); // padding inside the box

        // Add to container
        this.container.add([this.bg, this.text]);
        this.container.setDepth(9999999);
        this.container.setVisible(false);
    }

    show(text, callback = null) {
        return new Promise((resolve, reject) => {
            this.text.setText('');
            this.container.setVisible(true);
    
            let i = 0;
            this.scene.time.addEvent({
                delay: 30,
                repeat: text.length - 1,
                callback: () => {
                    this.text.setText(text.slice(0, ++i));
                    if (i === text.length) {
                        if (callback) callback(); // Call the callback if provided
                        resolve(); // Resolve the promise once the text is fully displayed
                    }
                },
                callbackScope: this // Ensure the correct `this` context is used
            });
        });
    }

    hide() {
        this.container.setVisible(false);
    }
}
