import { createApp } from 'vue'
import App from './App.vue'
import { ElCheckbox, ElCheckboxGroup, ElIcon, ElCollapseTransition } from 'element-plus'
import * as ElIconModules from '@element-plus/icons'

// 将el-icon的组件名称AbbbCddd转化为i-abbb-cddd形式
// 此前用switch做组件名时因关键字重复报错，所以格式统一加了前缀
// 例：Switch转换为i-switch，ArrowDownBold转换为i-arrow-down-bold
const transElIconName = iconName => 'i' + iconName.replace(/[A-Z]/g, match => '-' + match.toLowerCase())

const app = createApp(App)

// 统一注册el-icon图标
for (const iconName in ElIconModules) {
    app.component(transElIconName(iconName), ElIconModules[iconName])
}

app.use(ElIcon).use(ElCheckbox).use(ElCheckboxGroup).use(ElCollapseTransition).mount('#app')
