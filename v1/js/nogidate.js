/**
 * Nogidate 年月日插件
 *
 * version:1.0.0
 *
 * author:左手掐腰
 *
 * Copyright 2019.3
 *
 */
window.Nogidate = (function(){
    let Nogidate = function() {
        this.unitH = 22;
    };
    Nogidate.prototype = {
        init: function(config) {
            /**
             * {
                "startDate":"2011-11-11",
                "endDate":'',
                "currDate":'',
                "initEle": document.querySelector("#element"),
                'ulClass': 'pager_detail',
                'rootClass': 'pager_root',
                'needRoot': true,
                'change':function(date){
                    console.log(date);
                    window.location.href = '#' + date;
                    showList(date);
                }
               }
             */
            if(!config || !config.initEle) {
                console.log('未找到初始化元素');
                return;
            }

            this.startDate = config.startDate?config.startDate:'2011-11-11';
            this.startYear = Number(this.startDate.split('-')[0]);
            this.startMon =  Number(this.startDate.split('-')[1]);
            this.startDay =  Number(this.startDate.split('-')[2]);

            this.endDate = config.endDate?config.endDate:this.getCurr();
            this.endYear = Number(this.endDate.split('-')[0]);
            this.endMon =  Number(this.endDate.split('-')[1]);
            this.endDay =  Number(this.endDate.split('-')[2]);

            let currDate = config.currDate?config.currDate:this.endDate;
            this.currYear = Number(currDate.split('-')[0]);
            this.currMon =  Number(currDate.split('-')[1]);
            this.currDay =  Number(currDate.split('-')[2]);

            if (this.startDate > this.endDate || currDate < this.startDate || currDate > this.endDate) {
                console.log('日期返回不正确');
            }
            this.change = config.change;

            this.ulClass = config.ulClass?config.ulClass:'';
            this.rootClass = config.rootClass?config.rootClass:'';

            this.initEle = config.initEle;
            this.yearUL = document.createElement('ul');
            this.yearUL.className = 'nogiyear ' + this.ulClass;
            this.monUL = document.createElement('ul');
            this.monUL.className = 'nogimon ' + this.ulClass;
            this.dayUL = document.createElement('ul');
            this.dayUL.className = 'nogiday ' + this.ulClass;

            this.rootEle = document.createElement('div');
            if (config.needRoot) {
                this.initEle.innerHTML='';
                this.initEle.appendChild(this.rootEle);
            } else {
                this.rootEle = this.initEle;
            }
            this.rootEle.className += ' nogidate ' + this.rootClass;
            this.rootEle.appendChild(this.yearUL);
            this.rootEle.appendChild(this.monUL);
            this.rootEle.appendChild(this.dayUL);

            // 样式
            if (!document.getElementById('nogidatestyle')) {
                let style = document.createElement('style');
                style.setAttribute('id', 'nogidatestyle');
                style.innerHTML='.nogidate ul {list-style: none;margin: 0;transition: 0.35s;-moz-transition: 0.35s;-webkit-transition: 0.35s;}.nogicurr{font-family:\'Poiret One\',sans-serif;color: #44c9ff;font-weight: bold;}.nogidate {display: flex;cursor: pointer;-moz-user-select:none;-webkit-user-select:none;-ms-user-select:none;-khtml-user-select:none;user-select:none;-webkit-tap-highlight-color: rgba(0, 0, 0, 0);}.nogiyear .nogicurr:after{content: " 年";}.nogimon .nogicurr:after{content: " 月";}.nogiday .nogicurr:after{content: " 日";}.nogidate li{height: 22px;}';
                document.body.appendChild(style);
            }

            // 行高调整
            let that = this;/*
            window.onresize = function(){
                that.unitH = that.yearUL.querySelector('li').offsetHeight;
                that.resizePos(this.yearUL);
            };*/
            // 生成年月日DOM
            this.reload(this.yearUL);
            // 调整选中日期的位置
            this.resizePos(this.yearUL);
            // 执行回调
            this.dateChange();

            // 绑定鼠标事件
            this.bindDrag(this.yearUL);
            this.bindDrag(this.monUL);
            this.bindDrag(this.dayUL);
        },
        reinit: function(currDate){
            if (currDate){
                this.currYear = Number(currDate.split('-')[0]);
                this.currMon =  Number(currDate.split('-')[1]);
                this.currDay =  Number(currDate.split('-')[2]);
                this.reload(this.yearUL);
                this.resizePos(this.yearUL);
                this.dateChange();
            }
        },
        /**
         * 获取元素的marginTop，并限制其最大最小值
         */
        getLastMargin: function(ele){
            let minMarginTop = (1-ele.children.length) * this.unitH;

            if (ele.style.marginTop) {
                let lastMargin = Number(ele.style.marginTop.replace('px', ''));

                if (lastMargin > 0) {
                    return 0;
                }

                if (lastMargin < minMarginTop) {
                    return minMarginTop;
                }
                return lastMargin;
            }
            return 0;
            
        },
        /**
         * 将元素以及其后的节点定位到nogicurr的位置
         * @param ele
         */
        resizePos: function(ele){
            if(!ele){return}
            // 行高
            let curr = ele.querySelector('.nogicurr');
            ele.style.marginTop = -curr.getAttribute('index') * this.unitH + 'px';
            this.resizePos(ele.nextSibling);
        },
        /**
         * 根据marginTop判断元素的当前选定值
         * 并标记其className为nogicurr
         * @param ele
         */
        updateCurrClass: function(ele){
            let lastMargin = Math.abs(this.getLastMargin(ele));
            let index = Math.floor((lastMargin+this.unitH/2)/this.unitH);
            ele.querySelector('.nogicurr').className = '';
            ele.querySelector('li[index=\''+index+'\']').className = 'nogicurr';
        },
        /**
         * 根据点击位置确认选择日期
         * 并标记其className为nogicurr
         * @param ele
         */
        clickSelect: function(ele, index){
            ele.querySelector('.nogicurr').className = '';
            ele.querySelector('li[index=\''+index+'\']').className = 'nogicurr';
        },
        /**
         * 绑定鼠标事件
         * @param ele
         */
        bindDrag: function(ele) {
            let that = this;
            function mouseup(e){
                document.body.removeEventListener('mousemove', mousemoveFN, { passive: false });
                document.body.removeEventListener('touchmove', mousemoveFN, { passive: false });
                document.body.removeEventListener('mouseup', mouseup);
                document.body.removeEventListener('touchend', mouseup);
                
                // 动画渐变效果
                ele.style.transition = '0.35s';
                // click
                if(e.pageX === that.startX && e.pageY === that.startY){
                    // 根据点击位置确认选择日期
                    let index = e.path[0].getAttribute('index');
                    if(null !== index)
                        that.clickSelect(ele, index);
                } else {
                    // 根据位置确定当前选定的元素
                    that.updateCurrClass(ele);
                }
                // 更新当前的日期
                that.renewDate();
                // 重新加载之后的节点
                that.reload(ele.nextSibling);
                // 定位到当前选定的元素
                that.resizePos(ele);
                that.dateChange();
            }
            function mousemoveFN(e){
                e.preventDefault();
                // 判断是触摸还是点击事件
                if (e.targetTouches) {
                    ele.style.marginTop = Number(ele.style.marginTop.replace('px', '')) + e.targetTouches[0].pageY-that.pageY + 'px';
                    that.pageY = e.targetTouches[0].pageY;
                } else {
                    ele.style.marginTop = Number(ele.style.marginTop.replace('px', '')) + e.pageY-that.pageY + 'px';
                    that.pageY = e.pageY;
                }
                // 每次移动事件都根据位置确定当前选定的元素
                that.updateCurrClass(ele);
            }
            function mousedownFN(e){
                // 判断是触摸还是点击事件
                if (e.targetTouches) {
                    // 触摸事件时保存点击时的位置
                    that.startX = e.targetTouches[0].pageX;
                    that.startY = e.targetTouches[0].pageY;
                } else {
                    // 触摸事件时保存点击时的位置
                    that.startX = e.pageX;
                    that.startY = e.pageY;
                }
                that.pageY = that.startY;
                // 去除动画渐变效果
                ele.style.transition = 'none';
                // 整个网页绑定移动和松开事件
                document.body.addEventListener('mousemove', mousemoveFN, { passive: false });
                document.body.addEventListener('touchmove', mousemoveFN, { passive: false });
                document.body.addEventListener('mouseup', mouseup);
                document.body.addEventListener('touchend', mouseup);
            }
            // 事件开始
            ele.addEventListener('mousedown', mousedownFN);
            ele.addEventListener('touchstart', mousedownFN, {passive:false});
        },
        /**
         * 重新生成月份或日期
         * @param ele
         */
        reload: function(ele) {
            if (!ele) {return;}
            if (ele.className.indexOf('nogimon') !== -1) {
                let monCountStart = 1;
                if (this.startYear === this.currYear) {
                    monCountStart = this.startMon;
                    if (this.currMon < monCountStart) {
                        this.currMon = monCountStart;
                    }
                }
                let monCountEnd = 12;
                if (this.endYear === this.currYear) {
                    monCountEnd = this.endMon;
                    if (this.currMon > monCountEnd) {
                        this.currMon = monCountEnd;
                    }
                }
                this.monUL.innerHTML = '';
                for (let mon = monCountStart; mon <= monCountEnd; mon ++) {
                    let li = document.createElement('li');
                    li.textContent = mon;
                    li.setAttribute('index', mon-monCountStart);
                    if (mon === this.currMon) {
                        li.className = 'nogicurr';
                    }
                    this.monUL.appendChild(li);
                }
            } else if (ele.className.indexOf('nogiday') !== -1) {
                let dayFullCount = this.calcDays(this.currYear, this.currMon);
                let dayCountStart = 1;
                if (this.startYear === this.currYear && this.startMon === this.currMon) {
                    dayCountStart = this.startDay;
                    if (this.currDay < dayCountStart) {
                        this.currDay = dayCountStart;
                    }
                }
                let dayCountEnd = dayFullCount;
                if (this.endYear === this.currYear && this.endMon === this.currMon) {
                    dayCountEnd = this.endDay;
                    if (this.currDay > dayCountEnd) {
                        this.currDay = dayCountEnd;
                    }
                }
                if (this.currDay > dayFullCount) {
                    this.currDay = dayFullCount;
                }

                this.dayUL.innerHTML = '';
                for (let day = dayCountStart; day <= dayCountEnd; day ++) {
                    let li = document.createElement('li');
                    li.textContent = day;
                    li.setAttribute('index', day-dayCountStart);
                    if (this.currDay === day) {
                        li.className = 'nogicurr';
                    }
                    this.dayUL.appendChild(li);
                }
            } else {
                this.yearUL.innerHTML = '';
                for (let year = this.startYear; year <= this.endYear; year ++) {
                    let li = document.createElement('li');
                    li.textContent = year;
                    li.setAttribute('index', year-this.startYear);
                    if (year === this.currYear) {
                        li.className = 'nogicurr';
                    }
                    this.yearUL.appendChild(li);
                }
            }
            this.reload(ele.nextSibling);
        },
        renewDate: function(){
            this.currYear = Number(this.yearUL.querySelector('.nogicurr').textContent);
            this.currMon = Number(this.monUL.querySelector('.nogicurr').textContent);
            this.currDay = Number(this.dayUL.querySelector('.nogicurr').textContent);
        },
        dateChange: function(){
            let mon = this.currMon < 10 ? '0'+this.currMon : this.currMon;
            let day = this.currDay < 10 ? '0'+this.currDay : this.currDay;
            let newDate =  this.currYear + '-' + mon + '-' + day;
            if (newDate !== this.currDate) {
                this.currDate = newDate;
                if (this.change) {
                    this.change(this.currDate);
                }
            }
        },
        calcDays: function(year, month) {
            if (month === 2) {
                if ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0 && year % 4000 !== 0)) {
                    return 29;
                } else {
                    return 28;
                }
            } else {
                if (month === 4 || month === 6 || month === 9 || month === 11) {
                    return 30;
                } else {
                    return 31;
                }
            }
        },
        getCurr: function() {
            let date = new Date();
            let year = date.getFullYear();
            let mon = date.getMonth() + 1;
            mon = mon < 10 ? '0' + mon : mon;
            let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
            return year + '-' + mon + '-' + day;
        }
    };
    return Nogidate;
})();
