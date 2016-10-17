<?php

$config = array(
  'pass' => 'qwerty',
  'dest' => 'audio'
);


function is_post_set($names) {
  foreach ($names as $name) {
    if (!isset($_POST[$name])) {
      return false;
    }
  }
  return true;
}

function try_to_save($src,$filename) {
  $data = file_get_contents($src);
  if ($data === false) {
    return false;
  } else {
    file_put_contents($filename,$data);
    
    /* 
    issue on windows: http://stackoverflow.com/questions/9659600/glob-cant-find-file-names-with-multibyte-characters-on-windows
    http://stackoverflow.com/questions/23058449/save-filename-with-unicode-chars
    */
    
    // works with cyrilic, doesn't work with japanese
    //file_put_contents(iconv("UTF-8", "cp1251", $filename), $data);
  }
  return true;
}

$required = array('src','pass','name','index','total');

if (is_post_set($required)) {
  $src = $_POST['src'];
  $pass = $_POST['pass'];
  $name = $_POST['name'];
  $index = $_POST['index'];
  $total = $_POST['total'];
  
  //$src = str_replace("https://","http://",$src);
  
  if ($pass != $config['pass']) {
    echo 'wrong pass';
    return;
  }
  
  // @todo more escaping
  $name = preg_replace('|[<>:"\\\/?*\|]|u','',$name);
  
  $filePath = $config['dest'] . DIRECTORY_SEPARATOR . $name . '.mp3';
  
  if (try_to_save($src, $filePath)) {
    echo ' ' . ($index + 1) . '/' . $total . ' saved as "' . $filePath . '"';
  } else {
    echo ' ' . ($index + 1) . '/' . $total . ' error';
  }
  
} else {
  //echo 'not all fields';

}

?>