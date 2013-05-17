/*
@package Abricos
@license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
*/

var Component = new Brick.Component();
Component.requires = {
	mod:[
        {name: '{C#MODNAME}', files: ['grouplist.js','todolist.js']}
	]
};
Component.entryPoint = function(NS){
	
	var Dom = YAHOO.util.Dom,
		L = YAHOO.lang,
		R = NS.roles,
		buildTemplate = this.buildTemplate;
	
	var ManagerWidget = function(container){
		ManagerWidget.superclass.constructor.call(this, container, {
			'buildTemplate': buildTemplate, 'tnames': 'widget' 
		});
	};
	YAHOO.extend(ManagerWidget, Brick.mod.widget.Widget, {
		init: function(){
			this.wsMenuItem = 'manager'; // использует wspace.js
			this.groupListWidget = null;
			this.todoListWidget = null;
		},
		destroy: function(){
			if (!L.isNull(this.groupListWidget)){
				this.groupListWidget.destroy();
				this.todoListWidget.destroy();
			}
			ManagerWidget.superclass.destroy.call(this);
		},
		onLoad: function(seventid){
			var __self = this;
			NS.initManager(function(){
				__self._onLoadManager();
			});
		},
		_onLoadManager: function(){
			this.elHide('loading');
			this.elShow('view');
			var __self = this;
			
			this.groupListWidget = new NS.GroupListWidget(this.gel('groplist'), {
				'onSelectedItem': function(groupid){
					__self.setFilter({'groupid': groupid});
				},
				'onGroupRemoved': function(){
					__self.todoListWidget.renderList();
				}
			});
			this.todoListWidget = new NS.TodoListWidget(this.gel('todolist'));
		},
		onClick: function(el, tp){
			switch(el.id){
			case tp['baddtodo']: 
				this.showNewTodoEditor(); return true;
			case tp['baddgroup']: 
			case tp['baddgroupc']: 
				this.showNewGroupEditor(); return true;
			case tp['bclearfilter']:
				this.setFilter(null);
				break;
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
			this.todoListWidget.setFilter(filter);
			if (L.isObject(filter) && filter['groupid']|0 > 0){
				var group = NS.manager.groupList.get(filter['groupid']);
				if (L.isValue(group)){
					this.elSetHTML('grouptl', group.title);
					this.elShow('filterbtns');
				}
			}else{
				this.elSetHTML('grouptl', '');
				this.elHide('filterbtns');
				this.groupListWidget.selectGroupById(0);
			}
		}
	});
	NS.ManagerWidget = ManagerWidget;
};