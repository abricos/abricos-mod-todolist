<?php 
/**
 * @package Abricos
 * @subpackage TodoList
 * @license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
 * @author Alexander Kuzmin <roosit@abricos.org>
 */

require_once 'dbquery.php';

class TodoGroup extends AbricosItem {
	public $title;
	public $order;
	
	public function __construct($d){
		parent::__construct($d);
		$this->title = strval($d['tl']);
		$this->order = intval($d['ord']);
	}
	
	public function ToAJAX(){
		$ret = parent::ToAJAX();
		$ret->tl = $this->title;
		$ret->ord = $this->order;
		return $ret;
	}
}

class TodoGroupList extends AbricosList { }


class TodoPriority extends AbricosItem {
	public $title;
	public $color;
	public $isdefault;
	public $order;
	
	public function __construct($d){
		parent::__construct($d);
		$this->title = strval($d['tl']);
		$this->color = strval($d['clr']);
		$this->isdefault = $d['def']>0;
		$this->order = intval($d['ord']);
	}
	
	public function ToAJAX(){
		$ret = parent::ToAJAX();
		$ret->tl = $this->title;
		$ret->clr = $this->color;
		$ret->def = $this->isdefault;
		$ret->ord = $this->order;
		return $ret;
	}
}

class TodoPriorityList extends AbricosList { }

class TodoTagGroup extends AbricosItem {
	public $title;
	public $order;

	public function __construct($d){
		parent::__construct($d);
		$this->title = strval($d['tl']);
		$this->order = intval($d['ord']);
	}

	public function ToAJAX(){
		$ret = parent::ToAJAX();
		$ret->tl = $this->title;
		$ret->ord = $this->order;
		return $ret;
	}
}
class TodoTagGroupList extends AbricosList { }


class TodoTag extends AbricosItem {
	public $title;
	public $taggroupid;
	public $order;
	
	public function __construct($d){
		parent::__construct($d);
		$this->title = strval($d['tl']);
		$this->taggroupid = intval($d['tgid']);
		$this->order = intval($d['ord']);
	}

	public function ToAJAX(){
		$ret = parent::ToAJAX();
		$ret->tl = $this->title;
		$ret->tgid = $this->taggroupid;
		$ret->ord = $this->order;
		return $ret;
	}
}
class TodoTagList extends AbricosList { }

class TodoItem extends AbricosItem {
	
	public $title;
	public $descript;
	public $groupid;
	public $priorityid;
	public $likeid;
	public $plantime;
	public $executed;
	public $isExecute;
	public $date;
	
	public function __construct($d){
		parent::__construct($d);
		
		$this->title = strval($d['tl']);
		$this->descript = strval($d['dsc']);
		$this->groupid = intval($d['gid']);
		$this->priorityid = intval($d['prtid']);
		$this->likeid = intval($d['lkid']);
		$this->plantime = intval($d['ptm']);
		$this->executed = intval($d['exc']);
		$this->isExecute = $this->executed > 0;
		$this->date = intval($d['dl']);
	}
	
	public function ToAJAX(){
		$ret = parent::ToAJAX();
		$ret->tl = $this->title;
		$ret->dsc = $this->descript;
		$ret->gid = $this->groupid;
		$ret->prtid = $this->priorityid;
		$ret->lkid = $this->likeid;
		$ret->ptm = $this->plantime;
		$ret->exc = $this->executed;
		$ret->dl = $this->date;
		
		return $ret;
	}
}

class TodoList extends AbricosList { }

class TodoDepend extends AbricosItem {
	
	public $depends = array();
	
	public function __construct($d){
		parent::__construct($d);
		
		$this->AddTodoDepend($d['did']);
	}
	
	/**
	 * Добавить зависимость от дела
	 * @param integer $todoid
	 */
	public function AddTodoDepend($todoid){
		array_push($this->depends, $todoid);
	}
	
	public function ToAJAX(){
		$ret = parent::ToAJAX();
		$ret->deps = $this->depends;
		return $ret;
	}
}

class TodoDependList extends AbricosList { }

class TodoListUserConfig {
	public function __construct($d){
		
	}
	
	public function ToAJAX(){
		$ret = new stdClass();
		return $ret;
	}
}

class TodoListConfig {

	/**
	 * @var TodoListConfig
	 */
	public static $instance;

	public function __construct($cfg){
		TodoListConfig::$instance = $this;

		if (empty($cfg)){ $cfg = array(); }

		/*
		 if (isset($cfg['subscribeSendLimit'])){
		$this->subscribeSendLimit = intval($cfg['subscribeSendLimit']);
		}
		/**/
	}
}

?>