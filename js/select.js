/*
@package Abricos
@license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
*/

var Component = new Brick.Component();
Component.requires = {
	mod:[
		// {name: '{C#MODNAME}', files: ['lib.js']}
	]
};
Component.entryPoint = function(NS){
	
	var Dom = YAHOO.util.Dom,
		E = YAHOO.util.Event,
		L = YAHOO.lang,
		buildTemplate = this.buildTemplate,
		BW = Brick.mod.widget.Widget;
	
	var SelectWidget = function(container, list, cfg){
		cfg = L.merge({
			'value': null
		}, cfg || {});
		SelectWidget.superclass.constructor.call(this, container, {
			'buildTemplate': buildTemplate, 'tnames': 'widget,select,option' 
		}, list, cfg);
	};
	YAHOO.extend(SelectWidget, BW, {
		init: function(list, cfg){
			this.list = list;
			this.cfg = cfg;
			this._value = cfg['value'];
		},
		getValue: function(){
			return this.gel('select.id').value;
		},
		setValue: function(value){
			this._value = value;
			this.gel('select.id').value = value;
		},
		render: function(){
			var TM = this._TM, value = this._value;
	
			var lst = "";
			this.list.foreach(function(item){
				lst += TM.replace('option',{
					'id': item.id,
					'tl': item.title
				});
			});
			
			this.gel('id').innerHTML = TM.replace('select', {'rows': lst});
			this.setValue(value);
		}			
	});
	NS.SelectWidget = SelectWidget;	
};