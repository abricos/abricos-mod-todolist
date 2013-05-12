<?php
/**
 * Схема таблиц модуля
 * @package Abricos
 * @subpackage TodoList
 * @license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
 * @author Alexander Kuzmin <roosit@abricos.org>
 */

$charset = "CHARACTER SET 'utf8' COLLATE 'utf8_general_ci'";
$updateManager = Ab_UpdateManager::$current; 
$db = Abricos::$db;
$pfx = $db->prefix;

if ($updateManager->isInstall()){
	Abricos::GetModule('todolist')->permission->Install();
	
	$db->query_write("
		CREATE TABLE IF NOT EXISTS ".$pfx."todolist_group (
			`groupid` int(10) unsigned NOT NULL auto_increment COMMENT 'Идентификатор',
			`parentgroupid` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Родитель',
			`userid` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Пользователь',
			
			`title` varchar(250) NOT NULL DEFAULT '' COMMENT 'Название',
			`ord` int(5) NOT NULL DEFAULT 0 COMMENT 'Сортировка',
			
			`dateline` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Дата создания',
			`deldate` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Дата удаления',

			PRIMARY KEY (`groupid`),
			KEY (`userid`)
		)".$charset
	);	

	// приоритетность задачи
	$db->query_write("
		CREATE TABLE IF NOT EXISTS ".$pfx."todolist_priority (
			`priorityid` int(10) unsigned NOT NULL auto_increment COMMENT 'Идентификатор',
			`userid` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Пользователь',
				
			`title` varchar(250) NOT NULL DEFAULT '' COMMENT 'Название',
			`ord` int(2) unsigned NOT NULL DEFAULT 0 COMMENT 'Сортировка',
			`isdefault` tinyint(1) unsigned NOT NULL DEFAULT 0 COMMENT 'По умолчанию',
			
			`dateline` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Дата создания',
			`deldate` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Дата удаления',
	
			PRIMARY KEY (`priorityid`),
			KEY (`userid`)
		)".$charset
	);

	// личное отношение к задачи
	$db->query_write("
		CREATE TABLE IF NOT EXISTS ".$pfx."todolist_like (
			`likeid` int(10) unsigned NOT NULL auto_increment COMMENT 'Идентификатор',
			`userid` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Пользователь',
	
			`title` varchar(250) NOT NULL DEFAULT '' COMMENT 'Название',
			`ord` int(2) unsigned NOT NULL DEFAULT 0 COMMENT 'Сортировка',
			`isdefault` tinyint(1) unsigned NOT NULL DEFAULT 0 COMMENT 'По умолчанию',
				
			`dateline` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Дата создания',
			`deldate` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Дата удаления',
	
			PRIMARY KEY (`likeid`),
			KEY (`userid`)
		)".$charset
	);
	
	
	$db->query_write("
		CREATE TABLE IF NOT EXISTS ".$pfx."todolist (
			`todoid` int(10) unsigned NOT NULL auto_increment COMMENT 'Идентификатор',
			`userid` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Пользователь',
			`groupid` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Группа',
			
			`module` varchar(50) NOT NULL DEFAULT '' COMMENT 'Модуль инициатор',
				
			`title` TEXT NOT NULL,
	
			`priorityid` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Приоритет',
			`likeid` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Отношение',
			
			`exectime` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Предположительное время выполнения в секундах',
			
			`ord` int(5) NOT NULL DEFAULT 0 COMMENT 'Сортировка',
				
			`dateline` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Дата создания',
			`deldate` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Дата удаления',
	
			PRIMARY KEY (`todoid`),
			KEY (`userid`)
		)".$charset
	);
	
}


?>