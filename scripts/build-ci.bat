@echo off

REM Set the GitHub token environment variable
set GH_TOKEN=%GITHUB_TOKEN%

REM Print environment info for debugging
if defined GH_TOKEN (
    echo GH_TOKEN is set: yes
) else (
    echo GH_TOKEN is set: no
)

if defined GITHUB_TOKEN (
    echo GITHUB_TOKEN is set: yes
) else (
    echo GITHUB_TOKEN is set: no
)

REM Run the electron build
npm run electron:dist:ci -- %*