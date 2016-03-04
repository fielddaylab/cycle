<?php
  $filename = "data.txt";
  $event = preg_replace('/[^A-Za-z0-9\-.,\'": ]/', '', $_GET["event"]);
  if(!preg_match('/^\d+ (CREATE|JOIN|MOVE)( \d+)?$/',$event)) { echo "FAIL"; return; } //sanitization

  $fp = fopen($filename, "r+");
  if(flock($fp, LOCK_EX))
  {
    $content = fread($fp,1000000);
    if($event)
    {
      $lines = explode("\n",$content);
      $last_line = $lines[count($lines)-2];
      $last_num = intval(substr($last_line,0,strpos($last_line," ")));
      if(!is_numeric($last_num)) $last_num = 0;
      $last_num++;
      $content = substr($content,strpos($content,"\n")+1).$last_num." ".$event."\n";
      ftruncate($fp, 0);
      rewind($fp);
      fwrite($fp, $content);
      fflush($fp);
    }
    flock($fp, LOCK_UN);
    echo $content;
  }
  else echo "FAIL";

  fclose($fp);
?>

