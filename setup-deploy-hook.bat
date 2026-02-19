@echo off
REM 設定每次 commit 後自動 push 到 GitHub 並部署到 Vercel
git config core.hooksPath ./hooks
echo 已設定：每次 git commit 後會自動執行 git push 及 vercel --prod
echo 若要取消：git config --unset core.hooksPath
