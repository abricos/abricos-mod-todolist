/*
@package Abricos
@license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
*/

var Component = new Brick.Component();
Component.requires = {
	mod:[
		{name: '{C#MODNAME}', files: ['lib.js']}
	]
};
Component.entryPoint = function(NS){
	
	var Dom = YAHOO.util.Dom,
		E = YAHOO.util.Event,
		L = YAHOO.lang,
		buildTemplate = this.buildTemplate,
		BW = Brick.mod.widget.Widget;

	var PrioritySelectWidget = function(container, cfg){
		cfg = L.merge({
			'value': 0
		}, cfg || {});
		PrioritySelectWidget.superclass.constructor.call(this, container, {
			'buildTemplate': buildTemplate, 'tnames': 'widget,row' 
		}, cfg);
	};
	YAHOO.extend(PrioritySelectWidget, BW, {
		init: function(cfg){
			this.cfg = cfg;
		},
		render: function(){
			var TM = this._TM, lst = "";
			NS.manager.priorityList.foreach(function(prt){
				lst += TM.replace('row', {
					'id': prt.id,
					'tl': prt.title
				});
			} , 'order');
			this.elSetHTML('list', lst);
			
			this.setValue(this.cfg['value']);
		},
		onClick: function(el){
			var TId = this._TId, 
				prefix = el.id.replace(/([0-9]+$)/, ''),
				numid = el.id.replace(prefix, "");
	
			switch(prefix){
			case TId['row']['id']+'-': this.setValue(numid); return true;
			}
		},
		getValue: function(){
			var value = 0, TId = this._TId;
			NS.manager.priorityList.foreach(function(prt){
				var el = Dom.get(TId['row']['id']+'-'+prt.id);
				if (Dom.hasClass(el, 'select')){
					value = prt.id;
				}
			});
			return value;
		},
		setValue: function(value){
			var TId = this._TId;
			NS.manager.priorityList.foreach(function(prt){
				var el = Dom.get(TId['row']['id']+'-'+prt.id);
				Dom.setStyle(el, 'color', prt.color);
				if (prt.id == value){
					Dom.addClass(el, 'select');
				}else{
					Dom.removeClass(el, 'select');
				}
			});			
		}
	});
	NS.PrioritySelectWidget = PrioritySelectWidget;
};