#!/bin/bash
for line in `cat notrans.txt`
do
    wget -q http://ikuta.club/nogizaka/message/getBlog.do?id=$line -O $line
    echo $line
done
