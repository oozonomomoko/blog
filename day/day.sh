#!/bin/bash
first="2011-11-10"
last="2018-10-27"
until [ "$first" = "$last" ]
do
    first=`date -d "$first 1 days" +"%Y-%m-%d"`
    wget -q http://ikuta.club/nogizaka/message/getBlogList.do?day=$first -O $first
    echo $first
done
