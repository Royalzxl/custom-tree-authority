## 此控件解决以下需求问题
- 权限设置时--下级全部取消选中，需要上级不取消选中的需求

## 此控件依赖以下组件【可优化为不依赖以下控件】
+ element-plus UI框架中的Icon组件
- element-plus UI框架中的Checkbox、CheckboxGroup组件
+ element-plus UI框架中的CollapseTransition组件

## 此控件数据结构如下
* menuType 0 标识菜单页面 1标识按钮
```
[
    {
        id:'xx',
        title: 'xxs,
        menuType: 0,
        children: [{
            {
                id:'xxs',
                title: 'xxss,
                menuType: 0
                children: [
                    {
                        id:'xx',
                        title: 'xxs,
                        children: null,
                        menuType: 1
                    }
                ]
            }
        }]
    }
]
```
