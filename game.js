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

class Game {
    constructor(kaboom) {
        this.elliotSprite = null;
        this.scoreSprite = null;
        this.sardinesTillNextLevelSprite = null;
        this.titleSprite = null;
        this.seaWeedSprites = null;
        this.backgroundMusicDuringGamePlay = new BackgroundMusic(kaboom);
        this.livesSprites = [];
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
        this.playBackgroundMusic();
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
        let durationCounter = 0;
        const bonusLevelTimeRemainingSprite = add([text("Time Remaining: " + (BONUS_LEVEL_DURATION/1000), 12), rgb(1,0,0), pos(10, 10)]);
        this.timers.push(setInterval(() => {
            if (durationCounter >= BONUS_LEVEL_DURATION) {
                this.levelNum++;
                this.bonusLevelStatus = BONUS_LEVEL_ENDED;
                destroy(bonusLevelTimeRemainingSprite);
                this.showLevelPage();
            }
            else {
                durationCounter += 1000;
                bonusLevelTimeRemainingSprite.text = "Time Remaining: " + ((BONUS_LEVEL_DURATION/1000) - (durationCounter/1000));
            }

        }, 1000));
        this.bonusLevelStatus = BONUS_LEVEL_IN_PROGRESS;
        this.playBackgroundMusic(); // TODO: change to different music
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
          console.log("rendering seaweed");
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
        const dist = 30;
        for (let i=0; i<this.lives-1; i++) { // draw 1 less than total because the player is playing one of the lives right now
            this.livesSprites.push(add([sprite("elliot"), pos(width() - (i*dist) - dist, 10), scale(ELLIOT_SCALE/2, ELLIOT_SCALE/2)]));
            console.log("there are " + this.livesSprites.length + " sprite lives");
        }
        if (this.lives-1 > 0) {
            this.livesSprites.push(add([text("lives", 8), pos(width() - ((this.lives)*(dist*1.25)), 15)]));
        }
    }

    renderTitleAndScore() {
        if (this.titleSprite) {
            destroy(this.titleSprite);
        }
        this.titleSprite =  add([text("Sardines!", 12), rgb(100,0,0), pos(10, 10)]);
        if (this.scoreSprite) {
            destroy(this.scoreSprite);
        }
        if (this.sardinesTillNextLevelSprite) {
            destroy(this.sardinesTillNextLevelSprite);
        }
        this.scoreSprite = add([text("score: " + this.score, 8), pos(10, 25), rgb(0,255,0)]);
        this.sardinesTillNextLevelSprite = add([text("sardines eaten: " + this.sardines.numEaten), 8,
            pos(10, 35), rgb(0,255,0)]);
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
                //elliotSprite.scale = Math.sin(time()) * .2;
                this.elliotSprite.angle += 1;
                //elliotSprite.color = rgb(1, 0, 0);
            }    
          });        
    }

    playBackgroundMusic() {
        this.backgroundMusicDuringGamePlay.play();
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
        
        keyPress("space", () => {
            console.log("current pause value is " + paused());
            if (paused()) {
                pause(false);
                this.backgroundMusicDuringGamePlay.play()
            }
            else {
                pause(true);
                this.backgroundMusicDuringGamePlay.stop()
            }
            console.log("new pause value is " + paused());
        });
    
        keyPress("m", () => {
            this.backgroundMusicDuringGamePlay.enableDisable(!this.backgroundMusicDuringGamePlay.isEnabled());
        });

        keyPress("r", () => {
            console.log("resetting game");
            this.resetGame();
            this.resetScoreAndLives();
            go(LEVEL_SCENE_NAME, {game: this, levelNum: this.levelNum, sardinesNeededForNextLevel: this.sardinesNeededForNextLevel});
        });

        keyPress("i", () => {
            if (this.isGameOver()) {
                // Not during a game
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
        this._renderFishSprite(this.scubaDiversType1);
        this._renderFishSprite(this.scubaDiversType2);
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

    _renderFishSprite(guy) {
        if (guy.initalDelayBeforeRender) {
            // setTimeout() not setInterval() so it's only called once
            setTimeout(_installTimer(this), guy.initalDelayBeforeRender);
        }
        else {
          _installTimer(this);
        }
        function _installTimer(game) {
          game.timers.push(setInterval(() => {
              // First, check custom condition if one exists (e.g. for crab do not render if godMode is enabled)
              if (guy.condition && !guy.condition(game.elliotSprite)) {
                  console.log("Not displaying " + guy.name + " because of custom condition");
                  return;
              }
              if (get(guy.name).length < guy.max) {
                  console.log("max for " + guy.name + " is " + guy.max);
                  console.log("currently there are " + get(guy.name).length   + " " + guy.name + ". adding one more.");
                  if (guy.currentDelay >= guy.maxDelay) {
                    guy.currentDelay = 0;
                    guy.orientation = choose([-1, 1]);
                    game.allFishSprites.push(_addFishSprite(guy));
                    console.log(guy.name + " added for a total of " + get(guy.name).length);
                  }
                  else {
                      guy.currentDelay += guy.spawnInterval;
                  }
              }
            }, guy.spawnInterval));          
        }
        function _addFishSprite(fish) {
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
                this.sardinesTillNextLevelSprite.text = "sardines eaten: " + this.sardines.numEaten;
            }
        });

      // Super Elliot
      this.elliotSprite.collides(this.crabs.name, (s) => {
        console.log("*** god mode on!");
        destroy(s);
        play("godMode");
        this.elliotSprite.godMode.enabled = true;
        this.crabs.numEaten++;
        this.elliotSprite.godMode.timerId = setInterval(() => {
            if (this.elliotSprite.godMode.seconds++ >= this.elliotSprite.godMode.maxSeconds) {
                clearInterval(this.elliotSprite.godMode.timerId);
                this.elliotSprite.godMode.seconds = this.elliotSprite.angle = 0;
                //this.elliotSprite.color = rgb(0, 0, 0);
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
        destroy(this.elliotSprite); // hiding sprite still trigger collisions so just destroy it now
        this.backgroundMusicDuringGamePlay.stop();

        // Stop spawning new creatures
        this.timers.forEach(t => clearInterval(t));
        this.timers.length = 0;

        let x = (width() / 2)-200, y = (height() / 2)-100;
        const titleFontSize = 24, textFontSize = 12;
        
        this.gameOverOverlaySprites.push(add([
              text("game over", titleFontSize),
              pos(x, y),
          ]));
  
        this.gameOverOverlaySprites.push(add([
          text("final score: " + this.score, textFontSize),
          pos(x, y+=30),
        ]));

        this.gameOverOverlaySprites.push(add([
            text("you reached level " + this.levelNum, textFontSize),
            pos(x, y+=18),
          ]));        
        
        this.gameOverOverlaySprites.push(add([
          text("press 'i' for instructions ", textFontSize),
          pos(x, y+=60),
        ]));
        
        this.gameOverOverlaySprites.push(add([
          text("press 'r' to play again ", textFontSize),
          pos(x, y+=15),
        ]));
      }
  
      resetGame() {
        if (this.elliotSprite) {
            // this was already done in gameOver() if the game ended via player deaths.
            // But not if resetting the game coming from the instructions page or level 1
            destroy(this.elliotSprite);   
        }
        this.elliotSprite = null;
        this.allFishSprites.forEach(e => destroy(e));
        this.allFishSprites.length = 0;
        // this was already done in gameOver() if the game ended via player deaths.
        // But not if resetting the game coming from the instructions page or level 1
        this.timers.forEach(t => clearInterval(t));
        this.timers.length = 0;
        this.gameOverOverlaySprites.forEach(e => destroy(e));
        this.gameOverOverlaySprites.length = 0;
    }

    resetScoreAndLives() {
        console.log("resetting score and lives");
        this.levelNum = 1; // first level is 1 not 0
        this.score = 0;
        this.lives = 3;
        this.sardines.numEaten = 0;
        this.bonusSardinesEaten = 0;
    }
  
    isGameOver() {
        return this.lives <= 0;
    }
    
    increaseScore(points) {
        play("scorePoint");
        this.score += points;
        if (this.bonusLevelStatus != BONUS_LEVEL_IN_PROGRESS) {
            this.scoreSprite.text = "score: " + this.score;
        }
    }

    showLevelPage() {
        if (this.levelNum == 1) { // first level is 1 not 0  
            // Create all scenes for future use
            kaboom.scene(MAIN_SCENE_NAME, (args) => {
                randSeed(Date.now()); 
                args.game.startNewGame();
                console.log("starting new level");
              });

            this.kaboom.scene(LEVEL_SCENE_NAME, async (args) => {
                const {game, levelNum, sardinesNeededForNextLevel} = args, kaboom = game.kaboom;
                let x = (width() / 2)-100, textX = x+80, y = (height() / 2)-50;
                const FONT_SIZE = 8, VERTICAL_SPACING = 11, DOUBLE_VERTICAL_SPACING = VERTICAL_SPACING*2;
                add([text("Level " + levelNum, FONT_SIZE*2), pos(x, y)]);
                // add([text("* press 'space' to pause game", FONT_SIZE), pos(x, y+=DOUBLE_VERTICAL_SPACING)]);            
                // add([text("* press 'm' to toggle music on/off", FONT_SIZE), pos(x, y+=VERTICAL_SPACING)]);
                
                // Is next round a bonus level or not?
                const nextLevelIsBonus = (this.levelNum+1) % this.bonusLevelEvery == 0;
                let txt, color;
                if (nextLevelIsBonus) {
                    txt = "BONUS ROUND!";
                    color = rgb(1, 1, 0); // yellow
                }
                else {
                    txt = "next level";
                    color = rgb(1, 1, 1);
                }
                add([text("Eat " + sardinesNeededForNextLevel + " sardines for " + txt, FONT_SIZE), pos(x, y+=(VERTICAL_SPACING*2)),
                    color]);
                await wait(1);
                let count = 3;
                const GET_READY = "GET READY ... ";
                const countText = add([text(GET_READY + (count +""), FONT_SIZE*2), pos(x, y+= DOUBLE_VERTICAL_SPACING)]);
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
                let x = (width() / 2)-100, textX = x+80, y = (height() / 2)-50;
                const FONT_SIZE = 8, VERTICAL_SPACING = 11, DOUBLE_VERTICAL_SPACING = VERTICAL_SPACING*2;
                add([text("BONUS LEVEL", FONT_SIZE*2), pos(x, y), rgb(1, 1, 0)]);
                await wait(1);
                add([text((BONUS_LEVEL_DURATION/1000) + " seconds to eat as many sardines as you can!", FONT_SIZE), pos(x, y+=(VERTICAL_SPACING*2))]);
                await wait(1);
                let count = 3;
                const GET_READY = "GET READY ... ";
                const countText = add([text(GET_READY + (count +""), FONT_SIZE*2), pos(x, y+= DOUBLE_VERTICAL_SPACING)]);
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
                let x = (width() / 2)-100, textX = x+80, y = (height() / 2)-50;
                const FONT_SIZE = 8, VERTICAL_SPACING = 11, DOUBLE_VERTICAL_SPACING = VERTICAL_SPACING*2;
                add([text("BONUS LEVEL OVER!", FONT_SIZE*2), pos(x, y)]);
                
                add([text("Results", FONT_SIZE), pos(x, y+=(VERTICAL_SPACING*2))]);
                await wait(1);
                add([text("Sardines eaten:", FONT_SIZE), pos(x, y+=(VERTICAL_SPACING*2))]);
                await wait(1);
                const bonusSardinesEaten = args.game.bonusSardinesEaten;
                add([text(bonusSardinesEaten, FONT_SIZE), pos(x, y+=(VERTICAL_SPACING*2)), rgb(1, 1, 0)]); // yellow text
                await wait(1);
                add([text("Total bonus:", FONT_SIZE), pos(x, y+=(VERTICAL_SPACING*2))]);
                add([text( (bonusSardinesEaten * args.game.sardines.points), FONT_SIZE), pos(x, y+=(VERTICAL_SPACING*2)), rgb(1, 1, 0)]); // yellow text
                await wait(1);
                this.bonusSardinesEaten = 0;
                this.bonusLevelStatus = BONUS_LEVEL_NOT_IN_PROGRESS;  
                kaboom.go(MAIN_SCENE_NAME, args);  
            });

        }
        this.resetGame();
        if (this.bonusLevelStatus == BONUS_LEVEL_ENDED) {
            go(BONUS_RESULTS_SCENE_NAME, {game: this});
        }        
        if (this.levelNum % this.bonusLevelEvery == 0) {
            // Bonus title level
            go(BONUS_TITLE_SCENE_NAME, {game: this});
        }
        else {
            //go(BONUS_TITLE_SCENE_NAME, {game: this});
            go(LEVEL_SCENE_NAME, {game: this, levelNum: this.levelNum, sardinesNeededForNextLevel: this.sardinesNeededForNextLevel});
        }
    }
}