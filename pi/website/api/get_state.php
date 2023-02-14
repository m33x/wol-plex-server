<?php
    //header('Access-Control-Allow-Origin: *'); //Development header
    header('Content-Type: application/json; charset=utf-8');

    $info = json_decode(getStateFromHASS(), true);
    $state = $info['state'];
    $last_changed = parseDate($info['last_changed']);
    $output = json_encode(array('state' => $state, 'last_changed' => $last_changed));
    echo $output; // {"state":"off","last_changed":"2022-10-14 10:17:07"}

    function getStateFromHASS() {
        // Init
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://example.org/api/states/switch.wake_on_lan'); // Home Assistant's REST API
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Authorization: abc-secret-123...'));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        // Query
        $result = curl_exec($ch);
        curl_close($ch);
        return $result;  // {..., "state": "on", "last_changed": "2022-10-14T09:17:07.277838+00:00", ...}
    }

    function parseDate($dateStr) {
        $dateStr = date_parse($dateStr);
        $year = $dateStr['year'];
        $month = str_pad($dateStr['month'], 2, '0', STR_PAD_LEFT);
        $day = str_pad($dateStr['day'], 2, '0', STR_PAD_LEFT);
        $hour = str_pad($dateStr['hour'], 2, '0', STR_PAD_LEFT);
        $minute = str_pad($dateStr['minute'], 2, '0', STR_PAD_LEFT);
        $second = str_pad($dateStr['second'], 2, '0', STR_PAD_LEFT);
        date_default_timezone_set('Europe/Berlin');
        $ts = gmmktime($hour, $minute, $second, $month, $day, $year);
        return date("Y-m-d H:i:s", $ts);
    }

?>
