/*
@package Abricos
@license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
*/

var Component = new Brick.Component();
Component.requires = {
	mod:[
		{name: '{C#MODNAME}', files: ['dragdrop.js','todoeditor.js']}
	]
};
Component.entryPoint = function(NS){
	
	var Dom = YAHOO.util.Dom,
		E = YAHOO.util.Event,
		L = YAHOO.lang,
		buildTemplate = this.buildTemplate,
		BW = Brick.mod.widget.Widget;
	
	var TodoListWidget = function(container, cfg){
		cfg = L.merge({
		}, cfg || {});
		
		TodoListWidget.superclass.constructor.call(this, container, {
			'buildTemplate': buildTemplate, 'tnames': 'widget' 
		}, cfg);
	};
	YAHOO.extend(TodoListWidget, BW, {
		init: function(cfg){
			this.config = cfg;
			this.wsList = [];
			
			this.newEditorWidget = null;
		},
		destroy: function(){
			this.clearList();
			TodoListWidget.superclass.destroy.call(this);			
		},
		onLoad: function(){
			var __self = this;
			NS.initManager(function(){
				__self.renderList();
			});
		},
		clearList: function(){
			var ws = this.wsList;
			for (var i=0;i<ws.length;i++){
				ws[i].destroy();
			}
			this.elSetHTML('list', '');
		},
		setList: function(list){
			this.list = list;
			this.allEditorClose();
			this.render();
		},
		renderList: function(){
			this.clearList();
			
			var elList = this.gel('list'), ws = this.wsList, 
				__self = this;
			
			NS.manager.todoList.foreach(function(todo){
				var div = document.createElement('div');
				div['todo'] = todo;

				elList.appendChild(div);
				var w = new NS.TodoRowWidget(div, todo, {
					'onEditClick': function(w){__self.onTodoEditClick(w);},
					'onCopyClick': function(w){__self.onTodoCopyClick(w);},
					'onRemoveClick': function(w){__self.onTodoRemoveClick(w);},
					'onSelectClick': function(w){__self.onTodoSelectClick(w);},
					'onSave': function(w){ __self.render(); }
				});
				
				new NS.RowDragItem(div, {
					'endDragCallback': function(dgi, elDiv){
						var chs = elList.childNodes, ordb = NS.manager.todoList.count();
						var orders = {};
						for (var i=0;i<chs.length;i++){
							var todo = chs[i]['todo'];
							if (todo){
								todo.order = ordb;
								orders[todo.id] = ordb;
								ordb--;
							}
						}
						NS.manager.todoListOrderSave(orders);
						__self.render();
					}
				});
		
				ws[ws.length] = w;
			}, 'order', true);
			
			new YAHOO.util.DDTarget(elList);
		},
		foreach: function(f){
			if (!L.isFunction(f)){ return; }
			var ws = this.wsList;
			for (var i=0;i<ws.length;i++){
				if (f(ws[i])){ return; }
			}
		},
		allEditorClose: function(wExclude){
			this.newEditorClose();
			this.foreach(function(w){
				if (w != wExclude){
					w.editorClose();
				}
			});
		},
		onTodoEditClick: function(w){
			this.allEditorClose(w);
			w.editorShow();
		},
		onTodoCopyClick: function(w){
			this.showNewEditor(w.todo);
		},
		onTodoRemoveClick: function(w){
			var __self = this;
			new TodoRemovePanel(w.todo, function(list){
				__self.list.remove(w.todo.id);
				__self.render();
			});
		},
		onTodoSelectClick: function(w){
			this.allEditorClose(w);
			// w.editorShow();
		},
		showNewEditor: function(fel){
			if (!L.isNull(this.newEditorWidget)){ return; }
			
			this.allEditorClose();
			var __self = this;
			var todo = new NS.Todo();

			this.newEditorWidget = 
				new NS.TodoEditorWidget(this.gel('neweditor'), todo, {
					'onCancelClick': function(wEditor){ __self.newEditorClose(); },
					'onSave': function(wEditor, todo){
						__self.newEditorClose(); 
						__self.render();
					}
				});
		},
		newEditorClose: function(){
			if (L.isNull(this.newEditorWidget)){ return; }
			this.newEditorWidget.destroy();
			this.newEditorWidget = null;
		}
	});
	NS.TodoListWidget = TodoListWidget;
	
	var TodoRowWidget = function(container, todo, cfg){
		cfg = L.merge({
			'onEditClick': null,
			'onCopyClick': null,
			'onRemoveClick': null,
			'onSelectClick': null,
			'onSave': null
		}, cfg || {});
		TodoRowWidget.superclass.constructor.call(this, container, {
			'buildTemplate': buildTemplate, 'tnames': 'row' 
		}, todo, cfg);
	};
	YAHOO.extend(TodoRowWidget, BW, {
		init: function(todo, cfg){
			this.todo = todo;
			this.cfg = cfg;
			this.editorWidget = null;
		},
		onLoad: function(todo){
			this.elSetHTML({
				'tl': NS.textToView(todo.title)
			});
		},
		onClick: function(el, tp){
			switch(el.id){
			case tp['bedit']: case tp['beditc']:
				this.onEditClick();
				return true;
			case tp['bremove']: case tp['bremovec']:
				this.onRemoveClick();
				return true;
			case tp['dtl']: case tp['tl']:
				this.onSelectClick();
				return true;
			}
			return false;
		},
		onEditClick: function(){
			NS.life(this.cfg['onEditClick'], this);
		},
		onCopyClick: function(){
			NS.life(this.cfg['onCopyClick'], this);
		},
		onRemoveClick: function(){
			NS.life(this.cfg['onRemoveClick'], this);
		},
		onSelectClick: function(){
			NS.life(this.cfg['onSelectClick'], this);
		},
		onSave: function(){
			NS.life(this.cfg['onSave'], this);
		},
		editorShow: function(){
			if (!L.isNull(this.editorWidget)){ return; }
			var __self = this;
			this.editorWidget = 
				new NS.TodoEditorWidget(this.gel('easyeditor'), this.todo, {
					'onCancelClick': function(wEditor){ __self.editorClose(); },
					'onSave': function(wEditor){ 
						__self.editorClose(); 
						__self.onSave();
					}
				});
			
			Dom.addClass(this.gel('wrap'), 'rborder');
			Dom.addClass(this.gel('id'), 'rowselect');
			this.elHide('menu');
		},
		editorClose: function(){
			if (L.isNull(this.editorWidget)){ return; }

			Dom.removeClass(this.gel('wrap'), 'rborder');
			Dom.removeClass(this.gel('id'), 'rowselect');
			this.elShow('menu');

			this.editorWidget.destroy();
			this.editorWidget = null;
		}
	});
	NS.TodoRowWidget = TodoRowWidget;	

	var TodoRemovePanel = function(todo, callback){
		this.todo = todo;
		this.callback = callback;
		TodoRemovePanel.superclass.constructor.call(this, {fixedcenter: true});
	};
	YAHOO.extend(TodoRemovePanel, Brick.widget.Dialog, {
		initTemplate: function(){
			return buildTemplate(this, 'removepanel').replace('removepanel');
		},
		onClick: function(el){
			var tp = this._TId['removepanel'];
			switch(el.id){
			case tp['bcancel']: this.close(); return true;
			case tp['bremove']: this.remove(); return true;
			}
			return false;
		},
		remove: function(){
			var TM = this._TM, gel = function(n){ return  TM.getEl('removepanel.'+n); },
				__self = this;
			Dom.setStyle(gel('btns'), 'display', 'none');
			Dom.setStyle(gel('bloading'), 'display', '');
			NS.manager.todoRemove(this.todo.id, function(){
				__self.close();
				NS.life(__self.callback);
			});
		}
	});
	NS.TodoRemovePanel = TodoRemovePanel;

};