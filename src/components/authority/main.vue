<template>
    <div class="authority-main">
        <div class="level">
            <div class="level-expand" @click="openToogle">
                <el-icon><i-arrow-down v-show="!expand"/><i-arrow-up v-show="expand"/></el-icon>
            </div>
            <div class="check-all">
                <el-checkbox v-model="checkAll"
                :disabled="isCancel"
                @change="handleCheckAll">{{ item.title }}</el-checkbox>
            </div>
        </div>
        <el-collapse-transition>
            <div class="child" v-show="item.children && expand">
                <authority-item v-for="(it, idx) in item.children" :allCheck="hasChildCheck[idx]" :is-cancel="isCancel" :item="it" :index="idx" :key="idx" @checkAllData="checkAllData" />
            </div>
        </el-collapse-transition>
    </div>
</template>

<script>
    import { reactive, toRefs, watch } from 'vue'
    import { obtainData } from './utils'
    import AuthorityItem from './item'
    export default {
        name: 'AuthorityMain',
        components: {
            AuthorityItem
        },
        props: {
            item: {
                type: Object,
                default: () => {
                    return {}
                }
            },
            allCheck: {
                type: Array,
                default: () => {
                    return []
                }
            },
            index: {
                type: Number,
                default: 0
            },
            isCancel: {
                type: Boolean,
                default: false
            }
        },
        setup (props, { emit }) {
            const data = reactive({
                expand: false, // 是否展开
                checkAll: false, // 是否全选
                hasChildCheck: [], // 当前内部组件全选标识容器
                checkedIdList: [] // 存储内部组件传出来的选中值容器
            })

            // 初始化选中数据
            const initHasChildCheckHandle = value => {
                props.item.children.forEach((el, index) => {
                    const list = obtainData(el)
                    const sameValueList = []
                    list.forEach(ele => {
                        value.forEach(elem => {
                            if (ele === elem) sameValueList.push(elem)
                        })
                    })
                    sameValueList.length && (data.checkAll = true)
                    data.hasChildCheck[index] = { flag: sameValueList.length !== 0, checked: sameValueList }
                })
            }

            // 全选点击事件
            const handleCheckAll = value => {
                data.checkAll = value
                if (data.checkAll) {
                    props.item.children.forEach((el, index) => { data.hasChildCheck[index] = { flag: true, checked: obtainData(el) } })
                    data.checkedIdList = obtainData(props.item)
                } else {
                    props.item.children.forEach((el, index) => { data.hasChildCheck[index] = { flag: false, checked: [] } })
                    data.checkedIdList = []
                }

                emit('mergeData', props.index, data.checkedIdList)
            }

            // 组件内部选中数据
            const checkAllData = (index, levelCheck, value) => {
                value.length && (data.checkAll = true)

                data.hasChildCheck[index] = { flag: levelCheck, checked: value }

                // 存储对象内部所有选中数据
                data.checkedIdList = []
                data.hasChildCheck.forEach(el => {
                    data.checkedIdList = [...data.checkedIdList, ...el.checked]
                })

                // 去重
                data.checkedIdList = data.checkedIdList.reduce((all, next) => all.some(item => item === next) ? all : [...all, next], [])

                // 分情况 控制全选及数据
                if (data.checkedIdList.length) data.checkedIdList = [...data.checkedIdList, props.item.id]
                else data.checkAll = false

                emit('mergeData', props.index, data.checkedIdList)
            }

            // 展开切换
            const openToogle = () => {
                data.expand = !data.expand
            }

            // 注意侦听在vue3.0+中分两种类型
            // 具体区别与详情请查阅 https://v3.cn.vuejs.org/api/computed-watch-api.html#%E4%BE%A6%E5%90%AC%E5%8D%95%E4%B8%80%E6%BA%90
            watch(() => props.allCheck, value => initHasChildCheckHandle(value), { deeo: true, immediate: true })

            const { expand, checkAll, hasChildCheck } = toRefs(data)

            return {
                expand,
                checkAll,
                hasChildCheck,
                handleCheckAll,
                checkAllData,
                openToogle
            }
        }
    }
</script>

<style lang="scss" scoped>
    .authority-main {
        .level {
            display: flex;
            justify-content: flex-start;
            align-items: center;
            .level-expand {
                margin-right: 5px;
                cursor: pointer;
            }
        }
        .child {
            padding-left: 20px;
        }
    }
</style>
