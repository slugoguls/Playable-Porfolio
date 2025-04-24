import Phaser from 'phaser'; // Import Phaser from node_modules
import MenuScene from './scenes/MenuScene.js'; // Adjusted path for MenuScene
import GameScene from './scenes/GameScene.js'; // Adjusted path for GameScene

// Vite will handle the resizing and scaling automatically
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,   // Game width set to the window width
    height: window.innerHeight, // Game height set to the window height
    scene: [MenuScene, GameScene],  // Start with MenuScene
    physics: {
        default: 'arcade', // Using Arcade physics
        arcade: {
            gravity: { y: 0 }, // No gravity
            debug: false, // Turn off physics debugging
        },
    },
    pixelArt: true,  // Ensure pixel-perfect rendering
    scale: {
        mode: Phaser.Scale.RESIZE, // Resize mode
        autoCenter: Phaser.Scale.CENTER_BOTH, // Auto-center canvas
    },
    backgroundColor: '#000000', // Black background color
};

const game = new Phaser.Game(config); // Initialize the Phaser game instance

// Resize handler for window resizing (this will make sure the game resizes when you change window size)
window.addEventListener("resize", () => {
    game.scale.resize(window.innerWidth, window.innerHeight);  // Resize the game canvas
    console.log("Game Resized to:", window.innerWidth, window.innerHeight); // Debugging output
});
