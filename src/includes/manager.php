<?php
/**
 * @package Abricos
 * @subpackage Todolist
 * @copyright 2011-2015 Alexander Kuzmin
 * @license http://opensource.org/licenses/mit-license.php MIT License
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
     *
     * @var TodoListConfig
     */
    public $config = null;

    public function __construct($module){
        parent::__construct($module);

        TodoListManager::$instance = $this;

        $this->config = new TodoListConfig(isset(Abricos::$config['module']['todolist']) ? Abricos::$config['module']['todolist'] : array());
    }

    public function IsAdminRole(){
        return $this->IsRoleEnable(TodoListAction::ADMIN);
    }

    public function IsWriteRole(){
        if ($this->IsAdminRole()){
            return true;
        }
        return $this->IsRoleEnable(TodoListAction::WRITE);
    }

    public function IsViewRole(){
        if ($this->IsWriteRole()){
            return true;
        }
        return $this->IsRoleEnable(TodoListAction::VIEW);
    }

    public function AJAX($d){

        switch ($d->do){
            case "initdata":
                return $this->InitDataToAJAX();
            case "grouplist":
                return $this->GroupListToAJAX();
            case "grouplistorder":
                return $this->GroupListSetOrder($d->grouporders);
            case "groupsave":
                return $this->GroupSaveToAJAX($d->groupid, $d->savedata);
            case "groupremove":
                return $this->GroupRemove($d->groupid);
            case "todolist":
                return $this->TodoListToAJAX();
            case "todosave":
                return $this->TodoSaveToAJAX($d->todoid, $d->savedata);
            case "todoexecute":
                return $this->TodoExecuteToAJAX($d->todoid, $d->isexecute);
            case "todoremove":
                return $this->TodoRemove($d->todoid);
        }

        return null;
    }

    public function InitDataToAJAX(){
        if (!$this->IsViewRole()){
            return null;
        }

        $ret = new stdClass();

        $obj = $this->UserConfigToAJAX();
        $ret->userconfig = $obj->userconfig;

        $obj = $this->GroupListToAJAX();
        $ret->groups = $obj->groups;

        $obj = $this->PriorityListToAJAX();
        $ret->priorities = $obj->priorities;

        $obj = $this->TodoListToAJAX();
        $ret->todos = $obj->todos;

        return $ret;
    }

    /**
     * @return TodoListUserConfig
     */
    public function UserConfig(){
        if (!$this->IsViewRole()){
            return null;
        }

        $d = TodoListQuery::UserConfig($this->db, $this->userid);
        if (empty($d)){
            // пользователь первый раз запускает модуль, необходимо заполнить таблицы для него
            TodoListQuery::UserConfigAppend($this->db, $this->userid);

            $this->PrioritySave(0, $this->ArrayToObject(array(
                "tl" => "Срочный",
                "ord" => 3,
                "clr" => "#974554"
            )));
            $this->PrioritySave(0, $this->ArrayToObject(array(
                "tl" => "Нормальный",
                "ord" => 2,
                "clr" => "",
                "def" => 1
            )));
            $this->PrioritySave(0, $this->ArrayToObject(array(
                "tl" => "Не важный",
                "ord" => 1,
                "clr" => "#56975D"
            )));
        }

        return new TodoListUserConfig($d);
    }

    public function UserConfigToAJAX(){
        $uconfig = $this->UserConfig();
        if (empty($uconfig)){
            return null;
        }

        $ret = new stdClass();
        $ret->userconfig = $uconfig->ToAJAX();
        return $ret;
    }

    public function PriorityList(){
        if (!$this->IsViewRole()){
            return null;
        }

        $list = new TodoPriorityList();
        $rows = TodoListQuery::PriorityList($this->db, $this->userid);
        while (($d = $this->db->fetch_array($rows))){
            $list->Add(new TodoPriority($d));
        }
        return $list;
    }

    public function PriorityListToAJAX(){
        $list = $this->PriorityList();
        if (empty($list)){
            return null;
        }

        $ret = new stdClass();
        $ret->priorities = $list->ToAJAX();
        return $ret;
    }

    public function PrioritySave($priorityid, $sd){
        if (!$this->IsWriteRole()){
            return null;
        }

        $priorityid = intval($priorityid);
        $utmf = Abricos::TextParser(true);

        $sd->tl = $utmf->Parser($sd->tl);

        if ($priorityid == 0){
            $priorityid = TodoListQuery::PriorityAppend($this->db, $this->userid, $sd);
        } else {
            TodoListQuery::PriorityUpdate($this->db, $this->userid, $priorityid, $sd);
        }

        $d = TodoListQuery::Priority($this->db, $this->userid, $priorityid);
        if (empty($d)){
            return null;
        }

        return new TodoPriority($d);
    }

    public function PrioritySaveToAJAX($priorityid, $sd){
        $priority = $this->PrioritySave($priorityid, $sd);

        if (empty($priority)){
            return null;
        }

        $ret = new stdClass();
        $ret->priority = $priority->ToAJAX();

        return $ret;
    }

    /**
     * @return TodoGroupList
     */
    public function GroupList(){
        if (!$this->IsViewRole()){
            return null;
        }

        $list = new TodoGroupList();
        $rows = TodoListQuery::GroupList($this->db, $this->userid);
        while (($d = $this->db->fetch_array($rows))){
            $list->Add(new TodoGroup($d));
        }
        return $list;
    }

    public function GroupListToAJAX(){
        $list = $this->GroupList();
        if (empty($list)){
            return null;
        }

        $ret = new stdClass();
        $ret->groups = $list->ToAJAX();
        return $ret;
    }

    public function GroupSave($groupid, $sd){
        if (!$this->IsWriteRole()){
            return null;
        }

        $groupid = intval($groupid);
        $utmf = Abricos::TextParser(true);

        $sd->tl = $utmf->Parser($sd->tl);

        if ($groupid == 0){
            $groupid = TodoListQuery::GroupAppend($this->db, $this->userid, $sd);
        } else {
            TodoListQuery::GroupUpdate($this->db, $this->userid, $groupid, $sd);
        }

        $d = TodoListQuery::Group($this->db, $this->userid, $groupid);
        if (empty($d)){
            return null;
        }

        return new TodoGroup($d);
    }

    public function GroupSaveToAJAX($groupid, $sd){
        $group = $this->GroupSave($groupid, $sd);

        if (empty($group)){
            return null;
        }

        $ret = new stdClass();
        $ret->group = $group->ToAJAX();

        return $ret;
    }

    public function GroupListSetOrder($orders){
        if (!$this->IsWriteRole()){
            return null;
        }

        TodoListQuery::GroupListSetOrder($this->db, $this->userid, $orders);

        return true;
    }

    public function GroupRemove($groupid){
        if (!$this->IsWriteRole()){
            return null;
        }

        TodoListQuery::GroupRemove($this->db, $this->userid, $groupid);
        TodoListQuery::TodoRemoveByGroupId($this->db, $this->userid, $groupid);

        return true;
    }

    /**
     * @return TodoList
     */
    public function TodoList(){
        if (!$this->IsViewRole()){
            return null;
        }

        $list = new TodoList();
        $rows = TodoListQuery::TodoList($this->db, $this->userid);
        while (($d = $this->db->fetch_array($rows))){
            $list->Add(new TodoItem($d));
        }

        $this->TodoDependsFill($list);

        return $list;
    }

    public function TodoListToAJAX(){
        $list = $this->TodoList();
        if (empty($list)){
            return null;
        }

        $ret = new stdClass();
        $ret->todos = $list->ToAJAX();
        return $ret;
    }

    public function Todo($todoid){
        if (!$this->IsViewRole()){
            return null;
        }

        $d = TodoListQuery::Todo($this->db, $this->userid, $todoid);
        if (empty($d)){
            return null;
        }

        $todo = new TodoItem($d);

        $list = new TodoList();
        $list->Add($todo);

        $this->TodoDependsFill($list);

        return $todo;
    }

    protected function TodoDependsFill(TodoList $list){
        $todoid = 0;
        if ($list->Count() == 1){
            $todoid = $list->GetByIndex(0)->id;
        }

        $rows = TodoListQuery::DependList($this->db, $this->userid, $todoid);

        while (($d = $this->db->fetch_array($rows))){
            $todo = $list->Get($d['tid']);
            if (empty($todo)){
                continue;
            }
            $todo->dependList->Add(new TodoDepend($d));
        }
    }

    public function TodoToAJAX($todoid){
        $todo = $this->Todo($todoid);

        if (empty($todo)){
            return null;
        }

        $ret = new stdClass();
        $ret->todo = $todo->ToAJAX();

        return $ret;
    }

    /**
     * @param integer $todoid
     * @param object $sd
     * @return integer идентификатор дела
     */
    public function TodoSave($todoid, $sd){
        if (!$this->IsWriteRole()){
            return null;
        }

        $todoid = intval($todoid);
        $utm = Abricos::TextParser(true);
        $utm->jevix->cfgSetAutoBrMode(true);
        $utmf = Abricos::TextParser(true);

        $sd->tl = $utmf->Parser($sd->tl);
        $sd->dsc = $utm->Parser($sd->dsc);
        $sd->lkid = isset($sd->lkid) ? intval($sd->lkid) : 0;

        if ($todoid == 0){
            $todoid = TodoListQuery::TodoAppend($this->db, $this->userid, $sd);
        } else {
            TodoListQuery::TodoUpdate($this->db, $this->userid, $todoid, $sd);
        }

        // обновить зависимости
        TodoListQuery::DependClear($this->db, $this->userid, $todoid);
        if (is_array($sd->deps)){
            foreach ($sd->deps as $dep){
                if (empty($dep->id) || $dep->id == $todoid){
                    continue;
                }
                TodoListQuery::DependAppend($this->db, $this->userid, $todoid, $dep->id);
            }
        }

        return $todoid;
    }

    public function TodoSaveToAJAX($todoid, $sd){
        $todoid = $this->TodoSave($todoid, $sd);
        return $this->TodoToAJAX($todoid);
    }

    public function TodoExecute($todoid, $isExecute){
        if (!$this->IsWriteRole()){
            return null;
        }

        TodoListQuery::TodoExecute($this->db, $this->userid, $todoid, $isExecute);
    }

    public function TodoExecuteToAJAX($todoid, $isExecute){
        $this->TodoExecute($todoid, $isExecute);
        return $this->TodoToAJAX($todoid);
    }

    public function TodoRemove($todoid){
        if (!$this->IsWriteRole()){
            return null;
        }

        TodoListQuery::TodoRemove($this->db, $this->userid, $todoid);
        return true;
    }

    public function ArrayToObject($o){
        if (is_array($o)){
            $ret = new stdClass();
            foreach ($o as $key => $value){
                $ret->$key = $value;
            }
            return $ret;
        } else if (!is_object($o)){
            return new stdClass();
        }
        return $o;
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

    public function Bos_MenuData(){
        if (!$this->IsViewRole()){
            return null;
        }
        $i18n = $this->module->I18n();
        return array(
            array(
                "name" => "todolist",
                "group" => "personal",
                "title" => $i18n->Translate('bosmenu.todolist'),
                "icon" => "/modules/todolist/images/todolist-24.png",
                "url" => "todolist/wspace/ws/"
            )
        );
    }

}

?>