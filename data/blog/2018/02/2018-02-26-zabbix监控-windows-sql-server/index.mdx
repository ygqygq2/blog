---
title: "Zabbix监控 Windows SQL Server"
date: "2018-02-26"
categories:
  - "system-operations"
tags:
  - "sql-server"
  - "windows"
  - "zabbix"
---

# Zabbix 监控 Windows SQL Server

[TOC]

## 1\. 模板来源

此模板来自如下模板的修改和翻译。因为原模板为葡萄牙语。 [https://share.zabbix.com/databases/microsoft-sql-server/template-windows-sql-server](https://share.zabbix.com/databases/microsoft-sql-server/template-windows-sql-server)

## 2\. 模板使用

假如 zabbix agent 目录为`D:\zabbix` 确保 zabbix agent 配置文件`D:\zabbix\etc\zabbix_agentd.conf` 有此配置 `Include=D:\zabbix\etc\zabbix_agentd.conf.d\`

自定义 key 文件 `D:\zabbix\etc\zabbix_agentd.conf.d\discovery.mssql.server.conf` 内容：

```
# key of zabbix
UserParameter=discovery.mssql.databases,powershell.exe -noprofile -executionpolicy bypass -File D:\zabbix\scripts\discovery.mssql.server.ps1 JSONDB
UserParameter=discovery.mssql.jobs,powershell.exe -noprofile -executionpolicy bypass -File D:\zabbix\scripts\discovery.mssql.server.ps1 JSONJOB
UserParameter=discovery.mssql.data[*],powershell.exe -noprofile -executionpolicy bypass -File D:\zabbix\scripts\discovery.mssql.server.ps1 $1 "$2"
```

powershell 脚本文件 `D:\zabbix\scripts\discovery.mssql.server.ps1` 内容：

```
# parameter
Param(
  [string]$select,
  [string]$2
)

# Login SQLSERVER
$username = "username"
$password   = "password"

# JSONDB
if ( $select -eq 'JSONDB' )
{
$database = sqlcmd -d Master -U $username -P $password -h -1 -W -Q "set nocount on;SELECT name FROM master..sysdatabases"
$idx = 1
write-host "{"
write-host " `"data`":[`n"
foreach ($db in $database)
{
    if ($idx -lt $database.Count)
    {
        $line= "{ `"{#MSSQLDBNAME}`" : `"" + $db + "`" },"
        write-host $line
    }
    elseif ($idx -ge $database.Count)
    {
    $line= "{ `"{#MSSQLDBNAME}`" : `"" + $db + "`" }"
    write-host $line
    }
    $idx++;
}
write-host
write-host " ]"
write-host "}"
}

# STATUS
if ( $select -eq 'STATUS' )
{
sqlcmd -d Master -U $username -P $password -h -1 -W -Q "set nocount on;SELECT coalesce(max(state),7) from sys.databases where name = '$2'"
}

# CONN
if ( $select -eq 'CONN' )
{
sqlcmd -d Master -U $username -P $password -h -1 -W -Q "set nocount on;DECLARE @AllConnections TABLE(
    SPID INT,
    Status VARCHAR(MAX),
    LOGIN VARCHAR(MAX),
    HostName VARCHAR(MAX),
    BlkBy VARCHAR(MAX),
    DBName VARCHAR(MAX),
    Command VARCHAR(MAX),
    CPUTime INT,
    DiskIO INT,
    LastBatch VARCHAR(MAX),
    ProgramName VARCHAR(MAX),
    SPID_1 INT,
    REQUESTID INT
)
INSERT INTO @AllConnections EXEC sp_who2
SELECT count(*) FROM @AllConnections WHERE DBName = '$2'"
}

# JSONJOB
if ( $select -eq 'JSONJOB' )
{
$jobname = sqlcmd -d Master -U $username -P $password -h -1 -W -Q "set nocount on;SELECT [name] FROM msdb.dbo.sysjobs"
$idx = 1
write-host "{"
write-host " `"data`":[`n"
foreach ($job in $jobname)
{
    if ($idx -lt $jobname.Count)
    {
        $line= "{ `"{#MSSQLJOBNAME}`" : `"" + $job + "`" },"
        write-host $line
    }
    elseif ($idx -ge $jobname.Count)
    {
    $line= "{ `"{#MSSQLJOBNAME}`" : `"" + $job + "`" }"
    write-host $line
    }
    $idx++;
}
write-host
write-host " ]"
write-host "}"
}

# JOBSTATUS
if ( $select -eq 'JOBSTATUS' )
{
sqlcmd -d Master -U $username -P $password -h -1 -W -Q "set nocount on;WITH last_hist_rec AS
(
SELECT ROW_NUMBER() OVER
(PARTITION BY job_id ORDER BY run_date DESC, run_time DESC) AS [RowNum]
, job_id
, run_date AS [last_run_date]
, run_time AS [last_run_time]
, CASE run_status
WHEN 0 THEN '0'
WHEN 1 THEN '1'
WHEN 2 THEN '2'
WHEN 3 THEN '3'
WHEN 4 THEN '4'
END AS [status]
FROM msdb.dbo.sysjobhistory
)
SELECT jobs.name AS [job_name]
, hist.status
FROM msdb.dbo.sysjobs jobs
LEFT JOIN last_hist_rec hist ON hist.job_id = jobs.job_id
AND hist.RowNum = 1
WHERE jobs.name = '$2'" | % {$_.substring($_.length-1) -replace ''} | ForEach-Object {$_ -Replace "N", "5"}
}

# VERSION
if ( $select -eq 'VERSION' )
{
sqlcmd -d Master -U $username -P $password -h -1 -W -Q "set nocount on;SELECT
   SERVERPROPERTY ( 'ProductVersion' ),
   SERVERPROPERTY ( 'Edition' ),
   SERVERPROPERTY ( 'ProductLevel' )"
}
```

> **注意** 需要替换脚本中 SQL Server 的用户和密码； 用 zabbix 运行用户确认脚本运行正常（手动模拟 zabbix 运行）；

模板 xml 文件（zabbix3.2 版本） `Template Windows LLD MSSQL.xml` 内容：

```
<?xml version="1.0" encoding="UTF-8"?>
<zabbix_export>
    <version>3.2</version>
    <date>2018-02-11T06:11:01Z</date>
    <groups>
        <group>
            <name>Templates</name>
        </group>
    </groups>
    <templates>
        <template>
            <template>Template Windows LLD MSSQL</template>
            <name>Template Windows LLD MSSQL</name>
            <description># Desenvolvido por Diego Cavalcante - 06/12/2017

# Monitoramento Windows SQLServer</description>
            <groups>
                <group>
                    <name>Templates</name>
                </group>
            </groups>
            <applications>
                <application>
                    <name>MSSQL General</name>
                </application>
                <application>
                    <name>MSSQL Jobs Status</name>
                </application>
                <application>
                    <name>MSSQL Memory</name>
                </application>
                <application>
                    <name>MSSQL Services</name>
                </application>
                <application>
                    <name>MSSQL Statistics</name>
                </application>
            </applications>
            <items>
                <item>
                    <name>Version</name>
                    <type>7</type>
                    <snmp_community/>
                    <multiplier>0</multiplier>
                    <snmp_oid/>
                    <key>discovery.mssql.data[version]</key>
                    <delay>86400</delay>
                    <history>15</history>
                    <trends>0</trends>
                    <status>0</status>
                    <value_type>1</value_type>
                    <allowed_hosts/>
                    <units/>
                    <delta>0</delta>
                    <snmpv3_contextname/>
                    <snmpv3_securityname/>
                    <snmpv3_securitylevel>0</snmpv3_securitylevel>
                    <snmpv3_authprotocol>0</snmpv3_authprotocol>
                    <snmpv3_authpassphrase/>
                    <snmpv3_privprotocol>0</snmpv3_privprotocol>
                    <snmpv3_privpassphrase/>
                    <formula>1</formula>
                    <delay_flex/>
                    <params/>
                    <ipmi_sensor/>
                    <data_type>0</data_type>
                    <authtype>0</authtype>
                    <username/>
                    <password/>
                    <publickey/>
                    <privatekey/>
                    <port/>
                    <description>Version of SQLServer.</description>
                    <inventory_link>0</inventory_link>
                    <applications>
                        <application>
                            <name>MSSQL Statistics</name>
                        </application>
                    </applications>
                    <valuemap/>
                    <logtimefmt/>
                </item>
                <item>
                    <name>MSSQL is running</name>
                    <type>7</type>
                    <snmp_community/>
                    <multiplier>0</multiplier>
                    <snmp_oid/>
                    <key>net.tcp.port[,{$MSSQLPORT}]</key>
                    <delay>300</delay>
                    <history>7</history>
                    <trends>30</trends>
                    <status>0</status>
                    <value_type>3</value_type>
                    <allowed_hosts/>
                    <units/>
                    <delta>0</delta>
                    <snmpv3_contextname/>
                    <snmpv3_securityname/>
                    <snmpv3_securitylevel>0</snmpv3_securitylevel>
                    <snmpv3_authprotocol>0</snmpv3_authprotocol>
                    <snmpv3_authpassphrase/>
                    <snmpv3_privprotocol>0</snmpv3_privprotocol>
                    <snmpv3_privpassphrase/>
                    <formula>1</formula>
                    <delay_flex/>
                    <params/>
                    <ipmi_sensor/>
                    <data_type>0</data_type>
                    <authtype>0</authtype>
                    <username/>
                    <password/>
                    <publickey/>
                    <privatekey/>
                    <port/>
                    <description/>
                    <inventory_link>0</inventory_link>
                    <applications>
                        <application>
                            <name>MSSQL General</name>
                        </application>
                    </applications>
                    <valuemap>
                        <name>Service state</name>
                    </valuemap>
                    <logtimefmt/>
                </item>
                <item>
                    <name>Processor Time (%)</name>
                    <type>7</type>
                    <snmp_community/>
                    <multiplier>0</multiplier>
                    <snmp_oid/>
                    <key>perf_counter[\Process(sqlservr)\% Processor Time]</key>
                    <delay>300</delay>
                    <history>7</history>
                    <trends>30</trends>
                    <status>0</status>
                    <value_type>0</value_type>
                    <allowed_hosts/>
                    <units>%</units>
                    <delta>0</delta>
                    <snmpv3_contextname/>
                    <snmpv3_securityname/>
                    <snmpv3_securitylevel>0</snmpv3_securitylevel>
                    <snmpv3_authprotocol>0</snmpv3_authprotocol>
                    <snmpv3_authpassphrase/>
                    <snmpv3_privprotocol>0</snmpv3_privprotocol>
                    <snmpv3_privpassphrase/>
                    <formula>1</formula>
                    <delay_flex/>
                    <params/>
                    <ipmi_sensor/>
                    <data_type>0</data_type>
                    <authtype>0</authtype>
                    <username/>
                    <password/>
                    <publickey/>
                    <privatekey/>
                    <port/>
                    <description>perf_counter[\Process(sqlservr)\% Processor Time]</description>
                    <inventory_link>0</inventory_link>
                    <applications>
                        <application>
                            <name>MSSQL Statistics</name>
                        </application>
                    </applications>
                    <valuemap/>
                    <logtimefmt/>
                </item>
                <item>
                    <name>Memory in Use</name>
                    <type>7</type>
                    <snmp_community/>
                    <multiplier>0</multiplier>
                    <snmp_oid/>
                    <key>perf_counter[\Process(sqlservr)\Private Bytes]</key>
                    <delay>300</delay>
                    <history>7</history>
                    <trends>30</trends>
                    <status>0</status>
                    <value_type>0</value_type>
                    <allowed_hosts/>
                    <units>B</units>
                    <delta>0</delta>
                    <snmpv3_contextname/>
                    <snmpv3_securityname/>
                    <snmpv3_securitylevel>0</snmpv3_securitylevel>
                    <snmpv3_authprotocol>0</snmpv3_authprotocol>
                    <snmpv3_authpassphrase/>
                    <snmpv3_privprotocol>0</snmpv3_privprotocol>
                    <snmpv3_privpassphrase/>
                    <formula>1</formula>
                    <delay_flex/>
                    <params/>
                    <ipmi_sensor/>
                    <data_type>0</data_type>
                    <authtype>0</authtype>
                    <username/>
                    <password/>
                    <publickey/>
                    <privatekey/>
                    <port/>
                    <description>Memory in Use

perf_counter[\Process(sqlservr)\Private Bytes]</description>
                    <inventory_link>0</inventory_link>
                    <applications>
                        <application>
                            <name>MSSQL Memory</name>
                        </application>
                    </applications>
                    <valuemap/>
                    <logtimefmt/>
                </item>
                <item>
                    <name>Buffer Cache Hit Ratio (%)</name>
                    <type>7</type>
                    <snmp_community/>
                    <multiplier>0</multiplier>
                    <snmp_oid/>
                    <key>perf_counter[\{$MSSQLINST}:Buffer Manager\Buffer cache hit ratio]</key>
                    <delay>300</delay>
                    <history>7</history>
                    <trends>30</trends>
                    <status>0</status>
                    <value_type>0</value_type>
                    <allowed_hosts/>
                    <units>%</units>
                    <delta>0</delta>
                    <snmpv3_contextname/>
                    <snmpv3_securityname/>
                    <snmpv3_securitylevel>0</snmpv3_securitylevel>
                    <snmpv3_authprotocol>0</snmpv3_authprotocol>
                    <snmpv3_authpassphrase/>
                    <snmpv3_privprotocol>0</snmpv3_privprotocol>
                    <snmpv3_privpassphrase/>
                    <formula>1</formula>
                    <delay_flex/>
                    <params/>
                    <ipmi_sensor/>
                    <data_type>0</data_type>
                    <authtype>0</authtype>
                    <username/>
                    <password/>
                    <publickey/>
                    <privatekey/>
                    <port/>
                    <description>perf_counter[\{$MSSQLINST}:Buffer Manager\Buffer cache hit ratio]</description>
                    <inventory_link>0</inventory_link>
                    <applications>
                        <application>
                            <name>MSSQL Memory</name>
                        </application>
                    </applications>
                    <valuemap/>
                    <logtimefmt/>
                </item>
                <item>
                    <name>Checkpoint Pages por (SEG)</name>
                    <type>7</type>
                    <snmp_community/>
                    <multiplier>0</multiplier>
                    <snmp_oid/>
                    <key>perf_counter[\{$MSSQLINST}:Buffer Manager\Checkpoint pages/sec]</key>
                    <delay>300</delay>
                    <history>7</history>
                    <trends>30</trends>
                    <status>0</status>
                    <value_type>0</value_type>
                    <allowed_hosts/>
                    <units>p/sec</units>
                    <delta>0</delta>
                    <snmpv3_contextname/>
                    <snmpv3_securityname/>
                    <snmpv3_securitylevel>0</snmpv3_securitylevel>
                    <snmpv3_authprotocol>0</snmpv3_authprotocol>
                    <snmpv3_authpassphrase/>
                    <snmpv3_privprotocol>0</snmpv3_privprotocol>
                    <snmpv3_privpassphrase/>
                    <formula>1</formula>
                    <delay_flex/>
                    <params/>
                    <ipmi_sensor/>
                    <data_type>0</data_type>
                    <authtype>0</authtype>
                    <username/>
                    <password/>
                    <publickey/>
                    <privatekey/>
                    <port/>
                    <description>perf_counter[\{$MSSQLINST}:Buffer Manager\Checkpoint pages/sec]</description>
                    <inventory_link>0</inventory_link>
                    <applications>
                        <application>
                            <name>MSSQL Statistics</name>
                        </application>
                    </applications>
                    <valuemap/>
                    <logtimefmt/>
                </item>
                <item>
                    <name>Database Pages</name>
                    <type>7</type>
                    <snmp_community/>
                    <multiplier>0</multiplier>
                    <snmp_oid/>
                    <key>perf_counter[\{$MSSQLINST}:Buffer Manager\Database pages]</key>
                    <delay>300</delay>
                    <history>7</history>
                    <trends>30</trends>
                    <status>0</status>
                    <value_type>0</value_type>
                    <allowed_hosts/>
                    <units/>
                    <delta>0</delta>
                    <snmpv3_contextname/>
                    <snmpv3_securityname/>
                    <snmpv3_securitylevel>0</snmpv3_securitylevel>
                    <snmpv3_authprotocol>0</snmpv3_authprotocol>
                    <snmpv3_authpassphrase/>
                    <snmpv3_privprotocol>0</snmpv3_privprotocol>
                    <snmpv3_privpassphrase/>
                    <formula>1</formula>
                    <delay_flex/>
                    <params/>
                    <ipmi_sensor/>
                    <data_type>0</data_type>
                    <authtype>0</authtype>
                    <username/>
                    <password/>
                    <publickey/>
                    <privatekey/>
                    <port/>
                    <description>perf_counter[\SQLServer:Buffer Manager\Database pages]</description>
                    <inventory_link>0</inventory_link>
                    <applications>
                        <application>
                            <name>MSSQL Statistics</name>
                        </application>
                    </applications>
                    <valuemap/>
                    <logtimefmt/>
                </item>
                <item>
                    <name>Lazy Writes por (SEG)</name>
                    <type>7</type>
                    <snmp_community/>
                    <multiplier>0</multiplier>
                    <snmp_oid/>
                    <key>perf_counter[\{$MSSQLINST}:Buffer Manager\Lazy writes/sec]</key>
                    <delay>300</delay>
                    <history>7</history>
                    <trends>30</trends>
                    <status>0</status>
                    <value_type>0</value_type>
                    <allowed_hosts/>
                    <units>p/sec</units>
                    <delta>0</delta>
                    <snmpv3_contextname/>
                    <snmpv3_securityname/>
                    <snmpv3_securitylevel>0</snmpv3_securitylevel>
                    <snmpv3_authprotocol>0</snmpv3_authprotocol>
                    <snmpv3_authpassphrase/>
                    <snmpv3_privprotocol>0</snmpv3_privprotocol>
                    <snmpv3_privpassphrase/>
                    <formula>1</formula>
                    <delay_flex/>
                    <params/>
                    <ipmi_sensor/>
                    <data_type>0</data_type>
                    <authtype>0</authtype>
                    <username/>
                    <password/>
                    <publickey/>
                    <privatekey/>
                    <port/>
                    <description>perf_counter[\{$MSSQLINST}:Buffer Manager\Lazy writes/sec]</description>
                    <inventory_link>0</inventory_link>
                    <applications>
                        <application>
                            <name>MSSQL Statistics</name>
                        </application>
                    </applications>
                    <valuemap/>
                    <logtimefmt/>
                </item>
                <item>
                    <name>Page Life Expectancy</name>
                    <type>7</type>
                    <snmp_community/>
                    <multiplier>0</multiplier>
                    <snmp_oid/>
                    <key>perf_counter[\{$MSSQLINST}:Buffer Manager\Page life expectancy]</key>
                    <delay>300</delay>
                    <history>7</history>
                    <trends>30</trends>
                    <status>0</status>
                    <value_type>0</value_type>
                    <allowed_hosts/>
                    <units>s</units>
                    <delta>0</delta>
                    <snmpv3_contextname/>
                    <snmpv3_securityname/>
                    <snmpv3_securitylevel>0</snmpv3_securitylevel>
                    <snmpv3_authprotocol>0</snmpv3_authprotocol>
                    <snmpv3_authpassphrase/>
                    <snmpv3_privprotocol>0</snmpv3_privprotocol>
                    <snmpv3_privpassphrase/>
                    <formula>1</formula>
                    <delay_flex/>
                    <params/>
                    <ipmi_sensor/>
                    <data_type>0</data_type>
                    <authtype>0</authtype>
                    <username/>
                    <password/>
                    <publickey/>
                    <privatekey/>
                    <port/>
                    <description>perf_counter[\{$MSSQLINST}:Buffer Manager\Page life expectancy]</description>
                    <inventory_link>0</inventory_link>
                    <applications>
                        <application>
                            <name>MSSQL Statistics</name>
                        </application>
                    </applications>
                    <valuemap/>
                    <logtimefmt/>
                </item>
                <item>
                    <name>Target Pages</name>
                    <type>7</type>
                    <snmp_community/>
                    <multiplier>0</multiplier>
                    <snmp_oid/>
                    <key>perf_counter[\{$MSSQLINST}:Buffer Manager\Target pages]</key>
                    <delay>300</delay>
                    <history>7</history>
                    <trends>30</trends>
                    <status>0</status>
                    <value_type>3</value_type>
                    <allowed_hosts/>
                    <units/>
                    <delta>0</delta>
                    <snmpv3_contextname/>
                    <snmpv3_securityname/>
                    <snmpv3_securitylevel>0</snmpv3_securitylevel>
                    <snmpv3_authprotocol>0</snmpv3_authprotocol>
                    <snmpv3_authpassphrase/>
                    <snmpv3_privprotocol>0</snmpv3_privprotocol>
                    <snmpv3_privpassphrase/>
                    <formula>1</formula>
                    <delay_flex/>
                    <params/>
                    <ipmi_sensor/>
                    <data_type>0</data_type>
                    <authtype>0</authtype>
                    <username/>
                    <password/>
                    <publickey/>
                    <privatekey/>
                    <port/>
                    <description>perf_counter[\{$MSSQLINST}:Buffer Manager\Target pages]</description>
                    <inventory_link>0</inventory_link>
                    <applications>
                        <application>
                            <name>MSSQL Statistics</name>
                        </application>
                    </applications>
                    <valuemap/>
                    <logtimefmt/>
                </item>
                <item>
                    <name>Total pages</name>
                    <type>7</type>
                    <snmp_community/>
                    <multiplier>0</multiplier>
                    <snmp_oid/>
                    <key>perf_counter[\{$MSSQLINST}:Buffer Manager\Total pages]</key>
                    <delay>300</delay>
                    <history>7</history>
                    <trends>30</trends>
                    <status>1</status>
                    <value_type>3</value_type>
                    <allowed_hosts/>
                    <units/>
                    <delta>0</delta>
                    <snmpv3_contextname/>
                    <snmpv3_securityname/>
                    <snmpv3_securitylevel>0</snmpv3_securitylevel>
                    <snmpv3_authprotocol>0</snmpv3_authprotocol>
                    <snmpv3_authpassphrase/>
                    <snmpv3_privprotocol>0</snmpv3_privprotocol>
                    <snmpv3_privpassphrase/>
                    <formula>1</formula>
                    <delay_flex/>
                    <params/>
                    <ipmi_sensor/>
                    <data_type>0</data_type>
                    <authtype>0</authtype>
                    <username/>
                    <password/>
                    <publickey/>
                    <privatekey/>
                    <port/>
                    <description>perf_counter[\{$MSSQLINST}:Buffer Manager\Total pages]</description>
                    <inventory_link>0</inventory_link>
                    <applications>
                        <application>
                            <name>MSSQL Statistics</name>
                        </application>
                    </applications>
                    <valuemap/>
                    <logtimefmt/>
                </item>
                <item>
                    <name>Total size of the data banks</name>
                    <type>7</type>
                    <snmp_community/>
                    <multiplier>1</multiplier>
                    <snmp_oid/>
                    <key>perf_counter[\{$MSSQLINST}:Databases(_Total)\Data File(s) Size (KB)]</key>
                    <delay>3600</delay>
                    <history>15</history>
                    <trends>90</trends>
                    <status>0</status>
                    <value_type>0</value_type>
                    <allowed_hosts/>
                    <units>B</units>
                    <delta>0</delta>
                    <snmpv3_contextname/>
                    <snmpv3_securityname/>
                    <snmpv3_securitylevel>0</snmpv3_securitylevel>
                    <snmpv3_authprotocol>0</snmpv3_authprotocol>
                    <snmpv3_authpassphrase/>
                    <snmpv3_privprotocol>0</snmpv3_privprotocol>
                    <snmpv3_privpassphrase/>
                    <formula>1024</formula>
                    <delay_flex/>
                    <params/>
                    <ipmi_sensor/>
                    <data_type>0</data_type>
                    <authtype>0</authtype>
                    <username/>
                    <password/>
                    <publickey/>
                    <privatekey/>
                    <port/>
                    <description>Total size of the data banks.

perf_counter[\{$MSSQLINST}:Databases(_Total)\Data File(s) Size (KB)]</description>
                    <inventory_link>0</inventory_link>
                    <applications>
                        <application>
                            <name>MSSQL General</name>
                        </application>
                    </applications>
                    <valuemap/>
                    <logtimefmt/>
                </item>
                <item>
                    <name>Total size of logs</name>
                    <type>7</type>
                    <snmp_community/>
                    <multiplier>1</multiplier>
                    <snmp_oid/>
                    <key>perf_counter[\{$MSSQLINST}:Databases(_Total)\Log File(s) Size (KB)]</key>
                    <delay>3600</delay>
                    <history>15</history>
                    <trends>90</trends>
                    <status>0</status>
                    <value_type>0</value_type>
                    <allowed_hosts/>
                    <units>B</units>
                    <delta>0</delta>
                    <snmpv3_contextname/>
                    <snmpv3_securityname/>
                    <snmpv3_securitylevel>0</snmpv3_securitylevel>
                    <snmpv3_authprotocol>0</snmpv3_authprotocol>
                    <snmpv3_authpassphrase/>
                    <snmpv3_privprotocol>0</snmpv3_privprotocol>
                    <snmpv3_privpassphrase/>
                    <formula>1024</formula>
                    <delay_flex/>
                    <params/>
                    <ipmi_sensor/>
                    <data_type>0</data_type>
                    <authtype>0</authtype>
                    <username/>
                    <password/>
                    <publickey/>
                    <privatekey/>
                    <port/>
                    <description>日志的大小

perf_counter[\{$MSSQLINST}:Databases(_Total)\Log File(s) Size (KB)]</description>
                    <inventory_link>0</inventory_link>
                    <applications>
                        <application>
                            <name>MSSQL General</name>
                        </application>
                    </applications>
                    <valuemap/>
                    <logtimefmt/>
                </item>
                <item>
                    <name>Total of connections in the databases</name>
                    <type>7</type>
                    <snmp_community/>
                    <multiplier>0</multiplier>
                    <snmp_oid/>
                    <key>perf_counter[\{$MSSQLINST}:General Statistics\User Connections]</key>
                    <delay>300</delay>
                    <history>7</history>
                    <trends>30</trends>
                    <status>0</status>
                    <value_type>0</value_type>
                    <allowed_hosts/>
                    <units/>
                    <delta>0</delta>
                    <snmpv3_contextname/>
                    <snmpv3_securityname/>
                    <snmpv3_securitylevel>0</snmpv3_securitylevel>
                    <snmpv3_authprotocol>0</snmpv3_authprotocol>
                    <snmpv3_authpassphrase/>
                    <snmpv3_privprotocol>0</snmpv3_privprotocol>
                    <snmpv3_privpassphrase/>
                    <formula>1</formula>
                    <delay_flex/>
                    <params/>
                    <ipmi_sensor/>
                    <data_type>0</data_type>
                    <authtype>0</authtype>
                    <username/>
                    <password/>
                    <publickey/>
                    <privatekey/>
                    <port/>
                    <description>总的数据库连接

perf_counter[\{$MSSQLINST}:General Statistics\User Connections]</description>
                    <inventory_link>0</inventory_link>
                    <applications>
                        <application>
                            <name>MSSQL Statistics</name>
                        </application>
                    </applications>
                    <valuemap/>
                    <logtimefmt/>
                </item>
                <item>
                    <name>Lock Waits por (SEG)</name>
                    <type>7</type>
                    <snmp_community/>
                    <multiplier>0</multiplier>
                    <snmp_oid/>
                    <key>perf_counter[\{$MSSQLINST}:Locks(_Total)\Lock Waits/sec]</key>
                    <delay>300</delay>
                    <history>7</history>
                    <trends>30</trends>
                    <status>0</status>
                    <value_type>3</value_type>
                    <allowed_hosts/>
                    <units>p/sec</units>
                    <delta>0</delta>
                    <snmpv3_contextname/>
                    <snmpv3_securityname/>
                    <snmpv3_securitylevel>0</snmpv3_securitylevel>
                    <snmpv3_authprotocol>0</snmpv3_authprotocol>
                    <snmpv3_authpassphrase/>
                    <snmpv3_privprotocol>0</snmpv3_privprotocol>
                    <snmpv3_privpassphrase/>
                    <formula>1</formula>
                    <delay_flex/>
                    <params/>
                    <ipmi_sensor/>
                    <data_type>0</data_type>
                    <authtype>0</authtype>
                    <username/>
                    <password/>
                    <publickey/>
                    <privatekey/>
                    <port/>
                    <description>perf_counter[\{$MSSQLINST}:Locks(_Total)\Lock Waits/sec]</description>
                    <inventory_link>0</inventory_link>
                    <applications>
                        <application>
                            <name>MSSQL Statistics</name>
                        </application>
                    </applications>
                    <valuemap/>
                    <logtimefmt/>
                </item>
                <item>
                    <name>Grants Pending Memory</name>
                    <type>7</type>
                    <snmp_community/>
                    <multiplier>0</multiplier>
                    <snmp_oid/>
                    <key>perf_counter[\{$MSSQLINST}:Memory Manager\Memory Grants Pending]</key>
                    <delay>300</delay>
                    <history>7</history>
                    <trends>30</trends>
                    <status>0</status>
                    <value_type>3</value_type>
                    <allowed_hosts/>
                    <units/>
                    <delta>0</delta>
                    <snmpv3_contextname/>
                    <snmpv3_securityname/>
                    <snmpv3_securitylevel>0</snmpv3_securitylevel>
                    <snmpv3_authprotocol>0</snmpv3_authprotocol>
                    <snmpv3_authpassphrase/>
                    <snmpv3_privprotocol>0</snmpv3_privprotocol>
                    <snmpv3_privpassphrase/>
                    <formula>1</formula>
                    <delay_flex/>
                    <params/>
                    <ipmi_sensor/>
                    <data_type>0</data_type>
                    <authtype>0</authtype>
                    <username/>
                    <password/>
                    <publickey/>
                    <privatekey/>
                    <port/>
                    <description>perf_counter[\{$MSSQLINST}:Memory Manager\Memory Grants Pending]</description>
                    <inventory_link>0</inventory_link>
                    <applications>
                        <application>
                            <name>MSSQL Memory</name>
                        </application>
                    </applications>
                    <valuemap/>
                    <logtimefmt/>
                </item>
                <item>
                    <name>Cache Memory</name>
                    <type>7</type>
                    <snmp_community/>
                    <multiplier>1</multiplier>
                    <snmp_oid/>
                    <key>perf_counter[\{$MSSQLINST}:Memory Manager\SQL Cache Memory (KB)]</key>
                    <delay>300</delay>
                    <history>7</history>
                    <trends>30</trends>
                    <status>0</status>
                    <value_type>0</value_type>
                    <allowed_hosts/>
                    <units>B</units>
                    <delta>0</delta>
                    <snmpv3_contextname/>
                    <snmpv3_securityname/>
                    <snmpv3_securitylevel>0</snmpv3_securitylevel>
                    <snmpv3_authprotocol>0</snmpv3_authprotocol>
                    <snmpv3_authpassphrase/>
                    <snmpv3_privprotocol>0</snmpv3_privprotocol>
                    <snmpv3_privpassphrase/>
                    <formula>1024</formula>
                    <delay_flex/>
                    <params/>
                    <ipmi_sensor/>
                    <data_type>0</data_type>
                    <authtype>0</authtype>
                    <username/>
                    <password/>
                    <publickey/>
                    <privatekey/>
                    <port/>
                    <description>Cache Memory

perf_counter[\{$MSSQLINST}:Memory Manager\SQL Cache Memory (KB)]</description>
                    <inventory_link>0</inventory_link>
                    <applications>
                        <application>
                            <name>MSSQL Memory</name>
                        </application>
                    </applications>
                    <valuemap/>
                    <logtimefmt/>
                </item>
                <item>
                    <name>Memory Reserved</name>
                    <type>7</type>
                    <snmp_community/>
                    <multiplier>1</multiplier>
                    <snmp_oid/>
                    <key>perf_counter[\{$MSSQLINST}:Memory Manager\Target Server Memory (KB)]</key>
                    <delay>3600</delay>
                    <history>7</history>
                    <trends>30</trends>
                    <status>0</status>
                    <value_type>3</value_type>
                    <allowed_hosts/>
                    <units>B</units>
                    <delta>0</delta>
                    <snmpv3_contextname/>
                    <snmpv3_securityname/>
                    <snmpv3_securitylevel>0</snmpv3_securitylevel>
                    <snmpv3_authprotocol>0</snmpv3_authprotocol>
                    <snmpv3_authpassphrase/>
                    <snmpv3_privprotocol>0</snmpv3_privprotocol>
                    <snmpv3_privpassphrase/>
                    <formula>1024</formula>
                    <delay_flex/>
                    <params/>
                    <ipmi_sensor/>
                    <data_type>0</data_type>
                    <authtype>0</authtype>
                    <username/>
                    <password/>
                    <publickey/>
                    <privatekey/>
                    <port/>
                    <description>perf_counter[\{$MSSQLINST}:Memory Manager\Target Server Memory (KB)]</description>
                    <inventory_link>0</inventory_link>
                    <applications>
                        <application>
                            <name>MSSQL Memory</name>
                        </application>
                    </applications>
                    <valuemap/>
                    <logtimefmt/>
                </item>
                <item>
                    <name>Erros por (SEG)</name>
                    <type>7</type>
                    <snmp_community/>
                    <multiplier>0</multiplier>
                    <snmp_oid/>
                    <key>perf_counter[\{$MSSQLINST}:SQL Errors(_Total)\Errors/sec]</key>
                    <delay>300</delay>
                    <history>7</history>
                    <trends>30</trends>
                    <status>0</status>
                    <value_type>0</value_type>
                    <allowed_hosts/>
                    <units>p/sec</units>
                    <delta>0</delta>
                    <snmpv3_contextname/>
                    <snmpv3_securityname/>
                    <snmpv3_securitylevel>0</snmpv3_securitylevel>
                    <snmpv3_authprotocol>0</snmpv3_authprotocol>
                    <snmpv3_authpassphrase/>
                    <snmpv3_privprotocol>0</snmpv3_privprotocol>
                    <snmpv3_privpassphrase/>
                    <formula>1</formula>
                    <delay_flex/>
                    <params/>
                    <ipmi_sensor/>
                    <data_type>0</data_type>
                    <authtype>0</authtype>
                    <username/>
                    <password/>
                    <publickey/>
                    <privatekey/>
                    <port/>
                    <description>perf_counter[\{$MSSQLINST}:SQL Errors(_Total)\Errors/sec]</description>
                    <inventory_link>0</inventory_link>
                    <applications>
                        <application>
                            <name>MSSQL Statistics</name>
                        </application>
                    </applications>
                    <valuemap/>
                    <logtimefmt/>
                </item>
                <item>
                    <name>SQL Compilations por (SEG)</name>
                    <type>7</type>
                    <snmp_community/>
                    <multiplier>0</multiplier>
                    <snmp_oid/>
                    <key>perf_counter[\{$MSSQLINST}:SQL Statistics\SQL Compilations/sec]</key>
                    <delay>300</delay>
                    <history>7</history>
                    <trends>30</trends>
                    <status>0</status>
                    <value_type>0</value_type>
                    <allowed_hosts/>
                    <units>p/sec</units>
                    <delta>0</delta>
                    <snmpv3_contextname/>
                    <snmpv3_securityname/>
                    <snmpv3_securitylevel>0</snmpv3_securitylevel>
                    <snmpv3_authprotocol>0</snmpv3_authprotocol>
                    <snmpv3_authpassphrase/>
                    <snmpv3_privprotocol>0</snmpv3_privprotocol>
                    <snmpv3_privpassphrase/>
                    <formula>1</formula>
                    <delay_flex/>
                    <params/>
                    <ipmi_sensor/>
                    <data_type>0</data_type>
                    <authtype>0</authtype>
                    <username/>
                    <password/>
                    <publickey/>
                    <privatekey/>
                    <port/>
                    <description>perf_counter[\{$MSSQLINST}:SQL Statistics\SQL Compilations/sec]</description>
                    <inventory_link>0</inventory_link>
                    <applications>
                        <application>
                            <name>MSSQL Statistics</name>
                        </application>
                    </applications>
                    <valuemap/>
                    <logtimefmt/>
                </item>
                <item>
                    <name>SQL Server Integration Services 10.0</name>
                    <type>7</type>
                    <snmp_community/>
                    <multiplier>0</multiplier>
                    <snmp_oid/>
                    <key>service.info[MsDtsServer100]</key>
                    <delay>300</delay>
                    <history>7</history>
                    <trends>30</trends>
                    <status>0</status>
                    <value_type>3</value_type>
                    <allowed_hosts/>
                    <units/>
                    <delta>0</delta>
                    <snmpv3_contextname/>
                    <snmpv3_securityname/>
                    <snmpv3_securitylevel>0</snmpv3_securitylevel>
                    <snmpv3_authprotocol>0</snmpv3_authprotocol>
                    <snmpv3_authpassphrase/>
                    <snmpv3_privprotocol>0</snmpv3_privprotocol>
                    <snmpv3_privpassphrase/>
                    <formula>1</formula>
                    <delay_flex/>
                    <params/>
                    <ipmi_sensor/>
                    <data_type>0</data_type>
                    <authtype>0</authtype>
                    <username/>
                    <password/>
                    <publickey/>
                    <privatekey/>
                    <port/>
                    <description>Service: MsDtsServer100

Name: SQL Server Integration Services 10.0

Description: Provides management support for storing and running SSIS packages.</description>
                    <inventory_link>0</inventory_link>
                    <applications>
                        <application>
                            <name>MSSQL Services</name>
                        </application>
                    </applications>
                    <valuemap>
                        <name>MSSQL Service</name>
                    </valuemap>
                    <logtimefmt/>
                </item>
                <item>
                    <name>SQL Server Agent {$MSSQLAGENT}</name>
                    <type>7</type>
                    <snmp_community/>
                    <multiplier>0</multiplier>
                    <snmp_oid/>
                    <key>service.info[{$MSSQLAGENT}]</key>
                    <delay>300</delay>
                    <history>7</history>
                    <trends>30</trends>
                    <status>0</status>
                    <value_type>3</value_type>
                    <allowed_hosts/>
                    <units/>
                    <delta>0</delta>
                    <snmpv3_contextname/>
                    <snmpv3_securityname/>
                    <snmpv3_securitylevel>0</snmpv3_securitylevel>
                    <snmpv3_authprotocol>0</snmpv3_authprotocol>
                    <snmpv3_authpassphrase/>
                    <snmpv3_privprotocol>0</snmpv3_privprotocol>
                    <snmpv3_privpassphrase/>
                    <formula>1</formula>
                    <delay_flex/>
                    <params/>
                    <ipmi_sensor/>
                    <data_type>0</data_type>
                    <authtype>0</authtype>
                    <username/>
                    <password/>
                    <publickey/>
                    <privatekey/>
                    <port/>
                    <description>Service: SQLSERVERAGENT

Name: SQL Server Agent ({$ MSSQLAGENT})

Description: Performs tasks, monitors SQL Server, triggers alerts, and allows the automation of some administrative tasks.</description>
                    <inventory_link>0</inventory_link>
                    <applications>
                        <application>
                            <name>MSSQL Services</name>
                        </application>
                    </applications>
                    <valuemap>
                        <name>MSSQL Service</name>
                    </valuemap>
                    <logtimefmt/>
                </item>
                <item>
                    <name>SQL Server {$MSSQLSERVER}</name>
                    <type>7</type>
                    <snmp_community/>
                    <multiplier>0</multiplier>
                    <snmp_oid/>
                    <key>service.info[{$MSSQLSERVER}]</key>
                    <delay>300</delay>
                    <history>7</history>
                    <trends>30</trends>
                    <status>0</status>
                    <value_type>3</value_type>
                    <allowed_hosts/>
                    <units/>
                    <delta>0</delta>
                    <snmpv3_contextname/>
                    <snmpv3_securityname/>
                    <snmpv3_securitylevel>0</snmpv3_securitylevel>
                    <snmpv3_authprotocol>0</snmpv3_authprotocol>
                    <snmpv3_authpassphrase/>
                    <snmpv3_privprotocol>0</snmpv3_privprotocol>
                    <snmpv3_privpassphrase/>
                    <formula>1</formula>
                    <delay_flex/>
                    <params/>
                    <ipmi_sensor/>
                    <data_type>0</data_type>
                    <authtype>0</authtype>
                    <username/>
                    <password/>
                    <publickey/>
                    <privatekey/>
                    <port/>
                    <description>Service: MSSQLSERVER

Name: SQL Server ({$ MSSQLSERVER})

Description: Offers storage, processing, and controlled access to data and fast transaction processing.</description>
                    <inventory_link>0</inventory_link>
                    <applications>
                        <application>
                            <name>MSSQL Services</name>
                        </application>
                    </applications>
                    <valuemap>
                        <name>MSSQL Service</name>
                    </valuemap>
                    <logtimefmt/>
                </item>
            </items>
            <discovery_rules>
                <discovery_rule>
                    <name>MSSQL Databases</name>
                    <type>7</type>
                    <snmp_community/>
                    <snmp_oid/>
                    <key>discovery.mssql.databases</key>
                    <delay>3600</delay>
                    <status>0</status>
                    <allowed_hosts/>
                    <snmpv3_contextname/>
                    <snmpv3_securityname/>
                    <snmpv3_securitylevel>0</snmpv3_securitylevel>
                    <snmpv3_authprotocol>0</snmpv3_authprotocol>
                    <snmpv3_authpassphrase/>
                    <snmpv3_privprotocol>0</snmpv3_privprotocol>
                    <snmpv3_privpassphrase/>
                    <delay_flex/>
                    <params/>
                    <ipmi_sensor/>
                    <authtype>0</authtype>
                    <username/>
                    <password/>
                    <publickey/>
                    <privatekey/>
                    <port/>
                    <filter>
                        <evaltype>0</evaltype>
                        <formula/>
                        <conditions/>
                    </filter>
                    <lifetime>1</lifetime>
                    <description>MSSQL数据库服务器发现</description>
                    <item_prototypes>
                        <item_prototype>
                            <name>{#MSSQLDBNAME} Number of Connections</name>
                            <type>7</type>
                            <snmp_community/>
                            <multiplier>0</multiplier>
                            <snmp_oid/>
                            <key>discovery.mssql.data[CONN,{#MSSQLDBNAME}]</key>
                            <delay>600</delay>
                            <history>7</history>
                            <trends>30</trends>
                            <status>0</status>
                            <value_type>3</value_type>
                            <allowed_hosts/>
                            <units/>
                            <delta>0</delta>
                            <snmpv3_contextname/>
                            <snmpv3_securityname/>
                            <snmpv3_securitylevel>0</snmpv3_securitylevel>
                            <snmpv3_authprotocol>0</snmpv3_authprotocol>
                            <snmpv3_authpassphrase/>
                            <snmpv3_privprotocol>0</snmpv3_privprotocol>
                            <snmpv3_privpassphrase/>
                            <formula>1</formula>
                            <delay_flex/>
                            <params/>
                            <ipmi_sensor/>
                            <data_type>0</data_type>
                            <authtype>0</authtype>
                            <username/>
                            <password/>
                            <publickey/>
                            <privatekey/>
                            <port/>
                            <description>Number of MSSQL Database Connections - {#MSSQLDBNAME}</description>
                            <inventory_link>0</inventory_link>
                            <applications/>
                            <valuemap/>
                            <logtimefmt/>
                            <application_prototypes>
                                <application_prototype>
                                    <name>MSSQL database info - {#MSSQLDBNAME}</name>
                                </application_prototype>
                            </application_prototypes>
                        </item_prototype>
                        <item_prototype>
                            <name>{#MSSQLDBNAME} Status</name>
                            <type>7</type>
                            <snmp_community/>
                            <multiplier>0</multiplier>
                            <snmp_oid/>
                            <key>discovery.mssql.data[STATUS,{#MSSQLDBNAME}]</key>
                            <delay>600</delay>
                            <history>7</history>
                            <trends>30</trends>
                            <status>0</status>
                            <value_type>3</value_type>
                            <allowed_hosts/>
                            <units/>
                            <delta>0</delta>
                            <snmpv3_contextname/>
                            <snmpv3_securityname/>
                            <snmpv3_securitylevel>0</snmpv3_securitylevel>
                            <snmpv3_authprotocol>0</snmpv3_authprotocol>
                            <snmpv3_authpassphrase/>
                            <snmpv3_privprotocol>0</snmpv3_privprotocol>
                            <snmpv3_privpassphrase/>
                            <formula>1</formula>
                            <delay_flex/>
                            <params/>
                            <ipmi_sensor/>
                            <data_type>0</data_type>
                            <authtype>0</authtype>
                            <username/>
                            <password/>
                            <publickey/>
                            <privatekey/>
                            <port/>
                            <description>MONITOR o Status to DATE MINIMUM - {# MOUNT}</description>
                            <inventory_link>0</inventory_link>
                            <applications/>
                            <valuemap>
                                <name>MSSQL Databases Status</name>
                            </valuemap>
                            <logtimefmt/>
                            <application_prototypes>
                                <application_prototype>
                                    <name>MSSQL database info - {#MSSQLDBNAME}</name>
                                </application_prototype>
                            </application_prototypes>
                        </item_prototype>
                        <item_prototype>
                            <name>{#MSSQLDBNAME} Database Size</name>
                            <type>7</type>
                            <snmp_community/>
                            <multiplier>1</multiplier>
                            <snmp_oid/>
                            <key>perf_counter[\{$MSSQLINST}:Databases({#MSSQLDBNAME})\Data File(s) Size (KB)]</key>
                            <delay>3600</delay>
                            <history>15</history>
                            <trends>90</trends>
                            <status>0</status>
                            <value_type>3</value_type>
                            <allowed_hosts/>
                            <units>B</units>
                            <delta>0</delta>
                            <snmpv3_contextname/>
                            <snmpv3_securityname/>
                            <snmpv3_securitylevel>0</snmpv3_securitylevel>
                            <snmpv3_authprotocol>0</snmpv3_authprotocol>
                            <snmpv3_authpassphrase/>
                            <snmpv3_privprotocol>0</snmpv3_privprotocol>
                            <snmpv3_privpassphrase/>
                            <formula>1024</formula>
                            <delay_flex/>
                            <params/>
                            <ipmi_sensor/>
                            <data_type>0</data_type>
                            <authtype>0</authtype>
                            <username/>
                            <password/>
                            <publickey/>
                            <privatekey/>
                            <port/>
                            <description>Detects Total Bank Size.

perf_counter[\{$MSSQLINST}:Databases({#MSSQLDBNAME})\Data File(s) Size (KB)]</description>
                            <inventory_link>0</inventory_link>
                            <applications/>
                            <valuemap/>
                            <logtimefmt/>
                            <application_prototypes>
                                <application_prototype>
                                    <name>MSSQL database info - {#MSSQLDBNAME}</name>
                                </application_prototype>
                            </application_prototypes>
                        </item_prototype>
                        <item_prototype>
                            <name>{#MSSQLDBNAME} Log Size</name>
                            <type>7</type>
                            <snmp_community/>
                            <multiplier>1</multiplier>
                            <snmp_oid/>
                            <key>perf_counter[\{$MSSQLINST}:Databases({#MSSQLDBNAME})\Log File(s) Size (KB)]</key>
                            <delay>3600</delay>
                            <history>15</history>
                            <trends>90</trends>
                            <status>0</status>
                            <value_type>3</value_type>
                            <allowed_hosts/>
                            <units>B</units>
                            <delta>0</delta>
                            <snmpv3_contextname/>
                            <snmpv3_securityname/>
                            <snmpv3_securitylevel>0</snmpv3_securitylevel>
                            <snmpv3_authprotocol>0</snmpv3_authprotocol>
                            <snmpv3_authpassphrase/>
                            <snmpv3_privprotocol>0</snmpv3_privprotocol>
                            <snmpv3_privpassphrase/>
                            <formula>1024</formula>
                            <delay_flex/>
                            <params/>
                            <ipmi_sensor/>
                            <data_type>0</data_type>
                            <authtype>0</authtype>
                            <username/>
                            <password/>
                            <publickey/>
                            <privatekey/>
                            <port/>
                            <description>Total Log File Size.

perf_counter[\{$MSSQLINST}:Databases({#MSSQLDBNAME})\Log File(s) Size (KB)]</description>
                            <inventory_link>0</inventory_link>
                            <applications/>
                            <valuemap/>
                            <logtimefmt/>
                            <application_prototypes>
                                <application_prototype>
                                    <name>MSSQL database info - {#MSSQLDBNAME}</name>
                                </application_prototype>
                            </application_prototypes>
                        </item_prototype>
                    </item_prototypes>
                    <trigger_prototypes>
                        <trigger_prototype>
                            <expression>{Template Windows LLD MSSQL:discovery.mssql.data[STATUS,{#MSSQLDBNAME}].last(0)}>0</expression>
                            <recovery_mode>0</recovery_mode>
                            <recovery_expression/>
                            <name>{#MSSQLDBNAME}  ({ITEM.LASTVALUE})  is down on {HOST.NAME}</name>
                            <correlation_mode>0</correlation_mode>
                            <correlation_tag/>
                            <url/>
                            <status>0</status>
                            <priority>4</priority>
                            <description>Sqlserver

The status of the database {# mssqldbname} is {item.lastvalue}



Status possible.

0 ⇒ online.

1 ⇒ catering

2 ⇒ recovering

3 ⇒ recovery pending

4 ⇒ suspect

5 ⇒Emergency

6 ⇒ offline



7 ⇒ not exist</description>
                            <type>0</type>
                            <manual_close>0</manual_close>
                            <dependencies/>
                            <tags/>
                        </trigger_prototype>
                    </trigger_prototypes>
                    <graph_prototypes>
                        <graph_prototype>
                            <name>MSSQL Database Size and Log in {#MSSQLDBNAME}</name>
                            <width>900</width>
                            <height>200</height>
                            <yaxismin>0.0000</yaxismin>
                            <yaxismax>100.0000</yaxismax>
                            <show_work_period>0</show_work_period>
                            <show_triggers>1</show_triggers>
                            <type>0</type>
                            <show_legend>1</show_legend>
                            <show_3d>0</show_3d>
                            <percent_left>0.0000</percent_left>
                            <percent_right>0.0000</percent_right>
                            <ymin_type_1>0</ymin_type_1>
                            <ymax_type_1>0</ymax_type_1>
                            <ymin_item_1>0</ymin_item_1>
                            <ymax_item_1>0</ymax_item_1>
                            <graph_items>
                                <graph_item>
                                    <sortorder>0</sortorder>
                                    <drawtype>5</drawtype>
                                    <color>00C800</color>
                                    <yaxisside>0</yaxisside>
                                    <calc_fnc>7</calc_fnc>
                                    <type>0</type>
                                    <item>
                                        <host>Template Windows LLD MSSQL</host>
                                        <key>perf_counter[\{$MSSQLINST}:Databases({#MSSQLDBNAME})\Data File(s) Size (KB)]</key>
                                    </item>
                                </graph_item>
                                <graph_item>
                                    <sortorder>1</sortorder>
                                    <drawtype>5</drawtype>
                                    <color>0099CC</color>
                                    <yaxisside>1</yaxisside>
                                    <calc_fnc>7</calc_fnc>
                                    <type>0</type>
                                    <item>
                                        <host>Template Windows LLD MSSQL</host>
                                        <key>perf_counter[\{$MSSQLINST}:Databases({#MSSQLDBNAME})\Log File(s) Size (KB)]</key>
                                    </item>
                                </graph_item>
                            </graph_items>
                        </graph_prototype>
                        <graph_prototype>
                            <name>MSSQL Number of Connections in {#MSSQLDBNAME}</name>
                            <width>900</width>
                            <height>200</height>
                            <yaxismin>0.0000</yaxismin>
                            <yaxismax>100.0000</yaxismax>
                            <show_work_period>0</show_work_period>
                            <show_triggers>1</show_triggers>
                            <type>0</type>
                            <show_legend>1</show_legend>
                            <show_3d>0</show_3d>
                            <percent_left>0.0000</percent_left>
                            <percent_right>0.0000</percent_right>
                            <ymin_type_1>0</ymin_type_1>
                            <ymax_type_1>0</ymax_type_1>
                            <ymin_item_1>0</ymin_item_1>
                            <ymax_item_1>0</ymax_item_1>
                            <graph_items>
                                <graph_item>
                                    <sortorder>0</sortorder>
                                    <drawtype>5</drawtype>
                                    <color>0099CC</color>
                                    <yaxisside>1</yaxisside>
                                    <calc_fnc>7</calc_fnc>
                                    <type>0</type>
                                    <item>
                                        <host>Template Windows LLD MSSQL</host>
                                        <key>discovery.mssql.data[CONN,{#MSSQLDBNAME}]</key>
                                    </item>
                                </graph_item>
                            </graph_items>
                        </graph_prototype>
                    </graph_prototypes>
                    <host_prototypes/>
                </discovery_rule>
                <discovery_rule>
                    <name>MSSQL Jobs</name>
                    <type>7</type>
                    <snmp_community/>
                    <snmp_oid/>
                    <key>discovery.mssql.jobs</key>
                    <delay>3600</delay>
                    <status>0</status>
                    <allowed_hosts/>
                    <snmpv3_contextname/>
                    <snmpv3_securityname/>
                    <snmpv3_securitylevel>0</snmpv3_securitylevel>
                    <snmpv3_authprotocol>0</snmpv3_authprotocol>
                    <snmpv3_authpassphrase/>
                    <snmpv3_privprotocol>0</snmpv3_privprotocol>
                    <snmpv3_privpassphrase/>
                    <delay_flex/>
                    <params/>
                    <ipmi_sensor/>
                    <authtype>0</authtype>
                    <username/>
                    <password/>
                    <publickey/>
                    <privatekey/>
                    <port/>
                    <filter>
                        <evaltype>0</evaltype>
                        <formula/>
                        <conditions/>
                    </filter>
                    <lifetime>1</lifetime>
                    <description>SQL Server Jobs Discovery</description>
                    <item_prototypes>
                        <item_prototype>
                            <name>Job {#MSSQLJOBNAME} Status</name>
                            <type>7</type>
                            <snmp_community/>
                            <multiplier>0</multiplier>
                            <snmp_oid/>
                            <key>discovery.mssql.data[JOBSTATUS,{#MSSQLJOBNAME}]</key>
                            <delay>3600</delay>
                            <history>15</history>
                            <trends>30</trends>
                            <status>0</status>
                            <value_type>3</value_type>
                            <allowed_hosts/>
                            <units/>
                            <delta>0</delta>
                            <snmpv3_contextname/>
                            <snmpv3_securityname/>
                            <snmpv3_securitylevel>0</snmpv3_securitylevel>
                            <snmpv3_authprotocol>0</snmpv3_authprotocol>
                            <snmpv3_authpassphrase/>
                            <snmpv3_privprotocol>0</snmpv3_privprotocol>
                            <snmpv3_privpassphrase/>
                            <formula>1</formula>
                            <delay_flex/>
                            <params/>
                            <ipmi_sensor/>
                            <data_type>0</data_type>
                            <authtype>0</authtype>
                            <username/>
                            <password/>
                            <publickey/>
                            <privatekey/>
                            <port/>
                            <description>Monitora Status dos Jobs SQLSERVER.</description>
                            <inventory_link>0</inventory_link>
                            <applications>
                                <application>
                                    <name>MSSQL Jobs Status</name>
                                </application>
                            </applications>
                            <valuemap>
                                <name>MSSQL Jobs Status</name>
                            </valuemap>
                            <logtimefmt/>
                            <application_prototypes/>
                        </item_prototype>
                    </item_prototypes>
                    <trigger_prototypes>
                        <trigger_prototype>
                            <expression>{Template Windows LLD MSSQL:discovery.mssql.data[JOBSTATUS,{#MSSQLJOBNAME}].last(0)}=0</expression>
                            <recovery_mode>0</recovery_mode>
                            <recovery_expression/>
                            <name>Job {#MSSQLJOBNAME} ({ITEM.LASTVALUE}) on {HOST.NAME}</name>
                            <correlation_mode>0</correlation_mode>
                            <correlation_tag/>
                            <url/>
                            <status>0</status>
                            <priority>4</priority>
                            <description>SQLServer

Job Status {#MSSQLJOBNAME} is {ITEM.LASTVALUE}



Possible Status:

0 = Failure

1 = Success

2 = Repeat

3 = Canceled

4 = In Progress

5 = Never Run</description>
                            <type>0</type>
                            <manual_close>0</manual_close>
                            <dependencies/>
                            <tags/>
                        </trigger_prototype>
                        <trigger_prototype>
                            <expression>{Template Windows LLD MSSQL:discovery.mssql.data[JOBSTATUS,{#MSSQLJOBNAME}].last(0)}=2</expression>
                            <recovery_mode>0</recovery_mode>
                            <recovery_expression/>
                            <name>Job {#MSSQLJOBNAME} ({ITEM.LASTVALUE}) on {HOST.NAME}</name>
                            <correlation_mode>0</correlation_mode>
                            <correlation_tag/>
                            <url/>
                            <status>0</status>
                            <priority>1</priority>
                            <description/>
                            <type>0</type>
                            <manual_close>0</manual_close>
                            <dependencies/>
                            <tags/>
                        </trigger_prototype>
                        <trigger_prototype>
                            <expression>{Template Windows LLD MSSQL:discovery.mssql.data[JOBSTATUS,{#MSSQLJOBNAME}].last(0)}=3</expression>
                            <recovery_mode>0</recovery_mode>
                            <recovery_expression/>
                            <name>Job {#MSSQLJOBNAME} ({ITEM.LASTVALUE}) on {HOST.NAME}</name>
                            <correlation_mode>0</correlation_mode>
                            <correlation_tag/>
                            <url/>
                            <status>0</status>
                            <priority>2</priority>
                            <description/>
                            <type>0</type>
                            <manual_close>0</manual_close>
                            <dependencies/>
                            <tags/>
                        </trigger_prototype>
                        <trigger_prototype>
                            <expression>{Template Windows LLD MSSQL:discovery.mssql.data[JOBSTATUS,{#MSSQLJOBNAME}].last(0)}=5</expression>
                            <recovery_mode>0</recovery_mode>
                            <recovery_expression/>
                            <name>Job {#MSSQLJOBNAME} ({ITEM.LASTVALUE}) on {HOST.NAME}</name>
                            <correlation_mode>0</correlation_mode>
                            <correlation_tag/>
                            <url/>
                            <status>0</status>
                            <priority>3</priority>
                            <description/>
                            <type>0</type>
                            <manual_close>0</manual_close>
                            <dependencies/>
                            <tags/>
                        </trigger_prototype>
                    </trigger_prototypes>
                    <graph_prototypes/>
                    <host_prototypes/>
                </discovery_rule>
            </discovery_rules>
            <httptests/>
            <macros/>
            <templates/>
            <screens/>
        </template>
    </templates>
    <triggers>
        <trigger>
            <expression>{Template Windows LLD MSSQL:net.tcp.port[,{$MSSQLPORT}].last(0)}=0</expression>
            <recovery_mode>0</recovery_mode>
            <recovery_expression/>
            <name>MSSQL ({ITEM.LASTVALUE}) is not running on {HOST.NAME}</name>
            <correlation_mode>0</correlation_mode>
            <correlation_tag/>
            <url/>
            <status>0</status>
            <priority>2</priority>
            <description>MSSQL Port is down</description>
            <type>0</type>
            <manual_close>1</manual_close>
            <dependencies/>
            <tags/>
        </trigger>
        <trigger>
            <expression>{Template Windows LLD MSSQL:service.info[{$MSSQLAGENT}].count(#3,0,gt)}=3</expression>
            <recovery_mode>0</recovery_mode>
            <recovery_expression/>
            <name>SQL Server Agent {$MSSQLAGENT} ({ITEM.LASTVALUE}) is not running on {HOST.NAME}</name>
            <correlation_mode>0</correlation_mode>
            <correlation_tag/>
            <url/>
            <status>0</status>
            <priority>2</priority>
            <description>Service: SQLSERVERAGENT

Name: SQL Server Agent ({$ MSSQLAGENT})

Description: Performs tasks, monitors SQL Server, triggers alerts, and allows the automation of some administrative tasks.</description>
            <type>0</type>
            <manual_close>1</manual_close>
            <dependencies/>
            <tags/>
        </trigger>
        <trigger>
            <expression>{Template Windows LLD MSSQL:service.info[MsDtsServer100].count(#3,0,gt)}=3 and {Template Windows LLD MSSQL:service.info[MsDtsServer100].last()}<>255</expression>
            <recovery_mode>0</recovery_mode>
            <recovery_expression/>
            <name>SQL Server Integration Services 10.0 ({ITEM.LASTVALUE}) is not runnig on {HOST.NAME}</name>
            <correlation_mode>0</correlation_mode>
            <correlation_tag/>
            <url/>
            <status>0</status>
            <priority>2</priority>
            <description>Service: SQLSERVERAGENT

Name: SQL Server Agent ({$ MSSQLAGENT})

Description: Performs tasks, monitors SQL Server, triggers alerts, and allows the automation of some administrative tasks.</description>
            <type>0</type>
            <manual_close>1</manual_close>
            <dependencies/>
            <tags/>
        </trigger>
        <trigger>
            <expression>{Template Windows LLD MSSQL:service.info[{$MSSQLSERVER}].count(#3,0,gt)}=3</expression>
            <recovery_mode>0</recovery_mode>
            <recovery_expression/>
            <name>SQL Server {$MSSQLSERVER} ({ITEM.LASTVALUE}) is not runnig on {HOST.NAME}</name>
            <correlation_mode>0</correlation_mode>
            <correlation_tag/>
            <url/>
            <status>0</status>
            <priority>2</priority>
            <description>Service: MSSQLSERVER

Name: SQL Server ({$ MSSQLSERVER})

Description: Offers storage, processing, and controlled access to data and fast transaction processing.</description>
            <type>0</type>
            <manual_close>1</manual_close>
            <dependencies/>
            <tags/>
        </trigger>
    </triggers>
    <graphs>
        <graph>
            <name>MSSQL Memory Usage</name>
            <width>900</width>
            <height>200</height>
            <yaxismin>0.0000</yaxismin>
            <yaxismax>100.0000</yaxismax>
            <show_work_period>1</show_work_period>
            <show_triggers>1</show_triggers>
            <type>0</type>
            <show_legend>1</show_legend>
            <show_3d>0</show_3d>
            <percent_left>0.0000</percent_left>
            <percent_right>0.0000</percent_right>
            <ymin_type_1>0</ymin_type_1>
            <ymax_type_1>0</ymax_type_1>
            <ymin_item_1>0</ymin_item_1>
            <ymax_item_1>0</ymax_item_1>
            <graph_items>
                <graph_item>
                    <sortorder>0</sortorder>
                    <drawtype>2</drawtype>
                    <color>FC6EA3</color>
                    <yaxisside>1</yaxisside>
                    <calc_fnc>7</calc_fnc>
                    <type>0</type>
                    <item>
                        <host>Template Windows LLD MSSQL</host>
                        <key>perf_counter[\Process(sqlservr)\Private Bytes]</key>
                    </item>
                </graph_item>
                <graph_item>
                    <sortorder>1</sortorder>
                    <drawtype>2</drawtype>
                    <color>A54F10</color>
                    <yaxisside>1</yaxisside>
                    <calc_fnc>7</calc_fnc>
                    <type>0</type>
                    <item>
                        <host>Template Windows LLD MSSQL</host>
                        <key>perf_counter[\{$MSSQLINST}:Memory Manager\SQL Cache Memory (KB)]</key>
                    </item>
                </graph_item>
                <graph_item>
                    <sortorder>2</sortorder>
                    <drawtype>2</drawtype>
                    <color>2774A4</color>
                    <yaxisside>1</yaxisside>
                    <calc_fnc>7</calc_fnc>
                    <type>0</type>
                    <item>
                        <host>Template Windows LLD MSSQL</host>
                        <key>perf_counter[\{$MSSQLINST}:Buffer Manager\Buffer cache hit ratio]</key>
                    </item>
                </graph_item>
                <graph_item>
                    <sortorder>3</sortorder>
                    <drawtype>2</drawtype>
                    <color>6C59DC</color>
                    <yaxisside>1</yaxisside>
                    <calc_fnc>7</calc_fnc>
                    <type>0</type>
                    <item>
                        <host>Template Windows LLD MSSQL</host>
                        <key>perf_counter[\{$MSSQLINST}:Memory Manager\Memory Grants Pending]</key>
                    </item>
                </graph_item>
                <graph_item>
                    <sortorder>4</sortorder>
                    <drawtype>2</drawtype>
                    <color>AC8C14</color>
                    <yaxisside>1</yaxisside>
                    <calc_fnc>7</calc_fnc>
                    <type>0</type>
                    <item>
                        <host>Template Windows LLD MSSQL</host>
                        <key>perf_counter[\{$MSSQLINST}:Memory Manager\Target Server Memory (KB)]</key>
                    </item>
                </graph_item>
            </graph_items>
        </graph>
        <graph>
            <name>MSSQL Statistics</name>
            <width>900</width>
            <height>200</height>
            <yaxismin>0.0000</yaxismin>
            <yaxismax>100.0000</yaxismax>
            <show_work_period>1</show_work_period>
            <show_triggers>1</show_triggers>
            <type>0</type>
            <show_legend>1</show_legend>
            <show_3d>0</show_3d>
            <percent_left>0.0000</percent_left>
            <percent_right>0.0000</percent_right>
            <ymin_type_1>0</ymin_type_1>
            <ymax_type_1>0</ymax_type_1>
            <ymin_item_1>0</ymin_item_1>
            <ymax_item_1>0</ymax_item_1>
            <graph_items>
                <graph_item>
                    <sortorder>0</sortorder>
                    <drawtype>0</drawtype>
                    <color>6C59DC</color>
                    <yaxisside>1</yaxisside>
                    <calc_fnc>7</calc_fnc>
                    <type>0</type>
                    <item>
                        <host>Template Windows LLD MSSQL</host>
                        <key>perf_counter[\{$MSSQLINST}:Buffer Manager\Checkpoint pages/sec]</key>
                    </item>
                </graph_item>
                <graph_item>
                    <sortorder>1</sortorder>
                    <drawtype>0</drawtype>
                    <color>AC8C14</color>
                    <yaxisside>1</yaxisside>
                    <calc_fnc>7</calc_fnc>
                    <type>0</type>
                    <item>
                        <host>Template Windows LLD MSSQL</host>
                        <key>perf_counter[\{$MSSQLINST}:Buffer Manager\Database pages]</key>
                    </item>
                </graph_item>
                <graph_item>
                    <sortorder>2</sortorder>
                    <drawtype>0</drawtype>
                    <color>611F27</color>
                    <yaxisside>1</yaxisside>
                    <calc_fnc>7</calc_fnc>
                    <type>0</type>
                    <item>
                        <host>Template Windows LLD MSSQL</host>
                        <key>perf_counter[\{$MSSQLINST}:SQL Errors(_Total)\Errors/sec]</key>
                    </item>
                </graph_item>
                <graph_item>
                    <sortorder>3</sortorder>
                    <drawtype>0</drawtype>
                    <color>F230E0</color>
                    <yaxisside>1</yaxisside>
                    <calc_fnc>7</calc_fnc>
                    <type>0</type>
                    <item>
                        <host>Template Windows LLD MSSQL</host>
                        <key>perf_counter[\{$MSSQLINST}:Buffer Manager\Lazy writes/sec]</key>
                    </item>
                </graph_item>
                <graph_item>
                    <sortorder>4</sortorder>
                    <drawtype>0</drawtype>
                    <color>5CCD18</color>
                    <yaxisside>1</yaxisside>
                    <calc_fnc>7</calc_fnc>
                    <type>0</type>
                    <item>
                        <host>Template Windows LLD MSSQL</host>
                        <key>perf_counter[\{$MSSQLINST}:Locks(_Total)\Lock Waits/sec]</key>
                    </item>
                </graph_item>
                <graph_item>
                    <sortorder>5</sortorder>
                    <drawtype>0</drawtype>
                    <color>BB2A02</color>
                    <yaxisside>1</yaxisside>
                    <calc_fnc>7</calc_fnc>
                    <type>0</type>
                    <item>
                        <host>Template Windows LLD MSSQL</host>
                        <key>perf_counter[\{$MSSQLINST}:Buffer Manager\Page life expectancy]</key>
                    </item>
                </graph_item>
                <graph_item>
                    <sortorder>6</sortorder>
                    <drawtype>0</drawtype>
                    <color>5A2B57</color>
                    <yaxisside>1</yaxisside>
                    <calc_fnc>7</calc_fnc>
                    <type>0</type>
                    <item>
                        <host>Template Windows LLD MSSQL</host>
                        <key>perf_counter[\Process(sqlservr)\% Processor Time]</key>
                    </item>
                </graph_item>
                <graph_item>
                    <sortorder>7</sortorder>
                    <drawtype>0</drawtype>
                    <color>89ABF8</color>
                    <yaxisside>1</yaxisside>
                    <calc_fnc>7</calc_fnc>
                    <type>0</type>
                    <item>
                        <host>Template Windows LLD MSSQL</host>
                        <key>perf_counter[\{$MSSQLINST}:SQL Statistics\SQL Compilations/sec]</key>
                    </item>
                </graph_item>
                <graph_item>
                    <sortorder>8</sortorder>
                    <drawtype>0</drawtype>
                    <color>7EC25C</color>
                    <yaxisside>1</yaxisside>
                    <calc_fnc>7</calc_fnc>
                    <type>0</type>
                    <item>
                        <host>Template Windows LLD MSSQL</host>
                        <key>perf_counter[\{$MSSQLINST}:Buffer Manager\Target pages]</key>
                    </item>
                </graph_item>
                <graph_item>
                    <sortorder>9</sortorder>
                    <drawtype>0</drawtype>
                    <color>274482</color>
                    <yaxisside>1</yaxisside>
                    <calc_fnc>7</calc_fnc>
                    <type>0</type>
                    <item>
                        <host>Template Windows LLD MSSQL</host>
                        <key>perf_counter[\{$MSSQLINST}:General Statistics\User Connections]</key>
                    </item>
                </graph_item>
            </graph_items>
        </graph>
        <graph>
            <name>MSSQL Total Size of Databases and Logs</name>
            <width>900</width>
            <height>200</height>
            <yaxismin>0.0000</yaxismin>
            <yaxismax>100.0000</yaxismax>
            <show_work_period>1</show_work_period>
            <show_triggers>1</show_triggers>
            <type>0</type>
            <show_legend>1</show_legend>
            <show_3d>0</show_3d>
            <percent_left>0.0000</percent_left>
            <percent_right>0.0000</percent_right>
            <ymin_type_1>0</ymin_type_1>
            <ymax_type_1>0</ymax_type_1>
            <ymin_item_1>0</ymin_item_1>
            <ymax_item_1>0</ymax_item_1>
            <graph_items>
                <graph_item>
                    <sortorder>0</sortorder>
                    <drawtype>5</drawtype>
                    <color>00CC00</color>
                    <yaxisside>1</yaxisside>
                    <calc_fnc>7</calc_fnc>
                    <type>0</type>
                    <item>
                        <host>Template Windows LLD MSSQL</host>
                        <key>perf_counter[\{$MSSQLINST}:Databases(_Total)\Data File(s) Size (KB)]</key>
                    </item>
                </graph_item>
                <graph_item>
                    <sortorder>1</sortorder>
                    <drawtype>5</drawtype>
                    <color>DD0000</color>
                    <yaxisside>1</yaxisside>
                    <calc_fnc>7</calc_fnc>
                    <type>0</type>
                    <item>
                        <host>Template Windows LLD MSSQL</host>
                        <key>perf_counter[\{$MSSQLINST}:Databases(_Total)\Log File(s) Size (KB)]</key>
                    </item>
                </graph_item>
            </graph_items>
        </graph>
    </graphs>
    <value_maps>
        <value_map>
            <name>MSSQL Databases Status</name>
            <mappings>
                <mapping>
                    <value>0</value>
                    <newvalue>online</newvalue>
                </mapping>
                <mapping>
                    <value>1</value>
                    <newvalue>restoration</newvalue>
                </mapping>
                <mapping>
                    <value>2</value>
                    <newvalue>recovering</newvalue>
                </mapping>
                <mapping>
                    <value>3</value>
                    <newvalue>pending recovery</newvalue>
                </mapping>
                <mapping>
                    <value>4</value>
                    <newvalue>suspect</newvalue>
                </mapping>
                <mapping>
                    <value>5</value>
                    <newvalue>emergency</newvalue>
                </mapping>
                <mapping>
                    <value>6</value>
                    <newvalue>offline</newvalue>
                </mapping>
                <mapping>
                    <value>7</value>
                    <newvalue>not exist</newvalue>
                </mapping>
            </mappings>
        </value_map>
        <value_map>
            <name>MSSQL Jobs Status</name>
            <mappings>
                <mapping>
                    <value>0</value>
                    <newvalue>failure</newvalue>
                </mapping>
                <mapping>
                    <value>1</value>
                    <newvalue>Sucess</newvalue>
                </mapping>
                <mapping>
                    <value>2</value>
                    <newvalue>Repeat</newvalue>
                </mapping>
                <mapping>
                    <value>3</value>
                    <newvalue>Canceled</newvalue>
                </mapping>
                <mapping>
                    <value>4</value>
                    <newvalue>In progress</newvalue>
                </mapping>
                <mapping>
                    <value>5</value>
                    <newvalue>Never performed</newvalue>
                </mapping>
            </mappings>
        </value_map>
        <value_map>
            <name>MSSQL Service</name>
            <mappings>
                <mapping>
                    <value>0</value>
                    <newvalue>Initiated</newvalue>
                </mapping>
                <mapping>
                    <value>1</value>
                    <newvalue>Paused</newvalue>
                </mapping>
                <mapping>
                    <value>2</value>
                    <newvalue>Start Pending</newvalue>
                </mapping>
                <mapping>
                    <value>3</value>
                    <newvalue>Pause Pending</newvalue>
                </mapping>
                <mapping>
                    <value>4</value>
                    <newvalue>Continue Pending</newvalue>
                </mapping>
                <mapping>
                    <value>5</value>
                    <newvalue>Stop Pending</newvalue>
                </mapping>
                <mapping>
                    <value>6</value>
                    <newvalue>Stopped</newvalue>
                </mapping>
                <mapping>
                    <value>7</value>
                    <newvalue>Unknown</newvalue>
                </mapping>
                <mapping>
                    <value>255</value>
                    <newvalue>Unknown</newvalue>
                </mapping>
            </mappings>
        </value_map>
        <value_map>
            <name>Service state</name>
            <mappings>
                <mapping>
                    <value>0</value>
                    <newvalue>Down</newvalue>
                </mapping>
                <mapping>
                    <value>1</value>
                    <newvalue>Up</newvalue>
                </mapping>
            </mappings>
        </value_map>
    </value_maps>
</zabbix_export>
```

> **注意** 将 xml 内容保存为 xml 文件导入 zabbix 模板中； 链接到主机后验证和调试直至数据产生；
