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
			this.addDependRow();
		},
		onClick: function(el, tp){
			switch(el.id){
			case tp['add']: this.addDependRow(); return true;
			}
			return false;
		},
		renderList: function(){
			this.clearList();
			
		},
		addDependRow: function(){
			var div = document.createElement('div');
			this.gel('list').appendChild(div);
			
			var w = new DependRowWidget(div);
			this.wsList[this.wsList.length] = w;
		}
	});
	NS.DependsEditorWidget = DependsEditorWidget;
	
	var DependRowWidget = function(container, depend, cfg){
		cfg = L.merge({
		}, cfg || {});
		DependRowWidget.superclass.constructor.call(this, container, {
			'buildTemplate': buildTemplate, 'tnames': 'row' 
		}, depend, cfg);
	};
	YAHOO.extend(DependRowWidget, BW, {
		init: function(depend, cfg){
			
		},
		onLoad: function(){
			this.selectWidget = new DependTodoSelectWidget(this.gel('select'));
		}
	});
	NS.DependRowWidget = DependRowWidget;
	
	var DependTodoSelectWidget = function(container, cfg){
		cfg = L.merge({
		}, cfg || {});
		
		var list = NS.manager.todoList;
		
		DependTodoSelectWidget.superclass.constructor.call(this, container, list, cfg);
	};
	YAHOO.extend(DependTodoSelectWidget, NS.SelectWidget, {});
	NS.DependTodoSelectWidget = DependTodoSelectWidget;

};