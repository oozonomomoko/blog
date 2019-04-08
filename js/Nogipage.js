/**
 * Nogipage(乃木页) 分页插件 nogizaka赛高
 *
 * version:1.0.0
 *
 * author:左手掐腰(bilibili)
 *
 * Copyright 2018.8
 *
 */
window.Nogipage = (function () {
    var Nogi = function () {
        // 主体
        this.mainEle;
        this.pageNum;
        this.click;
        this.pages;
    };
    Nogi.prototype = {
        /**入参说明
         {
             totalPage:30, //总页数
             pageNum:1,//当前页
             //showAll:true,//是否显示所有页码
             click:function(pageNum){}//点击某页的回调

         }
         */
        init: function (config) {
            this.totalPage = parseInt(config.totalPage);
            this.pageNum = config.pageNum ? parseInt(config.pageNum) : 1;
            //this.showAll = config.showAll;
            this.click = config.click;

            this.mainEle = document.createElement('div');
            this.mainEle.id = 'Nogipage';
            document.body.appendChild(this.mainEle);

            var htmlStr = "<span class=\"nogiPre\"></span><div class=\"nogiNum\">";
            for (var i = 1; i <= this.totalPage; i++) {
                htmlStr += "<span>" + i + "</span>";
            }
            htmlStr += "</div><span class=\"nogiNxt\"></span>";

            this.mainEle.innerHTML = htmlStr;
            var that = this;

            this.mainEle.querySelector(".nogiPre").addEventListener('click', function () {
                that.select(that.pageNum - 1)
            });
            this.mainEle.querySelector(".nogiNxt").addEventListener('click', function () {
                that.select(that.pageNum + 1)
            });
            this.pages = this.mainEle.querySelectorAll(".nogiNum span");
            var curSel = this.pages[this.pageNum - 1];
            curSel.style['background-color'] = '#89007F';
            curSel.style.color = 'white';
            document.querySelector("#Nogipage .nogiNum").scrollTop = curSel.offsetTop - 100;

            for (var i = 0; i < this.pages.length; i++) {
                var page = this.pages[i];
                page.addEventListener('click', function () {
                    that.select(parseInt(this.textContent));
                });
            }
        },
        select: function (current) {
            if (!current || current > this.totalPage || current < 1 || current === this.pageNum) {
                return;
            }

            var curSel = this.pages[current - 1];
            curSel.style['background-color'] = '#89007F';
            curSel.style.color = 'white';

            var oldSel = this.pages[this.pageNum - 1];
            oldSel.style.color = '#89007F';
            oldSel.style['background-color'] = 'white';
            this.pageNum = current;

            if ('function' === typeof this.click) {
                this.click(this.pageNum);
            }
        }
    };
    return Nogi;
})();
