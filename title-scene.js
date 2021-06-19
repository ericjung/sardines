class TitleScene {

  constructor(kaboom, game) {
    
    // TODO: use the kaboom object instead of using the "global" kaboom object
    scene("instructions", () => {
      let x = (width() / 2)-150, textX = x+80;
      let y = 10;
      const FONT_SIZE = 8, SMALL_FONT_SIZE = 6, VERTICAL_SPACING = 11;
      add([text("Sardines!", FONT_SIZE*2), pos(x, y)]);
      add([text("Score points by eating sardines and other seafood", FONT_SIZE), pos(x, y+=(VERTICAL_SPACING*2))]);
      add([text("(but mostly sardines)", FONT_SIZE), pos(x, y+=VERTICAL_SPACING)]);

      add([text("* press 'space' to play", FONT_SIZE), pos(x, y+=(VERTICAL_SPACING*2))]);
      add([text("* press 'm' to toggle music on/off", FONT_SIZE), pos(x, y+=VERTICAL_SPACING)]);
    
      add([sprite("elliot"), pos(x, y+=30), scale(ELLIOT_SCALE)])
      add([text("You", FONT_SIZE), pos(textX, y+=(VERTICAL_SPACING*2))]); 
      
      add([sprite("arrows"), pos(x+150, y-15), scale(0.07, 0.07)]);
      add([text("move", FONT_SIZE), pos(textX+125, y)]);
      
      add([sprite("sardine"), pos(x-10, y+=40), scale(game.sardines.scale)])
      add([text("100 points", FONT_SIZE), pos(textX, y)]);
      add([sprite("crab", FONT_SIZE), pos(x, y+=15), scale(game.crabs.scale)])
      add([text("god mode: eat everything for points!", FONT_SIZE), pos(textX, y+=10)]);    

      add([sprite("shark"), pos(x+40, y+=25), scale(game.sharks.scale)])
      add([sprite("kracken"), pos(x+50, y-10), scale(game.krackens.scale)])    
      add([text("death!", FONT_SIZE), pos(textX, y+=5)]); 
      add([text("50 points in god mode for kracken", SMALL_FONT_SIZE), pos(textX, y+15)]);
      add([text("10 points for shark in god mode", SMALL_FONT_SIZE), pos(textX, y+25)]);

      add([sprite("seaHorse"), pos(x+15, y+=40), scale(game.seaHorses.scale)])
      add([text("friend", FONT_SIZE), pos(textX, y+=10)]);
      add([text("20 points in god mode", SMALL_FONT_SIZE), pos(textX, y+10)]);

      add([sprite("scubaDiverType1"), pos(x, y+=25), scale(game.scubaDiversType1.scale)])
      add([text("friend", FONT_SIZE), pos(textX, y+=10)]);
      add([text("20 points in god mode", SMALL_FONT_SIZE), pos(textX, y+10)]);

      add([sprite("scubaDiverType2"), pos(x-10, y+=25), scale(game.scubaDiversType2.scale)])
      add([text("friend", FONT_SIZE), pos(textX, y)]);
      add([text("20 points in god mode", SMALL_FONT_SIZE), pos(textX, y+10)]);

      add([sprite("pinkFish"), pos(x, y+=30), scale(game.pinkFishes.scale)])
      add([text("friend", FONT_SIZE), pos(textX, y)]);
      add([text("1 point in god mode", SMALL_FONT_SIZE), pos(textX, y+10)]);

      add([sprite("goldFish"), pos(x, y+=25), scale(game.goldFishes.scale)])
      add([text("friend", FONT_SIZE), pos(textX, y+=5)]);
      add([text("1 point in god mode", SMALL_FONT_SIZE), pos(textX, y+10)]);
        
      keyPress("space", () => {
        game.resetScoreAndLives();           
        game.showLevelPage();
      });
      
      play("spokenSardinesHighPitched"); // Speak the name of the game!
  });
  
  start("instructions");    
  }
}
