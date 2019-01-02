
#!/bin/bash
first="2018-12-26"
last="2019-01-01"
until [ "$first" = "$last" ]
do
    wget -nc -q http://ikuta.club/nogizaka/message/getBlogList.do?day=$first -O $first
    echo $first
    first=`date -d "$first 1 days" +"%Y-%m-%d"`
done
