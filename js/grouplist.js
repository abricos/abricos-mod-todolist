/*
@package Abricos
@license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
*/

var Component = new Brick.Component();
Component.requires = {
	mod:[
		{name: '{C#MODNAME}', files: ['dragdrop.js','groupeditor.js']}
	]
};
Component.entryPoint = function(NS){
	
	var Dom = YAHOO.util.Dom,
		E = YAHOO.util.Event,
		L = YAHOO.lang,
		buildTemplate = this.buildTemplate,
		BW = Brick.mod.widget.Widget;
	
	var GroupListWidget = function(container, cfg){
		cfg = L.merge({
			'onSelectedItem': null
		}, cfg || {});
		
		GroupListWidget.superclass.constructor.call(this, container, {
			'buildTemplate': buildTemplate, 'tnames': 'widget' 
		}, cfg);
	};
	YAHOO.extend(GroupListWidget, BW, {
		init: function(cfg){
			this.cfg = cfg;
			this.wsList = [];
			
			this.newEditorWidget = null;
		},
		destroy: function(){
			this.clearList();
			NS.manager.todoListChangedEvent.unsubscribe(this.onTodoListChanged);
			GroupListWidget.superclass.destroy.call(this);			
		},
		onLoad: function(){
			var __self = this;
			NS.initManager(function(){
				__self._onLoadManager();
			});
		},
		_onLoadManager: function(){
			NS.manager.todoListChangedEvent.subscribe(this.onTodoListChanged, this, true);
			this.renderList();
		},
		onTodoListChanged: function(){
			this.render();
		},
		clearList: function(){
			var ws = this.wsList;
			for (var i=0;i<ws.length;i++){
				ws[i].destroy();
			}
			this.elSetHTML('list', '');
		},
		renderList: function(){
			this.clearList();
			
			var elList = this.gel('list'), ws = this.wsList, 
				__self = this;
			
			NS.manager.groupList.foreach(function(group){
				var div = document.createElement('div');
				div['group'] = group;

				elList.appendChild(div);
				var w = new NS.GroupRowWidget(div, group, {
					'onEditClick': function(w){__self.onGroupEditClick(w);},
					'onRemoveClick': function(w){__self.onGroupRemoveClick(w);},
					'onSelectClick': function(w){__self.onGroupSelectClick(w);},
					'onSave': function(w){ __self.renderList(); }
				});
				
				new NS.RowDragItem(div, {
					'endDragCallback': function(dgi, elDiv){
						var chs = elList.childNodes, ordb = NS.manager.groupList.count();
						var orders = {};
						for (var i=0;i<chs.length;i++){
							var group = chs[i]['group'];
							if (group){
								group.order = ordb;
								orders[group.id] = ordb;
								ordb--;
							}
						}
						NS.manager.groupListOrderSave(orders);
						__self.renderList();
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
		render: function(){
			this.foreach(function(w){
				w.render();
			});
		},
		allEditorClose: function(wExclude){
			this.newEditorClose();
			this.foreach(function(w){
				if (w != wExclude){ w.editorClose(); }
			});
		},
		onGroupEditClick: function(w){
			this.allEditorClose(w);
			w.editorShow();
		},
		onGroupRemoveClick: function(w){
			var __self = this;
			new GroupRemovePanel(w.group, function(list){
				__self.list.remove(w.group.id);
				__self.renderList();
			});
		},
		onGroupSelectClick: function(w){
			this.allEditorClose(w);
			var groupid = 0;
			if (L.isValue(w)){
				groupid = w.group.id;
			}
			this.selectGroupById(groupid);
			NS.life(this.cfg['onSelectedItem'], groupid);
		},
		selectGroupById: function(groupid){
			this.foreach(function(w){
				if (w.group.id == groupid){
					w.select();
				}else{
					w.unSelect();
				}
			});
		},
		showNewEditor: function(fel){
			if (!L.isNull(this.newEditorWidget)){ return; }
			
			this.allEditorClose();
			var __self = this;
			var group = new NS.Group();

			this.newEditorWidget = 
				new NS.GroupEditorWidget(this.gel('neweditor'), group, {
					'onCancelClick': function(wEditor){ __self.newEditorClose(); },
					'onSave': function(wEditor, group){
						__self.newEditorClose(); 
						__self.renderList();
					}
				});
		},
		newEditorClose: function(){
			if (L.isNull(this.newEditorWidget)){ return; }
			this.newEditorWidget.destroy();
			this.newEditorWidget = null;
		}
	});
	NS.GroupListWidget = GroupListWidget;
	
	var GroupRowWidget = function(container, group, cfg){
		cfg = L.merge({
			'onEditClick': null,
			'onCopyClick': null,
			'onRemoveClick': null,
			'onSelectClick': null,
			'onSave': null
		}, cfg || {});
		GroupRowWidget.superclass.constructor.call(this, container, {
			'buildTemplate': buildTemplate, 'tnames': 'row' 
		}, group, cfg);
	};
	YAHOO.extend(GroupRowWidget, BW, {
		init: function(group, cfg){
			this.group = group;
			this.cfg = cfg;
			this.editorWidget = null;
		},
		render: function(){
			var group = this.group;
			this.elSetHTML({
				'tl': group.title,
				'cnt': group.todoCount
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
			}
			
			this.onSelectClick();
			
			return false;
		},
		onEditClick: function(){
			NS.life(this.cfg['onEditClick'], this);
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
				new NS.GroupEditorWidget(this.gel('easyeditor'), this.group, {
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
		},
		select: function(){
			Dom.addClass(this.gel('wrap'), 'select');
		},
		unSelect: function(){
			Dom.removeClass(this.gel('wrap'), 'select');
		},
		isSelect: function(){
			return Dom.hasClass(this.gel('wrap'), 'select');
		}
	});
	NS.GroupRowWidget = GroupRowWidget;	

	var GroupRemovePanel = function(group, callback){
		this.group = group;
		this.callback = callback;
		GroupRemovePanel.superclass.constructor.call(this, {fixedcenter: true});
	};
	YAHOO.extend(GroupRemovePanel, Brick.widget.Dialog, {
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
			NS.manager.groupRemove(this.group.id, function(){
				__self.close();
				NS.life(__self.callback);
			});
		}
	});
	NS.GroupRemovePanel = GroupRemovePanel;

};