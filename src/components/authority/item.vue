<template>
    <div class="authority-item">
        <div :class="['two-level', { 'no-child-item': !item.children }]">
            <div class="level-expand" v-if="item.children && item.children.length" @click="openToogle">
                <el-icon><i-arrow-down v-show="!expand"/><i-arrow-up v-show="expand"/></el-icon>
            </div>
            <el-checkbox v-model="levelCheck"
                :disabled="isCancel"
                @change="handleCheckAll($event, 0)">{{ item.title }}</el-checkbox>
        </div>
        <el-collapse-transition>
            <div class="two-child no-child" v-show="noChild.length && expand">
                <el-checkbox-group v-model="authorityCheckGroup" @change="checkAllGroupChange" :key="item.id">
                    <el-checkbox v-for="(it, idx) in noChild" :label="it.id" :disabled="isCancel" :key="idx">{{ it.title }}</el-checkbox>
                </el-checkbox-group>
            </div>
        </el-collapse-transition>
        <el-collapse-transition>
            <div class="two-child" v-if="hasChild.length && expand">
                <authority-item v-for="(it, idex) in hasChild" :allCheck="hasChildCheck[idex]" :is-cancel="isCancel" :item="it" :index="idex" :key="idex" @checkAllData="checkAllData" />
            </div>
        </el-collapse-transition>
    </div>
</template>

<script>
    import { computed, reactive, watch, toRefs } from 'vue'
    import { obtainData, findDifferentElement2 } from './utils'
    export default {
        name: 'AuthorityItem',
        props: {
            item: {
                type: Object,
                default: () => {
                    return {}
                }
            },
            index: { // 处于数组中的哪个位置
                type: Number,
                default: 0
            },
            allCheck: { // 本身是否选中, 以及选中数据
                type: Object,
                default: () => {
                    return {
                        flag: false,
                        checked: []
                    }
                }
            },
            isCancel: {
                type: Boolean,
                default: false
            }
        },
        setup (props, { emit }) {
            const data = reactive({
                expand: false,
                levelCheck: false, // 当前元素是否选中
                checkAll: false, // 当前子集是否全部选中
                authorityCheckGroup: [], // 当前没有子集的子集选中数据容器,
                hasChildCheck: [], // 当前内部组件全选标识容器
                checkedIdList: [] // 存储内部组件传出来的选中值容器
            })

            // 获取没有子集的数据
            const noChild = computed(() => {
                return props.item.children ? props.item.children.filter(el => !el.children || (el.children && !el.children.length)) : []
            })
            // 获取有子集的数据
            const hasChild = computed(() => {
                return props.item.children ? props.item.children.filter(el => el.children && el.children.length) : []
            })

            // 展开切换
            const openToogle = () => {
                data.expand = !data.expand
            }

            // 全选点击事件
            // data 当前元素是否选中标识
            // flag 标识是外部传入数据进行初始化还是当前组件点击事件触发
            const handleCheckAll = (value, flag) => {
                // 点击事件时处理 当前元素是否选中以及全选
                !flag && (data.levelCheck = data.checkAll = value)

                // 获取全选时的数据
                const list = obtainData(props.item)

                // 根据外部传入数据进行数据处理
                if (flag && (value instanceof Object)) {
                    // 处理当前元素是否需要选中
                    data.levelCheck = value.flag

                    // 处理是否全选
                    if (value.checked.length === list.length && !findDifferentElement2(value.checked, list).length) {
                        data.checkAll = true
                    } else data.checkAll = false
                }

                // 先全部清空【当前没有子集的子集选中数据容器】
                data.authorityCheckGroup = []

                // 全选时数据处理并动态展示
                if (data.checkAll) {
                    noChild.value.forEach(el => data.authorityCheckGroup.push(el.id))
                    hasChild.value.forEach((el, index) => { data.hasChildCheck[index] = { flag: true, checked: obtainData(el) } })
                    data.checkedIdList = list
                }

                // 本身选中，但并不是全选时
                if (data.levelCheck && !data.checkAll) {
                    // 定义一个临时数组，存储下级存在子集的选中数据
                    let hasChildCheck = []

                    // 定义一个变量存储对应情况下的数组值
                    const checkList = flag ? value.checked : value

                    // 先处理其子节点不再存在下级时
                    noChild.value.forEach(el => {
                        checkList.forEach(elem => {
                            if (el.id === elem) data.authorityCheckGroup.push(elem)
                        })
                    })

                    // 处理其子节点存在下级时数据处理
                    // 获取data.checked数组里面除去this.authorityCheckGroup数组里面的数据
                    hasChildCheck = findDifferentElement2(checkList, data.authorityCheckGroup)
                    // 移除元素本身id
                    hasChildCheck = hasChildCheck.filter(el => el !== props.item.id)

                    // 对下级数据进行赋值
                    hasChild.value.forEach((el, index) => {
                        const eleChecked = []
                        const list = obtainData(el)
                        list.forEach(ele => {
                            hasChildCheck.forEach(elem => {
                                if (ele === elem) eleChecked.push(elem)
                            })
                        })
                        // 定义一个变量标识下级是否有选中数据
                        const childFlag = eleChecked.length !== 0
                        data.hasChildCheck[index] = { flag: childFlag, checked: eleChecked }
                    })
                    data.checkedIdList = props.allCheck.checked
                }

                // 都未选中时
                if (!data.levelCheck && !data.checkAll) {
                    hasChild.value.forEach((el, index) => { data.hasChildCheck[index] = { flag: false, checked: [] } })
                    data.checkedIdList = []
                }

                // 全选时把数据向外推送
                !flag && emit('checkAllData', props.index, data.levelCheck, data.checkedIdList)
            }

            // 复选框组合选中更改触发
            const checkAllGroupChange = value => {
                // 增加选中情况下 设置元素本身选中
                if (value.length) data.levelCheck = true

                // 存储向外推送的数据【最底层】
                let pushOutData = []

                // 先定义一个isEnd标识是否是最底层
                const isEnd = hasChild.value.length === 0

                // 此处分两种情况
                // Ⅰ、最内层【即所有元素子集都没有子集时】
                // Ⅱ、中间层【有些元素子集有子集有些没有】
                if (isEnd) {
                    const isPage = noChild.value.filter(el => el.menuType === 0)
                    pushOutData = [...value, props.item.id]

                    // fix isPage.length => isPage.length === noChild.value.length
                    // isPage.length: 仅考虑了没有孩子的数据全是页面
                    // 未曾考虑到 当前有页面也有按钮时的情况
                    if (!value.length && isPage.length === noChild.value.length) {
                        pushOutData = [...value]
                        data.levelCheck = false
                    }

                    // 更新全选标识
                    if (value.length === noChild.value.length) data.checkAll = true
                    else data.checkAll = false
                } else {
                    // 获取子组件选中数据
                    data.checkedIdList = []
                    data.hasChildCheck.forEach(el => {
                        data.checkedIdList = [...data.checkedIdList, ...el.checked]
                    })

                    // 处理当前组件选中数据
                    // 获取移除的选中数据
                    let reduces = findDifferentElement2(props.allCheck.checked, [...value, ...data.checkedIdList, props.item.id])
                    
                    // fix isPage.length => isPage.length === noChild.value.length
                    // isPage.length: 仅考虑了没有孩子的数据全是页面
                    // 未曾考虑到 当前有页面也有按钮时的情况
                    const isPage = noChild.value.filter(el => el.menuType === 0)
                    if (!value.length && isPage.length === noChild.value.length) {
                        if (!value.length && !data.checkedIdList.length)
                            reduces = findDifferentElement2(props.allCheck.checked, [...value, ...data.checkedIdList])
                    }

                    // 获取选中数据
                    pushOutData = findDifferentElement2(props.allCheck.checked, reduces)

                    // 处理当前情况下选中数据长度为0时，更改当前选中状态
                    if (!pushOutData.length) data.levelCheck = false

                    // 更新全选标识
                    const checkedList = data.hasChildCheck.filter(el => el.checked.length > 0)
                    if (checkedList.length === hasChild.value.length) data.checkAll = true
                    else data.checkAll = false
                }

                emit('checkAllData', props.index, data.levelCheck, pushOutData)
            }

            // 组件内部选中数据
            const checkAllData = (index, levelCheck, value) => {
                if (value.length) data.levelCheck = true

                // 元素本身是否选中并获取选中数据
                data.hasChildCheck[index] = { flag: levelCheck, checked: value }

                // 存储对象内部所有选中数据
                data.checkedIdList = []
                data.hasChildCheck.forEach(el => {
                    data.checkedIdList = [...data.checkedIdList, ...el.checked]
                })
                // 处理当前组件选中数据
                // 获取移除的选中数据
                const reduces = findDifferentElement2(props.allCheck.checked, [...data.authorityCheckGroup, ...data.checkedIdList, props.item.id])
                // 获取选中数据
                data.checkedIdList = findDifferentElement2(props.allCheck.checked, reduces)

                // 处理当前情况下选中数据长度为1时，即只剩当前选中情况下 清空数据
                if (data.checkedIdList.length === 1) {
                    data.checkedIdList = []
                    data.levelCheck = false
                }

                // 向外传递数据
                emit('checkAllData', props.index, data.levelCheck, data.checkedIdList)
            }

            // 初始化是否全选
            // 注意侦听在vue3.0+中分两种类型
            // 具体区别与详情请查阅 https://v3.cn.vuejs.org/api/computed-watch-api.html#%E4%BE%A6%E5%90%AC%E5%8D%95%E4%B8%80%E6%BA%90
            watch(() => props.allCheck, value => handleCheckAll(value, 1), { deep: true, immediate: true })

            const { expand, levelCheck, authorityCheckGroup, hasChildCheck } = toRefs(data)

            return {
                expand,
                levelCheck,
                authorityCheckGroup,
                hasChildCheck,
                noChild,
                hasChild,
                openToogle,
                handleCheckAll,
                checkAllGroupChange,
                checkAllData
            }
        }
    }
</script>

<style lang="scss" scoped>
    .authority-item {
        .two-level {
            display: flex;
            justify-content: flex-start;
            align-items: center;
            .level-expand {
                margin-right: 5px;
                cursor: pointer;
            }
            &.no-child-item {
                padding-left: 20px;
            }
        }
        .two-child {
            padding-left: 20px;
        }
        .no-child {
            padding-left: 40px;
        }
    }
</style>
