# Sleep Script

You need to enter your `PLEX_AUTH_TOKEN`.
You can get it here: https://support.plex.tv/articles/204059436-finding-an-authentication-token-x-plex-token/

Also you do want to edit your `/etc/sudoers` file and allow `/usr/sbin/pm-suspend` to be called without any password.
```
my_user ALL=NOPASSWD:/usr/sbin/pm-suspend
```
