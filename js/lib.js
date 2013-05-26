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
	
	
	var Depend = function(d){
		Depend.superclass.constructor.call(this, d);
	};
	YAHOO.extend(Depend, SysNS.Item, {});
	NS.Depend = Depend;
	
	var DependList = function(d){
		DependList.superclass.constructor.call(this, d, Depend);
	};
	YAHOO.extend(DependList, SysNS.ItemList, {});
	NS.DependList = DependList;
	
	
	var Priority = function(d){
		d = L.merge({
			'tl': '',
			'def': 0,
			'ord': 0,
			'clr': ''
		}, d || {});
		Priority.superclass.constructor.call(this, d);
	};
	YAHOO.extend(Priority, SysNS.Item, {
		update: function(d){
			this.title = d['tl'];
			this.color = d['clr'];
			this.isDefault = (d['def']|0)>0;
			this.order = d['ord']|0;
		}
	});
	NS.Priority = Priority;
	
	var PriorityList = function(d){
		PriorityList.superclass.constructor.call(this, d, Priority);
	};
	YAHOO.extend(PriorityList, SysNS.ItemList, {
		getDefaultId: function(){
			var defid = 0;
			this.foreach(function(priotiry){
				if (priotiry.isDefault){
					defid = priotiry.id;
					return true;
				}
			});
			return defid;
		}
	});
	NS.PriorityList = PriorityList;
	
	var Group = function(d){
		d = L.merge({
			'tl': '',
			'ord': 0
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
			this.order = d['ord']|0;
		}
	});
	NS.Group = Group;
	
	var GroupList = function(d){
		GroupList.superclass.constructor.call(this, d, Group, {
			'order': '!order'
		});
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
			'ord': 0,
			'ptm': 0,
			'exc': 0,
			'dl': (new Date()).getTime()/1000,
			'deps': []
		}, d || {});
		Todo.superclass.constructor.call(this, d);
	};
	YAHOO.extend(Todo, SysNS.Item, {
		init: function(d){
			this.dependList = new NS.DependList();
			Todo.superclass.init.call(this, d);
		},
		update: function(d){
			this.title = d['tl'];
			this.descript = d['dsc'];
			this.groupid = d['gid']|0;
			this.priorityid = d['prtid']|0;
			this.likeid = d['lkid']|0;
			this.order = d['ord']|0;
			this.plantime = d['ptm']|0;
			this.executed = d['exc']|0; // время выполнения
			this.isExecute = this.executed > 0;
			this.date = d['dl']|0;
			
			this.dependList.clear();
			this.dependList.update(d['deps']);
			
			this._cachePriorityId = null;
			this._cachePriority = null;
			
			this._cacheGroupId = null;
			this._cacheGroup = null;
			
			this._cacheFullDepends = null;
			this._cacheChilds = null;
		},
		getPriority: function(){
			if (this._cachePriorityId == this.priorityid){
				return this._cachePriority;
			}
			this._cachePriorityId = this.priorityid;
			this._cachePriority = NS.manager.priorityList.get(this.priorityid);
			return this._cachePriority;
		},
		getGroup: function(){
			if (this._cacheGroupId == this.groupid){
				return this._cacheGroup;
			}
			this._cacheGroupId = this.groupid;
			this._cacheGroup = NS.manager.groupList.get(this.groupid);
			return this._cacheGroup;
		},
		
		_fillDepends: function(deps){ // рекурсивный метод заполнения массива
			deps = deps || {};
			
			this.dependList.foreach(function(dep){
				deps[deps.id] = true;
			});
			
			for (var id in deps){
				if (id == this.id){ continue; }
				
				var todo = NS.manager.todoList.get(id);
				if (!L.isValue(todo)){ continue; }
				
				todo._fillDepends(deps);
			}
		},
		getFullDepends: function(){ // список всех дел от которых зависит это дело, включая самые верхнии
			if (L.isValue(this._cacheFullDepends)){
				return this._cacheFullDepends;
			}
			var ret = [], deps = {};
			
			this._fillDepends(deps);

			for (var id in deps){
				if (id == this.id){ continue; }

				var todo = NS.manager.todoList.get(id);
				if (!L.isValue(todo)){ continue; }
				ret[ret.length] = id;
			}
			
			this._cacheFullDepends = ret;
			
			return ret;
		},
		checkTodoDepend: function(todoid){ // проверить - зависит ли это дело от todoid
			var ids = this.getFullDepends();
			for (var i=0;i<ids.length;i++){
				if (ids[i] == todoid){ return true; }
			}
			
			return false;
		},
		getFullChilds: function(){ // список всех зависимых дел от этого дела
			if (L.isValue(this._cacheChilds)){ 
				return this._cacheChilds;
			}
			
			var id = this.id, ret = [];
			NS.manager.todoList.foreach(function(todo){
				if (todo.id == id){ return; }
				
				if (todo.checkTodoDepend(id)){
					ret[ret.length] = todo.id
				}
			});
			this._cacheChilds = ret;
			return ret;
		}
	});
	NS.Todo = Todo;
	
	var todoListOrder = function(t1, t2){
		if (!t1.isExecute && t2.isExecute){ return -1; }
		if (t1.isExecute && !t2.isExecute){ return 1; }
		
		var p1 = t1.getPriority(),
			p2 = t2.getPriority();
		var po1 = L.isValue(p1) ? p1.order : 0,
			po2 = L.isValue(p2) ? p2.order : 0;
		
		if (po1 > po2){ return -1; }
		if (po1 < po2){ return 1; }
		
		var g1 = t1.getGroup(),
			g2 = t2.getGroup();
		var go1 = L.isValue(g1) ? g1.order : 0,
			go2 = L.isValue(g2) ? g2.order : 0;

		if (go1 > go2){ return -1; }
		if (go1 < go2){ return 1; }

		return 0;
	};
	
	var TodoList = function(d){
		TodoList.superclass.constructor.call(this, d, Todo, {
			'order': todoListOrder
		});
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
		groupRemove: function(groupid, callback){
			var __self = this;
			this.ajax({
				'do': 'groupremove',
				'groupid': groupid
			}, function(d){
				__self.groupList.remove(groupid);
				var tids = [];
				__self.todoList.foreach(function(todo){
					if (todo.groupid == groupid){
						tids[tids.length] = todo.id;
					}
				});
				for (var i=0; i<tids.length; i++){
					__self.todoList.remove(tids[i]);
				}
				NS.life(callback);
			});			
		},
		groupListOrderSave: function(orders, callback){
			var __self = this;
			this.ajax({
				'do': 'grouplistorder',
				'grouporders': orders
			}, function(d){
				__self._updateGroupList(d);
				NS.life(callback);
			});
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
		},
		todoExecute: function(todo, isExecute, callback){
			var __self = this;
			this.ajax({
				'do': 'todoexecute',
				'todoid': todo.id,
				'isexecute': isExecute
			}, function(d){
				if (L.isValue(d) && L.isValue(d['todo'])){
					todo.update(d['todo']);
					__self._todoCountInGroupCalculate();
					__self.onTodoListChanged();
				}
				NS.life(callback, todo);
			});			
		},
		todoRemove: function(todoid, callback){
			var __self = this;
			this.ajax({
				'do': 'todoremove',
				'todoid': todoid
			}, function(d){
				__self.todoList.remove(todoid);
				__self._todoCountInGroupCalculate();
				__self.onTodoListChanged();
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