
/**
 * First we will load all of this project's JavaScript dependencies which
 * includes Vue and other libraries. It is a great starting point when
 * building robust, powerful web applications using Vue and Laravel.
 */

require('./bootstrap');

window.Vue = require('vue');
import VueChatScroll from 'vue-chat-scroll';
Vue.use(VueChatScroll);
import Toaster from 'v-toaster'
Vue.use(Toaster, {timeout: 5000})
/**
 * The following block of code may be used to automatically register your
 * Vue components. It will recursively scan this directory for the Vue
 * components and automatically register them with their "basename".
 *
 * Eg. ./components/ExampleComponent.vue -> <example-component></example-component>
 */

// const files = require.context('./', true, /\.vue$/i)
// files.keys().map(key => Vue.component(key.split('/').pop().split('.')[0], files(key)))

Vue.component('message', require('./components/Message.vue'));

/**
 * Next, we will create a fresh Vue application instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */

const app = new Vue({
    el: '#app',
    data: {
        message: '',
        chat: {
            message: [],
            user: [],
            color: [],
            time:[]
        },
        typing: '',
        numberOfUsers: 0
    },
    watch: {
        message(){
            Echo.private('chat')
                .whisper('typing', {
                    name: this.message
                });
        }
    },
    methods: {
        send(){

            if(this.message.length != 0)
            this.chat.message.push(this.message);
            this.chat.user.push('you');
            this.chat.color.push('success');
            this.chat.time.push(this.getTime());

            $.ajax('/send',{
                type: 'POST',
                data: {message:this.message}
            })

            this.message = "";

        },
        getTime(){
            let time = new Date();
            return `${time.getHours()}:${time.getMinutes()}`;
        }
    },
    mounted() {
        Echo.private('chat')
            .listen('ChatEvent', (e) => {
                this.chat.message.push(e.message);
                this.chat.user.push(e.user);
                this.chat.color.push('warning');
                this.chat.time.push(this.getTime());

            }).listenForWhisper('typing', (e) => {
            if(e.name != ''){
                this.typing = 'typing...';
            }else {
                this.typing = ''
            }
        });

        Echo.join(`chat`)
            .here(users => {
                console.log(users);
                this.numberOfUsers = users.length;
            })
            .joining(user => {
                this.$toaster.success(`${user.name} has joined the group chat`);
                this.numberOfUsers+=1;
            })
            .leaving(user => {
                this.$toaster.warning(`${user.name} has left the group chat`);
                this.numberOfUsers-=1;
            })
            .listen('NewMessage', (e) => {
                // console.log(e);
            });
    }
});
