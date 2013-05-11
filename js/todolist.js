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
				__self = this, man = this.manager;
			
			NS.manager.groupList.foreach(function(catel){
				var div = document.createGroup('div');
				div['catalogGroup'] = catel;
				
				elList.appendChild(div);
				var w = new NS.TodoRowWidget(div, __self.manager, catel, {
					'onEditClick': function(w){__self.onGroupEditClick(w);},
					'onCopyClick': function(w){__self.onGroupCopyClick(w);},
					'onRemoveClick': function(w){__self.onGroupRemoveClick(w);},
					'onSelectClick': function(w){__self.onGroupSelectClick(w);},
					'onSaveGroup': function(w){ __self.render(); }
				});
				
				new NS.RowDragItem(div, {
					'endDragCallback': function(dgi, elDiv){
						var chs = elList.childNodes, ordb = list.count();
						var orders = {};
						for (var i=0;i<chs.length;i++){
							var catel = chs[i]['catalogGroup'];
							if (catel){
								catel.order = ordb;
								orders[catel.id] = ordb;
								ordb--;
							}
						}
						man.groupListOrderSave(list.catid, orders);
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
		onGroupEditClick: function(w){
			this.allEditorClose(w);
			w.editorShow();
		},
		onGroupCopyClick: function(w){
			this.showNewEditor(w.catel);
		},
		onGroupRemoveClick: function(w){
			var __self = this;
			new TodoRemovePanel(this.manager, w.catel, function(list){
				__self.list.remove(w.catel.id);
				__self.render();
			});
		},
		onGroupSelectClick: function(w){
			this.allEditorClose(w);
			// w.editorShow();
		},
		showNewEditor: function(fel){
			if (!L.isNull(this.newEditorWidget)){ return; }
			
			this.allEditorClose();
			var man = this.manager, __self = this;
			var catel = man.newGroup({'catid': this.list.catid});

			this.newEditorWidget = 
				new NS.GroupEditorWidget(this.gel('neweditor'), man, catel, {
					'fromGroup': fel || null,
					'onCancelClick': function(wEditor){ __self.newEditorClose(); },
					'onSaveGroup': function(wEditor, group){
						if (!L.isNull(group)){
							__self.list.add(group);
						}
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
	
	var TodoRowWidget = function(container, manager, catel, cfg){
		cfg = L.merge({
			'onEditClick': null,
			'onCopyClick': null,
			'onRemoveClick': null,
			'onSelectClick': null,
			'onSaveGroup': null
		}, cfg || {});
		TodoRowWidget.superclass.constructor.call(this, container, {
			'buildTemplate': buildTemplate, 'tnames': 'row' 
		}, manager, catel, cfg);
	};
	YAHOO.extend(TodoRowWidget, BW, {
		init: function(manager, catel, cfg){
			this.manager = manager;
			this.catel = catel;
			this.cfg = cfg;
			this.editorWidget = null;
		},
		onLoad: function(manager, catel){
			this.elSetHTML({
				'tl': catel.title
			});
			if (L.isNull(catel.url())){
				this.elHide('bgopage');
			}
		},
		onClick: function(el, tp){
			switch(el.id){
			case tp['bgopage']: case tp['bgopagec']:
				this.goPage();
				return true;
			case tp['bedit']: case tp['beditc']:
				this.onEditClick();
				return true;
			case tp['bcopy']: case tp['bcopyc']:
				this.onCopyClick();
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
		goPage: function(catid){
			var url = this.catel.url();
			window.open(url);
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
		onSaveGroup: function(){
			NS.life(this.cfg['onSaveGroup'], this);
		},
		editorShow: function(){
			if (!L.isNull(this.editorWidget)){ return; }
			var __self = this;
			this.editorWidget = 
				new NS.GroupEditorWidget(this.gel('easyeditor'), this.manager, this.catel, {
					'onCancelClick': function(wEditor){ __self.editorClose(); },
					'onSaveGroup': function(wEditor){ 
						__self.editorClose(); 
						__self.onSaveGroup();
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

	var TodoRemovePanel = function(manager, catel, callback){
		this.manager = manager;
		this.catel = catel;
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
			this.manager.groupRemove(this.catel.id, function(){
				__self.close();
				NS.life(__self.callback);
			});
		}
	});
	NS.TodoRemovePanel = TodoRemovePanel;

};