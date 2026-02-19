@echo off
REM 一鍵：add、commit、push、部署 Vercel
cd /d "%~dp0"

git add -A
if "%1"=="" (
  git commit -m "Auto update"
) else (
  git commit -m "%*"
)

if errorlevel 1 (
  echo 沒有變更可提交，或 commit 失敗
  exit /b 1
)

REM post-commit hook 會自動執行 git push 及 vercel --prod
exit /b 0
