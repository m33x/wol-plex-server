#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""Puts the server to sleep in case there is no Plex / Time Machine backup activity. (Hint: Run inside a screen session)."""

__author__ = "Maximilian Golla"
__license__ = "MIT"
__version__ = "0.0.1"
__status__ = "Prototype"

import time
import datetime
import sys
import subprocess
import collections
import requests

PLEX_AUTH_TOKEN = 'your-plex-auth-token'
RECHECK_INTERVAL = 60  # seconds

def is_someone_accessing_files_check():
    """Returns the number of currently open files at /mnt."""
    try:
        print("New file access check...having a look at '/mnt'")
        response = subprocess.getoutput("lsof -w /mnt/* | grep /mnt/ | wc -l")
        if response == '0':
            return False
        return True
    except Exception:
        return True

def is_someone_streaming_check():
    """Queries the Plex API and obtains the total number and playback state(s) of current sessions."""
    try:
        print("New streaming check...having a look at Plex sessions")
        my_headers = {}
        my_headers['X-Plex-Token'] = PLEX_AUTH_TOKEN
        my_headers['accept'] = 'application/json'
        url = 'http://127.0.0.1:32400/status/sessions'
        response = requests.get(url, headers=my_headers)
        data = response.json()
        size = None
        if 'MediaContainer' in data:
            if 'size' in data['MediaContainer']:
                size = data['MediaContainer']['size']
        print(f"Currently there are {size} users online ...")
        users = []
        if 'MediaContainer' in data:
            if 'Metadata' in data['MediaContainer']:
                for session in data['MediaContainer']['Metadata']:
                    user = {'User': None, 'State': None, 'Platform': None, 'IP': None, 'Started': None}
                    if 'User' in session:
                        if 'title' in session['User']:
                            user['User'] = session['User']['title']
                    if 'Player' in session:
                        if 'state' in session['Player']:
                            user['State'] = session['Player']['state']
                        if 'platform' in session['Player']:
                            user['Platform'] = session['Player']['platform']
                        if 'remotePublicAddress' in session['Player']:
                            user['IP'] = session['Player']['remotePublicAddress']
                    if 'TranscodeSession' in session:
                        if 'timeStamp' in session['TranscodeSession']:
                            user['Started'] = int(session['TranscodeSession']['timeStamp'])
                            user['Started'] = datetime.datetime.fromtimestamp(user['Started']).strftime('%Y-%m-%d %H:%M:%S')
                    users.append(user)
        streaming = False
        for user in users:
            print(user)
            if user['State'] != 'paused':
                streaming = True
        return streaming
    except Exception:
        return True

def is_there_activity():
    """Checks whether there is any Plex or file activity."""
    file_access = is_someone_accessing_files_check()
    print(f"File access: {file_access}")
    streaming = is_someone_streaming_check()
    print(f"Streaming: {streaming}")
    if file_access:
        return 1
    if streaming:
        return 1
    return 0

def main():
    """Initializes a ring buffer and periodically checks whether there is any activity. If not, for 15 checks/minutes it puts the system to sleep."""
    print("Initializing the data structures...")
    output_file = open('sleep_monitor_log.txt', 'a', encoding='utf-8')
    # History file, keeps track of last activity
    ring_buffer = collections.deque(maxlen=15)
    for _ in range(1, 16):
        ring_buffer.append(1)

    try:
        while True:
            print("###### " + datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

            # Check if there is any activity (files or streaming)
            ring_buffer.append(is_there_activity())
            # Analyze history
            activities = ring_buffer.count(1)
            print(f"Currently there are {activities} activities in the past 15 minutes...")
            # If there was no activities for 15 checks, then go to sleep
            if activities == 0:
                # Go to sleep
                print("Going to sleep now!")
                output_file.write(datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")+' - Sleeping now!\n')
                output_file.flush()
                subprocess.getoutput("sudo /usr/sbin/pm-suspend")
                output_file.write(datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")+' - Waking up again!\n')
                output_file.flush()
                # Reset history file
                for _ in range(1, 16):
                    ring_buffer.append(1)
            else:
                print(f"Will check again in {RECHECK_INTERVAL} seconds...")
            time.sleep(RECHECK_INTERVAL)

    except KeyboardInterrupt:
        output_file.close()
        print("\nOh! You pressed CTRL + C.")
        print("Program interrupted.")
        sys.exit(0)

if __name__ == '__main__':
    main()
