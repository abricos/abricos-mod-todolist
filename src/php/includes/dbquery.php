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
				".(empty($d->def) ? 0 : 1).",
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
				isdefault=".(empty($d->def) ? 0 : 1).",
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
		title as tl,
		ord
	";

    public static function GroupList(Ab_Database $db, $userid){
        $sql = "
			SELECT
				".TodoListQuery::$GroupFields."
			FROM ".$db->prefix."todolist_group
			WHERE userid=".bkint($userid)." AND deldate=0
			ORDER BY ord DESC, title
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

    public static function GroupListSetOrder(Ab_Database $db, $userid, $orders){
        if (count($orders) == 0){
            return;
        }

        for ($i = 0; $i < count($orders); $i++){
            $di = $orders[$i];
            $sql = "
				UPDATE ".$db->prefix."todolist_group
				SET ord=".bkint($di->o)."
				WHERE userid=".bkint($userid)." AND groupid=".bkint($di->id)."
				LIMIT 1
			";
            $db->query_write($sql);
        }
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
		plantime as ptm,
		executed as exc,
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
			(userid, title, descript, groupid, priorityid, likeid, plantime, dateline) VALUES (
				".bkint($userid).",
				'".bkstr($d->tl)."',
				'".bkstr($d->dsc)."',
				".bkint($d->gid).",
				".bkint($d->prtid).",
				".bkint($d->lkid).",
				".bkint($d->ptm).",
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
				plantime=".bkint($d->ptm)."
			WHERE userid=".bkint($userid)." AND todoid=".bkint($todoid)."
			LIMIT 1
		";
        $db->query_write($sql);
    }

    public static function TodoExecute(Ab_Database $db, $userid, $todoid, $isExecute){
        $sql = "
			UPDATE ".$db->prefix."todolist
			SET executed=".($isExecute ? TIMENOW : 0)."
			WHERE userid=".bkint($userid)." AND todoid=".bkint($todoid)."
			LIMIT 1
		";
        $db->query_write($sql);
    }

    public static function TodoRemove(Ab_Database $db, $userid, $todoid){
        $sql = "
			UPDATE ".$db->prefix."todolist
			SET deldate=".TIMENOW."
			WHERE userid=".bkint($userid)." AND todoid=".bkint($todoid)."
			LIMIT 1
		";
        $db->query_write($sql);
    }

    public static function TodoRemoveByGroupId(Ab_Database $db, $userid, $groupid){
        $sql = "
			UPDATE ".$db->prefix."todolist
			SET deldate=".TIMENOW."
			WHERE userid=".bkint($userid)." AND groupid=".bkint($groupid)."
		";
        $db->query_write($sql);
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    /*                       Зависимость дел                     */
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    public static function DependList(Ab_Database $db, $userid, $todoid = 0){
        $sql = "
			SELECT
				d.dependid as id,
				d.todoid as tid
			FROM ".$db->prefix."todolist t
			INNER JOIN ".$db->prefix."todolist_depends d ON t.todoid=d.todoid
			INNER JOIN ".$db->prefix."todolist td ON d.todoid=td.todoid 
			WHERE t.userid=".bkint($userid)." AND t.deldate=0
				AND td.userid=".bkint($userid)." AND td.deldate=0 
				".($todoid > 0 ? " AND t.todoid=".bkint($todoid) : "")."
		";
        return $db->query_read($sql);
    }

    public static function DependAppend(Ab_Database $db, $userid, $todoid, $dependid){
        $sql = "
			INSERT IGNORE INTO ".$db->prefix."todolist_depends 
			(userid, todoid, dependid, dateline) VALUES (
				".bkint($userid).",
				".bkint($todoid).",
				".bkint($dependid).",
				".TIMENOW."
			)
		";
        $db->query_write($sql);
    }

    public static function DependRemove(Ab_Database $db, $userid, $todoid, $dependid){
        $sql = "
			DELETE FROM ".$db->prefix."todolist_depends
			WHERE userid=".bkint($userid)." AND todoid=".bkint($todoid)."
				AND dependid=".bkint($dependid)."
		";
        $db->query_write($sql);
    }

    public static function DependClear(Ab_Database $db, $userid, $todoid){
        $sql = "
			DELETE FROM ".$db->prefix."todolist_depends
			WHERE userid=".bkint($userid)." AND todoid=".bkint($todoid)."
		";
        $db->query_write($sql);
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    /*                            Теги                           */
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    public static $TagGroupFields = "
		groupid as id,
		title as tl,
		ord
	";

    public static function TagGroupList(Ab_Database $db, $userid){
        $sql = "
			SELECT
				".TodoListQuery::$TagGroupFields."
			FROM ".$db->prefix."todolist_taggroup
			WHERE userid=".bkint($userid)." AND deldate=0
			ORDER BY ord DESC, title
		";
        return $db->query_read($sql);
    }

    public static function TagGroup(Ab_Database $db, $userid, $taggroupid){
        $sql = "
			SELECT
				".TodoListQuery::$TagGroupFields."
			FROM ".$db->prefix."todolist_taggroup
			WHERE userid=".bkint($userid)." AND taggroupid=".bkint($taggroupid)." AND deldate=0
			LIMIT 1
		";
        return $db->query_first($sql);
    }

    public static function TagGroupAppend(Ab_Database $db, $userid, $d){
        $sql = "
			INSERT INTO ".$db->prefix."todolist_taggroup
			(userid, title, dateline) VALUES (
				".bkint($userid).",
				'".bkstr($d->tl)."',
				".TIMENOW."
			)
		";
        $db->query_write($sql);
        return $db->insert_id();
    }

    public static function TagGroupUpdate(Ab_Database $db, $userid, $taggroupid, $d){
        $sql = "
			UPDATE ".$db->prefix."todolist_taggroup
			SET title='".bkstr($d->tl)."'
			WHERE userid=".bkint($userid)." AND taggroupid=".bkint($taggroupid)."
			LIMIT 1
		";
        $db->query_write($sql);
    }

    public static function TagGroupListSetOrder(Ab_Database $db, $userid, $orders){
        if (count($orders) == 0){
            return;
        }

        for ($i = 0; $i < count($orders); $i++){
            $di = $orders[$i];
            $sql = "
				UPDATE ".$db->prefix."todolist_taggroup
				SET ord=".bkint($di->o)."
				WHERE userid=".bkint($userid)." AND taggroupid=".bkint($di->id)."
				LIMIT 1
			";
            $db->query_write($sql);
        }
    }

    public static function TagGroupRemove(Ab_Database $db, $userid, $taggroupid){
        $sql = "
			UPDATE ".$db->prefix."todolist_taggroup
			SET deldate=".TIMENOW."
			WHERE userid=".bkint($userid)." AND taggroupid=".bkint($taggroupid)."
			LIMIT 1
		";
        $db->query_write($sql);
    }

}

?>