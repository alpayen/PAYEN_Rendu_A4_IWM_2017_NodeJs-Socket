<template>
    <div id="app">
        <div class="header">
            <div class=" connection-status">
            <div v-if="isConnected" class="alert alert-success" role="alert">
                <strong>Connected to server</strong>
            </div>
            <div v-if="!isConnected" class="alert alert-danger" role="alert">
                <strong>Disconnect form server</strong>
            </div>
        </div>
        </div>
        <router-view/>
    </div>
</template>
<script>

    export default {
        data() {
            return {
                isConnected: false,
            }
        },
        sockets: {
            connect() {
                this.isConnected = true;
            },

            disconnect() {
                this.isConnected = false;
            },
        },
    }
</script>
<style lang="scss">
    @import "assets/css/bootstrap.min.css";
    @import "assets/css/style";

</style>
