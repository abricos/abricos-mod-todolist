<?php
/**
 * @package Abricos
 * @subpackage TodoList
 * @license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
 * @author Alexander Kuzmin <roosit@abricos.org>
 */

class TodoListQuery {
	
	public static function GroupList(Ab_Database $db, $userid){
		$sql = "
			SELECT
				groupid as id,
				parentgroupid as pid,
				title as tl,
				ord
			FROM ".$db->prefix."todolist_group
			WHERE userid=".bkint($userid)."
		";
		return $db->query_read($sql);
	}
	
	public static function TodoList(Ab_Database $db, $userid){
		$sql = "
			SELECT
				todoid as id,
				groupid as gid,
				priorityid as prtid,
				likeid as lkid,
				title as tl,
				ord
			FROM ".$db->prefix."todolist
			WHERE userid=".bkint($userid)." AND deldate=0
		";
		return $db->query_read($sql);
	}
	
}

?>