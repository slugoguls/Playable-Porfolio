import Phaser from 'phaser'; // Import Phaser from node_modules
import MenuScene from './scenes/MenuScene.js'; // Adjusted path for MenuScene
import GameScene from './scenes/GameScene.js'; // Adjusted path for GameScene
import OutdoorScene from './scenes/TheOutdoors.js'; // Adjusted path for OutdoorScene

// Target resolution for the game
const targetWidth = 320;
const targetHeight = 180;

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,   // Game width set to the window width
    height: window.innerHeight, // Game height set to the window height
    scene: [MenuScene, GameScene, OutdoorScene],  // Start with MenuScene
    physics: {
        default: 'arcade', // Using Arcade physics
        arcade: {
            gravity: { y: 0 }, // No gravity
            debug: false, // Turn off physics debugging
        },
    },
    pixelArt: true,  // Ensure pixel-perfect rendering
    scale: {
        mode: Phaser.Scale.FIT,  // Ensures the game will scale and fit the screen without stretching
        autoCenter: Phaser.Scale.CENTER_BOTH,  // Auto-center canvas
    },
    backgroundColor: '#000000', // Black background color
};

const game = new Phaser.Game(config); // Initialize the Phaser game instance

// Resize handler for window resizing (this will make sure the game resizes when you change window size)
window.addEventListener("resize", () => {
    game.scale.resize(window.innerWidth, window.innerHeight);  // Resize the game canvas
    console.log("Game Resized to:", window.innerWidth, window.innerHeight); // Debugging output
});
