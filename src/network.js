// Copyright 2020 Michael Rodriguez
//
// Permission to use, copy, modify, and/or distribute this software for any
// purpose with or without fee is hereby granted, provided that the above
// copyright notice and this permission notice appear in all copies.
//
// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
// WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
// SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
// WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
// OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
// CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

"use strict";

// Node.js modules
const net = require('net');
const events = require('events');
const readline = require('readline');

// Local modules
const logger = require('./logger');

class NetworkHandler extends events.EventEmitter
{
    #instance;

    constructor()
    {
        super();

        this.#instance = net.createServer((socket) =>
        {
            // We of course, only want to ever read lines from the client.
            const rl = readline.createInterface(socket);

            rl.on('line', (line) =>
            {
                // Ensure that we're only working with true plain text
                // (no whitespace, no terminator characters etc.)
                line = line.trim();

                // An incoming IRC client message is essentially defined as
                // this:
                //
                // COMMAND param1 param2 :everything here is param3

                // First, check to see if the delimiter (:) is present.
                const delimiter_index = line.indexOf(":");

                let cmd = "";
                let args = [];

                // Delimiter not present.
                if (delimiter_index === -1)
                {
                    let irc_string = line.split(' ');

                    // We want to remove the command from the array, know what
                    // it is, and preserve everything else.
                    cmd  = irc_string.shift();
                    args = irc_string;
                }
                else
                {
                    // Delimiter present.

                    // We want everything AFTER where the delimiter is.
                    const str    = line.slice(delimiter_index + 1);
                    const params = line.slice(0, delimiter_index - 1);

                    let irc_string = params.split(' ');
                    irc_string.push(str);

                    // We want to remove the command from the array, know what
                    // it is, and preserve everything else.
                    cmd  = irc_string.shift();
                    args = irc_string;
                }

                this.emit('command_received',
                {
                    socket: socket,
                    command: cmd.toUpperCase(),
                    params: args
                });
            });

            logger.debug(`Client connected (ip=${socket.remoteAddress})`);
            this.emit('client_connected', socket);

            socket.on('close', () =>
            {
                this.emit('client_disconnected', socket);
            });
        });
    }

    // Adds a listener on `ip` `port`.
    add_listener(ip, port)
    {
        this.#instance.listen(port, ip, 511, () =>
        {
            logger.info(`Listening for new connections on ${ip}:${port}`);
        });
    }
}

module.exports = function()
{
    return new NetworkHandler();
}