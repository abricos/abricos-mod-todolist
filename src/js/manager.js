var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: '{C#MODNAME}', files: ['grouplist.js', 'todolist.js']}
    ]
};
Component.entryPoint = function(NS){

    var Y = Brick.YUI,
        COMPONENT = this,
        SYS = Brick.mod.sys;

    NS.ManagerWidget = Y.Base.create('managerWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance){
            this.set('waiting', true);

            var __self = this;
            NS.initManager(function(){
                __self._onLoadManager();
            });
        },
        destructor: function(){
            if (this.groupListWidget){
                this.groupListWidget.destroy();
                this.todoListWidget.destroy();
            }
        },
        _onLoadManager: function(){
            this.set('waiting', false);

            var tp = this.template,
                __self = this;

            var glWidget = this.groupListWidget = new NS.GroupListWidget(tp.gel('groplist'), {
                'onSelectedItem': function(groupid){
                    __self.setFilter({'groupid': groupid});
                },
                'onGroupRemoved': function(){
                    __self.todoListWidget.renderList();
                },
                'onReorderList': function(){
                    NS.manager.todoList.reorder();
                    __self.todoListWidget.renderList();
                }
            });
            this.todoListWidget = new NS.TodoListWidget(tp.gel('todolist'), {
                'onGroupClick': function(groupid){
                    glWidget.selectGroupById(groupid);
                }
            });
        },
        onClick: function(e){
            switch (e.dataClick) {
                case 'addtodo':
                    this.showNewTodoEditor();
                    return true;
                case 'addgroup':
                    this.showNewGroupEditor();
                    return true;
                case 'clearfilter':
                    this.setFilter(null);
                    return true;
            }
        },
        showNewTodoEditor: function(){
            this.todoListWidget.showNewEditor();
        },
        showNewGroupEditor: function(){
            this.groupListWidget.showNewEditor();
        },
        setFilter: function(filter){
            filter = filter || null;

            var tp = this.template;

            this.todoListWidget.setFilter(filter);

            if (Y.Lang.isObject(filter) && filter['groupid'] | 0 > 0){
                var group = NS.manager.groupList.get(filter['groupid']);
                if (group){
                    tp.setHTML('grouptl', group.title);
                    tp.show('filterbtns');
                }
            } else {
                tp.setHTML('grouptl', '');
                tp.hide('filterbtns');
                this.groupListWidget.selectGroupById(0);
            }
        }
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'widget'}
        }
    });
};