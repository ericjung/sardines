/**
 * SARDINES!
 * By Eric H. Jung
 * a Week in April 2021
 * 
 * For my adorable son, Elliot on his 3rd birthday 2021-04-23, who likes to eat sardines with me.
 * There are still some bugs with pausing/unpausing the game, and a few other things I'd like to add:
 * 
 *   * high scores (requires backend web service with database)
 *   * treasure chest random appearances -- big points!
 *   * snail. similar to the crab, he crawls on the sea floor. when touched, the player slows down for a period of time.
 *   * change background music when crab is touched to indicate god mode (like when pac-man eats a power-up)
 *   * other sea creature which, when touched, the player speeds up for a period of time.
 *   * better sea floor; e.g. with sand, shells, etc. not just seweed
 *   * multiplayer?
 */
const ELLIOT_SCALE = 0.1;
const MAIN_SCENE_NAME = "main";
const LEVEL_SCENE_NAME = "level";
const BONUS_SCENE_NAME = "bonus";
const BONUS_TITLE_SCENE_NAME = "bonusTitle";
const BONUS_RESULTS_SCENE_NAME ="bonusResults";
const BONUS_LEVEL_DURATION = 10000; // in msec

const BONUS_LEVEL_IN_PROGRESS = 1;
const BONUS_LEVEL_ENDED = 2;
const BONUS_LEVEL_NOT_IN_PROGRESS = 3;

const YELLOW = kaboom.color(1, 1, 0, 1); // rgba 
const WHITE = kaboom.color(1, 1, 1, 1 ); // rgba

const NUM_LIVES_PER_GAME = 3;

const NORMAL_FONT_SIZE = 8;
const BIG_FONT_SIZE = 12;
const BIGGEST_FONT_SIZE = NORMAL_FONT_SIZE*2;

const NORMAL_VERTICAL_SPACING = 12;
const DOUBLE_VERTICAL_SPACING = NORMAL_VERTICAL_SPACING * 2;
const QUADRUPLE_VERTICAL_SPACING = DOUBLE_VERTICAL_SPACING * 2;

class Game {
    constructor(kaboom) {
        this.CENTER_TEXT_Y = (kaboom.height() / 2)-50;
        this.CENTER_TEXT_X = (width() / 2)-150;
        this.elliotSprite = null;
        this.scoreSprite = null;
        this.sardinesTillNextLevelSprite = null;
        this.titleSprite = null;
        this.seaWeedSprites = null;
        this.backgroundMusicDuringGamePlay = new BackgroundMusic(kaboom);
        this.livesSprites = [];
        this.lives = NUM_LIVES_PER_GAME;
        this.extraLifeScore = 7000;
        this.allFishSprites = [];
        this.timers = [];
        this.kaboom = kaboom;
        this.levelNum = 1; // levels are 1-indexed
        this.sardinesNeededForNextLevel = 20;
        this.bonusLevelEvery = 3;
        this.gameOverOverlaySprites = [];
        this.bonusLevelStatus = BONUS_LEVEL_NOT_IN_PROGRESS;
        this.bonusSardinesEaten = 0;

        // TODO: should we increase number of sharks based on _levelNum_ ??? to make it hard by level
        this.sharks = new FriendOrEnemy({name: "shark", points: 10, speed: this.kaboom.rand(80, 120),
            spawnInterval: 3000, scale: this.kaboom.vec2(-1, 1), yDeltaRange: {min: 10, max: 40},
            infoSpacing: null, max: 10});

        this.crabs = new FriendOrEnemy({name: "crab", points: 0, speed: 15, spawnInterval: 3000, scale: this.kaboom.vec2(0.1),
            yDeltaRange: {min: 0, max: 0, direction: 1} /* horizontal only */, infoSpacing: null,
            pos: this.kaboom.vec2(width()/2, height()-30), maxDelay: 5000 /* delay until next crab appears */,
            max: 1,
            // display crab if godMode not enabled (crab collision enabled godmode, so dont spawn crab during godmode)
            condition: elliotSprite => !elliotSprite.godMode.enabled});

        this.krackens = new FriendOrEnemy({name: "kracken", points: 50, speed: this.kaboom.rand(30, 70), spawnInterval: 1000,
            scale: this.kaboom.vec2(0.50), yDeltaRange: {min: 0, max: 0}, /* horizontal only */ infoSpacing: {x: -10, y: 30},
            max: 1,
            initalDelayBeforeRender: 5000});
 
        this.sardines = new FriendOrEnemy({name: "sardine", points: 100, speed: this.kaboom.rand(30, 80), spawnInterval: 500,
            scale: this.kaboom.vec2(0.5), yDeltaRange: {min: 5, max: 30}, max: 6, numEaten: 0});

        this.pinkFishes = new FriendOrEnemy({name: "pinkFish", points: 1, speed: this.kaboom.rand(30, 80), spawnInterval: 1000,
            scale: this.kaboom.vec2(1), yDeltaRange: {min: 10, max: 30}, infoSpacing: {x: 0, y: 20}, max: 3});

        this.goldFishes = new FriendOrEnemy({name: "goldFish", points: 1, speed: this.kaboom.rand(30, 80), spawnInterval: 1000,
            scale: this.kaboom.vec2(0.05), yDeltaRange: {min: 10, max: 50}, infoSpacing: {x: 0, y: 20}, max: 2});

        this.seaHorses = new FriendOrEnemy({name: "seaHorse", points: 20, speed: this.kaboom.rand(30, 80), spawnInterval: 1000,
            scale: this.kaboom.vec2(0.05), yDeltaRange: {min: 0, max: 0}, infoSpacing: {x: 10, y: 30}, max: 1});

        this.scubaDiversType1 = new FriendOrEnemy({name: "scubaDiverType1", points: 20, speed: this.kaboom.rand(30, 70), spawnInterval: 1000,
            scale: this.kaboom.vec2(0.04), yDeltaRange: {min: 0, max: 0}, infoSpacing: {x: -10, y: 30}, max: 1});

        this.scubaDiversType2 = new FriendOrEnemy({name: "scubaDiverType2", points: 20, speed: this.kaboom.rand(30, 70), spawnInterval: 1000,
            scale: this.kaboom.vec2(0.14), yDeltaRange: {min: 0, max: 0}, infoSpacing: {x: -10, y: 30}, max: 1});
    }

    startNewGame() {
        this.playBackgroundMusic(false);
        this.renderElliot(); // render Elliot first because other renders depend on this.elliotSprite to be non-null
        this.renderSeaweed();
        this.renderTitleAndScore();
        this.renderFriendsAndEnemies();
        this.renderSardines();
        this.renderRemainingLives();
        this.installKeyHandlers();
        this.installCollisionHandlers();
    }

    startBonusLevel() {
        this.playBackgroundMusic(true);
        let durationCounter = 0;
        const bonusLevelTimeRemainingSprite = add([text("Time Remaining: " + (BONUS_LEVEL_DURATION/1000), BIG_FONT_SIZE), WHITE, pos(10, 10)]);
        this.timers.push(setInterval(() => {
            if (durationCounter >= BONUS_LEVEL_DURATION) {
                this.bonusLevelStatus = BONUS_LEVEL_ENDED;
                destroy(bonusLevelTimeRemainingSprite);
                go(BONUS_RESULTS_SCENE_NAME, {game: this, levelNum: this.levelNum, sardinesNeededForNextLevel: this.sardinesNeededForNextLevel});
            }
            else {
                durationCounter += 1000;
                bonusLevelTimeRemainingSprite.text = "Time Remaining: " + ((BONUS_LEVEL_DURATION/1000) - (durationCounter/1000));
            }

        }, 1000));
        this.bonusLevelStatus = BONUS_LEVEL_IN_PROGRESS;
        this.renderElliot(); // render Elliot first because other renders depend on this.elliotSprite to be non-null
        //this.renderSeaweed(); // TODO: render sunken ship, etc
        //this.renderTitleAndScore();
        this.renderSardines();
        //this.renderRemainingLives();
        this.installKeyHandlers();
        this.installCollisionHandlers();        
    }

    renderSeaweed() {
      if (this.seaWeedSprites) {
          for (const s in this.seaWeedSprites) {
              destroy(this.seaWeedSprites[s]);
          }          
      }
      this.seaWeedSprites = [];
      for (let i = 0; i<9; i++) {
          this.seaWeedSprites.push(add([
                sprite("seaWeed1"),
                scale(0.2),
                origin("topleft"),
                pos(100*i, height()-95)
            ]));
      }        
    }

   // draw the lives remaining
   renderRemainingLives() {
        for (const i in this.livesSprites) {
            destroy(this.livesSprites[i]);
        }
        this.livesSprites.length = 0
        const dist = this.elliotSprite.width * ELLIOT_SCALE;
        for (let i=0; i<this.lives-1; i++) { // draw 1 less than total because the player is playing one of the lives right now
            this.livesSprites.push(add([sprite("elliot"), pos(width() - (i*dist) - dist, 10), scale(ELLIOT_SCALE/2, ELLIOT_SCALE/2)]));
        }
        if (this.lives-1 > 0) {
            this.livesSprites.push(add([text("lives", NORMAL_FONT_SIZE), pos(width() - ((this.lives)*(dist*1.25)), 15)]));
        }
    }

    renderTitleAndScore() {
        if (this.titleSprite) {
            destroy(this.titleSprite);
        }
        this.titleSprite =  add([text("Sardines!", BIG_FONT_SIZE), WHITE, pos(10, 10)]);
        if (this.scoreSprite) {
            destroy(this.scoreSprite);
        }
        if (this.sardinesTillNextLevelSprite) {
            destroy(this.sardinesTillNextLevelSprite);
        }
        this.scoreSprite = add([text("score: " + this.score, NORMAL_FONT_SIZE), WHITE, pos(10, 25)]);
        this.sardinesTillNextLevelSprite = add([text("sardines eaten: " + (this.sardines.numEaten + ""), NORMAL_FONT_SIZE), WHITE,
            pos(10, 35)]);
    }

    renderElliot() {
        if (this.elliotSprite) {
            destroy(this.elliotSprite);
        }
        this.elliotSprite = add([
                sprite("elliot"),
                scale(ELLIOT_SCALE, ELLIOT_SCALE),
                pos(width()/2, height()/2),
                rotate(0),
                origin("center"),
                {
                godMode: {
                    enabled: false,
                    timerId: null,
                    seconds: 0,
                    maxSeconds: 7
                },
                speed: 290
                }
            ]);
      
        this.elliotSprite.action(() => {
            // Animate elliot if he's in godmode
            // Wish we had transparency to fade him in/out
            if (this.elliotSprite.godMode.enabled) {
                // TODO: pulse transparency and color instead of this angle rotation
                this.elliotSprite.angle += 1;
                //elliotSprite.color = rgb(1, 0, 0);
            }    
          });        
    }

    playBackgroundMusic(isBonusLevel) {
        if (isBonusLevel) {
            this.backgroundMusicDuringGamePlay.selectJeopardyTheme();
        }
        else {
            this.backgroundMusicDuringGamePlay.selectMahNaMahNa();
        }

        this.backgroundMusicDuringGamePlay.play();
    }

    stopBackgroundMusic() {
        this.backgroundMusicDuringGamePlay.stop();
    }

    installKeyHandlers() {
        keyDown("left", () => {
            if (paused()) {
                return;
            }
            this.elliotSprite.move(-this.elliotSprite.speed, 0);
            this.elliotSprite.pos.x = Math.max(this.elliotSprite.pos.x, (this.elliotSprite.width * ELLIOT_SCALE) - (ELLIOT_SCALE * 150));
        });
        
        keyDown("right", () => {
            if (paused()) {
                return;
            }
            this.elliotSprite.move(this.elliotSprite.speed, 0);
            this.elliotSprite.pos.x = Math.min(this.elliotSprite.pos.x, width() - (this.elliotSprite.width * ELLIOT_SCALE) + (ELLIOT_SCALE * 150));
        });
        
        keyDown("up", () => {
            if (paused()) {
                return;
            }      
            this.elliotSprite.move(0, -this.elliotSprite.speed);
            this.elliotSprite.pos.y = Math.max(this.elliotSprite.pos.y, (this.elliotSprite.height * ELLIOT_SCALE - (ELLIOT_SCALE*180)));
        });
        
        keyDown("down", () => {
            if (paused()) {
                return;
            }    
            this.elliotSprite.move(0, this.elliotSprite.speed);
            this.elliotSprite.pos.y = Math.min(this.elliotSprite.pos.y, height() - (this.elliotSprite.height * ELLIOT_SCALE - (ELLIOT_SCALE*180)));
        });
        
        keyDown("space", () => {
            console.log("current pause value is " + paused());
            if (paused()) {
                // Already paused -- so unpause
                pause(false);
                this.playBackgroundMusic(this.bonusLevelStatus == BONUS_LEVEL_IN_PROGRESS);
            }
            else {
                pause(true);
                // TODO: pause timers (but need to keep state of time remaining for the case of bonus level)
                this.stopBackgroundMusic();
            }
            console.log("new pause value is " + paused());
        });
    
        keyPress("m", () => {
            this.backgroundMusicDuringGamePlay.enableDisable(!this.backgroundMusicDuringGamePlay.isEnabled());
        });

        keyPress("r", () => {
            this.resetGame();
            this.resetScoreAndLives();
            go(LEVEL_SCENE_NAME, {game: this, levelNum: this.levelNum, sardinesNeededForNextLevel: this.sardinesNeededForNextLevel});
        });

        keyPress("i", () => {
            if (this.isGameOver()) {
                // No instructions during gameplay
                go("instructions");
            }
        });                  
    }

    renderFriendsAndEnemies() {
        this._renderFishSprite(this.sharks);
        this._renderFishSprite(this.krackens);
        this._renderFishSprite(this.pinkFishes);
        this._renderFishSprite(this.goldFishes);
        this._renderFishSprite(this.seaHorses);        
        if (this.levelNum % 2 == 0) {
            // for even levels, render scuba diver 1
            this._renderFishSprite(this.scubaDiversType1);
        }
        else {
            // for odd levels, render scuba diver 2
            this._renderFishSprite(this.scubaDiversType2);
        }
        this._renderFishSprite(this.crabs);
        [this.sharks.name, this.krackens.name, this.pinkFishes.name, this.goldFishes.name, this.seaHorses.name,
            this.scubaDiversType1.name, this.scubaDiversType2.name, this.crabs.name].forEach(e => {
              action(e, p => this.moveSprite(p));
        });
    }

    renderSardines() {
        this._renderFishSprite(this.sardines);
        [this.sardines.name].forEach(e => {
            action(e, p => this.moveSprite(p));
        });            
    }

    _renderFishSprite(fish) {
        if (fish.initalDelayBeforeRender) {
            console.log("initilDelayBeforeRender is " + fish.initalDelayBeforeRender + " for " + fish.name);
            // Is there an initial delay before rendering this sprite? For example,
            // we do not want to render crabs and shark immediately when level has started.
            // use setTimeout() not setInterval() so it's only called once.
            // TODO: fix. this is not yet working as expected.
            setTimeout(_installTimer(this), fish.initalDelayBeforeRender);
        }
        else {
          _installTimer(this);
        }
        function _installTimer(game) {
          game.timers.push(setInterval(() => {
              // First, check custom condition, if one exists (e.g. for crab do not render if godMode is enabled)
              if (fish.condition && !fish.condition(game.elliotSprite)) {
                  //console.log("Not displaying " + fish.name + " because of custom condition");
                  return;
              }
              if (get(fish.name).length < fish.max) {
                  //console.log("max for " + fish.name + " is " + fish.max);
                  //console.log("currently there are " + get(fish.name).length   + " " + fish.name + ". adding one more.");
                  if (fish.currentDelay >= fish.maxDelay) {
                    fish.currentDelay = 0;
                    fish.orientation = choose([-1, 1]);
                    game.allFishSprites.push(_addFishSprite(fish));
                    //console.log(fish.name + " added for a total of " + get(fish.name).length);
                  }
                  else {
                      fish.currentDelay += fish.spawnInterval;
                  }
              }
            }, fish.spawnInterval));          
        }
        function _addFishSprite(fish) {
            // TODO: don't render sprtes so close to elliot, especially sharks and krackens
            return add([
                  sprite(fish.name),
                  pos(fish.pos ? fish.pos :
                    vec2(rand(-width() / 2, width() / 2), rand(height() / 2 + 21))),
                  scale(fish.orientation*fish.scale.x, 1*fish.scale.y),
                  fish.name, // tag
                  {speed: fish.speed,
                    orientation: fish.orientation,
                    yDeltaRange: rand(fish.yDeltaRange.min, fish.yDeltaRange.max) *
                       // use the specified direction if one; otherwise random
                      (fish.direction ? fish.direction : choose([-1,1])),
                    points: fish.points
                  }
            ]);      
          }        
    }

    moveSprite(p) {
        p.move(p.speed*p.orientation, p.yDeltaRange);
        if (p.pos.x > width()) {
            p.pos.x = 1;
        }
        if (p.pos.x < 0) {
            p.pos.x = width();
        }
        if (p.pos.y > height()) {
            p.pos.y = 1;
        }
        if (p.pos.y < 0) {
            p.pos.y = height();
        }  
    }

    installCollisionHandlers() {
        this.elliotSprite.collides(this.pinkFishes.name, s => this.friendCollision(s));
        this.elliotSprite.collides(this.goldFishes.name, s => this.friendCollision(s));
        this.elliotSprite.collides(this.seaHorses.name, s => this.friendCollision(s));
        this.elliotSprite.collides(this.scubaDiversType1.name, s => this.friendCollision(s));
        this.elliotSprite.collides(this.scubaDiversType2.name, s => this.friendCollision(s));

        // Yum
        this.elliotSprite.collides(this.sardines.name, (s) => {
            destroy(s);
            this.increaseScore(s.points);
            // Sardines eaten on the bonus level dont increase numEaten
            if (this.bonusLevelStatus == BONUS_LEVEL_NOT_IN_PROGRESS) {
                if (++this.sardines.numEaten >= (this.levelNum * this.sardinesNeededForNextLevel)) {
                    this.levelNum++;
                    this.showLevelPage();
                }
                this.sardinesTillNextLevelSprite.text = "sardines eaten: " + (this.sardines.numEaten + "");
            }
            else {
                this.bonusSardinesEaten++;
            }
        });

      // Super Elliot
      this.elliotSprite.collides(this.crabs.name, (s) => {
        console.log("*** god mode on!");
        destroy(s);
        play("godMode");
        this.elliotSprite.godMode.enabled = true;
        this.crabs.numEaten++;
        const godModeTimerId = setInterval(() => {
            // If the level is cleared during godmode, this.elliotSprite is destroyed & nulled
            if (!this.elliotSprite) {
                clearInterval(godModeTimerId);
            }
            else if (this.elliotSprite.godMode.seconds++ >= this.elliotSprite.godMode.maxSeconds) {
                clearInterval(godModeTimerId);
                this.elliotSprite.godMode.seconds = this.elliotSprite.angle = 0;
                this.elliotSprite.godMode.enabled = false;
                console.log("*** god mode off");
            }
        }, 1000);
      });
      
        this.elliotSprite.collides(this.sharks.name, (s) => {
            destroy(s);
            this.maybeGameOver(s);
        });

        this.elliotSprite.collides(this.krackens.name, (s) => {
            destroy(s);
            this.maybeGameOver(s);
        });
    } // installCollisionHandlers()

    // If in godmode, friend collisions result in destruction of friend and some minimal points.
    friendCollision(s) {
        if (this.elliotSprite.godMode.enabled) {
            destroy(s);
            this.increaseScore(s.points);
            s.numEaten++; // TODO: check if this is incrementing numEaten on the object we expect
        }   
    }

    maybeGameOver(enemy) {
        if (this.elliotSprite.godMode.enabled) {
            this.increaseScore(enemy.points);
            return;
        }
        play("die");
        camShake(7);	  
        this.lives--;
        this.renderRemainingLives();
        if (this.isGameOver()) {
            this.gameOver();            
        }
      }

    gameOver() {
        // Game is really over
        destroy(this.elliotSprite); // Hiding the sprite still triggers collisions so destroy it instead
        this.stopBackgroundMusic();
        play("gameOver");

        // Stop spawning new creatures
        this.timers.forEach(t => clearInterval(t));
        this.timers.length = 0;

        let x = this.CENTER_TEXT_X, y = this.CENTER_TEXT_Y;
        this.gameOverOverlaySprites.push(add([text("game over", BIGGEST_FONT_SIZE), WHITE, pos(x, y)]));
        this.gameOverOverlaySprites.push(add([text("final score: " + this.score, BIG_FONT_SIZE), WHITE, pos(x, y+=DOUBLE_VERTICAL_SPACING)]));
        this.gameOverOverlaySprites.push(add([ text("you reached level " + this.levelNum, BIG_FONT_SIZE), WHITE, pos(x, y+=NORMAL_VERTICAL_SPACING)]));        
        this.gameOverOverlaySprites.push(add([ text("press 'i' for instructions ", NORMAL_FONT_SIZE), WHITE, pos(x, y+=QUADRUPLE_VERTICAL_SPACING)]));
        this.gameOverOverlaySprites.push(add([ text("press 'r' to play again ", NORMAL_FONT_SIZE), WHITE, pos(x, y+=NORMAL_VERTICAL_SPACING)]));
      }
  
      resetGame() {
        if (this.elliotSprite) {
            // This was already done in gameOver() if the game ended via player deaths.
            // But not if resetting the game coming from the instructions page or level 1.
            destroy(this.elliotSprite);   
        }
        this.elliotSprite = null;
        this.allFishSprites.forEach(e => destroy(e));
        this.allFishSprites.length = 0;
        // This was already done in gameOver() if the game ended via player deaths.
        // But not if resetting the game coming from the instructions page or level 1.
        this.timers.forEach(t => clearInterval(t));
        this.timers.length = 0;
        this.gameOverOverlaySprites.forEach(e => destroy(e));
        this.gameOverOverlaySprites.length = 0;
    }

    resetScoreAndLives() {
        console.log("resetting score and lives");
        this.levelNum = 1; // First level is 1, not 0
        this.score = 0;
        this.lives = NUM_LIVES_PER_GAME;
        this.sardines.numEaten = 0;
        this.bonusSardinesEaten = 0;
    }
  
    isGameOver() {
        return this.lives <= 0;
    }
    
    increaseScore(points) {
        this.score += points;
        if (this.score % this.extraLifeScore == 0) {
            this.lives++;
            this.renderRemainingLives();
            play("extraLife");
        }
        else {
            play("scorePoint");
        }
        if (this.bonusLevelStatus != BONUS_LEVEL_IN_PROGRESS) {
            this.scoreSprite.text = "score: " + this.score;
        }
    }

    showLevelPage() {
        if (this.levelNum == 1) { // First level is 1, not 0  
            // Create all scenes for future use
            kaboom.scene(MAIN_SCENE_NAME, (args) => {
                randSeed(Date.now()); 
                args.game.startNewGame();
              });

            this.kaboom.scene(LEVEL_SCENE_NAME, async (args) => {
                args.game.stopBackgroundMusic();

                const {game, levelNum, sardinesNeededForNextLevel} = args, kaboom = game.kaboom;
                let x = this.CENTER_TEXT_X, y = this.CENTER_TEXT_Y;
                add([text("Level " + levelNum, BIGGEST_FONT_SIZE), WHITE, pos(x, y)]);                          
                
                // Is next round a bonus level or not?
                const nextLevelIsBonus = (this.levelNum+1) % this.bonusLevelEvery == 0;
                let txt, color;
                if (nextLevelIsBonus) {
                    txt = "BONUS ROUND!";
                    color = YELLOW;
                }
                else {
                    txt = "next level";
                    color = WHITE;
                }
                add([text("Eat " + sardinesNeededForNextLevel + " sardines for " + txt, NORMAL_FONT_SIZE), WHITE, pos(x, y+=DOUBLE_VERTICAL_SPACING), color]);
                add([text("Extra life at " + this.extraLifeScore.toString() + " points", NORMAL_FONT_SIZE), WHITE, pos(x, y+=NORMAL_VERTICAL_SPACING)]);                      
                await wait(1);
                let count = 3;
                const GET_READY = "GET READY ... ";
                const countText = add([text(GET_READY + (count +""), BIGGEST_FONT_SIZE), WHITE, pos(x, y+=(QUADRUPLE_VERTICAL_SPACING))]);
                const levelCountdownTimerId = setInterval(async () =>  {
                    if (--count == 0) {
                        clearInterval(levelCountdownTimerId);
                        countText.text = GET_READY + "GO!";
                        await wait(0.5);
                        kaboom.go(MAIN_SCENE_NAME, args);
                    }
                    else {
                        countText.text = GET_READY + (count + "");
                    }
                }, 1000);
            });

            // Bonus title scene
            this.kaboom.scene(BONUS_TITLE_SCENE_NAME, async (args) => {
                const {game} = args;
                game.stopBackgroundMusic();
                let x = this.CENTER_TEXT_X, y = this.CENTER_TEXT_Y;
                add([text("BONUS LEVEL", BIGGEST_FONT_SIZE), YELLOW, pos(x, y)]);
                await wait(1);
                add([text((BONUS_LEVEL_DURATION/1000) + " seconds to eat all you can!", NORMAL_FONT_SIZE), WHITE, pos(x, y+=DOUBLE_VERTICAL_SPACING)]);
                await wait(1);
                let count = 3;
                const GET_READY = "GET READY ... ";
                const countText = add([text(GET_READY + (count +""), BIGGEST_FONT_SIZE), WHITE, pos(x, y+=QUADRUPLE_VERTICAL_SPACING)]);
                const levelCountdownTimerId = setInterval(async () => {
                    if (--count == 0) {
                        clearInterval(levelCountdownTimerId);
                        countText.text = GET_READY + "GO!";
                        await wait(0.5);
                        kaboom.go(BONUS_SCENE_NAME, args);
                    }
                    else {
                        countText.text = GET_READY + (count + "");
                    }
                }, 1000);                
            });

            // Bonus scene
            this.kaboom.scene(BONUS_SCENE_NAME, (args) => {
                const {game} = args;
                // TODO: make this scene nicer looking
                add([
                    sprite("shipWreck"),
                    scale(0.2),
                    origin("topleft"),
                    pos(100, height()-104)
                ]);
                game.startBonusLevel();
            });

            // Bonus results scene
            this.kaboom.scene(BONUS_RESULTS_SCENE_NAME, async (args) => {
                const {game} = args;
                game.resetGame(); // TODO: test if this is required
                // game.stopBackgroundMusic();   nah finish it out. it's not looping.
                let x = this.CENTER_TEXT_X, y = this.CENTER_TEXT_Y;
                const X_INDENT = 150;
                add([text("BONUS LEVEL OVER!", BIGGEST_FONT_SIZE), WHITE, pos(x, y)]);                
                await wait(1);
                add([text("Sardines eaten:", NORMAL_FONT_SIZE), WHITE, pos(x, y+=(QUADRUPLE_VERTICAL_SPACING))]);
                await wait(1);
                const bonusSardinesEaten = game.bonusSardinesEaten;
                add([text(bonusSardinesEaten.toString(), NORMAL_FONT_SIZE), YELLOW, pos(x+X_INDENT, y)]);
                await wait(1);
                add([text("Total bonus:", NORMAL_FONT_SIZE), WHITE, pos(x, y+=(NORMAL_VERTICAL_SPACING))]);
                await wait(1);
                add([text( (bonusSardinesEaten * game.sardines.points).toString(), NORMAL_FONT_SIZE), YELLOW, pos(x+X_INDENT, y)]);
                await wait(3);
                game.bonusSardinesEaten = 0;
                game.bonusLevelStatus = BONUS_LEVEL_NOT_IN_PROGRESS;  
                kaboom.go(LEVEL_SCENE_NAME, args);  
            });

        }
        this.resetGame();
        if (this.bonusLevelStatus == BONUS_LEVEL_ENDED) {
            go(BONUS_RESULTS_SCENE_NAME, {game: this, levelNum: this.levelNum, sardinesNeededForNextLevel: this.sardinesNeededForNextLevel});
        }        
        if (this.levelNum % this.bonusLevelEvery == 0) {
            // Bonus title level
            go(BONUS_TITLE_SCENE_NAME, {game: this, levelNum: this.levelNum, sardinesNeededForNextLevel: this.sardinesNeededForNextLevel});
        }
        else {
            // for testing bonus scenes, change next line to use BONUS_TITLE_SCENE_NAME
            go(LEVEL_SCENE_NAME, {game: this, levelNum: this.levelNum, sardinesNeededForNextLevel: this.sardinesNeededForNextLevel});
        }
    }
}