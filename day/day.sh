
#!/bin/bash
first="2019-01-01"
last="2019-02-26"
until [ "$first" = "$last" ]
do
    wget -nc -q http://ikuta.club/nogizaka/message/getBlogList.do?day=$first -O $first
    echo $first
    first=`date -d "$first 1 days" +"%Y-%m-%d"`
done
