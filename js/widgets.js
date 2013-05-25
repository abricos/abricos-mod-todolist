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
		LNG = this.language,
		BW = Brick.mod.widget.Widget;
	
	var SelectWidget = function(container, list, cfg){
		cfg = L.merge({
			'value': null,
			'notEmpty': false
		}, cfg || {});
		SelectWidget.superclass.constructor.call(this, container, {
			'buildTemplate': buildTemplate, 'tnames': 'widget,select,optionempty,option' 
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
			if (!this.cfg['notEmpty']){
				lst += TM.replace('optionempty');
			}
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
	
	var TimeTypeSelectWidget = function(container, cfg){
		cfg = L.merge({
			'notEmpty': true
		}, cfg || {});
		
		var list = new NS.DictList();
		for (var i=1;i<=3;i++){
			list.add(new NS.Dict({
				"id": i,
				'tl': LNG.get('dict.timetype.'+i)
			}));
		}
		
		TimeTypeSelectWidget.superclass.constructor.call(this, container, list, cfg);
	};
	YAHOO.extend(TimeTypeSelectWidget, SelectWidget, {});
	NS.TimeTypeSelectWidget = TimeTypeSelectWidget;
	
	var TimeInputWidget = function(container, cfg){
		cfg = L.merge({
			'value': 0
		}, cfg || {});
		TimeInputWidget.superclass.constructor.call(this, container, {
			'buildTemplate': buildTemplate, 'tnames': 'time' 
		}, cfg);
	};
	YAHOO.extend(TimeInputWidget, BW, {
		init: function(cfg){
			this.cfg = cfg;
		},
		onLoad: function(cfg){
			this.timeTypeWidget = new NS.TimeTypeSelectWidget(this.gel('ttype'));
			this.setValue(cfg['value']|0);
		},
		getValue: function(){
			var sec = this.gel('input').value|0;
			var TTYPE = NS.TIMETYPE;
			switch(this.timeTypeWidget.getValue()|0){
			case TTYPE['MINUTE']:	sec = sec*60; break;
			case TTYPE['HOUR']:		sec = sec*60*60; break;
			case TTYPE['DAY']:		sec = sec*60*60*24; break;
			}
			return sec;
		},
		setValue: function(value){
			value = value|0;
			var m = 60, h = 60*m, d = 24*h, ttime = 1;
			if (value == 0){
				ttime = 1;
			}else if (Math.round(value/d)*d == value){
				ttime = NS.TIMETYPE.DAY;
				value = value/d;
			}else if (Math.round(value/h)*h == value){
				ttime = NS.TIMETYPE.HOUR;
				value = value/h;
			}
			this.timeTypeWidget.setValue(ttime);
			this.gel('input').value = value;
		}
	});
	NS.TimeInputWidget = TimeInputWidget;
	
};