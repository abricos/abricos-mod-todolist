<?php
/**
 * @package Abricos
 * @subpackage TodoList
 * @license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
 * @author Alexander Kuzmin <roosit@abricos.org>
 */

require_once 'classes.php';

class TodoListManager extends Ab_ModuleManager {
	
	/**
	 * 
	 * @var TodoListModule
	 */
	public $module = null;
	
	/**
	 * @var TodoListManager
	 */
	public static $instance = null;
	
	/**
	 * Конфиг
	 * @var TodoListConfig
	 */
	public $config = null;
	
	public function __construct($module){
		parent::__construct($module);

		TodoListManager::$instance = $this;

		$this->config = new TodoListConfig(Abricos::$config['module']['todolist']);
	}
	
	public function IsAdminRole(){
		return $this->IsRoleEnable(TodoListAction::ADMIN);
	}
	
	public function IsWriteRole(){
		if ($this->IsAdminRole()){ return true; }
		return $this->IsRoleEnable(TodoListAction::WRITE);
	}
	
	public function IsViewRole(){
		if ($this->IsWriteRole()){ return true; }
		return $this->IsRoleEnable(TodoListAction::VIEW);
	}

	public function AJAX($d){

		switch($d->do){
			case "initdata": return $this->InitDataToAJAX();
			case "grouplist": return $this->GroupListToAJAX();
			case "todolist": return $this->TodoListToAJAX();
		}

		return null;
	}
	
	public function InitDataToAJAX(){
		if (!$this->IsViewRole()){ return null; }
		
		$ret = new stdClass();
		
		$obj = $this->GroupListToAJAX();
		$ret->groups = $obj->groups;

		$obj = $this->TodoListToAJAX();
		$ret->todos = $obj->todos;
		
		return $ret;
	}
	
	/**
	 * @return TodoGroupList
	 */
	public function GroupList(){
		if (!$this->IsViewRole()){ return null; }
		
		$list = new TodoGroupList();
		$rows = TodoListQuery::GroupList($this->db, $this->userid);
		while (($d = $this->db->fetch_array($rows))){
			$list->Add(new TodoGroup($d));
		}
		return $list;
	}
	
	public function GroupListToAJAX(){
		$list = $this->GroupList();
		if (empty($list)){ return null; }
		
		$ret = new stdClass();
		$ret->groups = $list->ToAJAX();
		return $ret;
	}
	
	/**
	 * @return TodoList
	 */
	public function TodoList(){
		if (!$this->IsViewRole()){ return null; }

		$list = new TodoList();
		$rows = TodoListQuery::TodoList($this->db, $this->userid);
		while (($d = $this->db->fetch_array($rows))){
			$list->Add(new TodoItem($d));
		}
		return $list;
	}
	
	public function TodoListToAJAX(){
		$list = $this->TodoList();
		if (empty($list)){ return null; }
		
		$ret = new stdClass();
		$ret->todos = $list->ToAJAX();
		return $ret;
	}

	public function ToArray($rows, &$ids1 = "", $fnids1 = 'uid', &$ids2 = "", $fnids2 = '', &$ids3 = "", $fnids3 = ''){
		$ret = array();
		while (($row = $this->db->fetch_array($rows))){
			array_push($ret, $row);
			if (is_array($ids1)){
				$ids1[$row[$fnids1]] = $row[$fnids1];
			}
			if (is_array($ids2)){
				$ids2[$row[$fnids2]] = $row[$fnids2];
			}
			if (is_array($ids3)){
				$ids3[$row[$fnids3]] = $row[$fnids3];
			}
		}
		return $ret;
	}
	
	public function ToArrayId($rows, $field = "id"){
		$ret = array();
		while (($row = $this->db->fetch_array($rows))){
			$ret[$row[$field]] = $row;
		}
		return $ret;
	}
	
}

?>