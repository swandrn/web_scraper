<?php
$url = $_POST['url'] ?? null;
if(isset($url)){
    $page = file_get_contents($url);
    echo $page;
}
?>