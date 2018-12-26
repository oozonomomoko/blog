
#!/bin/bash
first="2018-12-15"
last="2018-12-26"
until [ "$first" = "$last" ]
do
    wget -nc -q http://ikuta.club/nogizaka/message/getBlogList.do?day=$first -O $first
    echo $first
    first=`date -d "$first 1 days" +"%Y-%m-%d"`
done
