var transformToScreen = function(canv,o)
{
  o.w = canv.width*o.ww;
  o.h = canv.height*o.wh;
  o.x = o.wx*canv.width-o.w/2;
  o.y = o.wy*canv.height-o.h/2;
}
var transformEventToScreen = function(canv,e)
{
  e.start_x = e.start_wx*canv.width;
  e.start_y = e.start_wy*canv.height;
  e.end_x = e.end_wx*canv.width;
  e.end_y = e.end_wy*canv.height;
  e.mid_x = (e.start_x+e.end_x)/2;
  e.mid_y = (e.start_y+e.end_y)/2;
}
var tokenWorldTargetEvent = function(t,e,progress)
{
  t.target_wx = lerp(e.start_wx,e.end_wx,(progress+1)/((e.time+1)+1)) - 0.01+Math.random()*0.02;
  t.target_wy = lerp(e.start_wy,e.end_wy,(progress+1)/((e.time+1)+1)) - 0.01+Math.random()*0.02;
}
var tokenWorldTargetNode = function(t,n)
{
  t.target_wx = n.wx-(n.ww/2)+Math.random()*n.ww;
  t.target_wy = n.wy-(n.wh/2)+Math.random()*n.wh;
}

var transformGame = function(canv,nodes,events,tokens)
{
  for(var i = 0; i < nodes.length; i++)
    transformToScreen(canv,nodes[i]);
  for(var i = 0; i < events.length; i++)
    transformEventToScreen(canv,events[i]);
  for(var i = 0; i < tokens.length; i++)
    transformToScreen(canv,tokens[i]);
}

