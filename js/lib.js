/*
@package Abricos
@license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
*/

var Component = new Brick.Component();
Component.requires = { 
	mod:[
        {name: 'widget', files: ['notice.js']},
        {name: '{C#MODNAME}', files: ['roles.js']}
	]		
};
Component.entryPoint = function(NS){

	var L = YAHOO.lang,
		R = NS.roles;
	
	var SysNS = Brick.mod.sys;

	var buildTemplate = this.buildTemplate;
	buildTemplate({},'');
	
	NS.lif = function(f){return L.isFunction(f) ? f : function(){}; };
	NS.life = function(f, p1, p2, p3, p4, p5, p6, p7){
		f = NS.lif(f); f(p1, p2, p3, p4, p5, p6, p7);
	};
	NS.Item = SysNS.Item;
	NS.ItemList = SysNS.ItemList;
	
	var WS = "#app={C#MODNAMEURI}/wspace/ws/";
	
	NS.navigator = {
		'home': function(){ return WS; },
		'manager': {
			'view': function(){
				return WS+'manager/ManagerWidget/';
			}
		},
		'go': function(url){
			Brick.Page.reload(url);
		}
	};
	
	var Group = function(d){
		d = L.merge({
			'tl': ''
		}, d || {});
		Group.superclass.constructor.call(this, d);
	};
	YAHOO.extend(Group, SysNS.Item, {
		update: function(d){
			this.title = d['tl'];
		}
	});
	NS.Group = Group;
	
	var GroupList = function(d){
		GroupList.superclass.constructor.call(this, d, Group);
	};
	YAHOO.extend(GroupList, SysNS.ItemList, {});
	NS.GroupList = GroupList;
	
	
	var Todo = function(d){
		d = L.merge({
			'tl': ''
		}, d || {});
		Todo.superclass.constructor.call(this, d);
	};
	YAHOO.extend(Todo, SysNS.Item, {
		update: function(d){
			this.title = d['tl'];
		}
	});
	NS.Todo = Todo;
	
	var TodoList = function(d){
		TodoList.superclass.constructor.call(this, d, Todo);
	};
	YAHOO.extend(TodoList, SysNS.ItemList, {});
	NS.TodoList = TodoList;
	
	
	var Manager = function (callback){
		this.init(callback);
	};
	Manager.prototype = {
		init: function(callback){
			NS.manager = this;
			
			this.groupList = new GroupList();
			this.todoList = new TodoList();
			
			var __self = this;
			R.load(function(){
				__self.ajax({
					'do': 'initdata'
				}, function(d){
					__self._updateGroupList(d);
					NS.life(callback, __self);
				});
			});
		},
		ajax: function(data, callback){
			data = data || {};

			Brick.ajax('{C#MODNAME}', {
				'data': data,
				'event': function(request){
					NS.life(callback, request.data);
				}
			});
		},
		_updateGroupList: function(d){
			if (!L.isValue(d) || !L.isValue(d['groups']) || !L.isValue(d['groups']['list'])){
				return null;
			}
			this.groupList.update(d['groups']['list']);
		},
		groupList: function(callback){
			var __self = this;
			this.ajax({
				'do': 'grouplist'
			}, function(d){
				__self._updateGroupList(d);
				NS.life(callback);
			});
		},
		_updateGroupList: function(d){
			if (!L.isValue(d) || !L.isValue(d['todos']) || !L.isValue(d['todos']['list'])){
				return null;
			}
			this.todoList.update(d['todos']['list']);
		},
		todoList: function(callback){
			this.ajax({
				'do': 'todolist'
			}, function(d){
				NS.life(callback);
			});
		}
	};
	NS.manager = null;
	
	NS.initManager = function(callback){
		if (L.isNull(NS.manager)){
			NS.manager = new Manager(callback);
		}else{
			NS.life(callback, NS.manager);
		}
	};
	
};