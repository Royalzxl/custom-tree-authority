<template>
    <div class="authority">
        <div class="authority-wrapper" v-for="(item, index) in tree" :key="index">
            <authority-main :item="item"
                :all-check="checkedIdList[index]"
                :index="index"
                :is-cancel="isCancel"
                @mergeData="mergeData"></authority-main>
        </div>
    </div>
</template>

<script>
    import { reactive, toRefs, watch } from 'vue'
    import { obtainData } from './utils'
    import AuthorityMain from './main'
    export default {
        name: 'Authority',
        components: {
            AuthorityMain
        },
        props: {
            tree: {
                type: Array,
                default: () => {
                    return []
                }
            },
            allCheck: {
                type: Array,
                default: () => {
                    return []
                }
            },
            isCancel: {
                type: Boolean,
                default: false
            }
        },
        setup (props, { emit }) {
            // 存储内部组件传出来的选中值容器 此为一个二维数组
            const data = reactive({
                checkedIdList: []
            })

            // 定义初始化选中数据方法
            const initHasChildCheckHandle = value => {
                data.checkedIdList = []
                props.tree.forEach((item, index) => {
                    const sameValueList = []
                    if (value.indexOf(item.id) !== -1) sameValueList.push(item.id)
                    item.children && item.children.forEach((el, idx) => {
                        const list = obtainData(el)
                        list.forEach(ele => {
                            value.forEach(elem => {
                                if (ele === elem) sameValueList.push(elem)
                            })
                        })
                    })
                    data.checkedIdList[index] = sameValueList
                })
            }

            // 定义组件内部选中数据方法
            const mergeData = (index, dataArr) => {
                data.checkedIdList[index] = dataArr
                // 确保数据已经更新
                setTimeout(() => {
                    const finallyList = data.checkedIdList.reduce((acc, cur) => acc.concat(cur), [])
                    emit('update', finallyList)
                }, 10)
            }

            // 立即执行执行副作用
            watch(props.allCheck, value => { initHasChildCheckHandle(value) }, { deeo: true, immediate: true })

            const { checkedIdList } = toRefs(data)

            return {
                checkedIdList,
                mergeData
            }
        }
    }
</script>
