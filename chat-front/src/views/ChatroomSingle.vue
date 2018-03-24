<template>
    <div class="chat-single">
        <div class="chat-wrapper">
            <div class="users-list">
                <div class="inner-header">
                    <h4>In this room</h4>
                </div>
                <div class="users-list-wrapper">
                    <div v-for="user in users_in_room" class="single-user">
                        <p>{{user.username}}</p>
                        <span v-if="user.typing" class="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </span>
                    </div>
                </div>
            </div>
            <div class="messages">
                <div class="inner-header">
                    <h4>Bienvenue sur {{slug}}</h4>
                </div>

                <div class="messages_wrapper" id="messages_wrapper">
                    <div class="single-message" v-for="message in messages">
                        <div v-bind:class="message.send_name === username ? 'left' : 'right'">
                            <p class="username_date">
                                {{message.send_name === username ? 'Me' : message.send_name}}
                                <span class="time">
                                    {{new Date(message.send_at).toLocaleString([], {day: 'numeric', month:'numeric', year : '2-digit'})}}  at {{new Date(message.send_at).toLocaleString([], {hour: '2-digit', minute:'2-digit'})}}
                                </span>
                            </p>
                            <p class="content">
                                {{message.content}}
                            </p>
                        </div>
                    </div>
                </div>
                <form v-on:submit.prevent="sendMessage" class="">
                    <div class="form-group send-message">
                        <input type="text"
                               class="form-control"
                               id="username"
                               placeholder="Type your message"
                               @blur="stoppedTyping" v-model="message">
                        <button type="submit" class="btn btn-primary">Send</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        data: () => {
            return {
                slug: "",
                name: "",
                message: "",
                messages: [],
                username: localStorage.getItem('username'),
                users_in_room: [],
            }
        },
        watch: {
            message: function () {
                if (this.message.length > 0) {
                    this.$socket.emit('room_send_user_is_typing', this.slug);
                } else {
                    this.$socket.emit('room_send_user_stopped_typing', this.slug);
                }
            },
            messages : function () {
                if(this.messages.length > 0){
                }
            }
        },
        created() {
            this.slug = this.$route.params.slug;
            this.$socket.emit('join_room', this.slug);
            window.addEventListener('beforeunload', this.on_destroy);
        },
        sockets: {
            room_get_messages_ret(data) {
                this.messages = data;
                this.$nextTick(() => {
                    this.scrollToEnd();
                })
            },
            room_send_new_message_ret(message) {
                this.messages.push(message);
                this.$nextTick(() => {
                    this.scrollToEnd();
                })
            },
            room_send_user_list(users) {
                this.users_in_room = users;
            },
            user_typing_in_room(user_typing) {
                this.users_in_room.forEach((user, index) => {
                    if (user.username === user_typing) this.users_in_room[index].typing = true;
                });
            },
            user_stopped_typing_in_room(user_typing) {
                this.users_in_room.forEach((user, index) => {
                    if (user.username === user_typing) this.users_in_room[index].typing = false
                });
            }
        },
        methods: {
            sendMessage() {
                if (this.message !== "") {
                    let new_message = {
                        message: this.message,
                        slug: this.slug
                    };
                    this.$socket.emit('room_send_new_message', new_message);
                    this.message = "";
                }
            },
            stoppedTyping() {
                this.$socket.emit('room_send_user_stopped_typing', this.slug);
            },
            scrollToEnd: function() {
                let container = this.$el.querySelector("#messages_wrapper");
                container.scrollTop = container.scrollHeight;
            },
            on_destroy(){
                this.$socket.emit('leave_room', this.slug);
            }
        },
        destroyed() {
            this.$socket.emit('leave_room', this.slug);
        }
    }
</script>