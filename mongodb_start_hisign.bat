@echo off
set filename=mongod.exe
set filepath=C:\Program" "Files\MongoDB\Server\3.2\bin\
start %filepath%%filename% --dbpath D:\MyNode\db_mongodb
cmd.exe