const color = require('colors');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const requestIp = require('request-ip');
const redis = require('redis');
const client = redis.createClient();

function consoleLog(event, method, message = undefined) {
    console.log(event.red + '.' + method.yellow + (message !== undefined ? ' => ' + message : ''));
}


io.on('connection', function (socket) {

    socket.on('set_login', (username) => {
        socket.currentUser = {'username': username, 'ip': requestIp.getClientIp(socket.request)};
    });

    socket.on('check_auth', () => {
        if (socket.currentUser === undefined) {
            socket.emit('check_auth_ret', false)
        }
    });


    socket.on('action_login', (username) => {
        let created = true;
        client.hgetall('user:' + username, (err, res) => {
            if (res != null) {
                created = false;
            } else {
                client.hmset('user:' + username, [
                    'username', username, 'ip',
                    requestIp.getClientIp(socket.request),
                    'online', true
                ]);
            }
            socket.currentUser = {'username': username, 'ip': requestIp.getClientIp(socket.request)};
            socket.emit('action_loginSuccess', created);
        });
    });


    socket.on('room_send_new_message', (data) => {
        let message = {
            send_name: socket.currentUser.username,
            send_at: Date.now(),
            content: data.message
        };
        client.lpush('messages:' + data.slug, JSON.stringify(message));
        io.in(data.slug).emit('room_send_new_message_ret', message);
    });


    socket.on('room_send_user_is_typing', (slug) => {
        socket.to(slug).emit('user_typing_in_room', socket.currentUser.username);
    });

    socket.on('room_send_user_stopped_typing', (slug) => {
        socket.to(slug).emit('user_stopped_typing_in_room', socket.currentUser.username);
    });


    socket.on('rooms_get', () => {
        client.smembers('rooms', (err, res) => {
            for (room of res) {
                client.get('rooms:' + room, (err, room_json) => {
                    socket.emit('room_get_ret', JSON.parse(room_json));
                });
            }
        });
    });

    socket.on('create_room', (room_name) => {
        let slug = string_to_slug(room_name);
        let room = {
            name: room_name,
            slug: slug,
            owner: socket.currentUser.username
        };
        client.sadd('rooms', slug, (err, res) => {
            if (res) {
                client.append('rooms:' + slug, JSON.stringify(room), () => {
                    socket.emit('room_get_ret', room);
                });
            }
        });
    });

    //JOINING AND LEAVING GROUP

    socket.on('join_room', (slug) => {
        socket.join(slug, (err) => {
            client.sadd('connected:' + slug, socket.currentUser.username);
            client.lrange('messages:' + slug, 0, 20, (err, res) => {
                let messages = [];
                for (message of res) {
                    messages.push(JSON.parse(message))
                }
                messages.reverse();
                socket.emit('room_get_messages_ret', messages);
            });

            client.smembers('connected:' + slug, (err, res) => {
                let users = [];
                for (user of res) {
                    users.push({username: user, typing: false})
                }
                io.to(slug).emit('room_send_user_list', users);
            });
        });
    });

    socket.on('leave_room', (slug) => {
        client.srem('connected:' + slug, socket.currentUser.username, (err, res) => {
        });
        client.smembers('connected:' + slug, (err, res) => {
            let users = [];
            for (user of res) {
                users.push({username: user, typing: false})
            }
            socket.to(slug).emit('room_send_user_list', users);
        });
        socket.leave(slug, () => {
        });

    })

    //END JOINING AND LEAVING GROUP

});


io.on('chat message', function (soc) {

});

http.listen(3000, function () {
    console.log('listening on *:3000');
});


function string_to_slug(str) {
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();

    // remove accents, swap ñ for n, etc
    var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
    var to = "aaaaeeeeiiiioooouuuunc------";
    for (var i = 0, l = from.length; i < l; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    str = str.replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

    return str;
}