<?php
    //header('Access-Control-Allow-Origin: *'); //Development header
    header('Content-Type: application/json; charset=utf-8');

    if (!empty($_GET['act'])) {
        // This is evil, we do not allow any user input here!
        // https://github.com/jpoliv/wakeonlan/blob/master/wakeonlan
        shell_exec('./wakeonlan DE:AD:BE:EF:12:34');
        $output = json_encode(array('info' => 'Wake up signal was sent.'));
    } else {
        $output = json_encode(array('info' => 'No wake up signal sent.'));
    }

    echo $output; //{"info":"Wake up signal was sent."}

?>