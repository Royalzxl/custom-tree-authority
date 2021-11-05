<template>
    <authority :tree="treeExample" :all-check="checkExample"></authority>
</template>

<script>
    import Authority from './components/authority'
    import { treeExample, checkExample } from './components/authority/utils/example'
    export default {
        name: 'App',
        components: {
            Authority
        },
        data () {
            return {
                treeExample,
                checkExample
            }
        }
    }
</script>

<style lang="scss">
    #app {
        font-family: Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: #2c3e50;
        margin-top: 60px;
    }
</style>
