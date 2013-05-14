<?php
/**
 * @package Abricos
 * @subpackage TodoList
 * @license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
 * @author Alexander Kuzmin <roosit@abricos.org>
 */

class TodoListQuery {
	
	public static function UserConfig(Ab_Database $db, $userid){
		$sql = "
			SELECT
				userid as id
			FROM ".$db->prefix."todolist_userconfig
			WHERE userid=".bkint($userid)."
			LIMIT 1
		";
		return $db->query_first($sql);
	}
	
	public static function UserConfigAppend(Ab_Database $db, $userid){
		$sql = "
			INSERT INTO ".$db->prefix."todolist_userconfig
			(userid, dateline) VALUES (
				".bkint($userid).",
				".TIMENOW."
			)
		";
		$db->query_write($sql);
		return $db->insert_id();
	}
	
	public static $PriorityFields = "
		priorityid as id,
		title as tl,
		color as clr,
		isdefault as def,
		ord
	";
	
	public static function PriorityList(Ab_Database $db, $userid){
		$sql = "
			SELECT
				".TodoListQuery::$PriorityFields."
			FROM ".$db->prefix."todolist_priority
			WHERE userid=".bkint($userid)."
		";
		return $db->query_read($sql);
	}
	
	public static function Priority(Ab_Database $db, $userid, $priorityid){
		$sql = "
			SELECT
				".TodoListQuery::$PriorityFields."
			FROM ".$db->prefix."todolist_priority
			WHERE userid=".bkint($userid)." AND priorityid=".bkint($priorityid)." AND deldate=0
			LIMIT 1
		";
		return $db->query_first($sql);
	}
	
	public static function PriorityAppend(Ab_Database $db, $userid, $d){
		$sql = "
			INSERT INTO ".$db->prefix."todolist_priority
			(userid, title, color, isdefault, ord, dateline) VALUES (
				".bkint($userid).",
				'".bkstr($d->tl)."',
				'".bkstr($d->clr)."',
				".(empty($d->def)?0:1).",
				".bkint($d->ord).",
				".TIMENOW."
			)
		";
		$db->query_write($sql);
		return $db->insert_id();
	}
	
	public static function PriorityUpdate(Ab_Database $db, $userid, $priorityid, $d){
		$sql = "
			UPDATE ".$db->prefix."todolist_priority
			SET
				title='".bkstr($d->tl)."',
				color='".bkstr($d->clr)."',
				isdefault=".(empty($d->def)?0:1).",
				ord=".bkint($d->ord)."
				WHERE userid=".bkint($userid)." AND priorityid=".bkint($priorityid)."
			LIMIT 1
		";
		$db->query_write($sql);
	}
	
	public static function PriorityRemove(Ab_Database $db, $userid, $priorityid){
		$sql = "
			UPDATE ".$db->prefix."todolist_priority
			SET deldate=".TIMENOW."
			WHERE userid=".bkint($userid)." AND priorityid=".bkint($priorityid)."
			LIMIT 1
		";
		$db->query_write($sql);
	}
	
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
			(userid, title, dateline) VALUES (
				".bkint($userid).",
				'".bkstr($d->tl)."',
				".TIMENOW."
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
	
	public static function GroupRemove(Ab_Database $db, $userid, $groupid){
		$sql = "
			UPDATE ".$db->prefix."todolist_group
			SET deldate=".TIMENOW."
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
		descript as dsc,
		exectime as etm,
		ord,
		dateline as dl
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
			(userid, title, descript, groupid, priorityid, likeid, exectime, dateline) VALUES (
				".bkint($userid).",
				'".bkstr($d->tl)."',
				'".bkstr($d->dsc)."',
				".bkint($d->gid).",
				".bkint($d->prtid).",
				".bkint($d->lkid).",
				".bkint($d->etm).",
				".TIMENOW."
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
				descript='".bkstr($d->dsc)."',
				groupid=".bkint($d->gid).",
				priorityid=".bkint($d->prtid).",
				likeid=".bkint($d->lkid).",
				exectime=".bkint($d->etm)."
			WHERE userid=".bkint($userid)." AND todoid=".bkint($todoid)."
			LIMIT 1
		";
		$db->query_write($sql);
	}
}

?>