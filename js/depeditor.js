/*
@package Abricos
@license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
*/

var Component = new Brick.Component();
Component.requires = {
	mod:[
		{name: '{C#MODNAME}', files: ['widgets.js']}
	]
};
Component.entryPoint = function(NS){
	
	var Dom = YAHOO.util.Dom,
		E = YAHOO.util.Event,
		L = YAHOO.lang,
		buildTemplate = this.buildTemplate,
		BW = Brick.mod.widget.Widget;
	
	var DependsEditorWidget = function(container, todo, cfg){
		cfg = L.merge({
		}, cfg || {});
		DependsEditorWidget.superclass.constructor.call(this, container, {
			'buildTemplate': buildTemplate, 'tnames': 'widget' 
		}, todo, cfg);
	};
	YAHOO.extend(DependsEditorWidget, BW, {
		init: function(todo, cfg){
			this.todo = todo;
			this.cfg = cfg;
			
			this.wsList = [];
		},
		destroy: function(){
			this.clearList();
			DependsEditorWidget.superclass.destroy.call(this);			
		},
		clearList: function(){
			var ws = this.wsList;
			for (var i=0;i<ws.length;i++){
				ws[i].destroy();
			}
			this.elSetHTML('list', '');
		},
		onLoad: function(todo){
			var __self = this;
			todo.dependList.foreach(function(dep){
				__self.addDepend(dep);
			});
		},
		onClick: function(el, tp){
			switch(el.id){
			case tp['add']: this.addDepend(); return true;
			}
			return false;
		},
		addDepend: function(dep){
			dep = dep || new NS.Depend();
			var div = document.createElement('div');
			this.gel('list').appendChild(div);
			
			var w = new DependRowWidget(div, this.todo, dep);
			this.wsList[this.wsList.length] = w;
		},
		getSaveData: function(){
			var arr = [];
			var ws = this.wsList;
			for (var i=0;i<ws.length;i++){
				arr[arr.length] = ws[i].getValue();
			}
			return arr;
		}
	});
	NS.DependsEditorWidget = DependsEditorWidget;
	
	var DependTodoSelectWidget = function(container, cfg){
		var list = NS.manager.todoList;
		DependTodoSelectWidget.superclass.constructor.call(this, container, list, cfg);
	};
	YAHOO.extend(DependTodoSelectWidget, NS.SelectWidget, {
		buildTitle: function(todo){
			var group = todo.getGroup();
			if (L.isValue(group)){
				return group.title + ' / ' + todo.title;
			}
			return todo.title;
		}
	});
	NS.DependTodoSelectWidget = DependTodoSelectWidget;
	
	var DependRowWidget = function(container, todo, dep, cfg){
		cfg = L.merge({
		}, cfg || {});
		DependRowWidget.superclass.constructor.call(this, container, {
			'buildTemplate': buildTemplate, 'tnames': 'row' 
		}, todo, dep, cfg);
	};
	YAHOO.extend(DependRowWidget, BW, {
		init: function(todo, dep, cfg){
			this.todo = todo;
			this.dep = dep;
		},
		onLoad: function(){
			this.selectWidget = new DependTodoSelectWidget(this.gel('select'), {
				'exclude': this.todo.id
			});
		},
		getValue: function(){
			return this.selectWidget.getValue();
		}
	});
	NS.DependRowWidget = DependRowWidget;
	
};