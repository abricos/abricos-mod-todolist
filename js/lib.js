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
	
	NS.TIMETYPE = {
		'MINUTE': 1,
		'HOUR': 2,
		'DAY': 3
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
	
	var Dict = function(d){
		d = L.merge({
			'tl': ''
		}, d || {});
		Dict.superclass.constructor.call(this, d);
	};
	YAHOO.extend(Dict, SysNS.Item, {
		update: function(d){
			this.title = d['tl'];
		}
	});
	NS.Dict = Dict;
	
	var DictList = function(d){
		DictList.superclass.constructor.call(this, d, Dict);
	};
	YAHOO.extend(DictList, SysNS.ItemList, {});
	NS.DictList = DictList;
	
	var Priority = function(d){
		d = L.merge({
			'tl': ''
		}, d || {});
		Priority.superclass.constructor.call(this, d);
	};
	YAHOO.extend(Priority, SysNS.Item, {
		init: function(d){
			this.todoCount = 0;
			Priority.superclass.init.call(this, d);
		},
		update: function(d){
			this.title = d['tl'];
		}
	});
	NS.Priority = Priority;
	
	var PriorityList = function(d){
		PriorityList.superclass.constructor.call(this, d, Priority);
	};
	YAHOO.extend(PriorityList, SysNS.ItemList, {});
	NS.PriorityList = PriorityList;
	
	
	var Group = function(d){
		d = L.merge({
			'tl': ''
		}, d || {});
		Group.superclass.constructor.call(this, d);
	};
	YAHOO.extend(Group, SysNS.Item, {
		init: function(d){
			this.todoCount = 0;
			Group.superclass.init.call(this, d);
		},
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
			'dsc': '',
			'gid': 0,
			'prtid': 0,
			'lkid': 0,
			'etm': 0,
			'dl': (new Date()).getTime()/1000
		}, d || {});
		Todo.superclass.constructor.call(this, d);
	};
	YAHOO.extend(Todo, SysNS.Item, {
		update: function(d){
			this.title = d['tl'];
			this.descript = d['dsc'];
			this.groupid = d['gid']|0;
			this.priorityid = d['prtid']|0;
			this.likeid = d['lkid']|0;
			this.exectime = d['etm']|0;
			this.date = d['dl']|0;
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
			
			this.priorityList = new PriorityList();
			this.groupList = new GroupList();
			this.todoList = new TodoList();
			
			this.todoListChangedEvent = new YAHOO.util.CustomEvent('todoListChangedEvent');
			
			var __self = this;
			R.load(function(){
				__self.ajax({
					'do': 'initdata'
				}, function(d){
					__self._updatePriorityList(d);
					__self._updateGroupList(d);
					__self._updateTodoList(d);
					NS.life(callback, __self);
				});
			});
		},
		onTodoListChanged: function(){
			this.todoListChangedEvent.fire();
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
		
		_updatePriorityList: function(d){
			if (!L.isValue(d) || !L.isValue(d['priorities']) || !L.isValue(d['priorities']['list'])){
				return null;
			}
			this.priorityList.update(d['priorities']['list']);
		},
		priorityListLoad: function(callback){
			var __self = this;
			this.ajax({
				'do': 'prioritylist'
			}, function(d){
				__self._updatePriorityList(d);
				NS.life(callback);
			});
		},
		prioritySave: function(priorityid, sd, callback){
			var list = this.priorityList, priority = null;
			if (priorityid > 0){
				priority = list.get(priorityid);
			}
			this.ajax({
				'do': 'prioritysave',
				'priorityid': priorityid,
				'savedata': sd
			}, function(d){
				if (L.isValue(d) && L.isValue(d['priority'])){
					if (L.isNull(priority)){
						priority = new Priority(d['priority']);
						list.add(priority);
					}else{
						priority.update(d['priority']);
					}
				}
				NS.life(callback, priority);
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
		groupListOrderSave: function(orders){
			Brick.console(orders);
		},
		
		_updateTodoList: function(d){
			if (!L.isValue(d) || !L.isValue(d['todos']) || !L.isValue(d['todos']['list'])){
				return null;
			}
			this.todoList.update(d['todos']['list']);
			this._todoCountInGroupCalculate();
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
			var __self = this;
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
					__self._todoCountInGroupCalculate();
					__self.onTodoListChanged();
				}
				NS.life(callback, todo);
			});
		},
		todoListOrderSave: function(orders){
			Brick.console(orders);
		},
		_todoCountInGroupCalculate: function(){
			var gs = {};
			this.todoList.foreach(function(todo){
				var gid = todo.groupid|0;
				gs[gid] = (gs[gid]|0)+1;
			});
			this.groupList.foreach(function(group){
				group.todoCount = gs[group.id]|0;
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