@echo off
:: ตั้ง Windows Task Scheduler ให้รัน daily_job.py ทุกวัน 07:00 น.

set TASK_NAME=PM25_DailyJob
set PYTHON=%USERPROFILE%\anaconda3\python.exe
set SCRIPT=%~dp0daily_job.py

echo Creating scheduled task: %TASK_NAME%

schtasks /Create /TN "%TASK_NAME%" /TR "\"%PYTHON%\" \"%SCRIPT%\"" /SC DAILY /ST 07:00 /F /RL HIGHEST

if %ERRORLEVEL% == 0 (
    echo Task created successfully.
    echo Run now to test: schtasks /Run /TN "%TASK_NAME%"
) else (
    echo Failed to create task. Run this script as Administrator.
)
pause
