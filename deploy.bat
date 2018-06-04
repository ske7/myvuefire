cd firebase
cd public
rmdir /s/q static
del /q index.html
md static
cd..
copy "..\dist\index.html" public
xcopy "..\dist\static" "public\static" /o /x /e /h /k
firebase deploy
pause