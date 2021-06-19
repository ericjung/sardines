class Resources {

  constructor(kaboom) {
      // Load all sprites
      kaboom.loadSprite("sardine", "/sardines/sprites/sardine.png");
      kaboom.loadSprite("oceanBackground", "/sardines/sprites/oceantile.png");
      kaboom.loadSprite("pinkFish", "/sardines/sprites/pink-fish.png");
      kaboom.loadSprite("shark", "/sardines/sprites/shark-1.png");
      kaboom.loadSprite("goldFish", "/sardines/sprites/goldfish.png");
      kaboom.loadSprite("elliot", "/sardines/sprites/elliot-tongue2.png");
      kaboom.loadSprite("seaWeed1", "/sardines/sprites/seaweed-1.png");
      kaboom.loadSprite("crab", "/sardines/sprites/crab.png");
      kaboom.loadSprite("seaHorse", "/sardines/sprites/seahorse.png");
      kaboom.loadSprite("scubaDiverType1", "/sardines/sprites/scuba.png");
      kaboom.loadSprite("scubaDiverType2", "/sardines/sprites/scuba2.png");
      kaboom.loadSprite("arrows", "/sardines/sprites/arrows.png");
      kaboom.loadSprite("shipWreck", "/sardines/sprites/shipwreck-1.png");
      kaboom.loadSprite("kracken", "/sardines/sprites/kracken.png"); // thanks, max! http://pixelartmaker.com/art/c512d07f3150d9d
      
      // Load sounds and music
      kaboom.loadSound("scorePoint", "/sardines/audio/bleep.wav");
      kaboom.loadSound("die", "/sardines/audio/die.wav");
      kaboom.loadSound("godMode", "/sardines/audio/powerup1.wav");
      kaboom.loadSound("gameOver", "/sardines/audio/game-over-pacman.mp3");
      kaboom.loadSound("extraLife", "/sardines/audio/extra-life.mp3");
      kaboom.loadSound("spokenSardinesHighPitched", "/sardines/audio/elliot-speaking-sardines-high-pitched.mp3");
  }
}
    