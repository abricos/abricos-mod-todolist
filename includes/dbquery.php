<?php
/**
 * @package Abricos
 * @subpackage TodoList
 * @license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
 * @author Alexander Kuzmin <roosit@abricos.org>
 */

class TodoListQuery {
	
	public static $GroupFields = "
		groupid as id,
		parentgroupid as pid,
		title as tl,
		ord
	";
	
	public static function GroupList(Ab_Database $db, $userid){
		$sql = "
			SELECT
				".TodoListQuery::$GroupFields."
			FROM ".$db->prefix."todolist_group
			WHERE userid=".bkint($userid)."
		";
		return $db->query_read($sql);
	}
	
	public static function Group(Ab_Database $db, $userid, $groupid){
		$sql = "
			SELECT
				".TodoListQuery::$GroupFields."
			FROM ".$db->prefix."todolist_group
			WHERE userid=".bkint($userid)." AND groupid=".bkint($groupid)." AND deldate=0
			LIMIT 1
		";
		return $db->query_first($sql);
	}
	
	public static function GroupAppend(Ab_Database $db, $userid, $d){
		$sql = "
			INSERT INTO ".$db->prefix."todolist_group
			(userid, title) VALUES (
				".bkint($userid).",
				'".bkstr($d->tl)."'
			)
		";
		$db->query_write($sql);
		return $db->insert_id();
	}
	public static function GroupUpdate(Ab_Database $db, $userid, $groupid, $d){
		$sql = "
			UPDATE ".$db->prefix."todolist_group
			SET
				title='".bkstr($d->tl)."'
			WHERE userid=".bkint($userid)." AND groupid=".bkint($groupid)."
			LIMIT 1
		";
		$db->query_write($sql);
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
	
	public static function TodoAppend(Ab_Database $db, $userid, $d){
		$sql = "
			INSERT INTO ".$db->prefix."todolist
			(userid, title, groupid, priorityid, likeid) VALUES (
				".bkint($userid).",
				'".bkstr($d->tl)."',
				".bkint($d->gid).",
				".bkint($d->prtid).",
				".bkint($d->lkid)."
			)
		";
		$db->query_write($sql);
		return $db->insert_id();
	}
	public static function TodoUpdate(Ab_Database $db, $userid, $todoid, $d){
		$sql = "
			UPDATE ".$db->prefix."todolist
			SET
				title='".bkstr($d->tl)."',
				groupid=".bkint($d->gid).",
				priorityid=".bkint($d->prtid).",
				likeid=".bkint($d->lkid)."
			WHERE userid=".bkint($userid)." AND todoid=".bkint($todoid)."
			LIMIT 1
		";
		$db->query_write($sql);
	}
}

?>