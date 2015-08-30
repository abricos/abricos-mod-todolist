<?php
/**
 * @package Abricos
 * @subpackage Todolist
 * @copyright 2011-2015 Alexander Kuzmin
 * @license http://opensource.org/licenses/mit-license.php MIT License
 * @author Alexander Kuzmin <roosit@abricos.org>
 */

/**
 * Class TodoListModule
 */
class TodoListModule extends Ab_Module {

    /**
     * @var TodoListModule
     */
    public static $instance = null;

    private $_manager = null;

    public function TodoListModule(){
        // версия модуля
        $this->version = "0.1.3";

        // имя модуля
        $this->name = "todolist";

        $this->takelink = "todolist";

        $this->permission = new TodoListPermission($this);

        TodoListModule::$instance = $this;
    }

    /**
     * @return TodoListManager
     */
    public function GetManager(){
        if (is_null($this->_manager)){
            require_once 'includes/manager.php';
            $this->_manager = new TodoListManager($this);
        }
        return $this->_manager;
    }

    public function GetContentName(){
        return "";
    }

    public function Bos_IsMenu(){
        return true;
    }
}

class TodoListAction {
    const VIEW = 10;
    const WRITE = 30;
    const ADMIN = 50;
}

class TodoListPermission extends Ab_UserPermission {

    public function TodoListPermission(TodoListModule $module){

        $defRoles = array(
            new Ab_UserRole(TodoListAction::VIEW, Ab_UserGroup::REGISTERED),
            new Ab_UserRole(TodoListAction::VIEW, Ab_UserGroup::ADMIN),

            new Ab_UserRole(TodoListAction::WRITE, Ab_UserGroup::REGISTERED),
            new Ab_UserRole(TodoListAction::WRITE, Ab_UserGroup::ADMIN),

            new Ab_UserRole(TodoListAction::ADMIN, Ab_UserGroup::ADMIN),
        );

        parent::__construct($module, $defRoles);
    }

    public function GetRoles(){
        return array(
            TodoListAction::VIEW => $this->CheckAction(TodoListAction::VIEW),
            TodoListAction::WRITE => $this->CheckAction(TodoListAction::WRITE),
            TodoListAction::ADMIN => $this->CheckAction(TodoListAction::ADMIN)
        );
    }
}

Abricos::ModuleRegister(new TodoListModule());


?>