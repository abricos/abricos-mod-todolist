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
	
	NS.textToEdit = function(s){
		return s.replace(/<br\/>/gi, '');
	};

	NS.textToView = function(s){
		return s.replace(/<br\/>/gi, ' ');
	};

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
			'tl': '',
			'gid': 0,
			'prtid': 0,
			'lkid': 0
		}, d || {});
		Todo.superclass.constructor.call(this, d);
	};
	YAHOO.extend(Todo, SysNS.Item, {
		update: function(d){
			this.title = d['tl'];
			this.groupid = d['gid']|0;
			this.priorityid = d['prtid']|0;
			this.likeid = d['lkid']|0;
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
					__self._updateTodoList(d);
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
		groupListLoad: function(callback){
			var __self = this;
			this.ajax({
				'do': 'grouplist'
			}, function(d){
				__self._updateGroupList(d);
				NS.life(callback);
			});
		},
		groupSave: function(groupid, sd, callback){
			var list = this.groupList, group = null;
			if (groupid > 0){
				group = list.get(groupid);
			}
			this.ajax({
				'do': 'groupsave',
				'groupid': groupid,
				'savedata': sd
			}, function(d){
				if (L.isValue(d) && L.isValue(d['group'])){
					if (L.isNull(group)){
						group = new Group(d['group']);
						list.add(group);
					}else{
						group.update(d['group']);
					}
				}
				NS.life(callback, group);
			});
		},
		
		_updateTodoList: function(d){
			if (!L.isValue(d) || !L.isValue(d['todos']) || !L.isValue(d['todos']['list'])){
				return null;
			}
			this.todoList.update(d['todos']['list']);
		},
		todoListLoad: function(callback){
			var __self = this;
			this.ajax({
				'do': 'todolist'
			}, function(d){
				__self._updateTodoList(d);
				NS.life(callback);
			});
		},
		todoSave: function(todoid, sd, callback){
			var list = this.todoList, todo = null;
			if (todoid > 0){
				todo = list.get(todoid);
			}
			this.ajax({
				'do': 'todosave',
				'todoid': todoid,
				'savedata': sd
			}, function(d){
				if (L.isValue(d) && L.isValue(d['todo'])){
					if (L.isNull(todo)){
						todo = new Todo(d['todo']);
						list.add(todo);
					}else{
						todo.update(d['todo']);
					}
				}
				NS.life(callback, todo);
			});
		},
		todoListOrderSave: function(orders){
			Brick.console(orders);
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