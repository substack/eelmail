# eelmail

email server providing [imap](http://www.faqs.org/rfcs/rfc3501.html)
and [smtp](http://www.faqs.org/rfcs/rfc821.html)

# quick start

Let's set up an email server that sounds like a fun thing to do why not.

## start a server as root

We can start a server as root so that it can listen on low ports (25 and 143)
used by smtp and imap:

```
$ sudo eelmail server -d ./maildb
```

This isn't so great for security, so you probably want to drop privileges
inside the server with --uid and --gid:

```
$ sudo eelmail server -d ./maildb --uid=$UID --gid=$GROUPS
```

## add accounts

Once the server is running, create a user account:

```
$ exports EELMAIL_DATADIR=$PWD/maildata
$ eelmail users create substack \
  --login.basic.username=substack --login.basic.password=beepboop
```

You can also pass in the datadir with `-d`.

If it worked, `eelmail users list` should now show your username:

```
$ eelmail users list
substack
```

Repeat for additional user accounts you wish to configure.

## sanity check

Now that the server is running and accounts are configured, let's send a test
email. Here I'm using `substack.net` but you should replace that with your own domain.

Make sure you have netcat installed then do:

```
$ nc substack.net 25 <<END
> helo localhost
> mail from: alice@arpa.mil
> rcpt to: substack@substack.net
> data
> subject: yo
> 
> beep boop
> .
> quit
> END
220 beep
250 localhost
250
250
354
250
221 Bye!
```

Now make sure you have an email server (like postfix on linux) running locally and do:

```
$ fetchmail -p imap -u substack substack.net
Enter password for substack@substack.net: 
1 message for substack at substack.net.
reading message substack@substack.net:1 of 1 (17 header octets) (9 body octets) flushed
```

Enter the password that you configured and if it worked, you should now have
mail in your local inbox.

Type `mail` to read your email:

```
$ mail
"/var/mail/substack": 1 message 1 new
>N   1 substack@substack.net Fri Sep 26 09:51  18/728   yo
? n
Return-Path: <substack@substack.net>
X-Original-To: substack@substack.net
Delivered-To: substack@substack.net
Received: from beep (beep [IPv6:::1])
    by beep (Postfix) with ESMTP id 5C06D740061
    for <substack@substack.net>; Fri, 26 Sep 2014 09:51:41 -0700 (PDT)
Received: from localhost.localdomain [::1]
    by beep with IMAP (fetchmail-6.3.21)
    for <substack@substack.net> (single-drop); Fri, 26 Sep 2014 19:51:41 +0300 (IDT)
Received: from localhost.localdomain [::1]
    by beep with IMAP (fetchmail-6.3.21)
    for <substack@substack.net> (single-drop); Fri, 26 Sep 2014 19:47:56 +0300 (IDT)
subject: yo
Message-Id: <20140926165141.5C06D740061@beep>
Date: Fri, 26 Sep 2014 09:51:41 -0700 (PDT)
From: alice@arpa.mil

beep boop
? 
```

## api example

You can also create your own server from the api:

``` js
var eelmail = require('eelmail');
var level = require('level-party');

var db = level('./data/db');
var em = eelmail(db, { dir: './data' });

em.createServer('smtp').listen(25);
em.createServer('imap').listen(143);
```

Here we use `level-party` so that the user accounts can be modified while the
server is running with the `eelmail users` command. Just make sure that `-d`
matches the data dir.

# usage

```
Usage: eelmail COMMAND...

  eelmail {OPTIONS} users ...

    Manage eelmail user accounts.
    Run `eelmail users -h` for the list of commands.

  eelmail server {OPTIONS}

    Start an imap and smtp server.

    --ports.smtp  port to use for smtp (default: 25)
    --ports.imap  port to use for imap (default: 143)

    To use ssl for imap, specify one of:

    --imap.cert / --imap.key  paths of tls cert and key files
    --imap.pfx                path of pfx file

  eelmail help

    Show this message.

Global options:

  -d, --dir  directory to use to store data
             default: $EELMAIL_DATADIR or ./eelmail.db

```

# methods

``` js
var eelmail = require('eelmail')
```

## var em = eelmail(db, opts)

Create an eelmail instance `em` from a `db` and `opts`.

## var server = em.createServer(type, opts)

Create a server for `type`:

* `'imap'` - service to fetch saved emails
* `'imaps'` - imap over ssl
* `'smtp'` - service to receive emails

For `'imaps'`, you'll need to supply `opts.key/opts.cert` or `opts.pfx`.

## em.close()

Close the database.

# install

With [npm](https://npmjs.org), to get the `eelmail` command, do:

```
npm install -g eelmail
```

and to get the library, do:

```
npm install eelmail
```

# license

MIT
