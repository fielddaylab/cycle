var ENUM;

ENUM = 0;
var MULTIPLAYER_LOCAL = ENUM; ENUM++;
var MULTIPLAYER_AI    = ENUM; ENUM++;
var MULTIPLAYER_TUT   = ENUM; ENUM++;
var MULTIPLAYER_NET_CREATE = ENUM; ENUM++;
var MULTIPLAYER_NET_JOIN   = ENUM; ENUM++;

var cli;

var Game = function(init)
{
  var default_init =
  {
    width:640,
    height:320,
    container:"stage_container"
  }

  var self = this;
  doMapInitDefaults(init,init,default_init);

  var stage = new Stage({width:init.width,height:init.height,container:init.container});
  var scenes = [
    new NullScene(self, stage),
    new LoadingScene(self, stage),
    new ComicScene(self, stage),
    //new TestScene(self, stage),
    new ConfigScene(self,stage),
    new GamePlayScene(self, stage),
  ];
  var cur_scene = 0;
  var old_cur_scene = -1;

  self.multiplayer;
  self.turns;
  self.join;
  self.me;
  self.opponent;

  self.begin = function()
  {
    cli = new client(function(){cli.updated = true;},function(){console.log('something went wrong! :(');});
    cli.updated = false;
    cli.last_known = 0;

    self.nextScene();
    tick();
  };

  var tick = function()
  {
    requestAnimFrame(tick,stage.dispCanv.canvas);
    scenes[cur_scene].tick();
    if(old_cur_scene == cur_scene) //still in same scene- draw
    {
      stage.clear();
      scenes[cur_scene].draw();
      stage.draw(); //blits from offscreen canvas to on screen one
    }
    old_cur_scene = cur_scene;
  };

  self.nextScene = function()
  {
    self.setScene(cur_scene+1);
  };

  self.setScene = function(i)
  {
    if (i == 4) scenes[4].numGamesPlayed++;
    scenes[cur_scene].cleanup();
    cur_scene = i;
    scenes[cur_scene].ready();
  }

  self.log_level_begin = function(log_data) {
    log_data.event_data_complex = JSON.stringify(log_data.event_data_complex);
    scenes[4].mySlog.log(log_data);
  }

};

