/*
@package Abricos
@license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
*/

var Component = new Brick.Component();
Component.requires = {
	mod:[
		{name: 'sys', files: ['editor.js']},
		{name: '{C#MODNAME}', files: ['lib.js']}
	]
};
Component.entryPoint = function(NS){
	
	var Dom = YAHOO.util.Dom,
		E = YAHOO.util.Event,
		L = YAHOO.lang,
		buildTemplate = this.buildTemplate,
		BW = Brick.mod.widget.Widget;

	var GroupEditorWidget = function(container, group, cfg){
		cfg = L.merge({
			'onCancelClick': null,
			'onSave': null
		}, cfg || {});
		GroupEditorWidget.superclass.constructor.call(this, container, {
			'buildTemplate': buildTemplate, 'tnames': 'widget' 
		}, group, cfg);
	};
	YAHOO.extend(GroupEditorWidget, BW, {
		init: function(group, cfg){
			this.group = group;
			this.cfg = cfg;
		},
		destroy: function(){
			if (YAHOO.util.DragDropMgr){
				YAHOO.util.DragDropMgr.unlock();
			} 
			GroupEditorWidget.superclass.destroy.call(this);
		},
		onLoad: function(group){
			if (YAHOO.util.DragDropMgr){
				YAHOO.util.DragDropMgr.lock();
			} 
			this.group = group;

			this.elHide('loading');
			this.elShow('view');
			
			this.elSetValue({
				'tl': group.title
			});

			var __self = this;
			E.on(this.gel('id'), 'keypress', function(e){
				if (e.keyCode != 13){ return false; }
				__self.save(); return true; 
			});

			var elTitle = this.gel('tl');
			setTimeout(function(){try{elTitle.focus();}catch(e){}}, 100);
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
			var group = this.group;
			var sd = {
				'tl': this.gel('tl').value
			};

			this.elHide('btnsc');
			this.elShow('btnpc');

			var __self = this;
			NS.manager.groupSave(group.id, sd, function(group){
				__self.elShow('btnsc,btnscc');
				__self.elHide('btnpc,btnpcc');
				NS.life(cfg['onSave'], __self, group);
			}, group);
		}
	});
	NS.GroupEditorWidget = GroupEditorWidget;
};