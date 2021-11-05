/**
 * @description 获取全选数据
 * @param { Object } data
 * @returns { Array }
 */
export const obtainData = data => {
    return recursion(data, [])
}

/**
 * @description 递归传入数据，获取对应id
 * @param { Object } data 递归的数据
 * @param { Array } list id数组容器
 * @returns { Array }
 */
export const recursion = (data, list) => {
    list.push(data.id)
    if (data.children && data.children.length) {
        data.children.forEach(el => {
            recursion(el, list)
        })
    }
    return list
}

/**
 * @description 两个一维数组比较取不同
 * @param { Array } A 递归的数据
 * @param { Array } B id数组容器
 * @returns { Array }
 */
export const findDifferentElement2 = (A, B) => {
    // 定义一个空数组result作为返回值的容器
    const result = []

    // 定义两个对象分别用于盛装数组A、数组B的元素
    const Object_A = {}
    const Object_B = {}

    // 使用对象的【hash table】【即用对象的key】存储元素，并且去重
    for (const el of A) {
        Object_A[el] = undefined
    }
    for (const el of B) {
        Object_B[el] = undefined
    }

    // 使用对象的【hash table】【即用对象的key】删除相同元素
    for (const key in Object_A) {
        if (key in Object_B) {
            delete Object_B[key]
            delete Object_A[key]
        }
    }

    // 分别将对象Object_A、Object_b剩余下来的key push到result容器中
    for (const key in Object_A) {
        result.push(key)
    }
    for (const key in Object_B) {
        result.push(key)
    }

    // 返回result
    return result
}

/**
 * @description 字符串以空格为分隔符变成数组，再移除数组内属性两端空格
 * @param { String } str 
 * @returns { Array } 返回去除两端空格后的字符串数组
 */
const trimArr = str => {
    return (str || '').split(' ').filter((item) => !!item.trim())
}

/**
 * @description 添加类名
 * @param { HTMLElement | Element } el Html标签对象
 * @param { String } cls 样式类名
 */
export const addClass = (el, cls) => {
    if (!el) return
    let className = el.getAttribute('class') || ''
    const curClass = trimArr(className)
    const classes = (cls || '').split(' ').filter((item) => !curClass.includes(item) && !!item.trim())

    if (el.classList) el.classList.add(...classes)
    else {
        className += ` ${classes.join(' ')}`
        el.setAttribute('class', className)
    }
}

/**
 * @description 移除类名
 * @param { HTMLElement | Element } el Html标签对象
 * @param { String } cls 样式类名
 */
export const removeClass = (el, cls) => {
    if (!el || !cls) return
    const classes = trimArr(cls)
    let curClass = el.getAttribute('class') || ''
  
    if (el.classList) {
        el.classList.remove(...classes)
        return
    }
    classes.forEach((item) => {
        curClass = curClass.replace(` ${item} `, ' ')
    })
    const className = trimArr(curClass).join(' ')
    el.setAttribute('class', className)
}
  