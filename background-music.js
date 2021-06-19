class BackgroundMusic {

  constructor(kaboom) {
    this.kaboom = kaboom;
    kaboom.loadSound("mahNaMahNa", "/sardines/audio/mah-ma-mah-na.mp3");
    this.name = "mahNaMahNa"; 
    this.loop = true;
    this.volume = 0.5;
    this.musicObject = null;
    this.enabled = true;
  }
  
  stop() {
    // .resume() does not work so force .play() to be called again when game
    // restarts      
    if (this.musicObject) {
        this.musicObject.stop();
        this.musicObject = null;
    }
  }
  
  enableDisable(b) {
      this.enabled = b;
      if (this.enabled) {
          this.play();
      }
      else {
          this.stop();
      }
      console.log("Background Music is now " + this.enabled);
  }
  
  isEnabled() {
      return this.enabled;
  }
  
  play() {
    if (!this.enabled) return;
    
    this.stop();
    // .pause() and .resume() of music does not work very well  
    this.musicObject = play(this.name, {loop: this.loop, volume: this.volume}); 
  }
}
