#!/bin/bash
first="2018-10-31"
last="2018-11-11"
until [ "$first" = "$last" ]
do
    first=`date -d "$first 1 days" +"%Y-%m-%d"`
    wget -nc -q http://ikuta.club/nogizaka/message/getBlogList.do?day=$first -O $first
    echo $first
done
