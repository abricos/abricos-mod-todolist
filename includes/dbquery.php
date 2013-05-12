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
	
	public static $TodoFields = "
		todoid as id,
		groupid as gid,
		priorityid as prtid,
		likeid as lkid,
		title as tl,
		ord
	";
	public static function TodoList(Ab_Database $db, $userid){
		$sql = "
			SELECT
				".TodoListQuery::$TodoFields."
			FROM ".$db->prefix."todolist
			WHERE userid=".bkint($userid)." AND deldate=0
		";
		return $db->query_read($sql);
	}
	
	public static function Todo(Ab_Database $db, $userid, $todoid){
		$sql = "
			SELECT
				".TodoListQuery::$TodoFields."
			FROM ".$db->prefix."todolist
			WHERE userid=".bkint($userid)." AND todoid=".bkint($todoid)." AND deldate=0
			LIMIT 1
		";
		return $db->query_first($sql);
	}
	
	public static function TodoAppend(Ab_Database $db, $userid, $sd){
		$sql = "
			INSERT INTO ".$db->prefix."todolist
			(userid, title) VALUES (
				".bkint($userid).",
				'".bkstr($sd->tl)."'
			)
		";
		$db->query_write($sql);
		return $db->insert_id();
	}
	public static function TodoUpdate(Ab_Database $db, $userid, $todoid, $sd){
		$sql = "
			UPDATE ".$db->prefix."todolist
			SET
				title='".bkstr($sd->tl)."'
			WHERE userid=".bkint($userid)." AND todoid=".bkint($todoid)."
			LIMIT 1
		";
		$db->query_write($sql);
	}
}

?>