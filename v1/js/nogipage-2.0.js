/**
 * Nogipage 分页插件
 *
 * version:2.0.0
 *
 * author:左手掐腰
 *
 * Copyright 2019.3
 *
 */
window.Nogipage = (function(){
    let Nogipage = function() {
    };
    Nogipage.prototype = {
        init: function(config) {
            if(!config) {
                console.log('配置为空');
                return;
            }
            
            this.page = config.page?Number(config.page):1;
            this.totalPage = Number(config.totalPage);
            if(this.totalPage <= 0 || this.page < 1 || this.page > this.totalPage) {
                console.log('页码错误');
                return;
            }
            this.change = config.change;
            // 当前页 跳转页 前页 后页 首页 尾页
            this.pageEle = document.createElement('li');
            this.pageEle.textContent = this.page;
            this.pageEle.className = 'nogipage_page';
            this.preEle = document.createElement('li');
            this.preEle.textContent = '上页';
            this.preEle.className = 'nogipage_pre';
            this.nxtEle = document.createElement('li');
            this.nxtEle.textContent = '下页';
            this.nxtEle.className = 'nogipage_nxt';
            this.firstEle = document.createElement('li');
            this.firstEle.textContent = '首页';
            this.firstEle.className = 'nogipage_first';
            this.lastEle = document.createElement('li');
            this.lastEle.textContent = '尾页';
            this.lastEle.className = 'nogipage_last';
            
            this.rightEle = document.createElement('ul');
            this.rightEle.appendChild(this.preEle);
            this.rightEle.appendChild(this.nxtEle);
            if (config.showHead) {
                this.preEle.style.top = '-200%';
                this.nxtEle.style.top = '200%';
                this.firstEle.style.top = '-100%';
                this.lastEle.style.top = '100%';
                this.rightEle.appendChild(this.firstEle);
                this.rightEle.appendChild(this.lastEle);
            } else {
                this.preEle.style.top = '-102%';
                this.nxtEle.style.top = '102%';
            }
            this.rightEle.appendChild(this.pageEle);
            this.rightEle.className = 'nogipage';
            
            document.body.appendChild(this.rightEle);
            
            // 样式
            if (!document.getElementById('nogipagestyle')) {
                let style = document.createElement('style');
                style.setAttribute('id', 'nogipagestyle');
                style.innerHTML='.nogipage li.nogipage_page{background-color:#c679d0;}.nogipage{opacity:0.8;z-index:9999;transition:.3s;position:fixed;right:5%;top:46%;height:3em;width:3em;color:white;user-select:none;cursor:pointer;list-style:none;margin:0 auto;padding:0}.nogipage li{border:1px solid white;transition:.3s;height:100%;width:100%;text-align:center;line-height:3em;font-size:1em;position:absolute;overflow:hidden;background-color:#93d2ff}.nogipage_pre{animation:dragup .7s 2;border-radius:50% 50% 0 0}@keyframes dragup{0%{margin-top:0}50%{margin-top:-10px}100%{margin-top:0}}.nogipage_nxt{animation:dragdown .7s 2;border-radius:0 0 50% 50%}@keyframes dragdown{0%{margin-top:0}50%{margin-top:10px}100%{margin-top:0}}';
                document.body.appendChild(style);
            }

            this.bind();
            this.pageChange();
        },
        reinit: function(page){
            let temp = Number(page);
            if (temp < 1 || temp > this.totalPage) {
                return;
            }
            this.page = temp;
            this.pageEle.textContent = page;
            this.pageChange();
        },
        bind: function(){
            let that = this;
            this.firstEle.onclick = function(){
                that.pageEle.textContent = 1;
                that.page = 1;
                that.pageChange();
            };
            this.lastEle.onclick = function(){
                that.pageEle.textContent = that.totalPage;
                that.page = that.totalPage;
                that.pageChange();
            };
            // 前一页
            function mousedownPre(e){
                let pos = getEventPos(e);
                that.startX = pos[0];
                that.startY = pos[1];
                that.pageX = that.startX;
                that.pageY = that.startY;
                that.preEle.style.transition = 'none';
                that.preEle.style.borderRadius = '50%';
                that.rightEle.style.opacity = 1;
                document.addEventListener('mousemove', mousemovePre, { passive: false });
                document.addEventListener('touchmove', mousemovePre, { passive: false });
                document.addEventListener('mouseup', mouseupPre);
                document.addEventListener('touchend', mouseupPre);
            }
            function mousemovePre(e){
                let pos = getEventPos(e);
                let marginTop = Number(that.preEle.style.marginTop.replace('px', '')) + pos[1] - that.pageY;
                that.pageY = pos[1];
                if (marginTop > 9)
                    marginTop = 9;
                that.preEle.style.marginTop = marginTop + 'px';
                
                that.page = that.tempPage + Math.floor(marginTop/10);
                if (that.page < 1){
                    that.page = 1;
                    that.firstEle.style.backgroundColor = '#c679d0';
                } else {
                    that.firstEle.style.backgroundColor = '';
                }
                that.pageEle.textContent = that.page;
            }
            function mouseupPre(e){
                document.removeEventListener('mousemove', mousemovePre, { passive: false });
                document.removeEventListener('touchmove', mousemovePre, { passive: false });
                document.removeEventListener('mouseup', mouseupPre);
                document.removeEventListener('touchend', mouseupPre);
                that.preEle.style.transition = '0.3s';
                that.preEle.style.marginTop = '0px';
                that.firstEle.style.backgroundColor = '';
                that.rightEle.style.opacity = 0.8;
                that.preEle.style.borderRadius = '50% 50% 0 0';
                // 单击
                if (that.startX === that.pageX && that.startY === that.pageY){
                    let page = that.page - 1;
                    if (page > 0){
                        that.pageEle.textContent = page;
                        that.page = page;
                    }
                }
                that.pageChange();
            }
            function getEventPos(e){
                e.preventDefault();
                if(e.targetTouches){
                    return [e.targetTouches[0].pageX, e.targetTouches[0].pageY];
                } else {
                    return [e.pageX, e.pageY];
                }
            }
            this.preEle.addEventListener('mousedown', mousedownPre, { passive: false });
            this.preEle.addEventListener('touchstart', mousedownPre);
            // 后一页
            function mousedownNxt(e){
                let pos = getEventPos(e);
                that.startX = pos[0];
                that.startY = pos[1];
                that.pageX = that.startX;
                that.pageY = that.startY;
                that.nxtEle.style.transition = 'none';
                that.nxtEle.style.borderRadius = '50%';
                that.rightEle.style.opacity = 1;
                document.addEventListener('mousemove', mousemoveNxt, { passive: false });
                document.addEventListener('touchmove', mousemoveNxt, { passive: false });
                document.addEventListener('mouseup', mouseupNxt);
                document.addEventListener('touchend', mouseupNxt);
            }
            function mousemoveNxt(e){
                let pos = getEventPos(e);
                let marginTop = Number(that.nxtEle.style.marginTop.replace('px', '')) + pos[1] - that.pageY;
                that.pageY = pos[1];
                if (marginTop < -9)
                    marginTop = -9;
                that.nxtEle.style.marginTop = marginTop + 'px';
                
                that.page = that.tempPage + Math.floor(marginTop/10) + 1;
                if (that.page > that.totalPage) {
                    that.page = that.totalPage;
                    that.lastEle.style.backgroundColor = '#c679d0';
                } else {
                    that.lastEle.style.backgroundColor = '';
                }
                that.pageEle.textContent = that.page;
            }
            function mouseupNxt(e){
                document.removeEventListener('mousemove', mousemoveNxt, { passive: false });
                document.removeEventListener('touchmove', mousemoveNxt, { passive: false });
                document.removeEventListener('mouseup', mouseupNxt);
                document.removeEventListener('touchend', mouseupNxt);
                that.nxtEle.style.transition = '0.3s';
                that.nxtEle.style.marginTop = '0px';
                that.lastEle.style.backgroundColor = '';
                that.rightEle.style.opacity = 0.8;
                that.nxtEle.style.borderRadius = '0 0 50% 50%';
                // 单击
                if (that.startX === that.pageX && that.startY === that.pageY){
                    let page = that.page + 1;
                    if (page <= that.totalPage){
                        that.pageEle.textContent = page;
                        that.page = page;
                    }
                }
                that.pageChange();
            }
            function getEventPos(e){
                e.preventDefault();
                if(e.targetTouches){
                    return [e.targetTouches[0].pageX, e.targetTouches[0].pageY];
                } else {
                    return [e.pageX, e.pageY];
                }
            }
            this.nxtEle.addEventListener('mousedown', mousedownNxt, { passive: false });
            this.nxtEle.addEventListener('touchstart', mousedownNxt);            
        },
        pageChange: function(){
            // tempPage 上次页码
            if(this.tempPage != this.page) {
                this.tempPage = this.page;
                console.log(this.page);
                if (this.change instanceof Function)
                    this.change(this.page);
            }
        }
    };
    return Nogipage;
})();
