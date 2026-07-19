@echo off
color 0A
echo Change pip source
color 07
pip config set global.index-url https://mirrors.aliyun.com/pypi/simple
color 0A
echo Install  jupyter notebook
color 07
pip install jupyter
color 0A
echo install requirements
color 07
pip install -r requirements.txt
pause 