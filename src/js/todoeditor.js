/*
@package Abricos
@license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
*/

var Component = new Brick.Component();
Component.requires = {
	mod:[
		{name: 'sys', files: ['editor.js']},
		{name: '{C#MODNAME}', files: ['priority.js','depeditor.js']}
	]
};
Component.entryPoint = function(NS){
	
	var Dom = YAHOO.util.Dom,
		E = YAHOO.util.Event,
		L = YAHOO.lang,
		buildTemplate = this.buildTemplate,
		BW = Brick.mod.widget.Widget;

	var TodoEditorWidget = function(container, todo, cfg){
		cfg = L.merge({
			'onCancelClick': null,
			'onSave': null
		}, cfg || {});
		TodoEditorWidget.superclass.constructor.call(this, container, {
			'buildTemplate': buildTemplate, 'tnames': 'widget' 
		}, todo, cfg);
	};
	YAHOO.extend(TodoEditorWidget, BW, {
		init: function(todo, cfg){
			this.todo = todo;
			this.cfg = cfg;
		},
		destroy: function(){
			if (YAHOO.util.DragDropMgr){
				YAHOO.util.DragDropMgr.unlock();
			} 
			TodoEditorWidget.superclass.destroy.call(this);
		},
		onLoad: function(todo){
			if (YAHOO.util.DragDropMgr){
				YAHOO.util.DragDropMgr.lock();
			} 
			this.todo = todo;

			this.elHide('loading');
			this.elShow('view');
			
			this.groupSelectWidget = new NS.SelectWidget(this.gel('groupselect'), NS.manager.groupList, {
				'value': todo.groupid
			});
			
			this.prioritySelectWidget = new NS.PrioritySelectWidget(this.gel('priorityselect'), {
				'value': todo.priorityid
			});
			
			this.dependsEditorWidget = new NS.DependsEditorWidget(this.gel('depends'), todo);

			this.timeInputWidget = new NS.TimeInputWidget(this.gel('time'), {
				'value': todo.plantime
			});
			
			this.elSetValue({
				'tl': todo.title,
				'dsc': NS.textToEdit(todo.descript)
			});
			
			var elTitle = this.gel('tl');
			setTimeout(function(){try{elTitle.focus();}catch(e){}}, 100);
			
			var __self = this;
			E.on(this.gel('id'), 'keypress', function(e){
				if ((e.keyCode == 13 || e.keyCode == 10) && e.ctrlKey){ 
					__self.save(); return true; 
				}
				return false;
			});
			E.on(this.gel('tl'), 'keypress', function(e){
				if (e.keyCode == 13 || e.keyCode == 10){ 
					__self.save(); return true; 
				}
				return false;
			});
		},
		onClick: function(el, tp){
			switch(el.id){
			case tp['bsave']: this.save(); return true;
			case tp['bcancel']: this.onCancelClick(); return true;
			}
			return false;
		},
		onCancelClick: function(){
			NS.life(this.cfg['onCancelClick'], this);
		},
		save: function(){
			var cfg = this.cfg;
			var todo = this.todo;
			var sd = {
				'tl': this.gel('tl').value,
				'dsc': this.gel('dsc').value,
				'prtid': this.prioritySelectWidget.getValue()|0,
				'gid': this.groupSelectWidget.getValue()|0,
				'ptm': this.timeInputWidget.getValue(),
				'deps': this.dependsEditorWidget.getSaveData()
			};
			
			this.elHide('btnsc');
			this.elShow('btnpc');

			var __self = this;
			NS.manager.todoSave(todo.id, sd, function(todo){
				__self.elShow('btnsc,btnscc');
				__self.elHide('btnpc,btnpcc');
				NS.life(cfg['onSave'], __self, todo);
			}, todo);
		}
	});
	NS.TodoEditorWidget = TodoEditorWidget;
};