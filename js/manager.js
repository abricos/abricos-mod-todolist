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
			
			this.groupListWidget = new NS.GroupListWidget(this.gel('groplist'));
			this.todoListWidget = new NS.TodoListWidget(this.gel('todolist'));
		},
		onClick: function(el, tp){
			switch(el.id){
			case tp['baddtodo']: this.showNewTodoEditor(); return true;
			}
		},
		showNewTodoEditor: function(){
			this.todoListWidget.showNewEditor();
			/*
			this.elShow('bloading');
			this.elHide('btns');
			
			var __self = this;
			NS.manager.build(function(){
				__self.elShow('btns');
				__self.elHide('bloading');
			});
			/**/
		}
	});
	NS.ManagerWidget = ManagerWidget;
};