<template>
    <div class="chatrooms">
        <div class="inner-header">
            <h4>All our rooms</h4>
        </div>
        <div class="list-wrapper">

            <p v-for="room in rooms">
                <a v-bind:href="'/#/chatrooms/'+room.slug">{{room.name}}</a>
            </p>

            <div class="adding-wrapper">
                <form v-on:submit.prevent="add_room" class="">
                    <input type="text"
                           class="form-control"
                           id="new_room"
                           placeholder="What's the room name?"
                           v-model="room_name">
                    <button type="submit" class="btn btn-primary">Add a room</button>
                </form>
            </div>
        </div>

    </div>
</template>


<script>
    export default {
        data: () => {
            return {
                rooms: [],
                room_name: "",
                username: localStorage.getItem('username')
            }
        },
        beforeCreate() {
            this.$socket.emit('rooms_get');
        },
        sockets: {
            room_get_ret(room) {
                this.rooms.push(room);
            }
        },
        methods: {
            add_room() {
                if (this.room_name !== "") {
                    this.$socket.emit('create_room', this.room_name);
                    this.room_name = "";
                }
            },
        }
    }
</script>

