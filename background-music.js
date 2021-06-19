const MAH_NA_MA_NA = "mahNaMahNa";
const JEOPARDY_THEME = "jeopardyTheme";

class Music {
    constructor(props) {
        this.volume = props.volume;
        this.name = props.name;
        props.kaboom.loadSound(this.name, props.path);
    }
}
class BackgroundMusic {

  constructor(kaboom) {
    this.kaboom = kaboom;
    this.mahNaMahNa = new Music({kaboom: kaboom, volume: 0.5, name: MAH_NA_MA_NA, path: "/sardines/audio/mah-ma-mah-na.mp3"});
    this.jeopardyTheme = new Music({kaboom: kaboom, volume: 1.5, name: JEOPARDY_THEME, path: "/sardines/audio/jeopardy-theme.mp3"});
    this.active = this.mahNaMahNa;
    this.loop = true;
    this.musicObject = null;
    this.enabled = true;
  }

  selectMahNaMahNa() {
    this.active = this.mahNaMahNa;
  }

  selectJeopardyTheme() {
    this.active = this.jeopardyTheme;
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
    this.musicObject = this.kaboom.play(this.active.name, {loop: this.loop, volume: this.active.volume}); 
  }
}