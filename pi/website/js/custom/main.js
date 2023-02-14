/*jslint browser: true */
/*global window, $, alert*/

/* Change example.org and your are done here */

/* Global Variables */
var intervalId; // Periodic checks of state

$(document).ready(function () {
    'use strict';
    // Check server state every 5 seconds
    get_status();
    start_checks();
    $("#btnWakeUp").click(function() {
        wake_up();
    });

    $("#btnWakeUp").hover(
      function() {
        $( this ).html('<i class="fa-solid fa-bell fa-shake"></i> Wake up server!');
      }, function() {
        $( this ).html('<i class="fa-solid fa-bell"></i> Wake up server!');
      }
    );

});

function start_checks() {
    intervalId = setInterval(function() {
        get_status();
    }, 100000);
}

function stop_checks() {
    clearInterval(intervalId);
}

function switch_btn_state() {
    'use strict';
    if ($("#btnWakeUp").prop("disabled") == true) {
        // Button was disabled
        $("#btnWakeUp").prop("disabled", false);
        $("#btnWakeUp").html('<i class="fa-solid fa-bell"></i> Wake up server!');
        $("#btnWakeUp").removeClass("btn-success");
        $("#btnWakeUp").removeClass("btn-warning");
        $("#btnWakeUp").addClass("btn-primary");
    } else {
        // Button was enabled
        $("#btnWakeUp").prop("disabled", true);
        $("#btnWakeUp").html('<i class="fas fa-bell fa-shake"></i> Server is waking up right now!');
        $("#btnWakeUp").removeClass("btn-primary");
        $("#btnWakeUp").removeClass("btn-warning");
        $("#btnWakeUp").addClass("btn-success");
        // Hide button after 5 seconds
        setTimeout( function() { $("#btnWakeUp").css('visibility', 'hidden'); }, 5000);
        // Stop the periodic checks to give the server some time to wake up
        stop_checks();
        // After 30 seconds of waiting start the periodic checks again
        setTimeout( function() { start_checks(); }, 35000);
    }
}

function wake_up() {
    'use strict';
    $.ajax({
        dataType: "json",
        type: "GET",
        data: "act=True",
        url: 'https://example.org/wol/api/wakeup.php', // our own API
        beforeSend: function ( jqXHR, settings) {
            $("#btnWakeUp").html('<i class="fa-solid fa-hourglass-half"></i> Sending request...');
        }
    })
    .done(function (result) {
        //log(result.info);
        if (result.info == 'Wake up signal was sent.') {
            switch_btn_state();
            $("#lblStateBody").css("background-color", "#e2cb4963");
            $("#lblState").html('Server is waking up, please wait 30&nbsp;seconds&nbsp;&nbsp;<i class="fa-solid fa-mug-hot fa-bounce" style="--fa-animation-duration: 1.0s;" ></i>');
        } else {
            $("#btnWakeUp").html('<i class="fa-solid fa-triangle-exclamation"></i> Try again?');
            $("#btnWakeUp").removeClass("btn-success");
            $("#btnWakeUp").removeClass("btn-primary");
            $("#btnWakeUp").addClass("btn-warning");
        }
        console.log(result);
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        console.log("API is not responding...");
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
    });
}

function get_status() {
    'use strict';
    $.ajax({
        dataType: "json",
        type: "GET",
        url: 'https://example.org/wol/api/get_state.php' // our own API
    })
    .done(function (result) {
        if (result.state == 'off') {
            $("#btnWakeUp").css('visibility', 'visible');
            $("#btnWakeUp").prop("disabled", false);
            $("#btnWakeUp").html('<i class="fa-solid fa-bell"></i> Wake up server!');
            $("#btnWakeUp").removeClass("btn-success");
            $("#btnWakeUp").removeClass("btn-warning");
            $("#btnWakeUp").addClass("btn-primary");
            $("#lblStateBody").css("background-color", "#4987e261");
            $("#lblState").html('Shhh! Server sleeps and saves energy&nbsp;&nbsp;<i class="fa-solid fa-moon fa-beat" style="--fa-animation-duration: 2.5s;" ></i>');
        } else {
            $("#btnWakeUp").css('visibility', 'hidden');
            $("#lblStateBody").css("background-color", "#60e24963");
            $("#lblState").html('Server is running&nbsp;&nbsp;<i class="fa-solid fa-gear fa-spin" style="--fa-animation-duration: 1.5s;" ></i>');
        }
        $("#lblLastChanged").html(result.last_changed);
        console.log(result);
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        $("#lblState").html('<i class="fa-solid fa-hourglass-half"></i> Unknown');
        $("#lblLastChanged").html('<i class="fa-solid fa-hourglass-half"></i> Unknown');
        console.log("API is not responding...");
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
    });
}