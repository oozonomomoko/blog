
#!/bin/bash
first="2018-12-05"
last="2018-12-15"
until [ "$first" = "$last" ]
do
    wget -nc -q http://ikuta.club/nogizaka/message/getBlogList.do?day=$first -O $first
    echo $first
    first=`date -d "$first 1 days" +"%Y-%m-%d"`
done
