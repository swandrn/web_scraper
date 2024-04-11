<?php
//$url = 'https://www.scrapethissite.com/pages/simple/';
$url = 'https://www.youtube.com/';
$page = file_get_contents($url);
echo $page;
?>