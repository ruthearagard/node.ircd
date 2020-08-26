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
            const rl = readline.createInterface(socket);

            rl.on('line', (line) =>
            {
                logger.debug(line);
            });

            logger.debug(`Client connected (ip=${socket.remoteAddress})`);
            this.emit('client_connected', socket);
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