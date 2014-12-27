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
			`color` varchar(50) NOT NULL DEFAULT '' COMMENT 'Цвет',
			
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

			`title` varchar(250) NOT NULL DEFAULT '' COMMENT 'Модуль инициатор',
			`descript` TEXT NOT NULL,
			
			`priorityid` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Приоритет',
			`likeid` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Отношение',
			
			`plantime` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Предположительное время выполнения в секундах',
			
			`ord` int(5) NOT NULL DEFAULT 0 COMMENT 'Сортировка',
			
			`executed` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Дата/время выполнения',

			`dateline` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Дата создания',
			`deldate` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Дата удаления',
	
			PRIMARY KEY (`todoid`),
			KEY (`userid`)
		)".$charset
	);
	
	$db->query_write("
		CREATE TABLE IF NOT EXISTS ".$pfx."todolist_userconfig (
			`userid` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Пользователь',
	
			`dateline` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Дата создания записи',
			`lastview` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Дата посещения',
			
			UNIQUE KEY (`userid`)
		)".$charset
	);

	// планирование дел
	$db->query_write("
		CREATE TABLE IF NOT EXISTS ".$pfx."todolist_plan (
			`planid` int(10) unsigned NOT NULL auto_increment COMMENT 'Идентификатор',
			`userid` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Пользователь',
			
			`day` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'День',
			`todoid` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Дело',
			`ord` int(5) NOT NULL DEFAULT 0 COMMENT 'Сортировка',
			
			`dateline` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Дата создания',
			`deldate` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Дата удаления',
	
			PRIMARY KEY (`planid`),
			KEY (`userid`)
		)".$charset
	);
	
}

if ($updateManager->isUpdate('0.1.1')){

	// Зависимость от выполнения другого дела
	$db->query_write("
		CREATE TABLE IF NOT EXISTS ".$pfx."todolist_depends (
			`userid` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Пользователь',
			`todoid` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Исходное дело',
			`dependid` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Зависит от этого дела',
			`dateline` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Дата создания',
			UNIQUE KEY `depends` (`todoid`, `dependid`),
			KEY (`userid`)
		)".$charset
	);
}

/* * * * Ниже схема не применяется - в разработке * * * */

if ($updateManager->isUpdate('0.1.2')){
	
	// Группа тегов
	$db->query_write("
		CREATE TABLE IF NOT EXISTS ".$pfx."todolist_taggroup (
			`taggroupid` int(10) unsigned NOT NULL auto_increment COMMENT 'Идентификатор',
			`userid` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Пользователь',
	
			`title` varchar(50) NOT NULL DEFAULT '' COMMENT 'Заголовок',
			`ord` int(5) NOT NULL DEFAULT 0 COMMENT 'Сортировка',
	
			`dateline` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Дата создания',
			`deldate` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Дата удаления',
	
			PRIMARY KEY (`taggroupid`),
			KEY (`userid`)
		)".$charset
	);
	
	// Теги
	$db->query_write("
		CREATE TABLE IF NOT EXISTS ".$pfx."todolist_tag (
			`tagid` int(10) unsigned NOT NULL auto_increment COMMENT 'Идентификатор',
			`userid` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Пользователь',
			`taggroupid` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Группа тегов',

			`title` varchar(50) NOT NULL DEFAULT '' COMMENT 'Заголовок',
			`ord` int(5) NOT NULL DEFAULT 0 COMMENT 'Сортировка',
				
			`dateline` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Дата создания',
			`deldate` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Дата удаления',
	
			PRIMARY KEY (`tagid`),
			KEY (`userid`)
		)".$charset
	);

	// Связь тега с делом
	$db->query_write("
		CREATE TABLE IF NOT EXISTS ".$pfx."todolist_tagtodo (
			`tagid` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Тег',
			`todoid` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Дело',
			UNIQUE KEY `tagtodo` (`tagid`, `todoid`)
		)".$charset
	);
	
}


?>