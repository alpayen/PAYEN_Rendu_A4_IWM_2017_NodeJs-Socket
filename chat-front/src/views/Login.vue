<template>
    <div class="login container">
        <form v-on:submit.prevent="userNameSub" class="login-form">
            <h3>Choose your username</h3>
            <div class="form-group">
                <input type="text" class="form-control" id="username" placeholder="Username" v-model="username">
            </div>
            <div class="form-group ">
                <button type="submit" class="btn btn-primary">Sign in</button>
            </div>
        </form>
    </div>
</template>


<script>
    import router from "../router";
    export default {
        data: () => {
            return {
                username: "",
            }
        },
        sockets : {
            action_loginSuccess(created){
                localStorage.setItem('username', this.username);
                router.push('/chatrooms');
            }
        },
        methods: {
            userNameSub: function () {
                if(this.username){
                    this.$socket.emit('action_login', this.username)
                }
            }


        }
    }
</script>

